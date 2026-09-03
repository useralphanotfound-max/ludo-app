'use client';

import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no records matching your current criteria or filter parameters.',
  icon: Icon = ShieldCheck,
  actionLabel,
  onAction
}) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--emerald)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0, lineHeight: 1.5 }}>
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--emerald)',
            color: '#000000',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
