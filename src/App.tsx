import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RequirePermission from './components/RequirePermission';
import RolesList from './routes/admin/roles/RolesList';
import RoleDetail from './routes/admin/roles/RoleDetail';
import Unauthorized from './components/Unauthorized';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/roles" replace />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin/roles"
            element={
              <RequirePermission permission="roles.read">
                <RolesList />
              </RequirePermission>
            }
          />
          <Route
            path="/admin/roles/:id"
            element={
              <RequirePermission permission="roles.read">
                <RoleDetail />
              </RequirePermission>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
