import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#6366f1' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Verifying Security Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Superadmin has full access to all routes
  const isSuperadmin = user?.role === 'superadmin' || user?.email === 'adityatiwari5175@gmail.com';

  if (allowedRoles && !isSuperadmin) {
    const effectiveAllowedRoles = allowedRoles.includes('admin') ? [...allowedRoles, 'superadmin'] : allowedRoles;
    if (!effectiveAllowedRoles.includes(user?.role)) {
      return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
