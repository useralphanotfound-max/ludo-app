'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0c16',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-panel card-gold-border" style={{
        maxWidth: '460px',
        padding: '2.5rem',
        borderRadius: '24px'
      }}>
        <ShieldAlert size={52} color="#facc15" style={{ margin: '0 auto 1.25rem auto' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#facc15', margin: '0 0 0.5rem 0' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
          Page Not Found
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          The requested path does not exist on the Royal Ludo Superadmin Console.
        </p>
        <Link href="/superadmin/login" className="btn-gold" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
          <span>Return to Superadmin Portal</span>
        </Link>
      </div>
    </div>
  );
}
