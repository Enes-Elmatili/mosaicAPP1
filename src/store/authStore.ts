import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Mock data pour la démonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@mosaic.fr',
    firstName: 'Admin',
    lastName: 'MOSAIC',
    role: 'admin',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, Paris',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: '2',
    email: 'client@example.fr',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'client',
    phone: '+33 6 12 34 56 78',
    address: '456 Rue de la Paix, Lyon',
    createdAt: new Date('2024-01-15'),
    isActive: true,
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    
    if (user && password === 'password') {
      set({ user, isAuthenticated: true, isLoading: false });
      localStorage.setItem('mosaic_user', JSON.stringify(user));
    } else {
      set({ isLoading: false });
      throw new Error('Email ou mot de passe incorrect');
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('mosaic_user');
  },

  register: async (userData) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      role: userData.role || 'client',
      phone: userData.phone,
      address: userData.address,
      createdAt: new Date(),
      isActive: true,
    };
    
    mockUsers.push(newUser);
    set({ user: newUser, isAuthenticated: true, isLoading: false });
    localStorage.setItem('mosaic_user', JSON.stringify(newUser));
  },

  updateProfile: async (userData) => {
    set({ isLoading: true });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...userData };
        localStorage.setItem('mosaic_user', JSON.stringify(updatedUser));
        return { user: updatedUser, isLoading: false };
      }
      return { isLoading: false };
    });
  },
}));

// Initialiser l'état depuis localStorage
const savedUser = localStorage.getItem('mosaic_user');
if (savedUser) {
  const user = JSON.parse(savedUser);
  useAuthStore.setState({ user, isAuthenticated: true });
}