'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/admin/layout/AppShell';
import StatCard from '@/components/admin/cards/StatCard';
import DataTable from '@/components/admin/tables/DataTable';
import StatusBadge from '@/components/admin/tables/StatusBadge';
import { apiFetch } from '@/services/api';
import Swal from 'sweetalert2';
import { Gift, Plus, RefreshCw, Sparkles, CheckCircle2, Clock, Users, DollarSign } from 'lucide-react';

export default function AdminScratchCardsPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Festival Bonus Scratch Card',
    minReward: 10,
    maxReward: 100,
    rewardType: 'bonus',
    issueToAll: true,
    targetUserId: ''
  });

  useEffect(() => {
    fetchScratchCards();
  }, []);

  const fetchScratchCards = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/admin/scratch-cards');
      if (res.success && res.data?.scratch_cards) {
        setCards(res.data.scratch_cards);
      }
    } catch (e) {
      console.error('Fetch scratch cards error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/scratch-cards', 'POST', formData);
      if (res.success) {
        Swal.fire({
          title: 'Scratch Cards Issued!',
          text: res.message || `Successfully allocated scratch cards to players.`,
          icon: 'success',
          background: '#111624',
          color: '#ffffff'
        });
        setShowIssueModal(false);
        fetchScratchCards();
      }
    } catch (err) {
      Swal.fire({ title: 'Issue Failed', text: err.message || 'Operation failed', icon: 'error', background: '#111624', color: '#ffffff' });
    }
  };

  const totalCards = cards.length;
  const scratchedCards = cards.filter(c => c.isScratched || c.status === 'CLAIMED').length;
  const pendingCards = totalCards - scratchedCards;
  const totalBonusDistributed = cards.filter(c => c.isScratched).reduce((sum, c) => sum + (c.rewardAmount || c.minReward || 0), 0);

  const columns = [
    {
      key: 'name',
      label: 'Card Campaign',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{v || 'Daily Bonus Card'}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {r.cardId || r._id}</span>
        </div>
      )
    },
    {
      key: 'userId',
      label: 'Assigned Player',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong style={{ color: 'var(--emerald-light)', fontSize: '0.85rem' }}>{v?.username || 'Player'}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v?.mobile || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'rewardRange',
      label: 'Reward Range',
      render: (_, r) => (
        <strong style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>
          ₹{r.minReward || 5} - ₹{r.maxReward || 50}
        </strong>
      )
    },
    {
      key: 'claimedAmount',
      label: 'Revealed Amount',
      render: (_, r) => (
        <span style={{ fontWeight: 800, color: r.isScratched ? 'var(--emerald-light)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
          {r.isScratched ? `₹${r.rewardAmount || r.minReward}` : 'Unscratched'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, r) => (
        <StatusBadge
          status={r.isScratched ? 'RESOLVED' : 'ACTIVE'}
          text={r.isScratched ? 'SCRATCHED' : 'READY TO SCRATCH'}
        />
      )
    },
    {
      key: 'createdAt',
      label: 'Issued At',
      render: (v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(v || Date.now()).toLocaleDateString()}</span>
    }
  ];

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="micro-label">DAILY ENGAGEMENT & REWARD CAMPAIGNS</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.03em' }}>
              <Gift size={26} color="var(--emerald-light)" /> Scratch Cards & Bonus Allocation
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={fetchScratchCards}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-1)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={() => setShowIssueModal(true)}
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
                gap: '0.5rem',
                boxShadow: '0 0 20px var(--emerald-glow)'
              }}
            >
              <Plus size={16} /> Issue Scratch Cards
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <StatCard title="Total Scratch Cards" value={totalCards} trend="Allocated in DB" trendType="neutral" icon={Gift} badgeColor="emerald" />
          <StatCard title="Unscratched in Wallets" value={pendingCards} trend="Awaiting scratch" trendType="neutral" icon={Clock} badgeColor="gold" />
          <StatCard title="Scratched & Claimed" value={scratchedCards} trend="Redeemed by users" trendType="up" icon={CheckCircle2} badgeColor="emerald" />
          <StatCard title="Total Bonus Disbursed" value={`₹${totalBonusDistributed}`} trend="Real-time sum" trendType="neutral" icon={Sparkles} badgeColor="emerald" />
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={cards}
          loading={loading}
          emptyTitle="No Scratch Cards Distributed"
          emptyDescription="Click 'Issue Scratch Cards' to grant daily reward cards to active players."
        />

        {/* Issue Scratch Card Modal */}
        {showIssueModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', color: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="var(--gold)" /> Issue Bonus Scratch Cards
                </h3>
                <button onClick={() => setShowIssueModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Campaign Card Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="custom-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Min Random Reward (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minReward}
                      onChange={(e) => setFormData({ ...formData, minReward: Number(e.target.value) })}
                      className="custom-input"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Max Random Reward (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxReward}
                      onChange={(e) => setFormData({ ...formData, maxReward: Number(e.target.value) })}
                      className="custom-input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Target Audience</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="issueAudience"
                        checked={formData.issueToAll}
                        onChange={() => setFormData({ ...formData, issueToAll: true, targetUserId: '' })}
                        style={{ accentColor: 'var(--emerald)' }}
                      />
                      <span>All Active Players</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="issueAudience"
                        checked={!formData.issueToAll}
                        onChange={() => setFormData({ ...formData, issueToAll: false })}
                        style={{ accentColor: 'var(--emerald)' }}
                      />
                      <span>Specific User ID</span>
                    </label>
                  </div>
                </div>

                {!formData.issueToAll && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>User ID</label>
                    <input
                      type="text"
                      value={formData.targetUserId}
                      onChange={(e) => setFormData({ ...formData, targetUserId: e.target.value })}
                      placeholder="e.g. 66f1a89b..."
                      className="custom-input"
                      required={!formData.issueToAll}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--emerald)', color: '#000000', fontWeight: 900, border: 'none', cursor: 'pointer' }}
                  >
                    Issue Cards
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
