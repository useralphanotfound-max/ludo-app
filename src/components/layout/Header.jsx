'use client';

import React from 'react';
import { Menu, Globe, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({ admin, mobileOpen, setMobileOpen, onLogout }) {
  return (
    <header style={{
      height: '70px',
      backgroundColor: '#090d16',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      backdropFilter: 'blur(16px)'
    }}>
      {/* Mobile Toggle & Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '0.5rem',
            color: '#f59e0b',
            cursor: 'pointer'
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <img
            src="/logo.png"
            alt="Royal Ludo Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              objectFit: 'cover',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
              border: '1.5px solid rgba(245, 158, 11, 0.5)'
            }}
          />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Royal Ludo
            </div>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800, letterSpacing: '0.05em' }}>
              SUPERADMIN CONSOLE
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile & Action Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="desktop-only-ip" style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          padding: '0.375rem 0.75rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#60a5fa'
        }}>
          <Globe size={14} />
          <span>IP: <strong>{admin?.lastLoginIp || '127.0.0.1 (Localhost)'}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <img
            src={admin?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin'}
            alt="Superadmin Avatar"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '2px solid #f59e0b',
              backgroundColor: '#0f172a',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
            }}
          />
          <div className="desktop-only-user">
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              {admin?.username || 'admin@royalludo.com'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={12} />
              <span>SUPERADMIN</span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: '#f87171',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginLeft: '0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
