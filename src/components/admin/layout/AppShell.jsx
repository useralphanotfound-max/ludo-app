'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import GlobalSearchModal from './GlobalSearchModal';
import LiveTicker from '@/components/common/LiveTicker';
import { getRolePermissions } from '@/lib/rbac';
import { apiFetch } from '@/services/api';

export default function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] = useState(null);
  const [permissions, setPermissions] = useState(getRolePermissions('SUPERADMIN'));
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({ disputes: 0, withdrawals: 0, deposits: 0, liveGames: 0 });
  const [systemStatus, setSystemStatus] = useState({ text: 'All Systems Operational', isHealthy: true });
  const [previewRole, setPreviewRole] = useState(null);

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem('royal_admin_token');
    const storedUser = localStorage.getItem('royal_admin_user');

    if (!token || !storedUser) {
      router.push('/superadmin/login');
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setAdmin(parsed);
      const rolePerms = getRolePermissions(parsed?.role || 'SUPERADMIN');
      setPermissions(rolePerms);
      fetchTelemetry();
    } catch (e) {
      router.push('/superadmin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchTelemetry = async () => {
    try {
      const res = await apiFetch('/admin/dashboard');
      if (res.status && res.data) {
        setPendingCounts({
          disputes: res.data.pending?.disputes || 0,
          withdrawals: res.data.pending?.withdrawals || 0,
          deposits: res.data.financials?.deposits?.pendingRs || 0,
          liveGames: res.data.games?.running || 0
        });
      }

      // Monitoring fetch
      const monRes = await apiFetch('/admin/monitoring');
      if (monRes.status && monRes.data) {
        const isHealthy = monRes.data.apiStatus === 'HEALTHY' && monRes.data.dbStatus === 'CONNECTED';
        setSystemStatus({
          text: isHealthy ? 'All Systems Operational' : 'Services Degraded',
          isHealthy
        });
      }
    } catch (e) { }
  };

  const handleLogout = () => {
    localStorage.removeItem('royal_admin_token');
    localStorage.removeItem('royal_admin_user');
    router.push('/superadmin/login');
  };

  const handlePreviewRole = (roleId) => {
    setPreviewRole(roleId);
    setPermissions(getRolePermissions(roleId));
  };

  const handleExitPreview = () => {
    setPreviewRole(null);
    if (admin) {
      setPermissions(getRolePermissions(admin.role || 'SUPERADMIN'));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-void)',
          color: 'var(--emerald-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.9rem',
          gap: '1rem'
        }}
      >
        <div className="pulse-indicator" style={{ width: '16px', height: '16px' }} />
        <span>Authenticating Royal Ludo Admin OS Session...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <Sidebar
        permissions={permissions}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        pendingCounts={pendingCounts}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          admin={admin}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onOpenSearch={() => setSearchOpen(true)}
          onLogout={handleLogout}
          systemStatus={systemStatus}
          previewRole={previewRole}
          onExitPreview={handleExitPreview}
        />

        <LiveTicker />

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <Breadcrumb />
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Omnibox Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
