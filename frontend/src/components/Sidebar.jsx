import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NexDeskLogo from './NexDeskLogo';
import { LayoutDashboard, Ticket, BarChart3, Bot, Globe } from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isSuperadmin } = useAuth();

  const navItems = [];

  if (isAdmin) {
    navItems.push({
      name: isSuperadmin ? 'Superadmin Portal' : 'Admin Command',
      path: '/admin',
      icon: <LayoutDashboard size={18} />,
      end: true
    });
    navItems.push({
      name: 'Ticket Repository',
      path: '/tickets',
      icon: <Ticket size={18} />,
      end: true
    });
    navItems.push({
      name: 'System Analytics',
      path: '/admin/analytics',
      icon: <BarChart3 size={18} />,
      end: true
    });
  } else {
    // For Regular Customer
    navItems.push({
      name: 'My Support Desk',
      path: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      end: true
    });
  }

  navItems.push({
    name: 'Landing Page',
    path: '/landing',
    icon: <Globe size={18} />,
    end: true
  });

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ padding: '0 0.5rem 1rem' }}>
        <NexDeskLogo size="small" />
      </div>

      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', padding: '0 0.75rem 0.5rem', letterSpacing: '0.05em' }}>
        NAVIGATION
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '9999px',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: isActive ? '#000000' : '#475569',
            backgroundColor: isActive ? '#a3e635' : 'transparent',
            transition: 'all 0.2s ease'
          })}
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}

      <div
        style={{
          marginTop: 'auto',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1rem',
          textAlign: 'center'
        }}
      >
        <div style={{ color: '#032d1f', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <Bot size={24} />
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          Groq AI Engine
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
          Automated classification & triage active.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
