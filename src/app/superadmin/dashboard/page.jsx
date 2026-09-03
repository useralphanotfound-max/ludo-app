'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LiveTicker from '@/components/common/LiveTicker';
import DashboardView from '@/components/views/DashboardView';
import UserManagementView from '@/components/views/UserManagementView';
import WalletManagementView from '@/components/views/WalletManagementView';
import DepositManagementView from '@/components/views/DepositManagementView';
import WithdrawalManagementView from '@/components/views/WithdrawalManagementView';
import TransactionsLedgerView from '@/components/views/TransactionsLedgerView';
import GameCatalogView from '@/components/views/GameCatalogView';
import LiveGamesView from '@/components/views/LiveGamesView';
import DisputesView from '@/components/views/DisputesView';
import AntiCheatView from '@/components/views/AntiCheatView';
import ReferralView from '@/components/views/ReferralView';
import NotificationsView from '@/components/views/NotificationsView';
import SupportTicketsView from '@/components/views/SupportTicketsView';
import AuditLogsView from '@/components/views/AuditLogsView';
import GameSettingsView from '@/components/views/GameSettingsView';
import SystemMonitoringView from '@/components/views/SystemMonitoringView';
import RolesPermissionsView from '@/components/views/RolesPermissionsView';
import { apiFetch } from '@/services/api';
import { getRolePermissions } from '@/lib/rbac';

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState(getRolePermissions('SUPERADMIN'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ disputes: 0, withdrawals: 0, deposits: 0, liveGames: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('royal_admin_token');
    const storedUser = localStorage.getItem('royal_admin_user');

    if (!token || !storedUser) {
      router.push('/superadmin/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(storedUser);
      setAdmin(parsedAdmin);
      setPermissions(getRolePermissions(parsedAdmin?.role || 'SUPERADMIN'));
      fetchPendingCounts();
    } catch (e) {
      router.push('/superadmin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchPendingCounts = async () => {
    try {
      const res = await apiFetch('/admin/dashboard');
      if (res.status && res.data?.pending) {
        setPendingCounts({
          disputes: res.data.pending.disputes || 0,
          withdrawals: res.data.pending.withdrawals || 0,
          deposits: res.data.financials?.deposits?.pendingRs || 0,
          liveGames: res.data.games?.running || 0
        });
      }
    } catch (e) { }
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_admin_token');
    localStorage.removeItem('royal_admin_user');
    router.push('/superadmin/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0c0f1d', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
        Authenticating Superadmin Session...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090b16', color: '#f8fafc' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        pendingCounts={pendingCounts}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        permissions={permissions}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          admin={admin}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={handleLogout}
        />

        <LiveTicker />

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardView permissions={permissions} />}
          {activeTab === 'users' && <UserManagementView permissions={permissions} />}
          {activeTab === 'wallets' && <WalletManagementView permissions={permissions} />}
          {activeTab === 'deposits' && <DepositManagementView permissions={permissions} />}
          {activeTab === 'withdrawals' && <WithdrawalManagementView permissions={permissions} />}
          {activeTab === 'transactions' && <TransactionsLedgerView permissions={permissions} />}
          {activeTab === 'games' && <GameCatalogView permissions={permissions} />}
          {activeTab === 'live-games' && <LiveGamesView permissions={permissions} />}
          {activeTab === 'disputes' && <DisputesView permissions={permissions} />}
          {activeTab === 'risk' && <AntiCheatView permissions={permissions} />}
          {activeTab === 'anticheat' && <AntiCheatView permissions={permissions} />}
          {activeTab === 'referrals' && <ReferralView permissions={permissions} />}
          {activeTab === 'notifications' && <NotificationsView permissions={permissions} />}
          {activeTab === 'support' && <SupportTicketsView permissions={permissions} />}
          {activeTab === 'roles' && <RolesPermissionsView permissions={permissions} />}
          {activeTab === 'logs' && <AuditLogsView permissions={permissions} />}
          {activeTab === 'settings' && <GameSettingsView permissions={permissions} />}
          {activeTab === 'monitoring' && <SystemMonitoringView permissions={permissions} />}
        </main>
      </div>
    </div>
  );
}
