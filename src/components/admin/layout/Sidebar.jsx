'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  KeyRound,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { getRolePermissions, sanitizePermissions, canAccessModule } from '@/lib/rbac';

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
  'sub-admins': UserCheck,
  roles: KeyRound,
  logs: FileText,
  settings: Settings,
  monitoring: Activity
};

const NAVIGATION_GROUPS = [
  {
    title: 'MAIN OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin', permission: 'dashboard' }
    ]
  },
  {
    title: 'PAYMENTS & MONEY',
    items: [
      { id: 'wallets', label: 'User Balances', path: '/admin/wallets', permission: 'wallets' },
      { id: 'deposits', label: 'Deposits', path: '/admin/deposits', permission: 'deposits', badgeKey: 'deposits', badgeColor: 'emerald' },
      { id: 'withdrawals', label: 'Withdrawals', path: '/admin/withdrawals', permission: 'withdrawals', badgeKey: 'withdrawals', badgeColor: 'rose' },
      { id: 'transactions', label: 'Transactions', path: '/admin/transactions', permission: 'transactions' }
    ]
  },
  {
    title: 'GAMES & MATCHES',
    items: [
      { id: 'games', label: 'Game List', path: '/admin/games', permission: 'games' },
      { id: 'live-games', label: 'Live Matches', path: '/admin/live-games', permission: 'live-games', badgeKey: 'liveGames', badgeColor: 'emerald' },
      { id: 'disputes', label: 'Match Conflicts', path: '/admin/disputes', permission: 'disputes', badgeKey: 'disputes', badgeColor: 'gold' }
    ]
  },
  {
    title: 'USERS & SUPPORT',
    items: [
      { id: 'users', label: 'User Accounts', path: '/admin/users', permission: 'users' },
      { id: 'risk', label: 'Security & Fraud', path: '/admin/risk', permission: 'risk' },
      { id: 'referrals', label: 'Referrals', path: '/admin/referrals', permission: 'referrals' },
      { id: 'support', label: 'Support Tickets', path: '/admin/support', permission: 'support' }
    ]
  },
  {
    title: 'ADMIN STAFF',
    items: [
      { id: 'sub-admins', label: 'Admin Staff', path: '/admin/sub-admins', permission: 'admins' },
      { id: 'roles', label: 'Roles & Privileges', path: '/admin/roles', permission: 'roles' },
      { id: 'logs', label: 'Activity Logs', path: '/admin/audit-logs', permission: 'audit' }
    ]
  },
  {
    title: 'SYSTEM SETTINGS',
    items: [
      { id: 'notifications', label: 'Notifications', path: '/admin/notifications', permission: 'notifications' },
      { id: 'settings', label: 'Settings', path: '/admin/settings', permission: 'settings' },
      { id: 'monitoring', label: 'Server Status', path: '/admin/monitoring', permission: 'monitoring' }
    ]
  }
];

export default function Sidebar({
  permissions,
  collapsed,
  mobileOpen,
  setMobileOpen,
  pendingCounts = {},
  onLogout
}) {
  const pathname = usePathname();
  const resolvedPermissions = sanitizePermissions(permissions || getRolePermissions('SUPERADMIN'));

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
            zIndex: 45
          }}
        />
      )}

      <aside
        className={`sidebar-aside ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-expanded)',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: collapsed ? '1.25rem 0.5rem' : '1.25rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between'
          }}
        >
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div className="emerald-shield-glow">
              <Shield size={20} />
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Royal Ludo
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--emerald-light)', letterSpacing: '0.12em', marginTop: '2px' }}>
                  ADMIN OS
                </span>
              </div>
            )}
          </Link>

          {setMobileOpen && !collapsed && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Grouped Nav List */}
        <nav style={{ flex: 1, padding: collapsed ? '1rem 0.375rem' : '1rem 0.75rem', overflowY: 'auto' }}>
          {NAVIGATION_GROUPS.map((group) => {
            const accessibleItems = group.items.filter((item) => {
              if (item.id === 'dashboard') return true;
              return canAccessModule(resolvedPermissions, item.permission);
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} style={{ marginBottom: '1.25rem' }}>
                {!collapsed && (
                  <div
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      padding: '0.25rem 0.75rem',
                      marginBottom: '0.375rem'
                    }}
                  >
                    {group.title}
                  </div>
                )}

                {accessibleItems.map((item) => {
                  const Icon = iconMap[item.id] || LayoutDashboard;
                  const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                  const count = item.badgeKey ? pendingCounts[item.badgeKey] : null;

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '0.75rem' : '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                        backgroundColor: isActive ? 'var(--emerald-bg)' : 'transparent',
                        color: isActive ? 'var(--emerald-light)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 700 : 500,
                        textDecoration: 'none',
                        marginBottom: '0.25rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon size={18} color={isActive ? 'var(--emerald-light)' : 'var(--text-muted)'} />
                        {!collapsed && <span style={{ fontSize: '0.85rem' }}>{item.label}</span>}
                      </div>

                      {!collapsed && count ? (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: item.badgeColor === 'rose' ? 'rgba(244, 63, 94, 0.2)' : item.badgeColor === 'gold' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: item.badgeColor === 'rose' ? 'var(--rose)' : item.badgeColor === 'gold' ? 'var(--gold)' : 'var(--emerald-light)'
                          }}
                        >
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div style={{ padding: collapsed ? '0.5rem' : '0.875rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-void)' }}>
          <button
            onClick={onLogout}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-muted)',
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
