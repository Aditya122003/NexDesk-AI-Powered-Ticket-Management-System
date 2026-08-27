import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import LandingPage from './LandingPage';
import { Lock, Check, AlertCircle, ArrowRight, KeyRound, X } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in both password fields');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must contain at least 1 uppercase letter (A-Z)');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMsg('Password must contain at least 1 lowercase letter (a-z)');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setErrorMsg('Password must contain at least 1 special character (!@#$%^&*)');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });

      if (res.data.success) {
        setSuccessMsg('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      const msg = err.response?.data?.message || 'Invalid or expired password reset link';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Landing Page */}
      <LandingPage initialMode="login" />

      {/* Reset Password Modal Popup Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2500,
          padding: '1rem',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.25rem',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)',
            border: '1.5px solid #cbd5e1',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => navigate('/login')}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              backgroundColor: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1.5px solid #a7f3d0',
                marginBottom: '0.75rem'
              }}
            >
              <KeyRound size={24} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.25rem' }}>
              Set New Password
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
              Enter your new password below to recover access
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1.5px solid #fca5a5',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1.5px solid #a7f3d0',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Password Reset Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#047857',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Updating Password...' : <>Confirm New Password <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: '#047857', fontWeight: 800, textDecoration: 'underline' }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
