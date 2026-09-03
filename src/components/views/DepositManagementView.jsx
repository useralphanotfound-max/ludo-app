'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, Search, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, ShieldCheck, CreditCard, TrendingUp, Wallet, CircleDollarSign } from 'lucide-react';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';
import { hasPermission } from '@/lib/rbac';

export default function DepositManagementView({ permissions = {} }) {
  if (!hasPermission(permissions, 'deposits.view')) {
    return <AccessDeniedState module="Deposits" permission="deposits.view" />;
  }
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [verifyingId, setVerifyingId] = useState(null);

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
      }
    } catch (e) {
      console.error('Fetch deposits error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGateway = async (deposit) => {
    const confirm = await Swal.fire({
      title: 'Verify Deposit with Gateway Server?',
      text: `Re-query provider API for Transaction ID: ${deposit.depositId}. If successful, ₹${deposit.amountRs} will be credited to ${deposit.user.username}'s wallet.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#facc15',
      confirmButtonText: 'Verify Gateway Webhook',
      background: '#0f1322',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      setVerifyingId(deposit.id);
      const res = await apiFetch('/admin/deposits', {
        method: 'POST',
        body: JSON.stringify({
          depositId: deposit.id,
          action: 'VERIFY_GATEWAY',
          adminUsername: 'SuperAdmin'
        })
      });

      if (res.status) {
        Swal.fire({ title: 'Verified', text: res.message, icon: 'success', background: '#0f1322', color: '#ffffff' });
        fetchDeposits();
      }
    } catch (e) {
      Swal.fire({ title: 'Verification Failed', text: e.message || 'Error communicating with payment gateway', icon: 'error', background: '#0f1322', color: '#ffffff' });
    } finally {
      setVerifyingId(null);
    }
  };

  const miniStats = [
    { label: 'Total deposits', value: `₹${(deposits.reduce((sum, item) => sum + Number(item.amountRs || 0), 0) || 0).toLocaleString('en-IN')}`, icon: <CircleDollarSign size={15} />, color: '#34d399', trend: 'Daily inflow', trendColor: '#34d399' },
    { label: 'Pending review', value: `${deposits.filter(d => d.status === 'PENDING').length}`, icon: <Clock size={15} />, color: '#fbbf24', trend: 'Needs verification', trendColor: '#fbbf24' },
    { label: 'Successful', value: `${deposits.filter(d => d.status === 'SUCCESSFUL').length}`, icon: <CheckCircle size={15} />, color: '#34d399', trend: 'Gateway confirmed', trendColor: '#34d399' },
    { label: 'Failed', value: `${deposits.filter(d => d.status === 'FAILED').length}`, icon: <XCircle size={15} />, color: '#f87171', trend: 'Needs refund', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="DEPOSIT OPERATIONS"
        title="Deposit verification console"
        subtitle="Server-side reconciliation, provider confirmation, and safer wallet crediting for every deposit request."
        stats={miniStats}
        actions={[
          { label: 'Sync queue', onClick: fetchDeposits, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Filter Tabs & Search */}
      <div style={{ backgroundColor: '#0f1322', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REFUNDED'].map(st => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: statusFilter === st ? 'rgba(250, 204, 21, 0.2)' : 'transparent',
                color: statusFilter === st ? '#facc15' : '#94a3b8',
                fontWeight: statusFilter === st ? 800 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ width: '280px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search deposit ID or reference..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="custom-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div style={{ backgroundColor: '#0f1322', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#13192e', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>Deposit ID / Txn</th>
              <th style={{ padding: '1rem' }}>User Profile</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Method & Provider</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Server Verification</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#facc15', fontWeight: 800 }}>
                  Fetching Deposit Data...
                </td>
              </tr>
            ) : deposits.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No deposit records found in queue.
                </td>
              </tr>
            ) : (
              deposits.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>{d.depositId}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: {d.gatewayReferenceId}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: '#ffffff' }}>{d.user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.user.mobile}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#4ade80', fontSize: '1rem' }}>
                    ₹{d.amountRs.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: 700, color: '#cbd5e1' }}>{d.paymentMethod}</span>
                    <div style={{ fontSize: '0.7rem', color: '#facc15' }}>{d.gatewayProvider}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: d.status === 'SUCCESSFUL' ? 'rgba(34, 197, 94, 0.2)' : d.status === 'PENDING' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: d.status === 'SUCCESSFUL' ? '#4ade80' : d.status === 'PENDING' ? '#facc15' : '#f87171'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem',
                      color: d.webhookVerified ? '#4ade80' : '#facc15',
                      fontWeight: 700
                    }}>
                      {d.webhookVerified ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                      {d.webhookVerified ? 'Verified Webhook' : 'Pending Verification'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {!d.webhookVerified && (
                      <button
                        onClick={() => handleVerifyGateway(d)}
                        disabled={verifyingId === d.id}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#facc15',
                          color: '#000000',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {verifyingId === d.id ? 'Checking Gateway...' : '⚡ Verify Gateway'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
