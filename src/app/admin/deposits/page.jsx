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
import {
  ArrowDownLeft,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  ShieldAlert,
  Eye,
  Copy,
  Check,
  XCircle,
  X,
  CreditCard,
  QrCode,
  User,
  Phone,
  Calendar,
  ExternalLink,
  Layers,
  FileImage
} from 'lucide-react';

export default function DepositOperationsPage() {
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [summaryStats, setSummaryStats] = useState(null);
  const [depositTrend, setDepositTrend] = useState([]);
  const [methodDonut, setMethodDonut] = useState([]);

  // Complete details modal
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  // Lightbox for proof screenshot image
  const [lightboxImage, setLightboxImage] = useState(null);
  // Copied feedback tracker
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchDeposits(false);
    const interval = setInterval(() => {
      fetchDeposits(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [statusFilter, search, page]);

  const fetchDeposits = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await apiFetch(`/admin/deposits?status=${statusFilter}&search=${encodeURIComponent(search)}&page=${page}&limit=20&t=${Date.now()}`);
      if (res.status && res.data) {
        setDeposits(res.data);
        if (res.pagination) setPagination(res.pagination);
        if (res.summaryStats) setSummaryStats(res.summaryStats);
        if (res.methodDonutData) setMethodDonut(res.methodDonutData);
        if (res.depositTrendData) setDepositTrend(res.depositTrendData);
      }
    } catch (e) {
      console.error('Fetch deposits error:', e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerifyDeposit = async (deposit) => {
    const confirm = await Swal.fire({
      title: 'Approve & Credit Deposit?',
      text: `Verify Transaction UTR / Ref ID: ${deposit.utrNumber || deposit.depositId || deposit.id}. ₹${deposit.amountRs} will be immediately credited to ${deposit.user?.username || 'User'}'s wallet.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--emerald)',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Approve & Credit',
      background: '#111624',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch('/admin/deposits', {
        method: 'POST',
        body: JSON.stringify({ depositId: deposit.id || deposit.depositId, action: 'APPROVE' })
      });
      if (res.status) {
        Swal.fire({
          title: 'Deposit Approved & Credited!',
          text: res.message || 'Deposit verified and credited to user wallet.',
          icon: 'success',
          background: '#111624',
          color: '#ffffff',
          timer: 2000
        });
        if (selectedDeposit?.id === deposit.id || selectedDeposit?.depositId === deposit.depositId) {
          setSelectedDeposit(prev => prev ? { ...prev, status: 'APPROVED' } : null);
        }
        fetchDeposits();
      }
    } catch (e) {
      Swal.fire({ title: 'Verification Error', text: e.message || 'Deposit verification failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const handleRejectDeposit = async (deposit) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Deposit Request?',
      text: `Enter the reason for rejecting deposit #${deposit.depositId || deposit.id}:`,
      input: 'text',
      inputValue: 'Invalid or unverified UTR proof',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Reject Deposit',
      background: '#111624',
      color: '#ffffff',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a rejection reason!';
        }
      }
    });

    if (!isConfirmed) return;

    try {
      const res = await apiFetch('/admin/deposits', {
        method: 'POST',
        body: JSON.stringify({
          depositId: deposit.id || deposit.depositId,
          action: 'REJECT',
          reason
        })
      });

      if (res.status) {
        Swal.fire({
          title: 'Deposit Rejected',
          text: 'Deposit marked as rejected.',
          icon: 'info',
          background: '#111624',
          color: '#ffffff',
          timer: 1800
        });
        if (selectedDeposit?.id === deposit.id || selectedDeposit?.depositId === deposit.depositId) {
          setSelectedDeposit(prev => prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : null);
        }
        fetchDeposits();
      }
    } catch (e) {
      Swal.fire({ title: 'Rejection Error', text: e.message || 'Deposit rejection failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const depositTrendData = depositTrend.length > 0 ? depositTrend : [
    { name: 'Day 1', amount: 0 },
    { name: 'Day 3', amount: 0 },
    { name: 'Day 5', amount: 0 },
    { name: 'Day 7', amount: 0 },
    { name: 'Day 9', amount: 0 },
    { name: 'Day 11', amount: 0 },
    { name: 'Day 14', amount: 0 }
  ];

  const methodDonutData = methodDonut.length > 0 ? methodDonut : [
    { name: 'UPI Direct Transfer', value: deposits.length || 0, color: '#10b981' }
  ];

  const columns = [
    {
      key: 'proof',
      label: 'Proof Image',
      align: 'center',
      render: (_, r) => {
        if (!r.proofImageUrl) {
          return (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.65rem'
              }}
              title="No screenshot uploaded"
            >
              <FileImage size={16} />
            </div>
          );
        }

        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage({
                url: r.proofImageUrl,
                title: `Proof Screenshot — ${r.depositId}`,
                utr: r.utrNumber,
                user: r.user?.username,
                amount: r.amountRs
              });
            }}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              cursor: 'zoom-in',
              position: 'relative',
              backgroundColor: '#000000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
            title="Click to Enlarge Proof Screenshot"
          >
            <img
              src={r.proofImageUrl}
              alt="Payment Proof"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s'
              }}
              className="hover:opacity-100"
            >
              <Eye size={14} color="#ffffff" />
            </div>
          </div>
        );
      }
    },
    {
      key: 'depositId',
      label: 'Deposit ID / UTR',
      render: (v, r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--emerald-light)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {v || r.id}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(v || r.id, v || r.id);
              }}
              style={{ background: 'none', border: 'none', color: copiedKey === (v || r.id) ? 'var(--emerald-light)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              title="Copy Deposit ID"
            >
              {copiedKey === (v || r.id) ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 700 }}>
              UTR: {r.utrNumber || 'Pending Submission'}
            </span>
            {r.utrNumber && r.utrNumber !== 'N/A' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(r.utrNumber, `utr-${r.id}`);
                }}
                style={{ background: 'none', border: 'none', color: copiedKey === `utr-${r.id}` ? 'var(--emerald-light)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                title="Copy UTR"
              >
                {copiedKey === `utr-${r.id}` ? <Check size={11} /> : <Copy size={11} />}
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date(r.createdAt || Date.now()).toLocaleString('en-IN')}
          </div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Player Account',
      render: (v) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={13} style={{ color: 'var(--emerald-light)' }} />
            <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{v?.username || 'kingplayer'}</strong>
          </div>
          {v?.mobile && v.mobile !== 'N/A' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <Phone size={10} /> +91 {v.mobile}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'amountRs',
      label: 'Amount',
      render: (v) => <strong style={{ fontSize: '1rem', color: 'var(--emerald-light)', fontWeight: 900 }}>₹{(v || 0).toLocaleString('en-IN')}</strong>
    },
    {
      key: 'method',
      label: 'Deposit Method',
      render: (_, r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 700 }}>
            {r.paymentMethod === 'QR_CODE' ? <QrCode size={13} color="var(--gold)" /> : <CreditCard size={13} color="var(--emerald-light)" />}
            {r.paymentMethodTitle || r.paymentMethod || 'UPI Direct'}
          </div>
          {r.adminUpiId && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              To: {r.adminUpiId}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, r) => (
        <div>
          <StatusBadge status={v} />
          {r.rejectionReason && (
            <div style={{ fontSize: '0.68rem', color: 'var(--rose)', marginTop: '3px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.rejectionReason}>
              Reason: {r.rejectionReason}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'action',
      label: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* View Details Modal Trigger */}
          <button
            onClick={() => setSelectedDeposit(r)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            title="Inspect Complete Deposit Details & Proof"
          >
            <Eye size={12} /> Details
          </button>

          {/* Quick Action buttons for Pending */}
          {r.status === 'PENDING_APPROVAL' || r.status === 'PENDING' || r.status === 'INITIATED' ? (
            <>
              <button
                onClick={() => handleVerifyDeposit(r)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--emerald)',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Check size={12} /> Approve
              </button>

              <button
                onClick={() => handleRejectDeposit(r)}
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  backgroundColor: 'rgba(244, 63, 94, 0.1)',
                  color: 'var(--rose)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Reject Deposit"
              >
                <X size={12} />
              </button>
            </>
          ) : null}
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
            <div className="micro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-light)' }}>
              <ArrowDownLeft size={13} /> DEPOSIT OPERATIONS & UTR AUDIT
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', letterSpacing: '-0.03em' }}>
              Deposit Records & Proof Verification
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Review player deposit requests, match 12-digit UTR numbers, inspect payment screenshots, and credit user wallets.
            </p>
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
              onClick={() => fetchDeposits(false)}
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
          <StatCard
            title="Total Deposit Volume"
            value={`₹${(summaryStats?.totalDepositsRs !== undefined ? summaryStats.totalDepositsRs : deposits.reduce((sum, d) => sum + (d.amountRs || 0), 0)).toLocaleString('en-IN')}`}
            trend={summaryStats?.growthTrend || '+0.0% this month'}
            trendType="up"
            icon={ArrowDownLeft}
            badgeColor="emerald"
          />
          <StatCard
            title="Approved Deposits"
            value={summaryStats?.successfulCount !== undefined ? summaryStats.successfulCount : deposits.filter(d => d.status === 'APPROVED' || d.status === 'SUCCESSFUL').length}
            trend="Credited to players"
            trendType="up"
            icon={CheckCircle}
            badgeColor="emerald"
          />
          <StatCard
            title="Waiting Verification"
            value={summaryStats?.pendingCount !== undefined ? summaryStats.pendingCount : deposits.filter(d => d.status === 'PENDING_APPROVAL' || d.status === 'PENDING' || d.status === 'INITIATED').length}
            trend="Requires Admin Review"
            trendType="neutral"
            icon={Clock}
            badgeColor="gold"
          />
          <StatCard
            title="Rejected Requests"
            value={summaryStats?.failedCount !== undefined ? summaryStats.failedCount : deposits.filter(d => d.status === 'REJECTED' || d.status === 'FAILED' || d.status === 'EXPIRED').length}
            trend="Declined UTRs"
            trendType="down"
            icon={ShieldAlert}
            badgeColor="rose"
          />
        </div>

        {/* Analytics: 14-Day Deposit Volume & Payment Method Share */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          <ChartCard title="14-Day Deposit Inflow Trend" subtitle="Daily cash deposit volume across all methods" loading={loading}>
            <AreaChartWidget data={depositTrendData} xKey="name" yKey="amount" color="#10b981" formatY={(v) => v >= 1000 ? `₹${(v/1000).toFixed(1)}k` : `₹${v}`} />
          </ChartCard>

          <ChartCard title="Deposit Method Share" subtitle="UPI vs QR Code vs Bank Transfer" loading={loading}>
            <DonutChartWidget data={methodDonut.length > 0 ? methodDonut : methodDonutData} />
          </ChartCard>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by Deposit ID, Username, Mobile, or UTR..." />

          <FilterGroup
            options={[
              { label: 'All Deposits', value: 'ALL' },
              { label: 'Pending Only', value: 'PENDING_APPROVAL' },
              { label: 'Approved Only', value: 'APPROVED' },
              { label: 'Rejected Only', value: 'REJECTED' }
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
          emptyDescription="No deposit entries match your filter criteria."
          page={pagination.page || page}
          totalPages={pagination.totalPages || 1}
          totalItems={pagination.total || deposits.length}
          onPageChange={setPage}
        />

        {/* COMPLETE DETAILS MODAL */}
        {selectedDeposit && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(4, 7, 18, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setSelectedDeposit(null)}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '680px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: '#0c0f1e',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#090c17'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      Deposit Request Details
                    </h3>
                    <StatusBadge status={selectedDeposit.status} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0', fontFamily: 'monospace' }}>
                    ID: {selectedDeposit.depositId || selectedDeposit.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Proof Image Section */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    User Submitted Proof Screenshot
                  </span>
                  {selectedDeposit.proofImageUrl ? (
                    <div
                      style={{
                        backgroundColor: '#070a13',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div
                        onClick={() => setLightboxImage({
                          url: selectedDeposit.proofImageUrl,
                          title: `Proof Screenshot — ${selectedDeposit.depositId}`,
                          utr: selectedDeposit.utrNumber,
                          user: selectedDeposit.user?.username,
                          amount: selectedDeposit.amountRs
                        })}
                        style={{
                          maxHeight: '260px',
                          maxWidth: '100%',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'zoom-in',
                          border: '2px solid rgba(16, 185, 129, 0.4)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
                        }}
                      >
                        <img
                          src={selectedDeposit.proofImageUrl}
                          alt="Proof Screenshot"
                          style={{ maxHeight: '260px', width: 'auto', objectFit: 'contain', display: 'block' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setLightboxImage({
                            url: selectedDeposit.proofImageUrl,
                            title: `Proof Screenshot — ${selectedDeposit.depositId}`,
                            utr: selectedDeposit.utrNumber,
                            user: selectedDeposit.user?.username,
                            amount: selectedDeposit.amountRs
                          })}
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <Eye size={13} /> Full Screen View
                        </button>

                        <a
                          href={selectedDeposit.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={13} /> Open in New Tab
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1.5rem',
                        backgroundColor: '#070a13',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed rgba(255,255,255,0.15)',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <FileImage size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                      No screenshot proof uploaded for this deposit. Verify via bank statement using UTR.
                    </div>
                  )}
                </div>

                {/* Key Transaction Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ backgroundColor: '#070a13', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>DEPOSIT AMOUNT</span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--emerald-light)', fontWeight: 900 }}>
                      ₹{(selectedDeposit.amountRs || 0).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div style={{ backgroundColor: '#070a13', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>UTR / TRANSACTION ID</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 800 }}>
                        {selectedDeposit.utrNumber || 'N/A'}
                      </span>
                      {selectedDeposit.utrNumber && selectedDeposit.utrNumber !== 'N/A' && (
                        <button
                          onClick={() => copyToClipboard(selectedDeposit.utrNumber, 'modal-utr')}
                          style={{ background: 'none', border: 'none', color: copiedKey === 'modal-utr' ? 'var(--emerald-light)' : 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          {copiedKey === 'modal-utr' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Player Account Details */}
                <div style={{ backgroundColor: '#070a13', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    Player Profile
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Username:</span>
                      <strong style={{ color: '#ffffff' }}>{selectedDeposit.user?.username || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Phone Number:</span>
                      <strong style={{ color: '#ffffff' }}>+91 {selectedDeposit.user?.mobile || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>User ID:</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{selectedDeposit.user?.id || selectedDeposit.user?._id || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Method & Admin Account */}
                <div style={{ backgroundColor: '#070a13', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    Payment Channel
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Selected Method:</span>
                      <strong style={{ color: '#ffffff' }}>{selectedDeposit.paymentMethodTitle || selectedDeposit.paymentMethod || 'UPI Direct'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Admin UPI Handle:</span>
                      <strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{selectedDeposit.adminUpiId || 'royalludo@upi'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Created At:</span>
                      <span style={{ color: '#ffffff' }}>{new Date(selectedDeposit.createdAt || Date.now()).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* If Rejection Reason exists */}
                {selectedDeposit.rejectionReason && (
                  <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--rose)', display: 'block', textTransform: 'uppercase' }}>
                      Rejection Reason:
                    </span>
                    <p style={{ color: '#ffffff', fontSize: '0.825rem', margin: '4px 0 0 0' }}>
                      {selectedDeposit.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Action Buttons in Modal */}
                {selectedDeposit.status === 'PENDING_APPROVAL' || selectedDeposit.status === 'PENDING' || selectedDeposit.status === 'INITIATED' ? (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => handleRejectDeposit(selectedDeposit)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.4)',
                        color: 'var(--rose)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <XCircle size={15} /> Reject Request
                    </button>

                    <button
                      onClick={() => handleVerifyDeposit(selectedDeposit)}
                      style={{
                        flex: 2,
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--emerald)',
                        color: '#000000',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      <CheckCircle size={16} /> Approve & Credit ₹{(selectedDeposit.amountRs || 0).toLocaleString('en-IN')}
                    </button>
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX FOR PROOF IMAGE */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(10px)',
              zIndex: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              cursor: 'zoom-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                maxWidth: '600px',
                width: '100%',
                backgroundColor: '#0c0f1e',
                borderRadius: '24px',
                padding: '1.5rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.95)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {lightboxImage.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Player: <strong style={{ color: '#ffffff' }}>{lightboxImage.user}</strong> &nbsp;|&nbsp; Amount: <strong style={{ color: 'var(--emerald-light)' }}>₹{lightboxImage.amount}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setLightboxImage(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div
                style={{
                  maxHeight: '65vh',
                  overflow: 'auto',
                  borderRadius: '12px',
                  backgroundColor: '#000000',
                  padding: '4px',
                  marginBottom: '1rem'
                }}
              >
                <img
                  src={lightboxImage.url}
                  alt="Proof Screenshot"
                  style={{ width: '100%', maxHeight: '62vh', objectFit: 'contain', display: 'block' }}
                />
              </div>

              {lightboxImage.utr && (
                <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 800, marginBottom: '0.75rem' }}>
                  UTR: {lightboxImage.utr}
                </div>
              )}

              <button
                onClick={() => setLightboxImage(null)}
                style={{
                  padding: '0.5rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
