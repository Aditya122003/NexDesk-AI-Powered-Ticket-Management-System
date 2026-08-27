import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, EyeOff, Download } from 'lucide-react';

const ChartHeaderMenu = ({ showLabels, onToggleLabels, onDownload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: isOpen ? '#cbd5e1' : '#f1f5f9',
          color: '#334155',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '5px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        title="Chart Menu"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            backgroundColor: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
            padding: '6px',
            minWidth: '175px',
            zIndex: 100
          }}
        >
          <button
            onClick={() => {
              onToggleLabels();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            {showLabels ? <EyeOff size={15} style={{ color: '#d97706' }} /> : <Eye size={15} style={{ color: '#059669' }} />}
            Label: <span style={{ fontWeight: 900, color: showLabels ? '#059669' : '#64748b' }}>{showLabels ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              onDownload();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <Download size={15} style={{ color: '#0284c7' }} />
            Download Chart
          </button>
        </div>
      )}
    </div>
  );
};

export default ChartHeaderMenu;
