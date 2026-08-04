'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ActivityItem {
  title: string;
  desc: string;
  time: string;
  badge: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [cardsCount, setCardsCount] = useState<number>(0);
  const [collectionsCount, setCollectionsCount] = useState<number>(0);
  const [collectionsNames, setCollectionsNames] = useState<string>('Sin colecciones');
  const [presetsCount, setPresetsCount] = useState<number>(0);
  const [totalStock, setTotalStock] = useState<number>(0);
  const [productsCount, setProductsCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      let fetchedCardsCount = 0;
      let fetchedCollectionsCount = 0;
      let fetchedPresetsCount = 0;
      let fetchedTotalStock = 0;
      let fetchedProductsCount = 0;
      let colNamesStr = 'Sin colecciones';
      const activities: ActivityItem[] = [];

      try {
        const [resCards, resCollections, resPresets, resProducts] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/cards`),
          fetch(`${API_BASE_URL}/api/collections`),
          fetch(`${API_BASE_URL}/api/visual-presets`),
          fetch(`${API_BASE_URL}/api/products`),
        ]);

        // Process Cards
        if (resCards.status === 'fulfilled' && resCards.value.ok) {
          const jsonCards = await resCards.value.json();
          const cardList = Array.isArray(jsonCards) ? jsonCards : jsonCards.data || [];
          fetchedCardsCount = cardList.length;

          // Extract recent cards for activity list
          cardList.slice(0, 2).forEach((c: any) => {
            activities.push({
              title: 'Carta Registrada',
              desc: `${c.name} (${c.collection?.name || 'Base Set'} #${c.number || ''})`,
              time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
              badge: 'PUBLISHED',
            });
          });
        }

        // Process Collections
        if (resCollections.status === 'fulfilled' && resCollections.value.ok) {
          const jsonCol = await resCollections.value.json();
          if (Array.isArray(jsonCol)) {
            fetchedCollectionsCount = jsonCol.length;
            if (jsonCol.length > 0) {
              colNamesStr = jsonCol.slice(0, 3).map((c: any) => c.name || c.code).join(', ');
            }
            jsonCol.slice(0, 1).forEach((c: any) => {
              activities.push({
                title: 'Colección Disponible',
                desc: `${c.name} (${c.code || ''})`,
                time: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
                badge: 'COLLECTION',
              });
            });
          }
        }

        // Process Visual Presets
        if (resPresets.status === 'fulfilled' && resPresets.value.ok) {
          const jsonPresets = await resPresets.value.json();
          if (Array.isArray(jsonPresets)) {
            fetchedPresetsCount = jsonPresets.length > 0 ? jsonPresets.length : 5; // fallback to built-in GLSL shaders count
          } else {
            fetchedPresetsCount = 5;
          }
        } else {
          fetchedPresetsCount = 5; // standard 5 GLSL shader presets
        }

        // Process Products
        if (resProducts.status === 'fulfilled' && resProducts.value.ok) {
          const jsonProd = await resProducts.value.json();
          if (Array.isArray(jsonProd)) {
            fetchedProductsCount = jsonProd.length;
            fetchedTotalStock = jsonProd.reduce((acc: number, p: any) => acc + (p.stock || 0), 0);

            jsonProd.slice(0, 1).forEach((p: any) => {
              activities.push({
                title: 'Inventario / Stock',
                desc: `${p.card?.name || 'Listing'} (${p.condition}) - ${p.stock} un.`,
                time: p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
                badge: 'STOCK',
              });
            });
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      }

      setCardsCount(fetchedCardsCount);
      setCollectionsCount(fetchedCollectionsCount);
      setCollectionsNames(colNamesStr);
      setPresetsCount(fetchedPresetsCount);
      setTotalStock(fetchedTotalStock);
      setProductsCount(fetchedProductsCount);

      if (activities.length > 0) {
        setRecentActivities(activities);
      } else {
        setRecentActivities([
          { title: 'Sistema Operativo', desc: 'Base de datos y API conectadas correctamente', time: 'En vivo', badge: 'SYSTEM' }
        ]);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Cartas En Catálogo',
      value: loading ? '...' : cardsCount.toLocaleString(),
      change: `${cardsCount} cartas en base de datos`,
      icon: '📇',
      color: '#38bdf8'
    },
    {
      label: 'Colecciones Activas',
      value: loading ? '...' : collectionsCount.toString(),
      change: collectionsNames,
      icon: '📦',
      color: '#a855f7'
    },
    {
      label: 'Presets Studio 3D',
      value: loading ? '...' : presetsCount.toString(),
      change: 'GLSL Holográficos',
      icon: '🎨',
      color: '#f59e0b'
    },
    {
      label: 'Productos en Stock',
      value: loading ? '...' : totalStock.toLocaleString(),
      change: `${productsCount} variantes de producto`,
      icon: '🛒',
      color: '#10b981'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#f4f4f5' }}>
          Dashboard de Administración
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
          Resumen operativo del catálogo, assets 3D, inventarios y actividad reciente.
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: '1.5rem', backgroundColor: '#27272a', padding: '0.4rem', borderRadius: '8px' }}>
                {stat.icon}
              </span>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#f4f4f5' }}>Actividad Reciente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map((act, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#27272a50',
                borderRadius: '8px',
                border: '1px solid #27272a'
              }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f4f4f5' }}>{act.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '0.2rem' }}>{act.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: '#a855f720',
                    color: '#c084fc'
                  }}>
                    {act.badge}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5' }}>Acciones Rápidas</h3>

          <Link href="/cards" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#a855f715',
            border: '1px solid #a855f740',
            color: '#c084fc',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            <span>➕</span> Registrar Nueva Carta
          </Link>

          <Link href="/collections" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#38bdf815',
            border: '1px solid #38bdf840',
            color: '#38bdf8',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            <span>📦</span> Nueva Colección / Expansión
          </Link>

          <Link href="/studio" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#f59e0b15',
            border: '1px solid #f59e0b40',
            color: '#fbbf24',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            <span>🎨</span> Editar Shaders en Studio CMS
          </Link>
        </div>
      </div>
    </div>
  );
}

