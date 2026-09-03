'use client';

import React from 'react';

export default function FilterGroup({ options = [], activeValue, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
      {options.map((opt) => {
        const isActive = activeValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: isActive ? '1px solid var(--emerald-light)' : '1px solid var(--border)',
              backgroundColor: isActive ? 'var(--emerald-bg)' : 'transparent',
              color: isActive ? 'var(--emerald-light)' : 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: isActive ? 800 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
