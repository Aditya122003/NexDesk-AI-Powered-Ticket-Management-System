import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

const LoadingSpinner = ({ message = 'Synchronizing NexDesk Workspace Data...', fullPage = true }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullPage ? '60vh' : '220px',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '1.5rem' }}>
        {/* Outer glowing spinning ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3.5px solid transparent',
            borderTopColor: '#032d1f',
            borderRightColor: '#10b981',
            animation: 'spin 0.9s linear infinite',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)'
          }}
        />
        {/* Inner reverse spinning ring */}
        <div
          style={{
            position: 'absolute',
            inset: '9px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderBottomColor: '#22c55e',
            borderLeftColor: '#059669',
            animation: 'spinReverse 1.2s linear infinite'
          }}
        />
        {/* Center Pulsing Sparkles */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#032d1f'
          }}
        >
          <Sparkles style={{ width: '24px', height: '24px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.4rem',
          letterSpacing: '-0.01em'
        }}
      >
        {message}
      </h3>
      <p
        style={{
          fontSize: '0.85rem',
          color: '#64748b',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
      >
        <ShieldCheck style={{ width: '15px', height: '15px', color: '#10b981' }} />
        Secured by Groq AI Triage Engine
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
