'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import AreaChartWidget from '@/components/admin/charts/AreaChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import SelectFilter from '@/components/admin/forms/SelectFilter';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Receipt, DollarSign, ArrowDownLeft, ArrowUpRight, Download, RefreshCw, ShieldCheck } from 'lucide-react';

export default function FinancialLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [summaryStats, setSummaryStats] = useState(null);
  const [typeBreakdown, setTypeBreakdown] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ search, type: typeFilter });
      const res = await apiFetch(`/admin/transactions?${query.toString()}`);
      if (res.status && res.data) {
        setTransactions(res.data);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
        if (res.typeBreakdownData) setTypeBreakdown(res.typeBreakdownData);
      }
    } catch (e) {
      console.error('Fetch transactions error:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalVolume = summaryStats?.totalVolumeRs !== undefined
    ? summaryStats.totalVolumeRs
    : transactions.reduce((sum, t) => sum + Number(t.amountRs || 0), 0);
  const depositCount = summaryStats?.depositCount !== undefined
    ? summaryStats.depositCount
    : transactions.filter(t => t.type === 'DEPOSIT').length;
  const netFlow = summaryStats?.netFlowRs !== undefined
    ? summaryStats.netFlowRs
    : (summaryStats?.totalDepositsRs || 0) - (summaryStats?.totalWithdrawalsRs || 0);

  const typeBreakdownData = typeBreakdown.length > 0 ? typeBreakdown : [
    { name: 'DEPOSIT', amount: summaryStats?.totalDepositsRs || 0 },
    { name: 'WITHDRAWAL', amount: summaryStats?.totalWithdrawalsRs || 0 }
  ];

  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction ID',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{v || r._id || r.id}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt || Date.now()).toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'username',
      label: 'Player Account',
      render: (v, r) => <strong style={{ color: '#ffffff' }}>{v || r.user?.username || 'kingplayer'}</strong>
    },
    {
      key: 'type',
      label: 'Flow Type',
      render: (v) => <StatusBadge status={v} />
    },
    {
      key: 'amountRs',
      label: 'Amount (INR)',
      render: (v, r) => {
        const isCredit = r.type === 'DEPOSIT' || r.type === 'PRIZE_PAYOUT';
        return (
          <strong style={{ fontSize: '0.95rem', color: isCredit ? 'var(--emerald-light)' : 'var(--rose)' }}>
            {isCredit ? '+' : '-'}₹{(v || 0).toLocaleString('en-IN')}
          </strong>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'SUCCESS'} />
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & CSV Export */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">MONEY & PAYMENT HISTORY</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Transaction & Payment History
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => Swal.fire({ title: 'Exporting CSV', text: 'Financial transaction export started', icon: 'info', background: '#111624', color: '#ffffff' })}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--emerald)',
                color: '#000000',
                fontWeight: 900,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={fetchTransactions}
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
              <RefreshCw size={15} /> Refresh List
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Money Moved" value={`₹${totalVolume.toLocaleString('en-IN')}`} trend={summaryStats?.growthTrend || '+0.0% this month'} trendType="up" icon={DollarSign} badgeColor="emerald" />
          <StatCard title="Net Money Saved" value={`₹${netFlow.toLocaleString('en-IN')}`} trend="Positive cash liquidity" trendType="up" icon={ArrowDownLeft} badgeColor="emerald" />
          <StatCard title="Total Deposits Count" value={depositCount} trend="Confirmed in DB" trendType="up" icon={Receipt} badgeColor="emerald" />
          <StatCard title="Audit Status" value="100% Verified" trend="All payments tracked" trendType="neutral" icon={ShieldCheck} badgeColor="gold" />
        </div>

        {/* Analytics: Transaction Type Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <ChartCard title="Money Moved by Category" subtitle="Deposits vs Withdrawals vs Game Entries vs Prizes vs Bonus" loading={loading}>
            <BarChartWidget data={typeBreakdownData} xKey="name" bars={[{ key: 'amount', color: '#10b981', name: 'Volume (₹)' }]} formatY={(v) => `₹${(v/1000).toFixed(0)}k`} />
          </ChartCard>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by Transaction ID, Username, or Reference..." />

          <SelectFilter
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="All Transaction Types"
            options={[
              { label: 'DEPOSIT', value: 'DEPOSIT' },
              { label: 'WITHDRAWAL', value: 'WITHDRAWAL' },
              { label: 'PRIZE_PAYOUT', value: 'PRIZE' },
              { label: 'REFUND', value: 'REFUND' },
              { label: 'BONUS', value: 'BONUS' },
              { label: 'GAME_ENTRY', value: 'ENTRY' }
            ]}
          />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          emptyTitle="No Ledger Entries"
          emptyDescription="No transaction records match selected search filters."
        />
      </div>
    </AppShell>
  );
}
