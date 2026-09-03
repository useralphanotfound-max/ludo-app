'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowLeft, ShieldAlert, RotateCcw } from 'lucide-react';
import LudoDiceLoader from '@/components/common/LudoDiceLoader';

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-void)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Neon Ambient Lighting Circles */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '25%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Glass Card */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
          zIndex: 10
        }}
      >
        {/* Animated 3D Ludo Dice */}
        <div style={{ marginBottom: '1.25rem' }}>
          <LudoDiceLoader text="" size="large" />
        </div>

        {/* 404 Badge & Heading */}
        <div
          style={{
            fontSize: '4.5rem',
            fontWeight: 900,
            lineHeight: 1,
            background: 'linear-gradient(135deg, var(--emerald-light) 0%, var(--gold) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.04em'
          }}
        >
          404
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem 0' }}>
          Page Not Found
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
          Oops! Looks like this page doesn&apos;t exist or was moved.
          <br />
          Don&apos;t worry, you can easily navigate back to safety below.
        </p>

        {/* Action Buttons Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            href="/admin"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--emerald)',
              color: '#000000',
              fontWeight: 900,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 0 20px var(--emerald-glow)',
              transition: 'all 0.18s ease'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Go to Admin Dashboard</span>
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <RotateCcw size={16} />
              <span>Go Back</span>
            </button>

            <Link
              href="/superadmin/login"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft size={16} />
              <span>Login Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
