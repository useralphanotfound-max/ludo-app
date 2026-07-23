'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardView from '@/components/views/DashboardView';
import UserManagementView from '@/components/views/UserManagementView';
import WithdrawalsView from '@/components/views/WithdrawalsView';
import DisputesView from '@/components/views/DisputesView';
import GameSettingsView from '@/components/views/GameSettingsView';
import AuditLogsView from '@/components/views/AuditLogsView';
import { apiFetch } from '@/services/api';

export default function SuperadminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({ disputes: 0, withdrawals: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('royal_admin_token');
    const storedUser = localStorage.getItem('royal_admin_user');

    if (!token || !storedUser) {
      router.push('/superadmin/login');
      return;
    }

    try {
      setAdmin(JSON.parse(storedUser));
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
          withdrawals: res.data.pending.withdrawals || 0
        });
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_admin_token');
    localStorage.removeItem('royal_admin_user');
    router.push('/superadmin/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#060913', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Authenticating Superadmin Session...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060913', color: '#f3f4f6' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        pendingCounts={pendingCounts}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          admin={admin}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          onLogout={handleLogout}
        />

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'withdrawals' && <WithdrawalsView />}
          {activeTab === 'disputes' && <DisputesView />}
          {activeTab === 'settings' && <GameSettingsView />}
          {activeTab === 'logs' && <AuditLogsView />}
        </main>
      </div>
    </div>
  );
}
