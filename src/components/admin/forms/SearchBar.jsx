'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search records...',
  style = {}
}) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '360px', ...style }}>
      <Search
        size={16}
        color="var(--text-muted)"
        style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="custom-input"
        style={{ paddingLeft: '2.5rem', paddingRight: value ? '2.25rem' : '0.875rem' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
