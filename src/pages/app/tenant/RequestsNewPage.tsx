import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../../components/UI';
import { createRequest, uploadPhotos } from '../../../services/requests';
import type { CreateRequestInput, Priority, ServiceType } from '../../../types/request';

type FormState = {
  propertyId: string;
  serviceType: ServiceType;
  description: string;
  priority: Priority;
  categoryId?: string;
  subcategoryId?: string;
  files: File[];
};

export default function RequestsNewPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    propertyId: '',
    serviceType: 'general',
    description: '',
    priority: 'medium',
    categoryId: '',
    subcategoryId: '',
    files: [],
  });

  const onChange = (k: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [k]: e.target.value as any }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.propertyId.trim()) return setError('La propriété est requise.');
    if (!form.description.trim()) return setError('La description est requise.');

    setSubmitting(true);
    let photos: string[] | undefined;
    if (form.files.length > 0) {
      photos = await uploadPhotos(form.files);
    }

    const input: CreateRequestInput = {
      propertyId: form.propertyId.trim(),
      serviceType: form.serviceType,
      description: form.description.trim(),
      priority: form.priority,
      categoryId: form.categoryId || undefined,
      subcategoryId: form.subcategoryId || undefined,
      photos,
    };

    try {
      const created = await createRequest(input);
      navigate(`/app/tenant/requests/${created.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-4">
      <nav className="text-sm">
        <Link to="/app/tenant/requests" className="underline">
          Demandes
        </Link>{' '}/ <span>Nouvelle</span>
      </nav>

      <Card>
        <h1 className="text-xl font-semibold mb-4">Créer une demande</h1>
        {error && <div className="mb-3 p-3 border border-red-300 rounded text-red-700">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="propertyId">Propriété *</label>
            <input
              id="propertyId"
              data-testid="req-propertyId"
              name="propertyId"
              type="text"
              value={form.propertyId}
              onChange={onChange('propertyId')}
              className="w-full rounded border px-3 py-2"
              placeholder="ID ou référence de la propriété"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="serviceType">Type de service *</label>
            <select
              id="serviceType"
              data-testid="req-serviceType"
              name="serviceType"
              value={form.serviceType}
              onChange={onChange('serviceType')}
              className="w-full rounded border px-3 py-2"
              required
            >
              <option value="general">Général</option>
              <option value="plumbing">Plomberie</option>
              <option value="electrical">Électricité</option>
              <option value="hvac">CVC</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="priority">Priorité</label>
            <select
              id="priority"
              data-testid="req-priority"
              name="priority"
              value={form.priority}
              onChange={onChange('priority')}
              className="w-full rounded border px-3 py-2"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
            <div className="mt-2">
            <Badge>Prévue&nbsp;: {form.priority}</Badge>

            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="description">Description *</label>
            <textarea
              id="description"
              data-testid="req-description"
              name="description"
              rows={5}
              value={form.description}
              onChange={onChange('description')}
              className="w-full rounded border px-3 py-2"
              placeholder="Détails utiles pour traiter la demande…"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="categoryId">Catégorie (optionnel)</label>
              <input
                id="categoryId"
                data-testid="req-categoryId"
                name="categoryId"
                type="text"
                value={form.categoryId}
                onChange={onChange('categoryId')}
                className="w-full rounded border px-3 py-2"
                placeholder="catégorie"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="subcategoryId">Sous-catégorie (optionnel)</label>
              <input
                id="subcategoryId"
                data-testid="req-subcategoryId"
                name="subcategoryId"
                type="text"
                value={form.subcategoryId}
                onChange={onChange('subcategoryId')}
                className="w-full rounded border px-3 py-2"
                placeholder="sous-catégorie"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="photos">Photos (optionnel)</label>
            <input
              id="photos"
              data-testid="req-photos"
              name="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setForm((prev) => ({ ...prev, files: Array.from(e.target.files ?? []) }))
              }
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              data-testid="req-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Création…' : 'Créer la demande'}
            </Button>
            <Link to="/app/tenant/requests" className="underline self-center">
              Annuler
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
