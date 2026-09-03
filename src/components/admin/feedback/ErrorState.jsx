'use client';

import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to Load Module Data',
  message = 'An unexpected network error occurred while querying operational records.',
  onRetry
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--rose)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.25rem'
        }}
      >
        <AlertOctagon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: 'var(--rose)',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={15} />
          Retry Request
        </button>
      )}
    </div>
  );
}
