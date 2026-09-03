'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react';
import LudoDiceLoader from '@/components/common/LudoDiceLoader';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin@royalludo.com');
  const [password, setPassword] = useState('RoyalAdmin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.status && data.data?.token) {
        localStorage.setItem('royal_admin_token', data.data.token);
        localStorage.setItem('royal_admin_user', JSON.stringify(data.data.admin));
        document.cookie = `royal_admin_token=${data.data.token}; path=/; max-age=2592000; SameSite=Lax`;

        window.location.replace('/admin');
      } else {
        setError(data.message || 'Invalid username or password');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-void)',
        backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(16, 185, 129, 0.25), rgba(255, 255, 255, 0))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.14)',
          filter: 'blur(100px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Login Card */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2.25rem',
          borderRadius: '24px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.95)',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Ludo Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '22px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 15px rgba(245, 158, 11, 0.3)',
                overflow: 'hidden',
                border: '2px solid var(--emerald-light)',
                backgroundColor: '#111624',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src="/logo.png"
                alt="Royal Ludo Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ display: 'none', color: 'var(--emerald-light)', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={42} />
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              margin: '0 0 0.25rem 0'
            }}
          >
            Royal Ludo
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--emerald-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              backgroundColor: 'var(--emerald-bg)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <ShieldCheck size={14} />
            <span>Admin Panel</span>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: 'var(--rose)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              fontWeight: 700,
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Username / Email
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 0.75rem' }}>
              <Lock size={16} color="var(--emerald-light)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@royalludo.com"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}
            >
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0 0.75rem' }}>
              <KeyRound size={16} color="var(--emerald-light)" style={{ flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} color="var(--emerald-light)" /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 900,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 22px var(--emerald-glow)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.18s ease'
            }}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Admin Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem'
          }}
        >
          <ShieldCheck size={14} color="var(--emerald-light)" />
          <span>Secure Admin Login</span>
        </div>
      </div>
    </div>
  );
}
