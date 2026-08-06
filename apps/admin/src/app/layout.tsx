import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const metadata = {
  title: 'TCG Vision — Admin Panel',
  description: 'Panel de administración de cartas y colecciones Pokémon TCG.'
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{
        margin: 0,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#09090b',
        color: '#f4f4f5',
        display: 'flex',
        minHeight: '100vh'
      }}>
        <div style={{ display: 'none' }} aria-hidden="true">
          <img src="/next.svg" alt="next" />
          <img src="/vercel.svg" alt="vercel" />
        </div>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ marginTop: '64px', padding: '2rem', flex: 1, backgroundColor: '#09090b' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
