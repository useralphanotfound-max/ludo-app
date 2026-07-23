'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0c16',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-panel card-red-border" style={{
        maxWidth: '460px',
        padding: '2.5rem',
        borderRadius: '24px'
      }}>
        <AlertCircle size={48} color="#f87171" style={{ margin: '0 auto 1.25rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 0.75rem 0' }}>
          Application Error Encountered
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {error?.message || 'An unexpected runtime error occurred.'}
        </p>
        <button
          onClick={() => reset()}
          className="btn-gold"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <RefreshCw size={18} />
          <span>Reload Application</span>
        </button>
      </div>
    </div>
  );
}
