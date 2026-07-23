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
      {/* 3D Animated Ludo Coin Token */}
      <div className="ludo-coin-loader" style={{
        width: '64px',
        height: '64px',
        position: 'relative',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #ffe066 0%, #f59e0b 50%, #b45309 100%)',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -4px 6px rgba(0, 0, 0, 0.4)',
          border: '3px solid #fef08a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'coin3DSpin 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }}>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#78350f',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            ₹
          </span>
        </div>
      </div>

      <div style={{
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#fbbf24',
        letterSpacing: '0.02em',
        animation: 'pulseText 1.5s ease-in-out infinite'
      }}>
        {text}
      </div>
    </div>
  );
}
