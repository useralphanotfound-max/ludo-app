'use client';

import React from 'react';

export default function LudoLoader({ text = 'Loading Royal Ludo Data...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      textAlign: 'center'
    }}>
      <div className="ludo-dice-loader" aria-label="Loading" role="status" style={{
        position: 'relative',
        width: '72px',
        height: '72px',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="dice-face" style={{
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #d9e7ff 100%)',
          border: '2px solid rgba(255,255,255,0.8)',
          boxShadow: '0 16px 30px rgba(15, 23, 42, 0.35)',
          position: 'relative',
          animation: 'diceFloat 1.8s ease-in-out infinite'
        }}>
          <span style={{ position: 'absolute', top: '16px', left: '16px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
          <span style={{ position: 'absolute', top: '16px', right: '16px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
          <span style={{ position: 'absolute', bottom: '16px', left: '16px', width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
          <span style={{ position: 'absolute', bottom: '16px', right: '16px', width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
          <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#0f172a', boxShadow: '0 0 0 2px rgba(255,255,255,0.8)' }} />
        </div>
      </div>

      <div style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#f8fafc',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        animation: 'pulseText 1.5s ease-in-out infinite'
      }}>
        {text}
      </div>
    </div>
  );
}
