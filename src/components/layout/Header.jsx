'use client';

import React from 'react';
import { Menu, PanelLeftClose, PanelLeft, Search, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ admin, mobileOpen, setMobileOpen, collapsed, setCollapsed, onLogout }) {
  return (
    <header style={{
      height: '65px',
      backgroundColor: '#0c0f1d',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Search Input Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '480px' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search user, transaction ID, game ID..."
            style={{
              width: '100%',
              backgroundColor: '#141829',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              color: '#ffffff',
              fontSize: '0.825rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Right Controls: All Systems Normal & Admin Initials Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Systems Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>All systems normal</span>
        </div>

        {/* Admin Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#1d243a',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            color: '#60a5fa'
          }}>
            RR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
              {admin?.username || 'Ritu Rao'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>SUPERADMIN</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '0.5rem' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
