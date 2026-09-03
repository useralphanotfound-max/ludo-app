'use client';

import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton-box"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonCard({ height = '140px' }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        height
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="14px" />
        <Skeleton width="24px" height="24px" borderRadius="50%" />
      </div>
      <Skeleton width="60%" height="28px" />
      <Skeleton width="30%" height="12px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="glass-panel" style={{ overflow: 'hidden', padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} height="16px" />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.875rem' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} width={`${100 / columns}%`} height="20px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ height = '300px' }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="30%" height="20px" />
        <Skeleton width="100px" height="28px" borderRadius="var(--radius-md)" />
      </div>
      <Skeleton width="100%" height="calc(100% - 40px)" borderRadius="var(--radius-md)" />
    </div>
  );
}
