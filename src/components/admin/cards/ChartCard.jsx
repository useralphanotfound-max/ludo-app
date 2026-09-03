'use client';

import React from 'react';
import { SkeletonChart } from '../feedback/Skeleton';

export default function ChartCard({
  title,
  subtitle,
  actions,
  loading = false,
  children,
  height = '320px'
}) {
  if (loading) {
    return <SkeletonChart height={height} />;
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minHeight: height
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{actions}</div>}
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: '220px' }}>
        {children}
      </div>
    </div>
  );
}
