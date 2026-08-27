import React from 'react';

const NexDeskLogo = ({ size = 'medium', light = false }) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const iconBoxSize = isLarge ? '40px' : isSmall ? '28px' : '34px';
  const fontSize = isLarge ? '1.5rem' : isSmall ? '1.1rem' : '1.3rem';
  const markSize = isLarge ? '1.3rem' : isSmall ? '0.9rem' : '1.1rem';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isLarge ? '10px' : '8px', textDecoration: 'none' }}>
      {/* Ultra-Clean Geometric Icon */}
      <div
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          backgroundColor: '#032d1f',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a3e635',
          fontWeight: 900,
          fontSize: markSize,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.05em',
          boxShadow: '0 2px 8px rgba(3, 45, 31, 0.25)'
        }}
      >
        N
      </div>

      {/* Professional Brand Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span
          style={{
            fontSize: fontSize,
            fontWeight: 800,
            color: light ? '#ffffff' : '#032d1f',
            letterSpacing: '-0.03em',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          NexDesk
        </span>
      </div>
    </div>
  );
};

export default NexDeskLogo;
