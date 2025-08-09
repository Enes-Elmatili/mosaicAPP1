import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

let useAuthStore: typeof import('./authStore').useAuthStore;

beforeAll(async () => {
  useAuthStore = (await import('./authStore')).useAuthStore;
  // Stub master key for testing
  vi.stubEnv('VITE_MASTER_KEY', 'valid_master_key');
});

describe('authStore login with master key', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ masterKey: null, isAuthenticated: false, isLoading: false });
  });

  afterEach(() => {
  });

  it('authenticates valid master key', async () => {
    const loginPromise = useAuthStore.getState().login('valid_master_key');
    await loginPromise;
    const { isAuthenticated, masterKey } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(masterKey).toBe('valid_master_key');
    expect(localStorage.getItem('mosaic_master_key')).toBe('valid_master_key');
  });

  it('rejects invalid master key', async () => {
    const loginPromise = useAuthStore.getState().login('bad_key');
    await expect(loginPromise).rejects.toThrow('Master key invalide');
  });
});
