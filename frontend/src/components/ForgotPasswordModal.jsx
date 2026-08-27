import React, { useState } from 'react';
import API from '../services/api';
import { X, Mail, KeyRound, Check, AlertCircle, ArrowRight } from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setSuccessMsg('Password reset link sent to your email address. Check your inbox!');
        setEmail('');
      }
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '12px' }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Reset Your Password
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                Enter your email to receive a recovery link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
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

          {successMsg && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Account Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#032d1f',
                color: '#a3e635',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Sending...' : <>Send Reset Link <ArrowRight size={16} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
