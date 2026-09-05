'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import SelectFilter from '@/components/admin/forms/SelectFilter';
import User360Drawer from '@/components/admin/drawers/User360Drawer';
import PermissionGate from '@/components/admin/rbac/PermissionGate';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Users, Activity, Shield, TrendingDown, Eye, EyeOff, RefreshCw, Lock, Unlock } from 'lucide-react';

export default function UserOperationsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showMaskedPhones, setShowMaskedPhones] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [summaryStats, setSummaryStats] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, kycFilter, riskFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        kycStatus: kycFilter,
        riskScore: riskFilter,
        page: page.toString(),
        limit: '20'
      });
      const res = await apiFetch(`/admin/users?${query.toString()}`);
      if (res && (res.success || res.status) && res.data) {
        const userList = Array.isArray(res.data) ? res.data : (res.data.users || []);
        setUsers(userList);
        const pag = res.data.pagination || res.pagination;
        if (pag) setPagination(pag);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
      }
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    const confirm = await Swal.fire({
      title: `Change status to ${newStatus}?`,
      text: `User account will be marked as ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'BANNED' ? 'var(--rose)' : 'var(--emerald)',
      confirmButtonText: `Yes, ${newStatus}`,
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status) {
        Swal.fire({ title: 'Status Updated', text: res.message, icon: 'success', background: '#111624', color: '#ffffff' });
        fetchUsers();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Status update failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  // Sub-dashboard chart data calculated dynamically from API
  const verifiedCount = users.filter(u => u.kycStatus === 'VERIFIED').length;
  const pendingKycCount = users.filter(u => u.kycStatus === 'PENDING').length;
  const rejectedKycCount = users.filter(u => u.kycStatus === 'REJECTED').length;

  const kycDonutData = [
    { name: 'Verified', value: verifiedCount, color: '#10b981' },
    { name: 'Pending Review', value: pendingKycCount, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedKycCount, color: '#f43f5e' }
  ];

  const totalKycCount = verifiedCount + pendingKycCount + rejectedKycCount;

  const regTrendData = summaryStats?.regTrendData || [
    { name: 'W1', count: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 28 * 86400000) && new Date(u.createdAt) <= new Date(Date.now() - 21 * 86400000)).length },
    { name: 'W2', count: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 21 * 86400000) && new Date(u.createdAt) <= new Date(Date.now() - 14 * 86400000)).length },
    { name: 'W3', count: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 14 * 86400000) && new Date(u.createdAt) <= new Date(Date.now() - 7 * 86400000)).length },
    { name: 'W4', count: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 86400000)).length }
  ];

  const columns = [
    {
      key: 'username',
      label: 'User Profile',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff' }}>{r.username}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {r.id}</div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Phone Number',
      render: (_, r) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
          {showMaskedPhones ? r.maskedMobile : r.mobile}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Reg. Date',
      render: (v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(v || Date.now()).toLocaleDateString()}</span>
    },
    {
      key: 'kycStatus',
      label: 'KYC State',
      render: (v) => <StatusBadge status={v || 'UNVERIFIED'} />
    },
    {
      key: 'wallet',
      label: 'Total Wallet',
      render: (v) => <strong style={{ color: 'var(--gold)' }}>₹{(v?.totalBalanceRs || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'financials',
      label: 'Deposits',
      render: (v) => <span style={{ fontWeight: 800, color: 'var(--emerald-light)' }}>₹{(v?.totalDepositsRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'financialsOut',
      label: 'Cashouts',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--rose)' }}>₹{(r.financials?.totalWithdrawalsRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'stats',
      label: 'W / L Ratio',
      render: (v) => (
        <span style={{ fontSize: '0.75rem' }}>
          <strong style={{ color: 'var(--emerald-light)' }}>{v?.won || 0}W</strong> / <strong style={{ color: 'var(--rose)' }}>{v?.lost || 0}L</strong>
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'riskScore',
      label: 'Risk',
      render: (v) => <StatusBadge status={v || 'LOW'} />
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: (_, r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUserId(r.id);
          }}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            color: 'var(--gold)',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          View Profile
        </button>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sub-Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">USER ACCOUNTS</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              User Accounts & Profile Management
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowMaskedPhones(!showMaskedPhones)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {showMaskedPhones ? <EyeOff size={15} /> : <Eye size={15} />}
              {showMaskedPhones ? 'Unmask Phones' : 'Mask Phones'}
            </button>

            <button
              onClick={fetchUsers}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.825rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Refresh List
            </button>
          </div>
        </div>

        {/* 4 Mini Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Players" value={summaryStats?.totalUsers || pagination.total || users.length || 0} trend={summaryStats?.growthTrend || '+0.0% this month'} trendType="up" icon={Users} />
          <StatCard title="Active Accounts" value={users.filter(u => u.status === 'ACTIVE').length} trend="Active in rooms" trendType="up" icon={Activity} badgeColor="emerald" />
          <StatCard title="ID Verification Pending" value={users.filter(u => u.kycStatus !== 'VERIFIED').length} trend="Needs check" trendType="neutral" icon={Shield} badgeColor="gold" />
          <StatCard title="Suspicious Accounts" value={users.filter(u => (u.riskScore || '').toUpperCase() === 'HIGH').length} trend="Check activity" trendType="down" icon={TrendingDown} badgeColor="rose" />
        </div>

        {/* Analytics Row: 30-Day Registration Trend & KYC Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="30-Day Registration & Growth Velocity" subtitle="Weekly new player onboarding rate" loading={loading}>
            <BarChartWidget data={regTrendData} xKey="name" bars={[{ key: 'count', color: '#10b981', name: 'New Registrations' }]} />
          </ChartCard>

          <ChartCard title="KYC Compliance Distribution" subtitle="Player verification breakdown" loading={loading}>
            <DonutChartWidget data={kycDonutData} />
          </ChartCard>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by Username, Mobile, Referral Code, or User ID..." />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SelectFilter
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              placeholder="All Statuses"
              options={[
                { label: 'Active Only', value: 'ACTIVE' },
                { label: 'Suspended', value: 'PENDING_VERIFICATION' },
                { label: 'Banned Only', value: 'BANNED' }
              ]}
            />

            <SelectFilter
              value={kycFilter}
              onChange={(v) => { setKycFilter(v); setPage(1); }}
              placeholder="All KYC States"
              options={[
                { label: 'KYC Verified', value: 'VERIFIED' },
                { label: 'KYC Pending', value: 'PENDING' },
                { label: 'Unverified', value: 'NONE' }
              ]}
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="No Players Found"
          emptyDescription="No player accounts matching your search criteria."
          onRowClick={(row) => setSelectedUserId(row.id)}
          page={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || users.length}
          onPageChange={setPage}
        />

        {/* User 360° Drawer */}
        {selectedUserId && (
          <User360Drawer
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onRefreshUsers={fetchUsers}
          />
        )}
      </div>
    </AppShell>
  );
}
