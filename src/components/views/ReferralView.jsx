'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Search, RefreshCw, Trophy, Users, Award } from 'lucide-react';
import { apiFetch } from '@/services/api';

export default function ReferralView() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    fetchReferrals();
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        backgroundColor: '#121727',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>GROWTH & REWARDS</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gift size={24} color="#c084fc" /> Referral & Growth Management Console
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Track referral codes, reward distribution history, abuse detection, and referral caps.
          </p>
        </div>
        <button
          onClick={fetchReferrals}
          style={{
            padding: '0.625rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#171e30',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#c084fc',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} /> Sync Referral Rewards
        </button>
      </div>

      {/* Referrals Table */}
      <div style={{ backgroundColor: '#121727', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#171e30', color: '#64748b', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem' }}>Referral Code</th>
              <th style={{ padding: '1rem' }}>Referrer User</th>
              <th style={{ padding: '1rem' }}>Total Invited Users</th>
              <th style={{ padding: '1rem' }}>Reward Distributed</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#c084fc', fontWeight: 800 }}>
                  Fetching Live Referral Records...
                </td>
              </tr>
            ) : referrals.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No referral records found.
                </td>
              </tr>
            ) : (
              referrals.map(ref => (
                <tr key={ref.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#c084fc' }}>
                    {ref.code}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    {ref.referrer}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#60a5fa' }}>
                    {ref.totalReferred} Users
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 900, color: '#34d399' }}>
                    ₹{ref.rewardEarnedRs?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                      {ref.status || 'Active'}
                    </span>
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
