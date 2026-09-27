import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { LandingPage } from './pages/LandingPage';
import { Injira } from './pages/Injira';
import { Kwiyandikisha } from './pages/Kwiyandikisha';

import { Ahabanza } from './pages/Ahabanza';
import { Kwizigama } from './pages/Kwizigama';
import { Amateka } from './pages/Amateka';
import { AmafarangaNungutse } from './pages/AmafarangaNungutse';
import { Kuguza } from './pages/Kuguza';
import { InguzanyoZanjye } from './pages/InguzanyoZanjye';
import { Ubutumwa } from './pages/Ubutumwa';
import { Umwirondoro } from './pages/Umwirondoro';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAbakoresha } from './pages/AdminAbakoresha';
import { AdminIbibina } from './pages/AdminIbibina';
import { AdminKwizigama } from './pages/AdminKwizigama';
import { AdminKuguza } from './pages/AdminKuguza';
import { AdminInguzanyo } from './pages/AdminInguzanyo';
import { AdminRaporo } from './pages/AdminRaporo';
import { AdminAuditLogs } from './pages/AdminAuditLogs';

// Protected Route Guard for Standard Users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-kora-500/30 border-t-kora-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/injira" replace />;
  }

  return <>{children}</>;
};

// Strict Admin Route Guard
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/ahabanza" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/injira" element={<Injira />} />
            <Route path="/kwiyandikisha" element={<Kwiyandikisha />} />

            {/* User Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/ahabanza" element={<Ahabanza />} />
              <Route path="/kwizigama" element={<Kwizigama />} />
              <Route path="/amateka" element={<Amateka />} />
              <Route path="/amafaranga-nungutse" element={<AmafarangaNungutse />} />
              <Route path="/kuguza" element={<Kuguza />} />
              <Route path="/inguzanyo-zanjye" element={<InguzanyoZanjye />} />
              <Route path="/ubutumwa" element={<Ubutumwa />} />
              <Route path="/umwirondoro" element={<Umwirondoro />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="abakoresha" element={<AdminAbakoresha />} />
              <Route path="ibibina" element={<AdminIbibina />} />
              <Route path="kwizigama" element={<AdminKwizigama />} />
              <Route path="kuguza" element={<AdminKuguza />} />
              <Route path="inguzanyo" element={<AdminInguzanyo />} />
              <Route path="raporo" element={<AdminRaporo />} />
              <Route path="audit" element={<AdminAuditLogs />} />
            </Route>

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/ahabanza" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
