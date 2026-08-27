import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, RotateCcw } from 'lucide-react';

const CustomDateModal = ({ isOpen, onClose, startDate, endDate, onApply }) => {
  const [tempStart, setTempStart] = useState('');
  const [tempEnd, setTempEnd] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTempStart('');
      setTempEnd('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = (e) => {
    if (e) e.preventDefault();
    onApply(tempStart, tempEnd);
    onClose();
  };

  const handlePreset = (days) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setTempStart(start.toISOString().split('T')[0]);
    setTempEnd(end.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    setTempStart('');
    setTempEnd('');
    onApply('', '');
    onClose();
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
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#032d1f',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#a3e635' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Custom Date Range</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApply} style={{ padding: '1.5rem' }}>
          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset(15)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
              >
                Last 15 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset(30)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => handlePreset(90)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
              >
                Last 90 Days
              </button>
            </div>
          </div>

          {/* Date Pickers */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                From Date
              </label>
              <input
                type="date"
                className="form-control"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                To Date
              </label>
              <input
                type="date"
                className="form-control"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={15} /> Apply Range
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomDateModal;
