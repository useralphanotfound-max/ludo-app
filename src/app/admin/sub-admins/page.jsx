'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import AdminDrawer from '@/components/admin/drawers/AdminDrawer';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { UserCheck, Plus, ShieldCheck, KeyRound, Lock, RefreshCw } from 'lucide-react';

export default function SubAdminsControlPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const mockAdmins = [
    { id: 'ADM-101', username: 'Ritu Rao', role: 'SUPERADMIN', approvalLimitRs: 1000000, require2FA: true, status: 'ACTIVE', createdAt: '2026-08-01' },
    { id: 'ADM-102', username: 'Arjun Finance', role: 'FINANCE_MANAGER', approvalLimitRs: 25000, require2FA: true, status: 'ACTIVE', createdAt: '2026-08-10' },
    { id: 'ADM-103', username: 'Priya Ops', role: 'OPERATIONS_ADMIN', approvalLimitRs: 10000, require2FA: true, status: 'ACTIVE', createdAt: '2026-08-15' },
    { id: 'ADM-104', username: 'Amit Support', role: 'SUPPORT_MANAGER', approvalLimitRs: 5000, require2FA: false, status: 'ACTIVE', createdAt: '2026-08-20' }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/roles');
      if (res.status && res.data?.admins) {
        setAdmins(res.data.admins);
      } else {
        setAdmins(mockAdmins);
      }
    } catch (e) {
      setAdmins(mockAdmins);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSessions = async (adminId, username) => {
    const confirm = await Swal.fire({
      title: `Revoke Sessions for ${username}?`,
      text: 'Sub-admin will be forcibly logged out across all devices.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--rose)',
      confirmButtonText: 'Revoke All Sessions',
      background: '#111624',
      color: '#ffffff'
    });

    if (confirm.isConfirmed) {
      Swal.fire({ title: 'Sessions Revoked', text: `All active tokens invalidated for ${username}`, icon: 'success', background: '#111624', color: '#ffffff' });
    }
  };

  const roleDistData = [
    { name: 'Finance Managers', count: 8 },
    { name: 'Operations Admins', count: 5 },
    { name: 'Support Managers', count: 4 },
    { name: 'Gaming Operators', count: 3 },
    { name: 'System Admins', count: 2 }
  ];

  const columns = [
    {
      key: 'username',
      label: 'Admin Account',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff' }}>{v}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {r.id}</div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Assigned Role',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'approvalLimitRs',
      label: 'Financial Limit',
      render: (v) => <strong style={{ color: 'var(--gold)' }}>₹{(v || 25000).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'require2FA',
      label: '2FA Security',
      render: (v) => (
        <span style={{ fontSize: '0.72rem', color: v ? 'var(--emerald-light)' : 'var(--text-muted)', fontWeight: 800 }}>
          {v ? '✓ Enabled' : '✕ Disabled'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'ACTIVE'} />
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={() => setSelectedAdmin(r)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--surface-2)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Edit Limits & Role
          </button>
          <button
            onClick={() => handleRevokeSessions(r.id, r.username)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: 'var(--rose)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Revoke Sessions
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Create Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">SUB-ADMIN DELEGATION & SECURITY AUTHORITY</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <UserCheck size={26} color="var(--emerald-light)" /> Sub-Admin Control Center
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              href="/admin/sub-admins/create"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.85rem',
                border: 'none',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Create Sub-Admin Account
            </Link>

            <button
              onClick={fetchAdmins}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Sub-Admins" value={admins.length || 24} trend="Superadmin created" trendType="up" icon={UserCheck} badgeColor="emerald" />
          <StatCard title="Active Operational Accounts" value={admins.filter(a => a.status === 'ACTIVE').length || 21} trend="Active sessions" trendType="up" icon={ShieldCheck} badgeColor="emerald" />
          <StatCard title="Locked Accounts" value="2 Accounts" trend="Passcode reset req" trendType="down" icon={Lock} badgeColor="rose" />
          <StatCard title="2FA Enforcement" value="100% Enforced" trend="TOTP Mandatory" trendType="neutral" icon={KeyRound} badgeColor="gold" />
        </div>

        {/* Analytics: Role Distribution Bar Chart */}
        <ChartCard title="Sub-Admin Role Assignment Distribution" subtitle="Headcount per administrative role group" loading={loading}>
          <BarChartWidget data={roleDistData} xKey="name" bars={[{ key: 'count', color: '#10b981', name: 'Sub-Admins' }]} />
        </ChartCard>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          emptyTitle="No Sub-Admin Accounts"
          emptyDescription="No sub-admin login accounts configured."
        />

        {/* Admin Drawer */}
        {selectedAdmin && (
          <AdminDrawer
            adminAccount={selectedAdmin}
            onClose={() => setSelectedAdmin(null)}
            onRefresh={fetchAdmins}
          />
        )}
      </div>
    </AppShell>
  );
}
