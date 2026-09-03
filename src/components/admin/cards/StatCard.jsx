'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function StatCard({
  title,
  value,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon = Activity,
  badgeText,
  badgeColor = 'emerald',
  subtext
}) {
  const isUp = trendType === 'up';
  const isDown = trendType === 'down';

  const trendColor = isUp ? 'var(--emerald-light)' : isDown ? 'var(--rose)' : 'var(--text-muted)';
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Activity;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: badgeColor === 'rose' ? 'rgba(244, 63, 94, 0.12)' : badgeColor === 'gold' ? 'rgba(245, 158, 11, 0.12)' : badgeColor === 'purple' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: badgeColor === 'rose' ? 'var(--rose)' : badgeColor === 'gold' ? 'var(--gold)' : badgeColor === 'purple' ? 'var(--purple)' : 'var(--emerald-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* Primary Metric Display */}
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: '2px 0' }}>
        {value}
      </div>

      {/* Footer Trend Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        {trend ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trendColor, fontWeight: 700 }}>
            <TrendIcon size={13} />
            <span>{trend}</span>
          </div>
        ) : subtext ? (
          <span style={{ color: 'var(--text-muted)' }}>{subtext}</span>
        ) : null}

        {badgeText && (
          <span
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.65rem',
              fontWeight: 800,
              backgroundColor: badgeColor === 'rose' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: badgeColor === 'rose' ? 'var(--rose)' : 'var(--emerald-light)'
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
