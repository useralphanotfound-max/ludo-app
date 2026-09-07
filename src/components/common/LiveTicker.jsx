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
      padding: '0.45rem 1rem',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      width: '100%'
    }}>
      <marquee
        behavior="scroll"
        direction="left"
        scrollamount="5"
        onMouseOver={(e) => e.target.stop && e.target.stop()}
        onMouseOut={(e) => e.target.start && e.target.start()}
        style={{
          color: '#94a3b8',
          fontSize: '0.8125rem',
          fontWeight: 500,
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2.25rem' }}>
          {tickerItems.length === 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ color: '#10b981', fontSize: '0.9rem' }}>•</span>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>LIVE ACTIVITY STREAM</span>
              <span style={{ color: '#94a3b8' }}>Royal Ludo System Active</span>
              <span style={{ fontWeight: 800, color: '#34d399' }}>Real-time updates enabled</span>
            </span>
          ) : (
            tickerItems.concat(tickerItems).map((item, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: '#10b981', fontSize: '0.9rem' }}>•</span>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{item.type}</span>
                <span style={{ color: '#94a3b8' }}>{item.user}</span>
                <span style={{ fontWeight: 800, color: item.isPositive ? '#34d399' : '#f87171' }}>
                  {item.amount}
                </span>
              </span>
            ))
          )}
        </div>
      </marquee>
    </div>
  );
}
