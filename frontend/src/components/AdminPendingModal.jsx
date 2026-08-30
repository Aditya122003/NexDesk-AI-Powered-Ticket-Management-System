import React from 'react';
import { X, ShieldAlert, CheckCircle2, Clock, Mail, ArrowRight, User } from 'lucide-react';

const AdminPendingModal = ({ isOpen, onClose, userName, userEmail, message }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '2px solid #cbd5e1',
          borderTop: '6px solid #f59e0b',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '14px', display: 'flex' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Admin Application Submitted!
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 600 }}>
                Pending Superadmin Review & Approval
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
        <div style={{ padding: '1.75rem' }}>

          {/* Details Summary Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Application Profile
              </span>
              <span
                style={{
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Clock size={12} /> PENDING APPROVAL
              </span>
            </div>

            {userName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
                <User size={15} style={{ color: '#64748b' }} /> {userName}
              </div>
            )}
            {userEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                <Mail size={15} style={{ color: '#64748b' }} /> {userEmail}
              </div>
            )}
          </div>

          {/* Message Alert Banner */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              color: '#92400e',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <CheckCircle2 size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 800, marginBottom: '2px', color: '#78350f' }}>
                Superadmin Approval Required
              </div>
              <div>
                {message || 'Admin registration submitted! Superadmin must approve your account before you can log in as Admin.'}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.85rem 1.5rem',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#032d1f',
              color: '#a3e635',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(3, 45, 31, 0.25)'
            }}
          >
            Got It! Proceed to Sign In <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPendingModal;
