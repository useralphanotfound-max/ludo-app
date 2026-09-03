'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Search, RefreshCw, Download, Filter, DollarSign, ArrowDownLeft, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function TransactionsLedgerView({ permissions = {} }) {
  if (!hasPermission(permissions, 'transactions.view')) {
    return <AccessDeniedState module="Transactions" permission="transactions.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [summaryStats, setSummaryStats] = useState(null);

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
      }
    } catch (e) {
      console.error('Fetch transactions error:', e);
    } finally {
      setLoading(false);
    }
  };

  const miniStats = [
    { label: 'Volume', value: `₹${(summaryStats?.totalVolumeRs !== undefined ? summaryStats.totalVolumeRs : transactions.reduce((sum, t) => sum + Number(t.amountRs || 0), 0)).toLocaleString('en-IN')}`, icon: <DollarSign size={15} />, color: '#34d399', trend: summaryStats?.growthTrend || 'Total flow', trendColor: '#34d399' },
    { label: 'Deposits', value: `${summaryStats?.depositCount !== undefined ? summaryStats.depositCount : transactions.filter(t => t.type === 'DEPOSIT').length}`, icon: <ArrowDownLeft size={15} />, color: '#60a5fa', trend: 'Inflow', trendColor: '#60a5fa' },
    { label: 'Withdrawals', value: `${summaryStats?.withdrawalCount !== undefined ? summaryStats.withdrawalCount : transactions.filter(t => t.type === 'WITHDRAWAL').length}`, icon: <ArrowUpRight size={15} />, color: '#f87171', trend: 'Outflow', trendColor: '#f87171' },
    { label: 'Net Liquidity', value: `₹${(summaryStats?.netFlowRs !== undefined ? summaryStats.netFlowRs : 0).toLocaleString('en-IN')}`, icon: <ShieldCheck size={15} />, color: '#34d399', trend: 'Risk-cleared', trendColor: '#34d399' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="MONEY FLOW"
        title="Financial ledger console"
        subtitle="Complete transaction history across deposits, withdrawals, prizes, refunds, bonuses, and game entries."
        stats={miniStats}
        actions={[
          { label: 'Refresh ledger', onClick: fetchTransactions, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#121727',
        padding: '1rem',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Username, Txn Reference..."
            className="custom-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="custom-input"
          style={{ width: 'auto', minWidth: '180px' }}
        >
          <option value="ALL">All Transaction Types</option>
          <option value="DEPOSIT">Deposits</option>
          <option value="WITHDRAWAL">Withdrawals</option>
          <option value="MATCH_ENTRY">Game Entries</option>
          <option value="MATCH_WIN">Prizes</option>
          <option value="REFUND">Refunds</option>
          <option value="BONUS_CREDIT">Bonuses</option>
        </select>
      </div>

      {/* Data Table */}
      <div style={{
        backgroundColor: '#121727',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#171e30', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textTransform: 'uppercase', fontSize: '0.7rem', color: '#64748b' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Transaction Ref</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>User</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Prev Balance</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>New Balance</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Description / Reason</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
                  Fetching Live Transactions Ledger...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>{t.txnId}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#60a5fa' }}>{t.username}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, color: t.type === 'WITHDRAWAL' || t.type === 'MATCH_ENTRY' ? '#f87171' : '#34d399' }}>
                    {t.type === 'WITHDRAWAL' || t.type === 'MATCH_ENTRY' ? '-' : '+'}₹{t.amountRs?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>₹{t.prevBalanceRs?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>₹{t.newBalanceRs?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      backgroundColor: t.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: t.status === 'SUCCESS' ? '#34d399' : '#f87171'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8' }}>{t.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
