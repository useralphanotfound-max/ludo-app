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
import { Coins, TrendingUp, ShieldCheck, Lock, RefreshCw, PlusCircle } from 'lucide-react';

export default function WalletControlPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [adjustUser, setAdjustUser] = useState(null);

  const [walletStats, setWalletStats] = useState(null);

  useEffect(() => {
    fetchWalletUsers();
    fetchWalletStats();
  }, [search]);

  const fetchWalletUsers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/admin/users?search=${encodeURIComponent(search)}&limit=50`);
      if (res.status && res.data) {
        setUsers(res.data);
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
      }
    } catch (e) {
      console.error('Wallet stats error:', e);
    }
  };

  const handleFreezeToggle = async (user) => {
    const freezeState = !user.isWalletFrozen;
    const confirm = await Swal.fire({
      title: freezeState ? `Freeze Wallet for ${user.username}?` : `Unfreeze Wallet for ${user.username}?`,
      text: freezeState ? 'User will be blocked from match entries & cashouts.' : 'Wallet operations will resume.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: freezeState ? 'var(--rose)' : 'var(--emerald)',
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
        Swal.fire({ title: 'Success', text: res.message, icon: 'success', background: '#111624', color: '#ffffff' });
        fetchWalletUsers();
        fetchWalletStats();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message, icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  // Aggregates
  const totalCashRs = walletStats?.totalCashRs !== undefined ? walletStats.totalCashRs : users.reduce((sum, u) => sum + (u.wallet?.depositBalanceRs || 0), 0);
  const totalWinningRs = walletStats?.totalWinningRs !== undefined ? walletStats.totalWinningRs : users.reduce((sum, u) => sum + (u.wallet?.winningBalanceRs || 0), 0);
  const totalBonusRs = walletStats?.totalBonusRs !== undefined ? walletStats.totalBonusRs : users.reduce((sum, u) => sum + (u.wallet?.bonusBalanceRs || 0), 0);
  const frozenCount = walletStats?.frozenCount !== undefined ? walletStats.frozenCount : users.filter(u => u.isWalletFrozen).length;

  const cashFlowData = walletStats?.cashFlowData || [
    { name: 'Mon', deposits: 24000, withdrawals: 12000 },
    { name: 'Tue', deposits: 28000, withdrawals: 15000 },
    { name: 'Wed', deposits: 26000, withdrawals: 14000 },
    { name: 'Thu', deposits: 34000, withdrawals: 18000 },
    { name: 'Fri', deposits: 41000, withdrawals: 21000 },
    { name: 'Sat', deposits: 49000, withdrawals: 24000 },
    { name: 'Sun', deposits: 52000, withdrawals: 26000 }
  ];

  const poolDonutData = [
    { name: 'Cash (Deposit) Pool', value: totalCashRs || 1, color: '#10b981' },
    { name: 'Winning Pool', value: totalWinningRs || 1, color: '#f59e0b' },
    { name: 'Bonus Balance Pool', value: totalBonusRs || 1, color: '#8b5cf6' }
  ];

  const columns = [
    {
      key: 'username',
      label: 'User Profile',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff' }}>{r.username}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.maskedMobile}</div>
        </div>
      )
    },
    {
      key: 'depositBalance',
      label: 'Cash (Deposit)',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--emerald-light)' }}>₹{(r.wallet?.depositBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'winningBalance',
      label: 'Winning Pool',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--gold)' }}>₹{(r.wallet?.winningBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'bonusBalance',
      label: 'Bonus Pool',
      render: (_, r) => <span style={{ fontWeight: 800, color: 'var(--purple)' }}>₹{(r.wallet?.bonusBalanceRs || 0).toLocaleString('en-IN')}</span>
    },
    {
      key: 'totalBalance',
      label: 'Total Balance',
      render: (_, r) => <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>₹{(r.wallet?.totalBalanceRs || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'isWalletFrozen',
      label: 'Wallet Status',
      render: (v) => <StatusBadge status={v ? 'SUSPENDED' : 'ACTIVE'} text={v ? 'FROZEN' : 'ACTIVE'} />
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={() => setAdjustUser(r)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--gold)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            ⚡ Adjust Balance
          </button>
          <button
            onClick={() => handleFreezeToggle(r)}
            style={{
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: r.isWalletFrozen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              color: r.isWalletFrozen ? 'var(--emerald-light)' : 'var(--rose)',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {r.isWalletFrozen ? 'Unfreeze' : 'Freeze'}
          </button>
        </div>
      )
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sync */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">USER BALANCES</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              User Balances & Funds Management
            </h1>
          </div>

          <button
            onClick={fetchWalletUsers}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={15} /> Refresh Balances
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Deposit Money" value={`₹${totalCashRs.toLocaleString('en-IN')}`} trend={walletStats?.growthTrend || '+0.0% this week'} trendType="up" icon={Coins} badgeColor="emerald" />
          <StatCard title="Total Winnings Money" value={`₹${totalWinningRs.toLocaleString('en-IN')}`} trend="Ready for cashout" trendType="up" icon={TrendingUp} badgeColor="gold" />
          <StatCard title="Total Bonus Money" value={`₹${totalBonusRs.toLocaleString('en-IN')}`} trend="Promotions active" trendType="neutral" icon={ShieldCheck} badgeColor="purple" />
          <StatCard title="Frozen Accounts" value={frozenCount} trend="Locked wallets" trendType="down" icon={Lock} badgeColor="rose" />
        </div>

        {/* Analytics: 7-Day Cash Flow & Pool Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="7-Day Cash Flow Comparison" subtitle="Deposits inflow vs cashouts outflow" loading={loading}>
            <BarChartWidget
              data={cashFlowData}
              xKey="name"
              bars={[
                { key: 'deposits', color: '#10b981', name: 'Deposits (In)' },
                { key: 'withdrawals', color: '#f43f5e', name: 'Cashouts (Out)' }
              ]}
            />
          </ChartCard>

          <ChartCard title="Wallet Pool Share" subtitle="Cash vs Winning vs Bonus distribution" loading={loading}>
            <DonutChartWidget data={poolDonutData} />
          </ChartCard>
        </div>

        {/* Search Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search wallet by username, mobile, or User ID..." />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyTitle="No Wallets Found"
          emptyDescription="No player wallets matching your search criteria."
        />

        {/* Controlled Wallet Adjustment Modal */}
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
