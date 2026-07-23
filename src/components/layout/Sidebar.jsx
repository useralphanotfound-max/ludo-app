'use client';

import React from 'react';
import { LayoutDashboard, Users, ArrowUpRight, ShieldAlert, Settings, FileText, LogOut, ChevronRight, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, pendingCounts = {}, mobileOpen, setMobileOpen, collapsed }) {
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
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: collapsed ? '80px' : '270px',
        backgroundColor: '#0f1322',
        borderRight: '1px solid rgba(250, 204, 21, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        {/* Brand Header with Official Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
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
                boxShadow: '0 4px 16px rgba(250, 204, 21, 0.35)',
                border: '1.5px solid rgba(250, 204, 21, 0.6)'
              }}
            />
            {!collapsed && (
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  Royal Ludo
                </div>
                <div style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 800, marginTop: '2px', letterSpacing: '0.04em' }}>
                  SUPERADMIN PORTAL
                </div>
              </div>
            )}
          </div>

          {/* Close button for mobile screens */}
          {setMobileOpen && !collapsed && (
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
        <nav style={{ flex: 1, padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 0.875rem', overflowY: 'auto' }}>
          {!collapsed && (
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', paddingLeft: '0.625rem' }}>
              Navigation Console
            </div>
          )}

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={collapsed ? item.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '0.875rem' : '0.75rem 0.875rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(250, 204, 21, 0.15)' : 'transparent',
                  color: isActive ? '#facc15' : '#94a3b8',
                  fontWeight: isActive ? 800 : 500,
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: isActive ? '3px solid #facc15' : '3px solid transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Icon size={22} color={isActive ? '#facc15' : '#64748b'} />
                  {!collapsed && <span style={{ fontSize: '0.9rem' }}>{item.label}</span>}
                </div>

                {!collapsed && (
                  item.count ? (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: item.badgeColor === 'rose' ? 'rgba(239,68,68,0.2)' : 'rgba(250, 204, 21, 0.2)',
                      color: item.badgeColor === 'rose' ? '#f87171' : '#facc15'
                    }}>
                      {item.count}
                    </span>
                  ) : isActive ? (
                    <ChevronRight size={16} color="#facc15" />
                  ) : null
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div style={{ padding: collapsed ? '0.75rem' : '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: '#0a0c16' }}>
          <button
            onClick={onLogout}
            title={collapsed ? "Sign Out Admin" : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out Admin</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
