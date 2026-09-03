'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, totalPages = 1, totalItems = 0, onPageChange }) {
  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div
      style={{
        padding: '0.875rem 1.25rem',
        backgroundColor: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}
    >
      <div>
        Showing Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong> ({totalItems} Total Records)
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: page > 1 ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: page > 1 ? 'pointer' : 'not-allowed',
            opacity: page > 1 ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 700
          }}
        >
          <ChevronLeft size={15} /> Previous
        </button>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: page < totalPages ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: page < totalPages ? 'pointer' : 'not-allowed',
            opacity: page < totalPages ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 700
          }}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
