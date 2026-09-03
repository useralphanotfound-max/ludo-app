'use client';

import React, { useState } from 'react';
import { SkeletonTable } from '../feedback/Skeleton';
import EmptyState from '../feedback/EmptyState';
import Pagination from './Pagination';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No Records Found',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
  page: serverPage,
  totalPages: serverTotalPages,
  totalItems: serverTotalItems,
  onPageChange: serverOnPageChange,
  defaultLimit = 10
}) {
  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(defaultLimit);

  if (loading) {
    return <SkeletonTable rows={6} columns={columns.length || 5} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const isServerPaginated = Boolean(serverOnPageChange);

  // Client-side pagination calculations if serverOnPageChange is not provided
  const activePage = isServerPaginated ? (serverPage || 1) : localPage;
  const activeLimit = localLimit;
  const totalRecords = isServerPaginated ? (serverTotalItems || data.length) : data.length;
  const computedTotalPages = isServerPaginated
    ? (serverTotalPages || Math.ceil(totalRecords / activeLimit) || 1)
    : Math.ceil(data.length / activeLimit) || 1;

  const displayData = isServerPaginated
    ? data
    : data.slice((activePage - 1) * activeLimit, activePage * activeLimit);

  const handlePageChange = (newPage) => {
    if (isServerPaginated) {
      serverOnPageChange(newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLocalLimit(newLimit);
    if (!isServerPaginated) {
      setLocalPage(1);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--surface-2)',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{
                    padding: '0.875rem 1rem',
                    fontWeight: 800,
                    textAlign: col.align || 'left'
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rIdx) => (
              <tr
                key={row.id || row._id || rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={col.key || cIdx}
                    style={{
                      padding: '0.875rem 1rem',
                      textAlign: col.align || 'left',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={activePage}
        totalPages={computedTotalPages}
        totalItems={totalRecords}
        limit={activeLimit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
