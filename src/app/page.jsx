import Link from 'next/link';
import { Crown, ShieldCheck, Phone, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#060913',
      backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245, 158, 11, 0.15), rgba(255, 255, 255, 0))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '540px',
        width: '100%',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          boxShadow: '0 10px 30px -5px rgba(245, 158, 11, 0.4)',
          marginBottom: '1.25rem'
        }}>
          <Crown size={40} color="#060913" />
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 0.5rem 0' }}>
          Royal Ludo Platform
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
          Next.js App Router Architecture: Serverless Mobile REST APIs & Superadmin Control Center.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Link
            href="/superadmin/login"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}
          >
            <ShieldCheck size={20} />
            <span>Open Superadmin Portal</span>
            <ArrowRight size={18} />
          </Link>

          <a
            href="/api/cms/version-check"
            target="_blank"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem' }}
          >
            <Phone size={16} />
            <span>Test Mobile API Endpoint (/api/cms/version-check)</span>
          </a>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', color: '#64748b', fontSize: '0.75rem' }}>
          MongoDB Atlas Connected · Integer Paise Balances · Exact IP Audit Logging
        </div>
      </div>
    </div>
  );
}
