// src/routes/admin/AdminRoutes.tsx
import { Route } from "react-router-dom";
import RequirePermission from "@/components/RequirePermission";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import AdminLayout from "@/pages/admin/AdminLayout";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/UsersPage";
import AdminRolesPermissionsPage from "@/pages/admin/RolesPermissionsPage";
import AdminTicketsPage from "@/pages/admin/TicketsPage";
import AdminMissionsPage from "@/pages/admin/MissionsPage";
import AdminDocumentsPage from "@/pages/admin/DocumentsPage";
import AdminRequestsPage from "@/pages/admin/AdminRequestsPage";

export const AdminRoutes = (
  <Route element={<RequirePermission permission="admin" />}>
    <Route element={<PrivateLayout />}>
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
  </Route>
);
