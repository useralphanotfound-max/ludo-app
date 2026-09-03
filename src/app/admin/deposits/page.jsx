'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import AreaChartWidget from '@/components/admin/charts/AreaChartWidget';
import DonutChartWidget from '@/components/admin/charts/DonutChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import FilterGroup from '@/components/admin/forms/FilterGroup';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ArrowDownLeft, RefreshCw, Download, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export default function DepositOperationsPage() {
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [summaryStats, setSummaryStats] = useState(null);
  const [methodDonut, setMethodDonut] = useState([]);

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter, search, page]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/deposits?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}&limit=20`);
      if (res.status && res.data) {
        setDeposits(res.data);
        if (res.pagination) setPagination(res.pagination);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
        if (res.methodDonutData) setMethodDonut(res.methodDonutData);
      }
    } catch (e) {
      console.error('Fetch deposits error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeposit = async (deposit) => {
    const confirm = await Swal.fire({
      title: 'Approve & Credit Deposit?',
      text: `Verify Transaction UTR / Ref ID: ${deposit.depositId || deposit.id}. If valid, ₹${deposit.amountRs} will be credited to ${deposit.user?.username || 'User'}'s wallet.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--emerald)',
      confirmButtonText: 'Approve & Credit Deposit',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch('/admin/deposits', {
        method: 'POST',
        body: JSON.stringify({ depositId: deposit.id, action: 'RECONCILE' })
      });
      if (res.status) {
        Swal.fire({ title: 'Approved & Credited', text: res.message || 'Deposit verified and credited to user wallet.', icon: 'success', background: '#111624', color: '#ffffff' });
        fetchDeposits();
      }
    } catch (e) {
      Swal.fire({ title: 'Verification Error', text: e.message || 'Deposit verification failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const depositTrendData = [
    { name: 'Day 1', amount: 18000 },
    { name: 'Day 3', amount: 24000 },
    { name: 'Day 5', amount: 22000 },
    { name: 'Day 7', amount: 31000 },
    { name: 'Day 9', amount: 39000 },
    { name: 'Day 11', amount: 44000 },
    { name: 'Day 14', amount: 52000 }
  ];

  const methodDonutData = [
    { name: 'UPI Direct / PhonePe / GPay', value: 380, color: '#10b981' },
    { name: 'Bank Transfer / NEFT', value: 85, color: '#3b82f6' },
    { name: 'QR Code Direct', value: 35, color: '#f59e0b' }
  ];

  const columns = [
    {
      key: 'depositId',
      label: 'Deposit ID / UTR',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: 'var(--emerald-light)', fontFamily: 'monospace' }}>{v || r.id}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Player Account',
      render: (v) => <strong style={{ color: '#ffffff' }}>{v?.username || 'kingplayer'}</strong>
    },
    {
      key: 'amountRs',
      label: 'Amount',
      render: (v) => <strong style={{ fontSize: '0.95rem', color: 'var(--emerald-light)' }}>₹{(v || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'method',
      label: 'Deposit Method',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v || 'UPI Direct Transfer'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: (_, r) => (
        <button
          onClick={() => handleVerifyDeposit(r)}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: 'var(--emerald-light)',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Approve Deposit
        </button>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">DEPOSIT RECONCILIATION & AUDIT</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Deposit Operations & Verification Queue
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => Swal.fire({ title: 'Exporting CSV', text: 'Deposit record report download started', icon: 'info', background: '#111624', color: '#ffffff' })}
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
              onClick={fetchDeposits}
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
              <RefreshCw size={15} /> Sync Queue
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Deposit Volume" value={`₹${(summaryStats?.totalDepositsRs !== undefined ? summaryStats.totalDepositsRs : deposits.reduce((sum, d) => sum + (d.amountRs || 0), 0)).toLocaleString('en-IN')}`} trend={summaryStats?.growthTrend || '+0.0% this month'} trendType="up" icon={ArrowDownLeft} badgeColor="emerald" />
          <StatCard title="Pending Deposits Queue" value={summaryStats?.pendingCount !== undefined ? summaryStats.pendingCount : deposits.filter(d => d.status === 'PENDING').length} trend="Awaiting verification" trendType="neutral" icon={Clock} badgeColor="gold" />
          <StatCard title="Successful Credited" value={summaryStats?.successfulCount !== undefined ? summaryStats.successfulCount : deposits.filter(d => d.status === 'SUCCESSFUL').length} trend="Verified & Credited" trendType="up" icon={CheckCircle} badgeColor="emerald" />
          <StatCard title="Unverified Submissions" value={summaryStats?.failedCount !== undefined ? summaryStats.failedCount : deposits.filter(d => d.status === 'FAILED').length} trend="Needs review" trendType="down" icon={ShieldAlert} badgeColor="rose" />
        </div>

        {/* Analytics: 14-Day Deposit Volume & Payment Method Share */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="14-Day Deposit Inflow Trend" subtitle="Daily cash deposit volume across all methods" loading={loading}>
            <AreaChartWidget data={depositTrendData} xKey="name" yKey="amount" color="#10b981" formatY={(v) => `₹${(v/1000).toFixed(0)}k`} />
          </ChartCard>

          <ChartCard title="Deposit Method Share" subtitle="UPI vs Bank Transfer vs QR Code" loading={loading}>
            <DonutChartWidget data={methodDonut.length > 0 ? methodDonut : methodDonutData} />
          </ChartCard>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by Deposit ID, Username, or UTR..." />

          <FilterGroup
            options={[
              { label: 'All Deposits', value: 'ALL' },
              { label: 'Pending Only', value: 'PENDING' },
              { label: 'Success Only', value: 'SUCCESS' },
              { label: 'Failed Only', value: 'FAILED' }
            ]}
            activeValue={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={deposits}
          loading={loading}
          emptyTitle="No Deposit Records"
          emptyDescription="No deposit entries match your search parameters."
          page={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || deposits.length}
          onPageChange={setPage}
        />
      </div>
    </AppShell>
  );
}
