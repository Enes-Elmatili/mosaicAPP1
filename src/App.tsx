/**
 * App.tsx
 * Entrée principale : routage + protections + gestion des erreurs.
 */
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import RequirePermission from "./components/RequirePermission";
import AppRoleRedirect from "./components/AppRoleRedirect";
import PublicLayout from "./components/layout/PublicLayout";
import { PrivateLayout } from "./components/layout/PrivateLayout";

// --- ErrorBoundary ---
import React from "react";
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Erreur capturée par ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Une erreur est survenue
          </h1>
          <p className="text-gray-600">
            Impossible de charger cette page. Veuillez réessayer plus tard.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Lazy loading des pages ---
const HomePage = lazy(() => import("./pages/app/HomePage"));
const OffersPage = lazy(() => import("./pages/public/OffersPage"));
const LoginPage = lazy(() => import("./pages/public/LoginPage"));
const SignupPage = lazy(() => import("./pages/public/SignupPage"));
const LegalPage = lazy(() => import("./pages/public/LegalPage"));
const PolicyPage = lazy(() => import("./pages/public/PolicyPage"));

const ProfileSettingsPage = lazy(() => import("./pages/common/ProfileSettingsPage"));
const NotificationsCenterPage = lazy(() => import("./pages/common/NotificationsCenterPage"));
const DocumentsPage = lazy(() => import("./pages/common/DocumentsPage"));
const MessagesPage = lazy(() => import("./pages/common/MessagesPage"));
const OfflinePage = lazy(() => import("./pages/common/OfflinePage"));
const UnauthorizedPage = lazy(() => import("./pages/common/UnauthorizedPage"));
const NotFoundPage = lazy(() => import("./pages/common/NotFoundPage"));

// --- CLIENT ---
const ClientDashboardPage = lazy(() => import("./pages/app/client/DashboardPage.tsx"));
const ClientRequestsNewPage = lazy(() => import("./pages/app/client/RequestsNewPage.tsx"));
const ClientRequestsListPage = lazy(() => import("./pages/app/client/RequestListPage.tsx"));
const ClientInvoicesPage = lazy(() => import("./pages/app/client/InvoicesPage.tsx"));
const ClientContractsPage = lazy(() => import("./pages/app/client/ContractsPage.tsx"));
const ClientTicketsPage = lazy(() => import("./pages/app/client/TicketsPage.tsx"));

// --- PROVIDER ---
const ProviderDashboardPage = lazy(() => import("./pages/app/provider/DashboardPage"));
const ProviderMissionsPage = lazy(() => import("./pages/app/provider/MissionsPage"));
const ProviderMissionDetailPage = lazy(() => import("./pages/app/provider/MissionDetailPage"));
const ProviderPlanningPage = lazy(() => import("./pages/app/provider/PlanningPage"));
const ProviderEarningsPage = lazy(() => import("./pages/app/provider/EarningsPage"));

// --- ADMIN ---
import AdminLayout from "./pages/admin/AdminLayout";
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminRolesPermissionsPage = lazy(() => import("./pages/admin/RolesPermissionsPage"));
const AdminTicketsPage = lazy(() => import("./pages/admin/TicketsPage"));
const AdminMissionsPage = lazy(() => import("./pages/admin/MissionsPage"));
const AdminDocumentsPage = lazy(() => import("./pages/admin/DocumentsPage"));
const AdminRequestsPage = lazy(() => import("./pages/admin/AdminRequestsPage"));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          }
        >
          <Routes>
            {/* PUBLIC */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/policy" element={<PolicyPage />} />
            </Route>

            {/* AUTHENTIFIÉS (clients + providers) */}
            <Route element={<RequireAuth />}>
              <Route element={<PrivateLayout />}>
                <Route path="/app" element={<AppRoleRedirect />} />

                {/* Commun */}
                <Route path="/app/profile" element={<ProfileSettingsPage />} />
                <Route path="/app/notifications" element={<NotificationsCenterPage />} />
                <Route path="/app/documents" element={<DocumentsPage />} />
                <Route path="/app/messages" element={<MessagesPage />} />

                {/* CLIENT */}
                <Route path="/app/client/dashboard" element={<ClientDashboardPage />} />
                <Route path="/app/client/requests/new" element={<ClientRequestsNewPage />} />
                <Route path="/app/client/requests" element={<ClientRequestsListPage />} />
                <Route path="/app/client/invoices" element={<ClientInvoicesPage />} />
                <Route path="/app/client/contracts" element={<ClientContractsPage />} />
                <Route path="/app/client/tickets" element={<ClientTicketsPage />} />

                {/* PROVIDER */}
                <Route path="/app/provider/dashboard" element={<ProviderDashboardPage />} />
                <Route path="/app/provider/missions" element={<ProviderMissionsPage />} />
                <Route path="/app/provider/missions/:id" element={<ProviderMissionDetailPage />} />
                <Route path="/app/provider/planning" element={<ProviderPlanningPage />} />
                <Route path="/app/provider/earnings" element={<ProviderEarningsPage />} />
              </Route>
            </Route>

            {/* ADMIN (protégé + propre layout admin) */}
            <Route element={<RequirePermission permission="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/roles-permissions" element={<AdminRolesPermissionsPage />} />
                <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                <Route path="/admin/missions" element={<AdminMissionsPage />} />
                <Route path="/admin/documents" element={<AdminDocumentsPage />} />
                <Route path="/admin/requests" element={<AdminRequestsPage />} />
              </Route>
            </Route>

            {/* Divers */}
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
