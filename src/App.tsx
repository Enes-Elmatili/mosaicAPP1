/**
 * App.tsx
 * Entrée principale : routage + protections.
 */
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import RequireAuth from './components/RequireAuth';
import RequirePermission from './components/RequirePermission';
import ForbidRole from './components/ForbidRole';
import PublicLayout from './components/Layout/PublicLayout';
import { useAuth } from './store/auth';

// Lazy pages
const HomePage = lazy(() => import('./pages/app/HomePage'));
const OffersPage = lazy(() => import('./pages/public/OffersPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const SignupPage = lazy(() => import('./pages/public/SignupPage'));
const RentalSearchPage = lazy(() => import('./pages/public/RentalSearchPage'));
const RentalDetailPage = lazy(() => import('./pages/public/RentalDetailPage'));
const LegalPage = lazy(() => import('./pages/public/LegalPage'));
const PolicyPage = lazy(() => import('./pages/public/PolicyPage'));
const ProfileSettingsPage = lazy(() => import('./pages/common/ProfileSettingsPage'));
const NotificationsCenterPage = lazy(() => import('./pages/common/NotificationsCenterPage'));
const DocumentsPage = lazy(() => import('./pages/common/DocumentsPage'));
const MessagesPage = lazy(() => import('./pages/common/MessagesPage'));
const OfflinePage = lazy(() => import('./pages/common/OfflinePage'));
const UnauthorizedPage = lazy(() => import('./pages/common/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));
const TenantDashboardPage = lazy(() => import('./pages/app/tenant/DashboardPage'));
const RentPaymentPage = lazy(() => import('./pages/app/tenant/RentPaymentPage'));
const ContractsPage = lazy(() => import('./pages/app/tenant/ContractsPage'));
const TicketsPage = lazy(() => import('./pages/app/tenant/TicketsPage'));
const RequestsNewPage = lazy(() => import('./pages/app/tenant/RequestsNewPage'));
const RequestsListPage = lazy(() => import('./pages/app/tenant/RequestsListPage'));
const RequestsDetailPage = lazy(() => import('./pages/app/tenant/RequestsDetailPage'));
const OwnerDashboardPage = lazy(() => import('./pages/app/owner/DashboardPage'));
const PropertiesPage = lazy(() => import('./pages/app/owner/PropertiesPage'));
const InterventionsPage = lazy(() => import('./pages/app/owner/InterventionsPage'));
const InvoicesPage = lazy(() => import('./pages/app/owner/InvoicesPage'));
const ReportingPage = lazy(() => import('./pages/app/owner/ReportingPage'));
const ShortTermRentalPage = lazy(() => import('./pages/app/owner/ShortTermRentalPage'));
const ProviderMissionsPage = lazy(() => import('./pages/app/provider/MissionsPage'));
const ProviderMissionDetailPage = lazy(() => import('./pages/app/provider/MissionDetailPage'));
const PlanningPage = lazy(() => import('./pages/app/provider/PlanningPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const RolesPermissionsPage = lazy(() => import('./pages/admin/RolesPermissionsPage'));
const AdminTicketsPage = lazy(() => import('./pages/admin/TicketsPage'));
const AdminMissionsPage = lazy(() => import('./pages/admin/MissionsPage'));
const AdminDocumentsPage = lazy(() => import('./pages/admin/DocumentsPage'));

export default function App() {
  // ⚡ Initialise l’auth une fois au chargement
  const init = useAuth((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        }
      >
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/rental/search" element={<RentalSearchPage />} />
            <Route path="/rental/:id" element={<RentalDetailPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/policy" element={<PolicyPage />} />
          </Route>

          {/* Commun authentifié */}
          <Route element={<RequireAuth />}>
            {/* 🏠 Home app après login sur /app (et non plus sur /) */}
            <Route path="/app" element={<HomePage />} />

            <Route path="/app/profile" element={<ProfileSettingsPage />} />
            <Route path="/app/notifications" element={<NotificationsCenterPage />} />
            <Route path="/app/documents" element={<DocumentsPage />} />
            <Route path="/app/messages" element={<MessagesPage />} />

            {/* Tenant */}
            <Route path="/app/tenant/dashboard" element={<TenantDashboardPage />} />
            <Route path="/app/tenant/rent-payment" element={<RentPaymentPage />} />
            <Route path="/app/tenant/contracts" element={<ContractsPage />} />
            <Route path="/app/tenant/tickets" element={<TicketsPage />} />

            {/* Interdiction du rôle provider pour la création de demande */}
            <Route element={<ForbidRole role="provider" />}>
              <Route path="/app/tenant/requests/new" element={<RequestsNewPage />} />
            </Route>

            <Route path="/app/tenant/requests" element={<RequestsListPage />} />
            <Route path="/app/tenant/requests/:id" element={<RequestsDetailPage />} />

            {/* Owner */}
            <Route path="/app/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/app/owner/properties" element={<PropertiesPage />} />
            <Route path="/app/owner/interventions" element={<InterventionsPage />} />
            <Route path="/app/owner/invoices" element={<InvoicesPage />} />
            <Route path="/app/owner/reporting" element={<ReportingPage />} />
            <Route path="/app/owner/short-term-rental" element={<ShortTermRentalPage />} />

            {/* Provider */}
            <Route path="/app/provider/missions" element={<ProviderMissionsPage />} />
            <Route path="/app/provider/missions/:id" element={<ProviderMissionDetailPage />} />
            <Route path="/app/provider/planning" element={<PlanningPage />} />
          </Route>

          {/* Admin */}
          <Route element={<RequirePermission permission="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/missions" element={<AdminMissionsPage />} />
            <Route path="/admin/documents" element={<AdminDocumentsPage />} />
          </Route>

          {/* Divers */}
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
