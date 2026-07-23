import './globals.css';

export const metadata = {
  title: 'Royal Ludo — Superadmin & Backend Platform',
  description: 'Production-Ready Real-Money Gaming Backend API & Superadmin Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
