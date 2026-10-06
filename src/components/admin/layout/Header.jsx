'use client';

import React from 'react';
import { PanelLeftClose, PanelLeft, Search, LogOut, Eye, Menu, X, Wrench, ToggleLeft, ToggleRight } from 'lucide-react';

export default function Header({
  admin,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenSearch,
  onLogout,
  maintenanceMode = false,
  onToggleMaintenance,
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
        padding: '0 0.875rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '0.75rem',
        flexShrink: 0
      }}
    >
      {/* Left: Toggles + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, maxWidth: '480px' }}>
        {/* Mobile Hamburger */}
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle-btn"
            style={{ background: 'none', border: 'none', color: 'var(--emerald-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem', flexShrink: 0 }}
            title="Toggle Navigation"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        )}

        {/* Desktop Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="desktop-collapse-btn"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Search Bar */}
        <button
          onClick={onOpenSearch}
          style={{ flex: 1, minWidth: 0, backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.875rem', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
            <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Search users, transactions...</span>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px', backgroundColor: 'var(--surface-3)', color: 'var(--text-muted)', flexShrink: 0 }}>⌘K</span>
        </button>
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        {/* Preview Mode Pill */}
        {previewRole && (
          <div style={{ padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Eye size={13} />
            <span>Preview</span>
            <button onClick={onExitPreview} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem', textDecoration: 'underline', minHeight: 0, padding: 0 }}>Exit</button>
          </div>
        )}

        {/* Maintenance Toggle */}
        <button
          onClick={onToggleMaintenance}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 800, padding: '0.32rem 0.65rem', borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: maintenanceMode ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.1)', border: maintenanceMode ? '1px solid rgba(244,63,94,0.45)' : '1px solid rgba(16,185,129,0.3)', color: maintenanceMode ? 'var(--rose)' : 'var(--emerald-light)' }}
          title={maintenanceMode ? 'Maintenance ON — click to disable' : 'Maintenance OFF — click to enable'}
        >
          <Wrench size={13} />
          <span>Maintenance: <strong>{maintenanceMode ? 'ON' : 'OFF'}</strong></span>
          {maintenanceMode ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
        </button>

        {/* Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-2)', border: '1.5px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: 'var(--emerald-light)', boxShadow: '0 0 8px var(--emerald-glow)', flexShrink: 0 }}>
            {(admin?.username || admin?.email || 'SA').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {admin?.username || admin?.email || 'Admin'}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--emerald-light)', fontWeight: 800, letterSpacing: '0.03em' }}>
              {admin?.role || 'SUPERADMIN'}
            </span>
          </div>
          {onLogout && (
            <button onClick={onLogout} title="Sign Out" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)', minHeight: 0 }}>
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
