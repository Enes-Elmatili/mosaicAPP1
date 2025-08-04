import { create } from 'zustand';
import { Property, Booking, Service, ServiceRequest, Notification, Dashboard } from '../types';

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

// Mock data
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

export const useDataStore = create<DataState>((set, get) => ({
  properties: mockProperties,
  bookings: mockBookings,
  services: mockServices,
  serviceRequests: [],
  notifications: [],
  dashboard: null,

  fetchProperties: async () => {
    // Simulation API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ properties: mockProperties });
  },

  fetchBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ bookings: mockBookings });
  },

  fetchServices: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ services: mockServices });
  },

  fetchDashboard: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { properties, bookings } = get();
    const dashboard: Dashboard = {
      totalProperties: properties.length,
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.totalPrice, 0),
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
  },

  addProperty: async (propertyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newProperty: Property = {
      ...propertyData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set(state => ({
      properties: [...state.properties, newProperty]
    }));
  },

  updateProperty: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      properties: state.properties.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      )
    }));
  },

  deleteProperty: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      properties: state.properties.filter(p => p.id !== id)
    }));
  },

  createBooking: async (bookingData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set(state => ({
      bookings: [...state.bookings, newBooking]
    }));
  },

  updateBookingStatus: async (id, status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    set(state => ({
      bookings: state.bookings.map(b => 
        b.id === id ? { ...b, status } : b
      )
    }));
  },

  addNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date(),
    };
    
    set(state => ({
      notifications: [notification, ...state.notifications]
    }));
  },

  markNotificationAsRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    }));
  },
}));