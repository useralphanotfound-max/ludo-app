'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/services/api';

export default function LiveTicker() {
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    fetchLatestActivity();
    const interval = setInterval(fetchLatestActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatestActivity = async () => {
    try {
      const res = await apiFetch('/admin/dashboard');
      if (res.status && res.data?.recentTransactions) {
        setTickerItems(res.data.recentTransactions);
      }
    } catch (e) { }
  };

  return (
    <div style={{
      backgroundColor: '#070a12',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '0.4rem 1rem',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      width: '100%',
      height: '32px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: '0.75rem',
        width: '100%'
      }}>
        {tickerItems.length === 0 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#10b981', fontSize: '0.8rem' }}>●</span>
            <span style={{ color: '#cbd5e1', fontWeight: 600 }}>LIVE ACTIVITY STREAM</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#94a3b8' }}>Royal Ludo System Active</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ fontWeight: 800, color: '#34d399' }}>Real-time updates enabled</span>
          </div>
        ) : (
          tickerItems.slice(0, 5).map((item, idx) => (
            <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginRight: '1.5rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.7rem' }}>●</span>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{item.type}</span>
              <span style={{ color: '#94a3b8' }}>{item.user}</span>
              <span style={{ fontWeight: 800, color: item.isPositive ? '#34d399' : '#f87171' }}>
                {item.amount}
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
