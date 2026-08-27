import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ProfileModal from './ProfileModal';
import NexDeskLogo from './NexDeskLogo';
import { LogOut, Shield, User as UserIcon, Edit3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isSuperadmin } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <NexDeskLogo size="medium" />
          </Link>

          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#f1f5f9',
              padding: '3px 10px',
              borderRadius: '12px',
              color: '#475569',
              fontWeight: 700,
              border: '1px solid #e2e8f0'
            }}
          >
            Groq AI Active
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <NotificationDropdown />

          {/* User Profile Badge (Clickable to open ProfileModal) */}
          <div
            onClick={() => setIsProfileOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '30px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            className="user-profile-badge"
            title="Click to View & Edit Profile"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#e2e8f0', objectFit: 'cover', border: '2px solid #a3e635' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user?.name} <Edit3 size={11} style={{ color: '#64748b' }} />
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: isSuperadmin ? '#b45309' : isAdmin ? '#032d1f' : '#2563eb',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                {isAdmin ? <Shield size={10} /> : <UserIcon size={10} />}
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ gap: '4px' }}
            title="Sign Out"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      {/* Render ProfileModal when user clicks profile badge */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;
