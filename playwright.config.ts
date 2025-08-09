import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['line'], ['html', { open: 'never' }]],
  outputDir: 'test-results',

  // 🔸 Important : PAS de storageState ici (global) pour éviter l'ENOENT avant le setup
  use: {
    baseURL: process.env.APP_ORIGIN || 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1) Projet de setup : crée e2e/.auth/state.json
    {
      name: 'setup',
      testDir: 'e2e/.auth',
      testMatch: /state\.ts/,
      use: {
        // pas de storageState ici non plus
      },
    },

    // 2) Navigateurs qui utilisent le storageState créé par 'setup'
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/state.json',
      },
      dependencies: ['setup'],
    },
    // ❌ pas de WebKit sur ton mac actuel
  ],
});