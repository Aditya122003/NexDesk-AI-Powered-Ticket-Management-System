import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Ticket as TicketIcon } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
        style={{ padding: '0.5rem 0.75rem', position: 'relative', borderRadius: '50%' }}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: '350px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#032d1f',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    padding: '0.9rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: n.read ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    gap: '0.85rem',
                    alignItems: 'flex-start',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: n.read ? '#f1f5f9' : '#ecfdf5',
                      color: n.read ? '#64748b' : '#047857',
                      padding: '8px',
                      borderRadius: '10px',
                      marginTop: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TicketIcon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45, fontWeight: 500 }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
