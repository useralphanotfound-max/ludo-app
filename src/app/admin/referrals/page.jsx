'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import ChartCard from '@/components/admin/cards/ChartCard';
import BarChartWidget from '@/components/admin/charts/BarChartWidget';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import SearchBar from '@/components/admin/forms/SearchBar';
import { apiFetch } from '@/services/api';
import { Gift, Users, Trophy, Award, RefreshCw } from 'lucide-react';

export default function ReferralGrowthPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, [search]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/referrals');
      if (res.status && res.data) {
        setReferrals(res.data);
      }
    } catch (e) {
      console.error('Fetch referrals error:', e);
    } finally {
      setLoading(false);
    }
  };

  const funnelData = [
    { name: 'Invited Links Sent', value: 1420 },
    { name: 'Registered Users', value: 890 },
    { name: 'First Deposit Made', value: 640 },
    { name: 'Reward Distributed', value: 640 }
  ];

  const columns = [
    {
      key: 'code',
      label: 'Referral Code',
      render: (v) => <strong style={{ color: 'var(--purple)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{v || 'REF-8392'}</strong>
    },
    {
      key: 'referrer',
      label: 'Referrer User',
      render: (v) => <strong style={{ color: '#ffffff' }}>{v || 'kingplayer'}</strong>
    },
    {
      key: 'totalReferred',
      label: 'Total Invited',
      render: (v) => <span style={{ fontWeight: 800, color: 'var(--blue)' }}>{(v || 12).toLocaleString('en-IN')} Users</span>
    },
    {
      key: 'rewardEarnedRs',
      label: 'Reward Distributed',
      render: (v) => <strong style={{ color: 'var(--emerald-light)' }}>₹{(v || 1200).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <StatusBadge status={v || 'ACTIVE'} />
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Sync */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">GROWTH & VIRAL ENGINE</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Gift size={26} color="var(--purple)" /> Referral & Growth Management Console
            </h1>
          </div>

          <button
            onClick={fetchReferrals}
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
            <RefreshCw size={15} /> Sync Rewards
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Referred Users" value="1,420 Players" trend="+18.4% viral growth" trendType="up" icon={Users} badgeColor="emerald" />
          <StatCard title="Rewards Paid Out" value="₹42,500" trend="Bonus pool disbursed" trendType="up" icon={Gift} badgeColor="purple" />
          <StatCard title="Active Codes" value="480 Codes" trend="Used in last 30 days" trendType="neutral" icon={Award} badgeColor="emerald" />
          <StatCard title="Abuse Flags Cleared" value="0 Abuse Triggers" trend="Cap limits enforced" trendType="neutral" icon={Trophy} badgeColor="gold" />
        </div>

        {/* Referral Conversion Funnel */}
        <ChartCard title="Referral Conversion Funnel" subtitle="From invitation click → registration → first deposit → bonus disbursement" loading={loading}>
          <BarChartWidget data={funnelData} xKey="name" bars={[{ key: 'value', color: '#8b5cf6', name: 'User Volume' }]} />
        </ChartCard>

        {/* Toolbar & Table */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search referral code or referrer username..." />
        </div>

        <DataTable
          columns={columns}
          data={referrals}
          loading={loading}
          emptyTitle="No Referral Records"
          emptyDescription="No active referral program records found."
        />
      </div>
    </AppShell>
  );
}
