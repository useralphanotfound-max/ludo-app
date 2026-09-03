'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  onLimitChange
}) {
  const safePage = Math.max(1, Math.min(page, Math.max(1, totalPages)));
  const calculatedTotalPages = Math.max(1, totalPages);

  // Generate smart page numbers array
  const getPageNumbers = () => {
    if (calculatedTotalPages <= 7) {
      return Array.from({ length: calculatedTotalPages }, (_, i) => i + 1);
    }

    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, '...', calculatedTotalPages];
    }

    if (safePage >= calculatedTotalPages - 3) {
      return [1, '...', calculatedTotalPages - 4, calculatedTotalPages - 3, calculatedTotalPages - 2, calculatedTotalPages - 1, calculatedTotalPages];
    }

    return [1, '...', safePage - 1, safePage, safePage + 1, '...', calculatedTotalPages];
  };

  const startRecord = totalItems > 0 ? (safePage - 1) * limit + 1 : 0;
  const endRecord = totalItems > 0 ? Math.min(safePage * limit, totalItems) : 0;

  return (
    <div
      style={{
        padding: '0.875rem 1.25rem',
        backgroundColor: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        borderBottomLeftRadius: 'var(--radius-lg)',
        borderBottomRightRadius: 'var(--radius-lg)'
      }}
    >
      {/* Left: Records Range & Rows Per Page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div>
          Showing <strong style={{ color: 'var(--emerald-light)' }}>{startRecord}</strong> to{' '}
          <strong style={{ color: 'var(--emerald-light)' }}>{endRecord}</strong> of{' '}
          <strong style={{ color: '#ffffff' }}>{totalItems || 0}</strong> records
        </div>

        {onLimitChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Right: Unique Page Pills Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        {/* First Page */}
        <button
          onClick={() => onPageChange && onPageChange(1)}
          disabled={safePage <= 1}
          title="First Page"
          style={{
            padding: '0.4rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: safePage > 1 ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: safePage > 1 ? 'pointer' : 'not-allowed',
            opacity: safePage > 1 ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange && onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          title="Previous Page"
          style={{
            padding: '0.4rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: safePage > 1 ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: safePage > 1 ? 'pointer' : 'not-allowed',
            opacity: safePage > 1 ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 700
          }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Number Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {getPageNumbers().map((pNum, idx) => {
            if (pNum === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '0.3rem 0.4rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    userSelect: 'none'
                  }}
                >
                  •••
                </span>
              );
            }

            const isActive = pNum === safePage;

            return (
              <button
                key={`page-${pNum}`}
                onClick={() => onPageChange && onPageChange(Number(pNum))}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--emerald-light)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--emerald)' : 'var(--surface-2)',
                  color: isActive ? '#000000' : 'var(--text-primary)',
                  fontWeight: isActive ? 900 : 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 12px var(--emerald-glow)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {pNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange && onPageChange(safePage + 1)}
          disabled={safePage >= calculatedTotalPages}
          title="Next Page"
          style={{
            padding: '0.4rem 0.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: safePage < calculatedTotalPages ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: safePage < calculatedTotalPages ? 'pointer' : 'not-allowed',
            opacity: safePage < calculatedTotalPages ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 700
          }}
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange && onPageChange(calculatedTotalPages)}
          disabled={safePage >= calculatedTotalPages}
          title="Last Page"
          style={{
            padding: '0.4rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: safePage < calculatedTotalPages ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: safePage < calculatedTotalPages ? 'pointer' : 'not-allowed',
            opacity: safePage < calculatedTotalPages ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
