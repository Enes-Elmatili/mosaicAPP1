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
});

describe('authStore login', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('authenticates valid user', async () => {
    const loginPromise = useAuthStore.getState().login('admin@mosaic.fr', 'password');
    await vi.runAllTimersAsync();
    await loginPromise;
    const { isAuthenticated, user } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(user?.email).toBe('admin@mosaic.fr');
  });

  it('rejects invalid password', async () => {
    const loginPromise = useAuthStore.getState().login('admin@mosaic.fr', 'wrong');
    const assertion = expect(loginPromise).rejects.toThrow('Email ou mot de passe incorrect');
    await vi.runAllTimersAsync();
    await assertion;
  });
});
