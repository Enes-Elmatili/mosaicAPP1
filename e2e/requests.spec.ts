// e2e/requests.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const CANDIDATE_PATHS = [
  '/app/tenant/requests/new',
  '/tenant/requests/new',
  '/app/requests/new',
  '/requests/new',
  '/app/tenant/requests',
  '/',
];

function ensureFixtures(): string[] {
  const candidates = [
    'tests/fixtures/photo1.jpg',
    'tests/fixtures/photo2.jpg',
    'e2e/fixtures/photo1.jpg',
    'e2e/fixtures/photo2.jpg',
  ].map(p => path.resolve(p));
  const existing = candidates.filter(p => fs.existsSync(p));
  if (existing.length >= 2) return existing.slice(0, 2);
  const tmp = path.resolve('e2e/tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const f1 = path.join(tmp, 'photo1.jpg');
  const f2 = path.join(tmp, 'photo2.jpg');
  if (!fs.existsSync(f1)) fs.writeFileSync(f1, '');
  if (!fs.existsSync(f2)) fs.writeFileSync(f2, '');
  return [f1, f2];
}

async function openFormWithMasterKey(page) {
  // 🔐 Active la master key AVANT toute navigation
  await page.addInitScript(
    ([k1, v, k2]) => { localStorage.setItem(k1, v); localStorage.setItem(k2, v); },
    ['mosaic_master_key', process.env.VITE_MASTER_KEY || 'dev-master-key', 'VITE_MASTER_KEY']
  );

  for (const p of CANDIDATE_PATHS) {
    await page.goto(p, { waitUntil: 'domcontentloaded' }).catch(() => null);

    // Si on est sur une liste, clique sur "Nouvelle demande" si visible
    const newBtn = page.getByRole('button', { name: /nouvelle|new|créer|create/i })
                   .or(page.getByRole('link', { name: /nouvelle|new|créer|create/i }));
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click().catch(() => null);
    }

    // Détecte le champ clé du formulaire
    const propertyInput =
      page.getByTestId('req-propertyId')
        .or(page.locator('[name="propertyId"]'))
        .or(page.getByLabel(/propriét/i).first())
        .or(page.getByPlaceholder(/propriét/i).first());

    if (await propertyInput.first().isVisible().catch(() => false)) {
      return { propertyInput };
    }
  }
  return null;
}

test('create maintenance request with photos and view details (master key on → off)', async ({ page }) => {
  // 1) Ouvrir le formulaire avec master key activée
  const hit = await openFormWithMasterKey(page);
  if (!hit) {
    await page.screenshot({ path: 'test-results/form-not-visible.png', fullPage: true }).catch(() => null);
    fs.writeFileSync('test-results/form-not-visible.url.txt', page.url());
    fs.writeFileSync('test-results/form-not-visible.html', await page.content());
    throw new Error('Form not visible — voir test-results/*.html/png pour route/guards.');
  }

  const { propertyInput } = hit;

  // 2) Remplir le formulaire
  await expect(propertyInput).toBeVisible({ timeout: 15_000 });
  await propertyInput.fill('APT-001');

  const serviceSelect =
    page.getByTestId('req-serviceType')
      .or(page.locator('select[name="serviceType"]'))
      .or(page.getByLabel(/type de service/i).first());
  await expect(serviceSelect).toBeVisible({ timeout: 15_000 });
  await serviceSelect.selectOption('plumbing').catch(async () => {
    await serviceSelect.selectOption({ index: 1 }).catch(() => null);
  });

  const descTextarea =
    page.getByTestId('req-description')
      .or(page.locator('textarea[name="description"]'))
      .or(page.getByLabel(/description/i).first());
  await expect(descTextarea).toBeVisible({ timeout: 15_000 });
  await descTextarea.fill('Fuite sous évier');

  // Optionnels
  const prioritySelect =
    page.getByTestId('req-priority')
      .or(page.locator('select[name="priority"]'))
      .or(page.getByLabel(/priorit/i).first());
  if (await prioritySelect.first().isVisible().catch(() => false)) {
    await prioritySelect.selectOption('high').catch(() => null);
  }

  const categorySelect =
    page.getByTestId('req-categoryId')
      .or(page.locator('select[name="categoryId"]'))
      .or(page.getByLabel(/catégor/i).first());
  if (await categorySelect.first().isVisible().catch(() => false)) {
    await categorySelect.selectOption({ index: 1 }).catch(() => null);
  }

  const subcategorySelect =
    page.getByTestId('req-subcategoryId')
      .or(page.locator('select[name="subcategoryId"]'))
      .or(page.getByLabel(/sous[- ]catégor/i).first());
  if (await subcategorySelect.first().isVisible().catch(() => false)) {
    await subcategorySelect.selectOption({ index: 1 }).catch(() => null);
  }

  // Upload
  const files = ensureFixtures();
  const fileInput = page.getByTestId('req-photos').or(page.locator('input[type="file"]')).first();
  await expect(fileInput).toBeVisible({ timeout: 15_000 });
  await fileInput.setInputFiles(files);

  // 3) Soumettre
  const submitBtn =
    page.getByTestId('req-submit')
      .or(page.getByRole('button', { name: /envoyer|créer|soumettre|submit/i }))
      .or(page.locator('button[type="submit"]'));
  await expect(submitBtn).toBeVisible({ timeout: 15_000 });
  await submitBtn.click();

  // 4) Attendre création (POST 201) ou navigation vers détail
  const created = page.waitForResponse(
    (r) => r.url().includes('/api/requests') && r.request().method() === 'POST' && r.status() === 201,
    { timeout: 20_000 }
  ).catch(() => null);
  const navigated = page.waitForURL(/\/app\/tenant\/requests\/\d+|\/requests\/\d+/, { timeout: 20_000 }).catch(() => null);
  await Promise.race([created, navigated]);

  // 5) 🔓 Désactiver la master key et recharger (validation “utilisateur normal”)
  await page.evaluate(([k1, k2]) => {
    localStorage.removeItem(k1);
    localStorage.removeItem(k2);
  }, ['mosaic_master_key', 'VITE_MASTER_KEY']);
  await page.reload({ waitUntil: 'domcontentloaded' });

  // 6) Vérifier la page détail (toujours accessible/visible)
  await expect(
    page.getByText(/Demande\s*#\s*\d+/i).or(page.getByRole('heading', { name: /Demande|Request/i }))
  ).toBeVisible({ timeout: 20_000 }).catch(async () => {
    await page.screenshot({ path: 'test-results/detail-not-visible.png', fullPage: true }).catch(() => null);
    fs.writeFileSync('test-results/detail-not-visible.url.txt', page.url());
    fs.writeFileSync('test-results/detail-not-visible.html', await page.content());
    throw new Error('Detail page not visible after master key removal — voir test-results/*.html/png');
  });

  // 7) (Optionnel) Vérifie le contenu saisi
  await expect(page.getByText(/Fuite sous évier/i)).toBeVisible({ timeout: 10_000 }).catch(() => null);
});
