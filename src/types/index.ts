export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'locataire' | 'prestataire' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial' | 'office';
  price: number;
  surface: number;
  rooms: number;
  bathrooms: number;
  images: string[];
  ownerId: string;
  isAvailable: boolean;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  propertyId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  message?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'cleaning' | 'renovation' | 'security';
  providerId: string;
  price: number;
  duration: number; // en heures
  isActive: boolean;
  rating: number;
  reviewCount: number;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  clientId: string;
  propertyId: string;
  scheduledDate: Date;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface Dashboard {
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  recentBookings: Booking[];
  monthlyRevenue: { month: string; revenue: number }[];
  propertyDistribution: { type: string; count: number }[];
}