import React from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  subMessage = 'This action cannot be undone.',
  confirmText = 'Permanently Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s ease'
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Header Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: isDanger ? '#fef2f2' : '#fffbebe',
            border: isDanger ? '1px solid #fee2e2' : '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}
        >
          {isDanger ? (
            <Trash2 size={28} style={{ color: '#dc2626' }} />
          ) : (
            <AlertTriangle size={28} style={{ color: '#d97706' }} />
          )}
        </div>

        {/* Modal Body */}
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#334155',
            lineHeight: 1.5,
            marginBottom: '0.5rem',
            fontWeight: 600
          }}
        >
          {message}
        </p>

        {subMessage && (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #ffe4e6',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.8rem',
              color: '#be123c',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1.5rem'
            }}
          >
            <ShieldAlert size={15} style={{ flexShrink: 0 }} />
            <span>{subMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isDanger ? '#dc2626' : '#d97706',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: isDanger
                ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                : '0 4px 12px rgba(217, 119, 6, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Trash2 size={16} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
