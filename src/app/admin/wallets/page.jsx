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
import WalletAdjustModal from '@/components/admin/drawers/WalletAdjustModal';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Coins, TrendingUp, ShieldCheck, Lock, RefreshCw } from 'lucide-react';

export default function WalletControlPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [adjustUser, setAdjustUser] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [cashFlowData, setCashFlowData] = useState([]);

  useEffect(() => {
    fetchWalletUsers();
    fetchWalletStats();
  }, [search]);

  const fetchWalletUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}&limit=50`);
      if (res.status && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.users || []);
        setUsers(list);
      }
    } catch (e) {
      console.error('Wallet users fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const res = await apiFetch('/admin/wallets');
      if (res.status && res.data) {
        setWalletStats(res.data);
        if (res.data.cashFlowData?.length) {
          setCashFlowData(res.data.cashFlowData);
        }
      }
    } catch (e) {
      console.error('Wallet stats error:', e);
    }
  };

  const handleFreezeToggle = async (user) => {
    const freezeState = !user.isWalletFrozen;
    const confirm = await Swal.fire({
      title: freezeState ? `Freeze Wallet?` : `Unfreeze Wallet?`,
      text: freezeState
        ? `${user.username} will be blocked from match entries & cashouts.`
        : `${user.username}'s wallet operations will resume.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: freezeState ? '#f43f5e' : '#10b981',
      confirmButtonText: freezeState ? 'Freeze Wallet' : 'Unfreeze Wallet',
      background: '#111624',
      color: '#ffffff'
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await apiFetch(`/admin/users/${user.id}/freeze-wallet`, {
        method: 'POST',
        body: JSON.stringify({ freeze: freezeState, reason: 'Console Wallet Freeze Toggle' })
      });
      if (res.status) {
        Swal.fire({ title: 'Done', text: res.message, icon: 'success', background: '#111624', color: '#fff' });
        fetchWalletUsers();
        fetchWalletStats();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message, icon: 'error', background: '#111624', color: '#fff' });
    }
  };

  const totalCashRs = walletStats?.totalCashRs ?? 0;
  const totalWinningRs = walletStats?.totalWinningRs ?? 0;
  const totalBonusRs = walletStats?.totalBonusRs ?? 0;
  const frozenCount = walletStats?.frozenCount ?? 0;

  const hasPoolData = totalCashRs > 0 || totalWinningRs > 0 || totalBonusRs > 0;
  const poolDonutData = hasPoolData ? [
    { name: 'Deposit Pool', value: totalCashRs, color: '#10b981' },
    { name: 'Winning Pool', value: totalWinningRs, color: '#f59e0b' },
    { name: 'Bonus Pool', value: totalBonusRs, color: '#8b5cf6' }
  ] : [];

  const columns = [
    {
      key: 'username',
      label: 'User',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff' }}>{r.username}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.maskedMobile}</div>
        </div>
      )
    },
    {
      key: 'depositBalance',
      label: 'Deposit',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--emerald-light)' }}>₹{(r.wallet?.depositBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'winningBalance',
      label: 'Winning',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--gold)' }}>₹{(r.wallet?.winningBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'bonusBalance',
      label: 'Bonus',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--purple)' }}>₹{(r.wallet?.bonusBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'totalBalance',
      label: 'Total',
      render: (_, r) => <strong style={{ color: '#ffffff' }}>₹{(r.wallet?.totalBalanceRs || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'isWalletFrozen',
      label: 'Status',
      render: (v) => <StatusBadge status={v ? 'SUSPENDED' : 'ACTIVE'} text={v ? 'FROZEN' : 'ACTIVE'} />
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button onClick={() => setAdjustUser(r)} className="btn" style={{ backgroundColor: 'var(--gold)', color: '#000', fontSize: '0.75rem' }}>
            Adjust
          </button>
          <button
            onClick={() => handleFreezeToggle(r)}
            className={r.isWalletFrozen ? 'btn' : 'btn btn-danger'}
            style={r.isWalletFrozen ? { backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--emerald-light)', fontSize: '0.75rem' } : { fontSize: '0.75rem' }}
          >
            {r.isWalletFrozen ? 'Unfreeze' : 'Freeze'}
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div className="admin-page">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <div className="micro-label">FINANCIAL CONTROL — USER WALLETS</div>
            <h1 className="admin-page-title">
              <Coins size={24} color="var(--emerald-light)" /> User Balances &amp; Funds
            </h1>
          </div>
          <button onClick={fetchWalletUsers} className="btn btn-primary">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid-auto">
          <StatCard title="Total Deposit Balance" value={`₹${totalCashRs.toLocaleString('en-IN')}`} trend="Across all wallets" trendType="up" icon={Coins} badgeColor="emerald" />
          <StatCard title="Total Winning Balance" value={`₹${totalWinningRs.toLocaleString('en-IN')}`} trend="Ready for cashout" trendType="up" icon={TrendingUp} badgeColor="gold" />
          <StatCard title="Total Bonus Balance" value={`₹${totalBonusRs.toLocaleString('en-IN')}`} trend="Promotional funds" trendType="neutral" icon={ShieldCheck} badgeColor="purple" />
          <StatCard title="Frozen Wallets" value={frozenCount} trend="Locked accounts" trendType="down" icon={Lock} badgeColor="rose" />
        </div>

        {/* Charts */}
        <div className="grid-2-1">
          <ChartCard title="7-Day Cash Flow" subtitle="Deposits (inflow) vs Cashouts (outflow)" loading={loading}>
            {cashFlowData.length > 0 ? (
              <BarChartWidget
                data={cashFlowData}
                xKey="name"
                bars={[
                  { key: 'deposits', color: '#10b981', name: 'Deposits' },
                  { key: 'withdrawals', color: '#f43f5e', name: 'Cashouts' }
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No transaction flow data available yet.
              </div>
            )}
          </ChartCard>

          <ChartCard title="Wallet Pool Distribution" subtitle="Balance pool breakdown" loading={loading}>
            {hasPoolData ? (
              <DonutChartWidget data={poolDonutData} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No wallet data to display.
              </div>
            )}
          </ChartCard>
        </div>

        {/* Search */}
        <div className="glass-panel" style={{ padding: '0.875rem 1.25rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by username, mobile, or User ID..." />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="No Wallets Found"
          emptyDescription="No player wallets matching your search criteria."
        />

        {adjustUser && (
          <WalletAdjustModal
            user={adjustUser}
            onClose={() => setAdjustUser(null)}
            onSuccess={fetchWalletUsers}
          />
        )}
      </div>
    </AppShell>
  );
}
