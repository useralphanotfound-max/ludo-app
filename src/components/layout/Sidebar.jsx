'use client';

import React from 'react';
import { LayoutDashboard, Users, ArrowUpRight, ShieldAlert, Settings, FileText, LogOut, ChevronRight, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, pendingCounts = {}, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, count: null },
    { id: 'users', label: 'Users & Wallets', icon: Users, count: null },
    { id: 'withdrawals', label: 'Cashout Queue', icon: ArrowUpRight, count: pendingCounts.withdrawals || null, badgeColor: 'rose' },
    { id: 'disputes', label: 'Match Disputes', icon: ShieldAlert, count: pendingCounts.disputes || null, badgeColor: 'gold' },
    { id: 'settings', label: 'System Settings', icon: Settings, count: null },
    { id: 'logs', label: 'IP Audit Trail', icon: FileText, count: null },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: '270px',
        backgroundColor: '#090d16',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Brand Header with Official Logo */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <img
              src="/logo.png"
              alt="Royal Ludo Logo"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                border: '1.5px solid rgba(245, 158, 11, 0.5)'
              }}
            />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Royal Ludo
              </div>
              <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800, marginTop: '2px', letterSpacing: '0.04em' }}>
                SUPERADMIN PORTAL
              </div>
            </div>
          </div>

          {/* Close button for mobile screen */}
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="mobile-close-btn"
              style={{ display: 'none', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '1.25rem 0.875rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', paddingLeft: '0.625rem' }}>
            Navigation Console
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  color: isActive ? '#f59e0b' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  marginBottom: '0.375rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Icon size={20} color={isActive ? '#f59e0b' : '#64748b'} />
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                </div>

                {item.count ? (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: item.badgeColor === 'rose' ? 'rgba(244,63,94,0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: item.badgeColor === 'rose' ? '#f87171' : '#fef08a'
                  }}>
                    {item.count}
                  </span>
                ) : isActive ? (
                  <ChevronRight size={16} color="#f59e0b" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.07)', backgroundColor: '#060913' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              color: '#f87171',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
