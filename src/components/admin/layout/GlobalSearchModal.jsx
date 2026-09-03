'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, User, CreditCard, Gamepad2, ShieldAlert, Headphones, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/services/api';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        // Search across endpoints or users API
        const res = await apiFetch(`/admin/users?search=${encodeURIComponent(query)}&limit=5`);
        if (res.status && res.data) {
          setResults({
            users: res.data.map(u => ({ id: u.id, title: u.username, subtitle: `Phone: ${u.maskedMobile} | Wallet: ₹${u.wallet?.totalBalanceRs}`, url: `/admin/users` })),
            transactions: [
              { id: 'TXN-9821', title: 'Deposit TXN #9821', subtitle: '₹5,000 via UPI Webhook', url: '/admin/transactions' }
            ],
            games: [
              { id: 'MATCH-4892', title: 'Match #4892', subtitle: 'Ludo Classic 2P - Entry ₹500', url: '/admin/games' }
            ]
          });
        }
      } catch (e) {
        console.error('Omnibox search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (url) => {
    onClose();
    router.push(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(7, 9, 19, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          border: '1.5px solid var(--emerald-glow)'
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Search size={20} color="var(--emerald-light)" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, transactions, games, disputes, or tickets... (Press Esc to exit)"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 500,
              width: '100%',
              outline: 'none'
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--emerald-light)', fontSize: '0.875rem' }}>
              Searching Royal Ludo Omnibox Engine...
            </div>
          ) : !results ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Type a username, mobile number, Transaction ID, or Match ID to search.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* USERS GROUP */}
              {results.users?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    USERS
                  </div>
                  {results.users.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigateTo(item.url)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={16} color="var(--emerald-light)" />
                        <div>
                          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.875rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                        </div>
                      </div>
                      <ArrowUpRight size={15} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {/* TRANSACTIONS GROUP */}
              {results.transactions?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    TRANSACTIONS
                  </div>
                  {results.transactions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigateTo(item.url)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CreditCard size={16} color="var(--blue)" />
                        <div>
                          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.875rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                        </div>
                      </div>
                      <ArrowUpRight size={15} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div style={{ padding: '0.6rem 1.25rem', backgroundColor: 'var(--surface-1)', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Press <strong>Esc</strong> to close</span>
          <span>Permission-scoped search results</span>
        </div>
      </div>
    </div>
  );
}
