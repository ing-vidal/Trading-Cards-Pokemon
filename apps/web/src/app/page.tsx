'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CardItem {
  id: string;
  name: string;
  number: string;
  collection: string;
  rarity: string;
  category?: string;
  price: number;
  color?: string;
  imageUrl?: string;
}

export default function PublicHomePage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [collectionsList, setCollectionsList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    async function loadCatalogData() {
      setLoading(true);

      // Fetch dynamic collections for filter dropdown
      try {
        const resCol = await fetch(`${API_BASE_URL}/api/collections`);
        if (resCol.ok) {
          const jsonCol = await resCol.json();
          if (Array.isArray(jsonCol)) {
            setCollectionsList(jsonCol.map((c: any) => ({ id: c.id, name: c.name, code: c.code })));
          }
        }
      } catch (e) {
        console.warn('API error when fetching collections:', e);
      }

      // Fetch dynamic cards from API
      let apiCards: CardItem[] = [];
      try {
        const resCards = await fetch(`${API_BASE_URL}/api/cards`);
        if (resCards.ok) {
          const jsonCards = await resCards.json();
          if (jsonCards.data && Array.isArray(jsonCards.data)) {
            apiCards = jsonCards.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              number: c.number,
              collection: c.collection?.name || 'Base Set',
              rarity: c.rarity?.name || '1-Star Rare',
              category: c.category?.name || 'Pokémon',
              price: c.products?.[0]?.price ? Number(c.products[0].price) : 49.99,
              color: c.rarity?.color || '#a855f7',
              imageUrl: c.assets?.[0]?.url || c.imageUrl,
            }));
          }
        }
      } catch (e) {
        console.warn('API connection offline:', e);
      }

      setCards(apiCards);
      setLoading(false);
    }

    loadCatalogData();
  }, []);

  const filteredCards = cards.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.number.toLowerCase().includes(search.toLowerCase());
    const matchesCol = selectedCollection === 'ALL' || c.collection === selectedCollection;
    const matchesCat = selectedCategory === 'ALL' || !c.category || c.category === selectedCategory;
    return matchesSearch && matchesCol && matchesCat;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem' }}>
      {/* Top Header Navbar */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 2.5rem auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #27272a'
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#ffffff'
          }}>
            TCG
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f4f4f5' }}>TCG Vision</h2>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>3D Interactive Catalog & Marketplace</span>
          </div>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
          <Link href="/" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Catálogo</Link>
          <Link href="/checkout" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Marketplace</Link>
          <Link href="/orders" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Mis Pedidos</Link>
        </nav>
      </header>

      {/* Main Catalog Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Page Title Header */}
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Catálogo de Cartas TCG</h1>
          <p style={{ margin: '0.35rem 0 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
            Explora las cartas registradas en tiempo real. Selecciona cualquier carta para interactuar con su visor 3D y efectos holográficos GLSL.
          </p>
        </div>

        {/* Faceted Filters Bar */}
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o número de carta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #3f3f46',
              backgroundColor: '#09090b',
              color: '#f4f4f5',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />

          {/* Dynamic Collection Select */}
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #3f3f46',
              backgroundColor: '#09090b',
              color: '#f4f4f5',
              fontSize: '0.9rem'
            }}
          >
            <option value="ALL">Todas las Colecciones</option>
            {collectionsList.map((col) => (
              <option key={col.id} value={col.name}>
                {col.name} ({col.code})
              </option>
            ))}
          </select>

          {/* Dynamic Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #3f3f46',
              backgroundColor: '#09090b',
              color: '#f4f4f5',
              fontSize: '0.9rem'
            }}
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="Pokémon">Pokémon</option>
            <option value="Trainer">Trainer</option>
            <option value="Energy">Energy</option>
          </select>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>
            Cargando cartas del catálogo en vivo...
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📇</div>
            <h3 style={{ margin: 0, color: '#f4f4f5' }}>No se encontraron cartas</h3>
            <p style={{ color: '#a1a1aa', marginTop: '0.5rem' }}>Agrega nuevas cartas desde el panel de administración para verlas publicadas aquí en tiempo real.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredCards.map((card) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>#{card.number}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: `${card.color || '#a855f7'}20`,
                      color: card.color || '#c084fc'
                    }}>
                      {card.rarity}
                    </span>
                  </div>

                  {/* Card Artwork Image Container */}
                  <div style={{
                    height: '240px',
                    borderRadius: '10px',
                    backgroundColor: '#09090b',
                    border: '1px solid #27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontSize: '3rem' }}>📇</div>
                    )}
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5', fontWeight: 700 }}>{card.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.2rem' }}>{card.collection}</div>
                  </div>

                  <div style={{
                    marginTop: '0.5rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #27272a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Desde:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>${card.price.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

