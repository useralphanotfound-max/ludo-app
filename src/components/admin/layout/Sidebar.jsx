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
  Globe,
  ChevronRight,
  User
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
  'master-web-settings': Globe,
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
      { id: 'settings', label: 'Global Settings', path: '/admin/settings', permission: 'settings' },
      { id: 'master-web-settings', label: 'Web Master Switch', path: '/admin/master-web-settings', permission: 'settings' },
      { id: 'monitoring', label: 'Server Monitoring', path: '/admin/monitoring', permission: 'monitoring' }
    ]
  }
];

export default function Sidebar({
  admin,
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity"
        />
      )}

      <aside
        className={`sidebar-aside ${mobileOpen ? 'mobile-open' : ''} flex flex-col h-screen sticky top-0 z-50 bg-[#0c0f1d] border-r border-slate-800/80 shadow-2xl transition-all duration-300 overflow-hidden selection:bg-emerald-500 selection:text-slate-950`}
        style={{
          width: collapsed ? 'var(--sidebar-collapsed, 80px)' : 'var(--sidebar-expanded, 270px)',
        }}
      >
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between border-b border-slate-800/80 bg-[#090b16] ${
            collapsed ? 'p-3 justify-center' : 'px-5 py-4'
          }`}
        >
          <Link href="/admin" className="flex items-center gap-3 group text-decoration-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0c0f1d] rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-black text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                  Royal Ludo
                </span>
                <span className="text-[10px] font-extrabold text-emerald-400 tracking-widest uppercase mt-1">
                  ADMIN OS
                </span>
              </div>
            )}
          </Link>

          {setMobileOpen && !collapsed && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Grouped Navigation List with Custom Smooth Scroll */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {NAVIGATION_GROUPS.map((group) => {
            const accessibleItems = group.items.filter((item) => {
              if (item.id === 'dashboard') return true;
              return canAccessModule(resolvedPermissions, item.permission);
            });

            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 pb-1.5 text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
                    {group.title}
                  </div>
                )}

                {accessibleItems.map((item) => {
                  const Icon = iconMap[item.id] || LayoutDashboard;
                  const isActive =
                    pathname === item.path ||
                    (item.path !== '/admin' && pathname.startsWith(item.path));
                  const count = item.badgeKey ? pendingCounts[item.badgeKey] : null;

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setMobileOpen && setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center justify-between rounded-2xl transition-all duration-200 ${
                        collapsed ? 'p-3 justify-center' : 'px-3.5 py-3'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-300 font-extrabold border-l-4 border-emerald-400 shadow-sm shadow-emerald-500/10'
                          : 'text-slate-400 font-medium hover:text-slate-200 hover:bg-slate-800/40 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {!collapsed && (
                          <span className="text-xs tracking-wide truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && count ? (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            item.badgeColor === 'rose'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : item.badgeColor === 'gold'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
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

        {/* Footer Admin Profile Card */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090b16] mt-auto">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                  {admin?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {admin?.email || 'admin@royalludo.com'}
                  </span>
                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider mt-0.5">
                    {admin?.role || 'SUPERADMIN'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="w-full p-3 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
