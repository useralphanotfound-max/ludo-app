'use client';

import React from 'react';

export default function StatusBadge({ status = 'ACTIVE', text }) {
  const st = String(status || '').toUpperCase();

  let bg = 'rgba(16, 185, 129, 0.15)';
  let color = 'var(--emerald-light)';
  let border = '1px solid rgba(16, 185, 129, 0.3)';

  if (st === 'BANNED' || st === 'SUSPENDED' || st === 'FAILED' || st === 'REJECTED' || st === 'CANCELLED' || st === 'HIGH') {
    bg = 'rgba(244, 63, 94, 0.15)';
    color = 'var(--rose)';
    border = '1px solid rgba(244, 63, 94, 0.3)';
  } else if (st === 'PENDING' || st === 'PENDING_VERIFICATION' || st === 'WAITING' || st === 'MEDIUM' || st === 'DISPUTED') {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = 'var(--gold)';
    border = '1px solid rgba(245, 158, 11, 0.3)';
  } else if (st === 'SUPERADMIN' || st === 'VIP' || st === 'RESOLVED' || st === 'SUCCESS' || st === 'COMPLETED' || st === 'VERIFIED') {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = 'var(--emerald-light)';
    border = '1px solid rgba(16, 185, 129, 0.3)';
  } else if (st === 'LOW' || st === 'OPERATIONS_ADMIN' || st === 'FINANCE_MANAGER') {
    bg = 'rgba(59, 130, 246, 0.15)';
    color = 'var(--blue)';
    border = '1px solid rgba(59, 130, 246, 0.3)';
  }

  return (
    <span
      style={{
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.68rem',
        fontWeight: 800,
        backgroundColor: bg,
        color,
        border,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}
    >
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color }} />
      {text || st}
    </span>
  );
}
