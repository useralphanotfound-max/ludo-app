'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Gamepad2,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Gift,
  Bell,
  HelpCircle,
  FileText,
  Settings,
  Activity,
  LogOut,
  X,
  Shield,
  KeyRound
} from 'lucide-react';
import { buildNavigation, getRolePermissions } from '@/lib/rbac';

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  wallets: Wallet,
  deposits: ArrowDownLeft,
  withdrawals: ArrowUpRight,
  transactions: Receipt,
  games: Gamepad2,
  'live-games': Radio,
  disputes: ShieldAlert,
  risk: ShieldCheck,
  referrals: Gift,
  notifications: Bell,
  support: HelpCircle,
  roles: KeyRound,
  admins: Shield,
  logs: FileText,
  settings: Settings,
  monitoring: Activity
};

export default function Sidebar({ activeTab, setActiveTab, onLogout, pendingCounts = {}, mobileOpen, setMobileOpen, collapsed, permissions }) {
  const resolvedPermissions = permissions || getRolePermissions('SUPERADMIN');
  const navItems = buildNavigation(resolvedPermissions).map((item) => ({
    ...item,
    icon: iconMap[item.id] || LayoutDashboard,
    count: item.id === 'deposits' ? pendingCounts.deposits || null : item.id === 'withdrawals' ? pendingCounts.withdrawals || null : item.id === 'live-games' ? pendingCounts.liveGames || null : item.id === 'disputes' ? pendingCounts.disputes || null : null,
    badgeColor: item.id === 'deposits' ? 'emerald' : item.id === 'withdrawals' ? 'rose' : item.id === 'live-games' ? 'emerald' : item.id === 'disputes' ? 'gold' : null
  }));

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 40
          }}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: collapsed ? '75px' : '260px',
        backgroundColor: '#0c0f1d',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}>
              <Shield size={20} />
            </div>
            {!collapsed && (
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Ludo Control
              </span>
            )}
          </div>

          {setMobileOpen && !collapsed && (
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Clean Nav List without section headers */}
        <nav style={{ flex: 1, padding: collapsed ? '1rem 0.375rem' : '1rem 0.75rem', overflowY: 'auto' }}>
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
                  padding: collapsed ? '0.75rem' : '0.65rem 0.75rem',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: isActive ? '#10b981' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  marginBottom: '0.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} color={isActive ? '#10b981' : '#64748b'} />
                  {!collapsed && <span style={{ fontSize: '0.85rem' }}>{item.label}</span>}
                </div>

                {!collapsed && item.count ? (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    backgroundColor: item.badgeColor === 'rose' ? 'rgba(239,68,68,0.2)' : item.badgeColor === 'emerald' ? 'rgba(16,185,129,0.2)' : 'rgba(250, 204, 21, 0.2)',
                    color: item.badgeColor === 'rose' ? '#f87171' : item.badgeColor === 'emerald' ? '#34d399' : '#facc15'
                  }}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div style={{ padding: collapsed ? '0.5rem' : '0.875rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: '#090b16' }}>
          <button
            onClick={onLogout}
            title={collapsed ? "Collapse / Sign Out" : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
