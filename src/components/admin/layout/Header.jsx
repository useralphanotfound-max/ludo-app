'use client';

import React from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeft, Search, LogOut, Shield, ShieldCheck, Eye, RefreshCw } from 'lucide-react';

export default function Header({
  admin,
  collapsed,
  setCollapsed,
  onOpenSearch,
  onLogout,
  systemStatus = { text: 'All Systems Operational', isHealthy: true },
  previewRole,
  onExitPreview
}) {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-header)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Search Input Bar & Collapse Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '520px' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeft size={19} /> : <PanelLeftClose size={19} />}
        </button>

        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            backgroundColor: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Search size={15} color="var(--text-muted)" />
            <span>Search user, transaction ID, game ID...</span>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)' }}>
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Controls: Real System Uptime Status + Admin Profile & Preview Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Permission Preview Mode Alert Pill */}
        {previewRole && (
          <div
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: 'var(--gold)',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Eye size={14} />
            <span>Previewing as: {previewRole}</span>
            <button
              onClick={onExitPreview}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline'
              }}
            >
              Exit
            </button>
          </div>
        )}

        {/* Real Systems Pulse Link */}
        <Link
          href="/admin/monitoring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: systemStatus.isHealthy ? 'var(--emerald-light)' : 'var(--rose)',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: systemStatus.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: systemStatus.isHealthy ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)'
          }}
          title="Click to view full infrastructure monitoring"
        >
          <span className="pulse-indicator" style={{ backgroundColor: systemStatus.isHealthy ? 'var(--emerald)' : 'var(--rose)' }} />
          <span>{systemStatus.text}</span>
        </Link>

        {/* Admin Avatar & Role Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              color: 'var(--emerald-light)',
              boxShadow: '0 0 12px var(--emerald-glow)'
            }}
          >
            {(admin?.username || 'SA').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {admin?.username || 'Super Admin'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--emerald-light)', fontWeight: 800 }}>
              {admin?.role || 'SUPERADMIN'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
