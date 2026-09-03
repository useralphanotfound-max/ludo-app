'use client';

import React from 'react';
import { Crown, Zap } from 'lucide-react';

export default function LudoDiceLoader({
  text = 'Loading Royal Ludo...',
  size = 'medium',
  fullScreen = false
}) {
  const getScale = () => {
    switch (size) {
      case 'small': return 0.65;
      case 'large': return 1.3;
      case 'huge': return 1.7;
      default: return 1;
    }
  };

  const scale = getScale();

  const loaderContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '1.25rem'
      }}
    >
      <div className="ludo-dice-container" style={{ transform: `scale(${scale})` }}>
        {/* Revolving 4-Color Neon Orbit Ring */}
        <div className="ludo-orbit-ring" />

        {/* Sleek Glowing Center Crown Core (No Dice Block) */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-1)',
            border: '1.5px solid var(--emerald-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-light)',
            boxShadow: '0 0 20px var(--emerald-glow), inset 0 0 10px rgba(16, 185, 129, 0.3)',
            animation: 'corePulseGlow 1.8s ease-in-out infinite'
          }}
        >
          <Crown size={22} color="var(--emerald-light)" />
        </div>
      </div>

      {text && (
        <div
          style={{
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
            fontWeight: 800,
            color: 'var(--emerald-light)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textShadow: '0 0 14px rgba(16, 185, 129, 0.45)'
          }}
        >
          <span className="pulse-indicator" style={{ width: '8px', height: '8px' }} />
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'var(--bg-void)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(12px)'
        }}
      >
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}
