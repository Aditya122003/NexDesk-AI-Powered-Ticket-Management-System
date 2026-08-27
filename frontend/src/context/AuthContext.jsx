import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('[AuthContext] Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const saveAuthData = (userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', tokenStr);
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success && res.data.token) {
      saveAuthData(res.data.user, res.data.token);
    }
    return res.data;
  };

  const googleLogin = async (googleData) => {
    const res = await API.post('/auth/google', googleData);
    if (res.data.success && res.data.token) {
      saveAuthData(res.data.user, res.data.token);
    }
    return res.data;
  };

  const register = async (name, email, password, role = 'customer') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    if (res.data.success && res.data.token) {
      saveAuthData(res.data.user, res.data.token);
    }
    return res.data;
  };

  const updateUser = (updatedUserObj, newTokenStr) => {
    setUser(updatedUserObj);
    localStorage.setItem('user', JSON.stringify(updatedUserObj));
    if (newTokenStr) {
      setToken(newTokenStr);
      localStorage.setItem('token', newTokenStr);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isSuperadmin = user?.role === 'superadmin' || user?.email === 'adityatiwari5175@gmail.com';
  const isAdmin = isSuperadmin || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isSuperadmin,
        isCustomer: user?.role === 'customer',
        login,
        googleLogin,
        register,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
export const useAuth = () => useContext(AuthContext);
