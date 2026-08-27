import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperadminDashboard from './pages/SuperadminDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

const AdminRouteWrapper = () => {
  const { isSuperadmin } = useAuth();
  return isSuperadmin ? <SuperadminDashboard /> : <AdminDashboard />;
};

const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Routes>
          {/* Customer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin', 'superadmin']} />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/tickets" element={<CustomerDashboard />} />
          </Route>

          {/* Admin / Superadmin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/admin" element={<AdminRouteWrapper />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          </Route>

          {/* Catch-all inside AppLayout */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage initialMode="login" />} />
            <Route path="/landing" element={<LandingPage initialMode="login" />} />
            <Route path="/login" element={<LandingPage initialMode="login" />} />
            <Route path="/register" element={<LandingPage initialMode="login" />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
