'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-void)',
        color: 'var(--emerald-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800
      }}
    >
      Redirecting to Royal Ludo Admin OS...
    </div>
  );
}
