'use client';

import React from 'react';
import Link from 'next/link';

interface OrderMock {
  id: string;
  number: string;
  date: string;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  itemsCount: number;
  itemsSummary: string;
}

const ORDERS_HISTORY: OrderMock[] = [
  { id: '1', number: 'ORD-892102', date: '2026-08-01', total: 1414.00, status: 'SHIPPED', itemsCount: 2, itemsSummary: 'Charizard VMAX (PSA 10), Pikachu EX Gold' },
  { id: '2', number: 'ORD-541209', date: '2026-07-20', total: 89.00, status: 'DELIVERED', itemsCount: 1, itemsSummary: 'Blastoise Holo (Base Set)' },
];

export default function UserOrdersPage() {
  const getStatusBadge = (status: OrderMock['status']) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#064e3b', color: '#34d399', text: 'ENTREGADO' };
      case 'SHIPPED':
        return { bg: '#1e3a8a', color: '#60a5fa', text: 'ENVIADO' };
      case 'PROCESSING':
        return { bg: '#78350f', color: '#fbbf24', text: 'EN PROCESO' };
      default:
        return { bg: '#3f3f46', color: '#a1a1aa', text: 'PENDIENTE' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      <div className="orders-shell" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Mis Pedidos & Compras</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
              Historial de órdenes procesadas y seguimiento de envíos de cartas TCG.
            </p>
          </div>
          <Link href="/catalog" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
            ← Ir a la Tienda
          </Link>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {ORDERS_HISTORY.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div className="order-row" key={order.id} style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f4f4f5' }}>#{order.number}</span>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {badge.text}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>{order.itemsSummary}</div>
                  <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Fecha: {order.date}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${order.total.toFixed(2)} USD</div>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer', display: 'inline-block', marginTop: '0.4rem' }}>
                    Ver Detalle de Envío ➔
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 620px) {
          .order-row { align-items: flex-start !important; flex-direction: column; }
          .order-row > div:last-child { text-align: left !important; width: 100%; }
        }
      `}</style>
    </div>
  );
}
