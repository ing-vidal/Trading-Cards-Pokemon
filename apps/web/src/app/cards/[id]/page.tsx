'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Card3DCanvas = dynamic(
  () => import('@tcg/ui').then((mod) => mod.Card3DCanvas),
  { ssr: false }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

function mapRarityToPreset(rarityName?: string): string {
  if (!rarityName) return 'basic-foil';
  const r = rarityName.toLowerCase();
  if (r.includes('rainbow') || r.includes('hyper')) return 'rainbow-hyper';
  if (r.includes('gold')) return 'gold-relic';
  if (r.includes('secret') || r.includes('diamond')) return 'glass-shatter';
  if (r.includes('promo')) return 'promo-glow';
  return 'basic-foil';
}

export default function CardDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const cardId = resolvedParams.id;

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCardDetails() {
      setLoading(true);
      if (!cardId) {
        setLoading(false);
        return;
      }

      // 1. Try to fetch from NestJS API
      try {
        const res = await fetch(`http://localhost:4000/api/cards/${cardId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            const rarityName = data.rarity?.name || '1-Star Rare';
            // Use shader directly from DB → rarity.preset.shader, fallback to name-based mapping
            const shaderFromDb = data.rarity?.preset?.shader;
            setCard({
              id: data.id,
              name: data.name,
              number: data.number,
              game: data.game || 'Pokemon TCG',
              language: data.language || 'English',
              collection: data.collection?.name || 'Base Set',
              rarity: rarityName,
              presetId: shaderFromDb || mapRarityToPreset(rarityName),
              collectionLogo: data.collection?.logo || data.collection?.image || data.collection?.imageUrl || data.collection?.cover || null,
              expansionImage: data.collection?.logo || data.collection?.image || data.collection?.imageUrl || data.collection?.cover || null,
              description: data.description || `Carta oficial de ${data.name} en el ecosistema TCG Vision.`,
              imageUrl: data.assets?.[0]?.url || data.imageUrl || null,
              prices: data.products && data.products.length > 0
                ? data.products.map((p: any) => ({
                    condition: p.condition || 'NEAR_MINT',
                    price: `$${Number(p.price).toFixed(2)}`,
                    stock: p.stock ?? 10,
                    status: p.status || 'AVAILABLE',
                  }))
                : [
                    { condition: 'Near Mint (RAW)', price: '$49.99', stock: 10, status: 'AVAILABLE' }
                  ],
            });
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('API error when loading card by ID, trying local storage:', e);
      }

      // 2. Try to fetch from LocalStorage custom cards
      try {
        const saved = localStorage.getItem('tcg_custom_cards');
        if (saved) {
          const parsed = JSON.parse(saved);
          const found = parsed.find((c: any) => c.id === cardId || c.name.toLowerCase() === cardId.toLowerCase());
          if (found) {
            const rarityName = found.rarity || '1-Star Rare';
            setCard({
              id: found.id,
              name: found.name,
              number: found.number,
              game: 'Pokemon TCG',
              language: 'English',
              collection: found.collection || 'Base Set',
              collectionLogo: found.collectionLogo || found.logo || found.image || found.imageUrl || found.cover || null,
              expansionImage: found.collectionLogo || found.logo || found.image || found.imageUrl || found.cover || null,
              rarity: rarityName,
              presetId: mapRarityToPreset(rarityName),
              description: `Carta personalizada de ${found.name}.`,
              imageUrl: found.imageUrl || null,
              prices: [{ condition: 'Near Mint (RAW)', price: `$${(found.price || 49.99).toFixed(2)}`, stock: 5, status: 'AVAILABLE' }]
            });
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading from localStorage:', e);
      }

      setLoading(false);
    }

    loadCardDetails();
  }, [cardId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⌛</div>
          <p style={{ color: '#a1a1aa' }}>Cargando renderizado 3D y detalles de la carta...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <h2>Carta no encontrada</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>No se pudo encontrar la carta solicitada en el sistema.</p>
          <Link href="/catalog" style={{ backgroundColor: '#38bdf8', color: '#09090b', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
            ← Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const shaderPresetId = card.presetId || mapRarityToPreset(card.rarity);
  const expansionImage = card.expansionImage || card.collectionLogo || null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
          <Link href="/catalog" style={{ color: '#38bdf8', textDecoration: 'none' }}>Catálogo</Link>
          <span>/</span>
          <span>{card.collection}</span>
          <span>/</span>
          <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{card.name}</span>
        </div>

        {/* Main Grid: Unified 3D Holo Card Left, Technical Stats Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Unified 3D Holo Canvas Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              height: '520px',
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
            }}>
              {/* key forces full remount of Three.js canvas when shader preset changes */}
              <Card3DCanvas
                key={shaderPresetId}
                imageUrl={card.imageUrl}
                presetId={shaderPresetId}
                intensity={0.85}
                height="520px"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#71717a', padding: '0 0.5rem' }}>
              <span>💡 Haz clic y arrastra para mover/rotar la carta en 3D</span>
              <span style={{ color: '#c084fc', fontWeight: 600 }}>Efecto Shader: {shaderPresetId}</span>
            </div>
          </div>

          {/* Technical Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{
                display: 'inline-flex',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: '#ec489920',
                color: '#ec4899',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                ✨ {card.rarity}
              </span>
              <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>{card.name}</h1>
              <div style={{ fontSize: '1rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                {card.collection} • #{card.number}
              </div>
            </div>

            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {card.description}
            </p>

            {/* Expansion Image */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem'
            }}>
              {expansionImage ? (
                <img
                  src={expansionImage}
                  alt={`Imagen de la expansión ${card.collection}`}
                  style={{
                    width: '110px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #38bdf850',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                  }}
                />
              ) : (
                <div style={{
                  width: '110px',
                  height: '150px',
                  backgroundColor: '#09090b',
                  border: '1px dashed #38bdf850',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem'
                }}>
                  📦
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Imagen de la Expansión
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f4f4f5', fontWeight: 700 }}>
                  {card.collection}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
                  Se muestra en la vista de detalle de la carta
                </span>
              </div>
            </div>

            {/* Price & Marketplace Breakdown */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#f4f4f5' }}>Disponibilidad en Mercado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {card.prices.map((p: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', backgroundColor: '#09090b', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f4f4f5' }}>{p.condition}</div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Stock: {p.stock} un.</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{p.price}</span>
                      <button style={{ backgroundColor: '#a855f7', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
