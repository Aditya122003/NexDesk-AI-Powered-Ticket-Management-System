import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('[NotificationContext] Failed to fetch notifications:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 10 seconds to auto-refresh notifications
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchNotifications();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated]);

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationContext] Error marking notifications read:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAllAsRead,
        showToast,
        toast
      }}
    >
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#6366f1',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 9999,
            fontWeight: 600,
            animation: 'slideUp 0.3s ease'
          }}
        >
          {toast.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
