import React, { useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Eye,
  MapPin,
  Star
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#14B8A6', '#F97316', '#EF4444'];

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore();
  const { dashboard, properties, bookings, fetchDashboard } = useDataStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+{trend}%</span>
              <span className="text-gray-500 ml-1">ce mois</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Propriétés"
            value={dashboard.totalProperties}
            icon={Building}
            trend={12}
            color="primary"
          />
          <StatCard
            title="Réservations"
            value={dashboard.totalBookings}
            icon={Calendar}
            trend={8}
            color="secondary"
          />
          <StatCard
            title="Revenus (€)"
            value={dashboard.totalRevenue}
            icon={TrendingUp}
            trend={15}
            color="accent"
          />
          <StatCard
            title="Utilisateurs"
            value={dashboard.totalUsers}
            icon={Users}
            trend={5}
            color="primary"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Revenus mensuels</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboard.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}€`, 'Revenus']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Property Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Distribution des propriétés</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboard.propertyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {dashboard.propertyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Réservations récentes</h3>
          </div>
          <div className="p-6">
            {dashboard.recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune réservation récente</p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentBookings.map((booking) => {
                  const property = properties.find(p => p.id === booking.propertyId);
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{property?.title || 'Propriété inconnue'}</h4>
                          <p className="text-sm text-gray-600">
                            {booking.startDate.toLocaleDateString()} - {booking.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{booking.totalPrice}€</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard pour les autres rôles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.firstName} !
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de vos activités récentes
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Propriétés disponibles</h3>
              <p className="text-2xl font-bold mt-2">{properties.filter(p => p.isAvailable).length}</p>
            </div>
            <Building className="w-8 h-8 opacity-80" />
          </div>
        </div>

        {user?.role === 'client' && (
          <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Mes réservations</h3>
                <p className="text-2xl font-bold mt-2">{bookings.filter(b => b.clientId === user.id).length}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Services disponibles</h3>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
            <Star className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Propriétés populaires</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 3).map((property) => (
              <div key={property.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium mb-2">{property.title}</h4>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.address}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">{property.price}€</span>
                  <span className="text-sm text-gray-500">{property.surface}m²</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};