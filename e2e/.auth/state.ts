// e2e/.auth/state.ts
import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const STATE_PATH = path.resolve(__dirname, 'state.json');

setup('create storage state (no master key)', async () => {
  const origin = process.env.APP_ORIGIN || process.env.E2E_BASE_URL || 'http://localhost:5173';

  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

  const state = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [] // ❗️aucune master key ici
      }
    ]
  };

  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  if (!fs.existsSync(STATE_PATH)) throw new Error('storage state not created');
});
