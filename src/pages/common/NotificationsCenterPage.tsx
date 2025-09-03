import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import PageWrapper from '../../components/Layout/PageWrapper';

const notifications = [
  {
    id: 1,
    type: 'info',
    title: 'Nouvelle demande validée',
    message: 'Votre demande d’intervention #REQ-458 a été acceptée.',
    date: '2025-08-12 14:35',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Paiement en attente',
    message: 'Votre paiement du loyer est en attente depuis 3 jours.',
    date: '2025-08-10 09:12',
  },
  {
    id: 3,
    type: 'success',
    title: 'Intervention terminée',
    message: 'L’intervention “Fuite salle de bain” est clôturée.',
    date: '2025-08-08 17:45',
  },
];

const typeIcons: Record<string, JSX.Element> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  warning: <AlertCircle className="h-5 w-5 text-orange-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const NotificationsCenterPage: React.FC = () => {
  return (
    <PageWrapper title="Centre de notifications">
      <div className="rounded-3xl border border-white/10 bg-white/70 backdrop-blur-md shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Vos notifications</h2>
          </div>
          <button className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            Tout effacer
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune notification pour le moment.</p>
        ) : (
          <ul className="divide-y divide-gray-200/50">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className="flex items-start gap-4 py-4 transition-transform hover:translate-x-1"
              >
                <div className="flex-shrink-0">{typeIcons[notif.type]}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <span className="text-xs text-gray-400">{notif.date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  );
};

export default NotificationsCenterPage;
