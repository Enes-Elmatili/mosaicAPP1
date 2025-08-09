import { create } from 'zustand';

interface AuthState {
  masterKey: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (key: string) => Promise<void>;
  logout: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
  masterKey: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (key: string) => {
    set({ isLoading: true });
    const master = import.meta.env.VITE_MASTER_KEY;
    if (key === master) {
      set({ masterKey: key, isAuthenticated: true, isLoading: false });
      localStorage.setItem('mosaic_master_key', key);
    } else {
      set({ isLoading: false });
      throw new Error('Master key invalide');
    }
  },

  logout: () => {
    set({ masterKey: null, isAuthenticated: false });
    localStorage.removeItem('mosaic_master_key');
  },
}));

// Initialiser l'état de la masterKey depuis localStorage
const savedMasterKey = localStorage.getItem('mosaic_master_key');
if (savedMasterKey) {
  useAuthStore.setState({ masterKey: savedMasterKey, isAuthenticated: true });
}
