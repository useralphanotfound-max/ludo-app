'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  // Filter out initial 'admin' segment since root Link handles 'Admin'
  const displaySegments = segments[0] === 'admin' ? segments.slice(1) : segments;

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
      <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Home size={13} />
        <span>Admin</span>
      </Link>

      {displaySegments.map((seg, idx) => {
        const url = `/admin/${displaySegments.slice(0, idx + 1).join('/')}`;
        const isLast = idx === displaySegments.length - 1;
        const formattedLabel = seg.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
          <React.Fragment key={url}>
            <ChevronRight size={12} color="var(--text-dim)" />
            {isLast ? (
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formattedLabel}</span>
            ) : (
              <Link href={url} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                {formattedLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
