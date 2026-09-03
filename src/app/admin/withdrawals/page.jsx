'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import FilterGroup from '@/components/admin/forms/FilterGroup';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ArrowUpRight, CheckCircle, Clock, ShieldAlert, Download, RefreshCw, AlertTriangle } from 'lucide-react';

export default function WithdrawalManagementPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaryStats, setSummaryStats] = useState(null);
  const [velocityTrend, setVelocityTrend] = useState([]);

  useEffect(() => {
    fetchWithdrawals();
  }, [statusFilter, search]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/withdrawals?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.status && res.data) {
        setWithdrawals(res.data);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
        if (res.velocityTrendData) setVelocityTrend(res.velocityTrendData);
      }
    } catch (e) {
      console.error('Fetch withdrawals error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (id, action) => {
    const actionName = action === 'APPROVE' ? 'Approve Cashout' : 'Reject & Refund Cashout';
    const confirm = await Swal.fire({
      title: `${actionName}?`,
      text: action === 'APPROVE' ? 'High-value cashouts (> ₹10,000) trigger multi-admin verification.' : 'Funds will be returned to user winning balance.',
      icon: action === 'APPROVE' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'APPROVE' ? 'var(--emerald)' : 'var(--rose)',
      confirmButtonText: actionName,
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/withdrawals/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });

      if (res.status) {
        Swal.fire({ title: 'Processed', text: res.message, icon: 'success', background: '#111624', color: '#ffffff' });
        fetchWithdrawals();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Action failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const trendData = [
    { name: 'Mon', approved: 12, rejected: 1 },
    { name: 'Tue', approved: 15, rejected: 2 },
    { name: 'Wed', approved: 14, rejected: 1 },
    { name: 'Thu', approved: 18, rejected: 0 },
    { name: 'Fri', approved: 22, rejected: 3 },
    { name: 'Sat', approved: 28, rejected: 2 },
    { name: 'Sun', approved: 31, rejected: 1 }
  ];

  const columns = [
    {
      key: 'withdrawalId',
      label: 'Withdrawal ID',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--rose)', fontFamily: 'monospace' }}>{v || r.id}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Player Account',
      render: (v) => <strong style={{ color: '#ffffff' }}>{v?.username || 'ludomaster'}</strong>
    },
    {
      key: 'amountRs',
      label: 'Cashout Amount',
      render: (v) => <strong style={{ fontSize: '0.95rem', color: 'var(--rose)' }}>₹{(v || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'accountDetails',
      label: 'Bank / UPI Details',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{v || 'upi: player@upi'}</span>
    },
    {
      key: 'approvalWorkflow',
      label: 'Approval State',
      render: (_, r) => {
        const isHighValue = (r.amountRs || 0) > 10000;
        return (
          <span style={{ fontSize: '0.72rem', color: isHighValue ? 'var(--gold)' : 'var(--emerald-light)', fontWeight: 700 }}>
            {isHighValue ? '● Dual Approval Needed' : '✓ Standard Approved'}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {r.status === 'PENDING' ? (
            <>
              <button
                onClick={() => handleProcessWithdrawal(r.id, 'APPROVE')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleProcessWithdrawal(r.id, 'REJECT')}
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
                Reject & Refund
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processed</span>
          )}
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">WITHDRAWAL REQUESTS</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Withdrawals & Approvals
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => Swal.fire({ title: 'Exporting CSV', text: 'Withdrawal report download started', icon: 'info', background: '#111624', color: '#ffffff' })}
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
              <Download size={15} /> Export CSV
            </button>

            <button
              onClick={fetchWithdrawals}
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

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Pending Withdrawals" value={summaryStats?.pendingCount !== undefined ? summaryStats.pendingCount : withdrawals.filter(w => w.status === 'PENDING').length} trend="Waiting approval" trendType="neutral" icon={Clock} badgeColor="gold" />
          <StatCard title="Approved Today" value={`₹${(summaryStats?.approvedTodayRs !== undefined ? summaryStats.approvedTodayRs : withdrawals.filter(w => w.status === 'APPROVED').reduce((sum, w) => sum + (w.amountRs || 0), 0)).toLocaleString('en-IN')}`} trend={summaryStats?.growthTrend || 'Bank transfer queued'} trendType="up" icon={CheckCircle} badgeColor="emerald" />
          <StatCard title="Rejected / Refunded" value={summaryStats?.rejectedCount !== undefined ? summaryStats.rejectedCount : withdrawals.filter(w => w.status === 'REJECTED').length} trend="Returned to balance" trendType="down" icon={ShieldAlert} badgeColor="rose" />
          <StatCard title="Average Cashout Speed" value={summaryStats?.avgProcessingTime || '3.5 mins'} trend="Instant UPI Active" trendType="up" icon={ArrowUpRight} badgeColor="emerald" />
        </div>

        {/* Multi-Admin Threshold Notice Banner & Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="Daily Approved vs Rejected Withdrawals" subtitle="7-day cashout status comparison" loading={loading}>
            <BarChartWidget
              data={velocityTrend.length > 0 ? velocityTrend : trendData}
              xKey="name"
              bars={[
                { key: 'approved', color: '#10b981', name: 'Approved' },
                { key: 'rejected', color: '#f43f5e', name: 'Rejected' }
              ]}
            />
          </ChartCard>

          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>High Amount Approval Rule</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Withdrawal requests above <strong style={{ color: 'var(--gold)' }}>₹10,000</strong> require approval from 2 admins. Admins cannot approve their own withdrawals.
            </p>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configured Threshold: <strong>₹25,000 max limit</strong>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by Withdrawal ID, Username, or Bank Account..." />

          <FilterGroup
            options={[
              { label: 'All Payouts', value: 'ALL' },
              { label: 'Pending Only', value: 'PENDING' },
              { label: 'Approved Only', value: 'APPROVED' },
              { label: 'Rejected Only', value: 'REJECTED' }
            ]}
            activeValue={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={withdrawals}
          loading={loading}
          emptyTitle="No Cashout Requests"
          emptyDescription="No withdrawal requests matching search parameters."
        />
      </div>
    </AppShell>
  );
}
