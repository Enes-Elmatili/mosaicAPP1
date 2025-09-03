import { create } from 'zustand';
import { Property, Booking, Service, ServiceRequest, Notification, Dashboard } from '../types';

// ======================
// API helpers (dev/prod)
// ======================
const RAW_BASE = (import.meta as any).env?.VITE_API_BASE || ""; // ex: http://localhost:3001  OU "" si proxy Vite

function buildUrl(path: string) {
  const base = RAW_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const withApi = p.startsWith("/api/") ? p : `/api${p}`;
  return `${base}${withApi}`;
}

const mk = () =>
  (typeof window === 'undefined'
    ? ''
    : localStorage.getItem('mosaic_master_key') ||
      localStorage.getItem('VITE_MASTER_KEY') ||
      '');

async function apiFetch<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  const key = mk();
  if (key) headers.set('x-master-key', key);

  const res = await fetch(buildUrl(path), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...Object.fromEntries(headers) },
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ======================
// Mock data (fallback)
// ======================
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Appartement moderne centre-ville',
    description: 'Magnifique appartement rénové avec vue sur la Seine',
    address: '15 Quai de Seine, 75001 Paris',
    type: 'apartment',
    price: 2500,
    surface: 85,
    rooms: 3,
    bathrooms: 2,
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'
    ],
    ownerId: '1',
    isAvailable: true,
    features: ['Balcon', 'Parking', 'Ascenseur', 'Cave'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Maison familiale avec jardin',
    description: 'Belle maison individuelle dans quartier calme',
    address: '42 Avenue de la République, 69003 Lyon',
    type: 'house',
    price: 1800,
    surface: 120,
    rooms: 4,
    bathrooms: 2,
    images: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    ownerId: '1',
    isAvailable: true,
    features: ['Jardin', 'Garage', 'Terrasse', 'Cheminée'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    clientId: '2',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
    status: 'confirmed',
    totalPrice: 2500,
    message: 'Recherche appartement pour stage à Paris',
    createdAt: new Date('2024-01-20'),
  },
];

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Nettoyage complet',
    description: 'Service de nettoyage professionnel pour appartements et maisons',
    category: 'cleaning',
    providerId: '3',
    price: 50,
    duration: 3,
    isActive: true,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: '2',
    title: 'Maintenance électrique',
    description: 'Dépannage et maintenance électrique',
    category: 'maintenance',
    providerId: '4',
    price: 80,
    duration: 2,
    isActive: true,
    rating: 4.6,
    reviewCount: 28,
  },
];

// ======================
// Store
// ======================
interface DataState {
  properties: Property[];
  bookings: Booking[];
  services: Service[];
  serviceRequests: ServiceRequest[];
  notifications: Notification[];
  dashboard: Dashboard | null;

  // Actions
  fetchProperties: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  properties: mockProperties,
  bookings: mockBookings,
  services: mockServices,
  serviceRequests: [],
  notifications: [],
  dashboard: null,

  // ===== Queries =====
  fetchProperties: async () => {
    try {
      const data = await apiFetch<Property[]>('/properties');
      set({ properties: data.map(normalizeProperty) });
    } catch {
      // fallback mock
      set({ properties: mockProperties });
    }
  },

  fetchBookings: async () => {
    try {
      const data = await apiFetch<Booking[]>('/bookings');
      set({ bookings: data.map(normalizeBooking) });
    } catch {
      set({ bookings: mockBookings });
    }
  },

  fetchServices: async () => {
    try {
      const data = await apiFetch<Service[]>('/services');
      set({ services: data });
    } catch {
      set({ services: mockServices });
    }
  },

  fetchDashboard: async () => {
    try {
      const data = await apiFetch<Dashboard>('/dashboard');
      set({ dashboard: data });
    } catch {
      // fallback calculé localement
      const { properties, bookings } = get();
      const dashboard: Dashboard = {
        totalProperties: properties.length,
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        totalUsers: 150,
        recentBookings: bookings.slice(0, 5),
        monthlyRevenue: [
          { month: 'Jan', revenue: 15000 },
          { month: 'Fév', revenue: 18000 },
          { month: 'Mar', revenue: 22000 },
          { month: 'Avr', revenue: 19000 },
          { month: 'Mai', revenue: 25000 },
          { month: 'Juin', revenue: 28000 },
        ],
        propertyDistribution: [
          { type: 'Appartements', count: 45 },
          { type: 'Maisons', count: 28 },
          { type: 'Commerces', count: 12 },
          { type: 'Bureaux', count: 8 },
        ],
      };
      set({ dashboard });
    }
  },

  // ===== Mutations =====
  addProperty: async (propertyData) => {
    // Optimistic UI (optionnel) : on peut attendre l’API si tu préfères
    try {
      const created = await apiFetch<Property>('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
      set(state => ({ properties: [...state.properties, normalizeProperty(created)] }));
    } catch {
      // fallback local
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set(state => ({ properties: [...state.properties, newProperty] }));
    }
  },

  updateProperty: async (id, updates) => {
    // Optimistic update
    set(state => ({
      properties: state.properties.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
    }));
    try {
      await apiFetch(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    } catch {
      // en cas d’erreur API, idéalement re-fetch
      get().fetchProperties();
    }
  },

  deleteProperty: async (id) => {
    // Optimistic removal
    const prev = get().properties;
    set({ properties: prev.filter(p => p.id !== id) });
    try {
      await apiFetch(`/properties/${id}`, { method: 'DELETE' });
    } catch {
      // rollback si API échoue
      set({ properties: prev });
    }
  },

  createBooking: async (bookingData) => {
    try {
      const created = await apiFetch<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      set(state => ({ bookings: [...state.bookings, normalizeBooking(created)] }));
    } catch {
      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        createdAt: new Date(),
      } as Booking;
      set(state => ({ bookings: [...state.bookings, newBooking] }));
    }
  },

  updateBookingStatus: async (id, status) => {
    set(state => ({ bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b) }));
    try {
      await apiFetch(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    } catch {
      get().fetchBookings();
    }
  },

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    };
    set(state => ({ notifications: [notification, ...state.notifications] }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    }));
  },
}));

// ======================
// Normalizers (dates JSON → Date)
// ======================
function normalizeProperty(p: any): Property {
  return {
    ...p,
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  };
}
function normalizeBooking(b: any): Booking {
  return {
    ...b,
    startDate: b.startDate ? new Date(b.startDate) : undefined,
    endDate: b.endDate ? new Date(b.endDate) : undefined,
    createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
  };
}
