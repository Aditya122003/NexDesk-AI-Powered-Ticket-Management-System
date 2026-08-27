import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <AlertTriangle size={48} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
          404 - Page Not Found
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          The page or support ticket view you are looking for does not exist.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Home size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
