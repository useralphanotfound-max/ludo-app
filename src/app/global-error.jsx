'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0c16', color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: '#facc15' }}>Global Application Exception</h2>
        <p style={{ color: '#94a3b8' }}>{error?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#facc15',
            color: '#0a0c16',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
