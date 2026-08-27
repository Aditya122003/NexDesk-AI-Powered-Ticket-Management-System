import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Sparkles, Mail, Lock, Shield, User, ArrowRight, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      showToast(error.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Official Google OAuth Response Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        showToast('No credential returned from Google', 'error');
        return;
      }

      const res = await googleLogin({
        credential: credentialResponse.credential
      });

      if (res.success) {
        showToast(`Google Authentication successful! Welcome ${res.user.name}`, 'success');
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[Google OAuth] Authentication Error:', error);
      showToast(error.response?.data?.message || 'Google OAuth Sign-In failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast('Google OAuth popup closed or failed to authorize', 'error');
  };

  // Quick Demo Account Logins
  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        showToast(`Logged in as ${res.user.role.toUpperCase()}`, 'success');
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      showToast('Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, #0b0f19 70%)',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-color-glow)'
        }}
      >
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              padding: '10px 18px',
              borderRadius: '14px',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={22} /> NexDesk Helpdesk
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Sign in with Google OAuth or Email credentials
          </p>
        </div>

        {/* Official Google OAuth Sign-In Widget */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', width: '100%' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="pill"
            theme="filled_blue"
            size="large"
            text="continue_with"
            width="340"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
          <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
          <span style={{ padding: '0 0.75rem', fontWeight: 700 }}>or sign in with email</span>
          <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }}></div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="admin@helpdesk.com or john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? <Loader2 size={18} className="spin" /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
            ⚡ Instant Demo Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              onClick={() => handleDemoLogin('admin@helpdesk.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', gap: '4px' }}
            >
              <Shield size={13} style={{ color: '#818cf8' }} /> Login as Admin
            </button>
            <button
              onClick={() => handleDemoLogin('john@example.com', 'customer123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', gap: '4px' }}
            >
              <User size={13} style={{ color: '#34d399' }} /> Login Customer
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
