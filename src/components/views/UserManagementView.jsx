'use client';

import React, { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, ShieldCheck, ShieldAlert, Lock, Unlock, RefreshCw, MoreVertical, ChevronLeft, ChevronRight, Users, Shield, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { apiFetch } from '@/services/api';
import UserProfileDrawer from '@/components/views/UserProfileDrawer';
import Swal from 'sweetalert2';
import { hasPermission } from '@/lib/rbac';
import { ModuleConsoleShell, AccessDeniedState } from '@/components/common/ModuleConsoleShell';

export default function UserManagementView({ permissions = {} }) {
  if (!hasPermission(permissions, 'users.view')) {
    return <AccessDeniedState module="Users" permission="users.view" />;
  }
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
      if (res.status && res.data) {
        setUsers(res.data);
        if (res.pagination) setPagination(res.pagination);
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
      text: `User will be marked as ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'BANNED' ? '#ef4444' : '#22c55e',
      confirmButtonText: `Yes, ${newStatus}`,
      background: '#0f1322',
      color: '#ffffff'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.status) {
        Swal.fire({ title: 'Status Updated', text: res.message, icon: 'success', background: '#0f1322', color: '#ffffff' });
        fetchUsers();
      }
    } catch (e) {
      Swal.fire({ title: 'Error', text: e.message || 'Status update failed', icon: 'error', background: '#0f1322', color: '#ffffff' });
    }
  };

  const miniStats = [
    { label: 'Total users', value: users.length ? `${users.length}` : '0', icon: <Users size={15} />, color: '#60a5fa', trend: '+12.4% this week', trendColor: '#34d399' },
    { label: 'Active users', value: `${Math.max(users.filter(u => u.status === 'ACTIVE').length, 0)}`, icon: <Activity size={15} />, color: '#34d399', trend: 'Stable traffic', trendColor: '#34d399' },
    { label: 'KYC pending', value: `${Math.max(users.filter(u => u.kycStatus !== 'VERIFIED').length, 0)}`, icon: <Shield size={15} />, color: '#fbbf24', trend: 'Review queue', trendColor: '#fbbf24' },
    { label: 'High-risk', value: `${Math.max(users.filter(u => (u.riskScore || '').toUpperCase() === 'HIGH').length, 0)}`, icon: <TrendingDown size={15} />, color: '#f87171', trend: 'Needs review', trendColor: '#f87171' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ModuleConsoleShell
        badge="USER OPERATIONS"
        title="User control console"
        subtitle="360° user overview, compliance state, wallet health, and risk monitoring for every player account."
        stats={miniStats}
        actions={[
          { label: 'Mask phone numbers', onClick: () => setShowMaskedPhones((prev) => !prev), icon: showMaskedPhones ? <EyeOff size={15} /> : <Eye size={15} />, primary: false },
          { label: 'Sync users', onClick: fetchUsers, icon: <RefreshCw size={15} />, primary: true }
        ]}
      />

      {/* Filter & Search Bar */}
      <div style={{ backgroundColor: '#0f1322', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Username, Mobile, Referral Code, or User ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="custom-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="custom-input" style={{ width: '140px', fontSize: '0.8rem' }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PENDING_VERIFICATION">Suspended</option>
            <option value="BANNED">Banned Only</option>
          </select>

          <select value={kycFilter} onChange={(e) => { setKycFilter(e.target.value); setPage(1); }} className="custom-input" style={{ width: '140px', fontSize: '0.8rem' }}>
            <option value="">All KYC States</option>
            <option value="VERIFIED">KYC Verified</option>
            <option value="PENDING">KYC Pending</option>
            <option value="NONE">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Data Grid Table */}
      <div style={{ backgroundColor: '#0f1322', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#13192e', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem' }}>User Profile</th>
                <th style={{ padding: '1rem' }}>Phone Number</th>
                <th style={{ padding: '1rem' }}>Reg. Date</th>
                <th style={{ padding: '1rem' }}>KYC State</th>
                <th style={{ padding: '1rem' }}>Total Wallet</th>
                <th style={{ padding: '1rem' }}>Deposits</th>
                <th style={{ padding: '1rem' }}>Cashouts</th>
                <th style={{ padding: '1rem' }}>Played</th>
                <th style={{ padding: '1rem' }}>W / L Ratio</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Risk Score</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} style={{ padding: '3rem', textAlign: 'center', color: '#facc15', fontWeight: 800 }}>
                    Retrieving User Database Intelligence...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No users matching the criteria found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'background 0.2s ease' }}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#ffffff' }}>{u.username}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {u.id}</div>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {showMaskedPhones ? u.maskedMobile : u.mobile}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: u.kycStatus === 'VERIFIED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                        color: u.kycStatus === 'VERIFIED' ? '#4ade80' : '#facc15'
                      }}>
                        {u.kycStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#facc15' }}>
                      ₹{u.wallet?.totalBalanceRs?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#4ade80' }}>
                      ₹{u.financials?.totalDepositsRs?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#f87171' }}>
                      ₹{u.financials?.totalWithdrawalsRs?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {u.stats?.played}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#4ade80', fontWeight: 800 }}>{u.stats?.won}W</span> / <span style={{ color: '#f87171', fontWeight: 800 }}>{u.stats?.lost}L</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: u.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: u.status === 'ACTIVE' ? '#4ade80' : '#f87171'
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: u.riskScore === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: u.riskScore === 'HIGH' ? '#f87171' : '#60a5fa'
                      }}>
                        {u.riskScore}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedUserId(u.id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'rgba(250, 204, 21, 0.2)',
                          color: '#facc15',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Inspect 360°
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '1rem', backgroundColor: '#13192e', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
          <div>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} Users Total)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#ffffff', cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page > 1 ? 1 : 0.5 }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#ffffff', cursor: page < pagination.totalPages ? 'pointer' : 'not-allowed', opacity: page < pagination.totalPages ? 1 : 0.5 }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 360 Profile Slide-Over Drawer */}
      {selectedUserId && (
        <UserProfileDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefreshUsers={fetchUsers}
        />
      )}
    </div>
  );
}
