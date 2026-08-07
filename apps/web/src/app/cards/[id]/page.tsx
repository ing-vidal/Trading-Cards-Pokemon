'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trading-cards-pokemon.onrender.com';

const Card3DCanvas = dynamic(
  () => import('@tcg/ui').then((mod) => mod.Card3DCanvas),
  { ssr: false }
);

const GoldCard3DCanvas = dynamic(
  () => import('@tcg/ui').then((mod) => mod.GoldCard3DCanvas),
  { ssr: false }
);


interface PageProps {
  params: Promise<{ id: string }>;
}

function mapRarityToPreset(rarityName?: string): string {
  if (!rarityName) return 'basic-foil';
  const r = rarityName.toLowerCase();
  if (r.includes('2-star') || r.includes('2 star')) return 'two-star-foil';
  if (r.includes('1-star') || r.includes('1 star')) return 'star-foil';
  if (r.includes('double rare')) return 'double-rare-foil';
  if (r === 'rare') return 'rare-foil';
  if (r.includes('rainbow') || r.includes('hyper')) return 'rainbow-hyper';
  if (r.includes('gold')) return 'gold-relic';
  if (r.includes('secret') || r.includes('diamond')) return 'glass-shatter';
  if (r.includes('promo')) return 'promo-glow';
  if (r.includes('special') || r.includes('illustration')) return 'special-art';
  if (r.includes('trainer') || r.includes('gallery')) return 'trainer-gallery';
  if (r.includes('2-star') || r.includes('2 star')) return 'rainbow-hyper';
  return 'basic-foil';
}

function normalizeCollectionImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item)).slice(0, 3);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && Boolean(item)).slice(0, 3);
      }
    } catch {
      // keep the original string as a single image
    }

    return [trimmed];
  }

  return [];
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
        const res = await fetch(`${API_BASE_URL}/api/cards/${cardId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            const rarityName = data.rarity?.name || '1-Star Rare';
            const rarityLevel = data.rarity?.level || '';
            // DB preset shader — only trust it if it's NOT the generic placeholder "basic-foil"
            // so that named rarities (Gold, Rainbow, etc.) always get their dedicated shader.
            const shaderFromDb = data.rarity?.preset?.shader;
            const isPlaceholder = !shaderFromDb || shaderFromDb === 'basic-foil';
            // Also map by level for 100% accuracy
            function mapLevelToPreset(level: string): string {
              if (level === 'COMMON' || level === 'UNCOMMON') return 'basic-foil';
              if (level === 'RARE')    return 'rare-foil';
              if (level === 'DOUBLE_RARE') return 'double-rare-foil';
              if (level === 'STAR_1') return 'star-foil';
              if (level === 'STAR_2') return 'two-star-foil';
              if (level === 'GOLD')    return 'gold-relic';
              if (level === 'RAINBOW') return 'rainbow-hyper';
              if (level === 'SECRET')  return 'glass-shatter';
              if (level === 'PROMO')   return 'promo-glow';
              return '';
            }
            const presetId = mapLevelToPreset(rarityLevel)
              || (!isPlaceholder ? shaderFromDb : '')
              || mapRarityToPreset(rarityName);
            const collectionImages = normalizeCollectionImages(
              data.collection?.images
              || data.collection?.logo
              || data.collection?.image
              || data.collection?.imageUrl
              || data.collection?.cover
            );
            const primaryCollectionImage = collectionImages[0]
              || data.collection?.logo
              || data.collection?.image
              || data.collection?.imageUrl
              || data.collection?.cover
              || null;
            setCard({
              id: data.id,
              name: data.name,
              number: data.number,
              game: data.game || 'Pokemon TCG',
              language: data.language || 'English',
              collection: data.collection?.name || 'Base Set',
              rarity: rarityName,
              presetId: presetId,
              collectionLogo: primaryCollectionImage,
              expansionImage: primaryCollectionImage,
              collectionImages,
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
            const collectionImages = normalizeCollectionImages(
              found.images
              || found.collectionImages
              || found.collectionLogo
              || found.logo
              || found.image
              || found.imageUrl
              || found.cover
            );
            const primaryCollectionImage = collectionImages[0]
              || found.collectionLogo
              || found.logo
              || found.image
              || found.imageUrl
              || found.cover
              || null;
            setCard({
              id: found.id,
              name: found.name,
              number: found.number,
              game: 'Pokemon TCG',
              language: 'English',
              collection: found.collection || 'Base Set',
              collectionLogo: primaryCollectionImage,
              expansionImage: primaryCollectionImage,
              collectionImages,
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

      // 3. Fallback to demo cards when offline
      const DEMO_MAP: Record<string, any> = {
        'demo-charizard-004': {
          id: 'demo-charizard-004',
          name: 'Charizard Holo',
          number: '004/102',
          game: 'Pokemon TCG',
          language: 'English',
          collection: 'Base Set',
          rarity: '1-Star Rare',
          presetId: 'basic-foil',
          description: 'Charizard lanza llamas tan intensas que pueden fundir casi cualquier cosa. Carta icónica holográfica de 1ª edición.',
          imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
          prices: [
            { condition: 'PSA 10 Gem Mint', price: '$2,499.99', stock: 1, status: 'AVAILABLE' },
            { condition: 'Near Mint (RAW)', price: '$349.99', stock: 3, status: 'AVAILABLE' },
          ],
        },
        'demo-pikachu-058': {
          id: 'demo-pikachu-058',
          name: 'Pikachu',
          number: '058/102',
          game: 'Pokemon TCG',
          language: 'English',
          collection: 'Base Set',
          rarity: '2-Star Secret Rare',
          presetId: 'two-star-foil',
          description: 'Pikachu almacena electricidad en las bolsas de sus mejillas. Edición especial con acabado holo brillante.',
          imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
          prices: [
            { condition: 'Near Mint (RAW)', price: '$899.99', stock: 2, status: 'AVAILABLE' },
          ],
        },
        'demo-mewtwo-010': {
          id: 'demo-mewtwo-010',
          name: 'Mewtwo Holo',
          number: '010/102',
          game: 'Pokemon TCG',
          language: 'English',
          collection: 'Base Set',
          rarity: 'Rainbow Hyper Rare',
          presetId: 'glass-shatter',
          description: 'Creado mediante manipulación genética, Mewtwo posee capacidades psíquicas devastadoras.',
          imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
          prices: [
            { condition: 'Near Mint (RAW)', price: '$120.00', stock: 5, status: 'AVAILABLE' },
          ],
        },
      };

      if (DEMO_MAP[cardId]) {
        setCard(DEMO_MAP[cardId]);
        setLoading(false);
        return;
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
    <div className="detail-page" style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      <div className="detail-shell" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(1.25rem, 3vw, 2rem)' }}>
        {/* Header Breadcrumb */}
        <div className="detail-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#a1a1aa' }}>
          <Link href="/catalog" style={{ color: '#38bdf8', textDecoration: 'none' }}>Catálogo</Link>
          <span>/</span>
          <span>{card.collection}</span>
          <span>/</span>
          <span style={{ color: '#f4f4f5', fontWeight: 600 }}>{card.name}</span>
        </div>

        {/* Main Grid: Unified 3D Holo Card Left, Technical Stats Right */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'clamp(1.5rem, 5vw, 3rem)', alignItems: 'start' }}>
          {/* 3D Card Canvas Panel */}
          <div className="holo-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            <div className="holo-panel" style={{
              height: 'min(520px, 68vw)',
              minHeight: '360px',
              backgroundColor: shaderPresetId === 'gold-relic' ? '#0a0800' : '#18181b',
              border: shaderPresetId === 'gold-relic'
                ? '1px solid #ffd06055'
                : '1px solid #27272a',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: shaderPresetId === 'gold-relic'
                ? '0 20px 60px rgba(255,208,96,0.2), 0 0 120px rgba(255,160,0,0.08)'
                : '0 20px 40px rgba(0,0,0,0.6)',
            }}>
              {shaderPresetId === 'gold-relic' ? (
                /* Premium 9-layer Gold renderer with PBR + editor */
                <GoldCard3DCanvas
                  key="gold-premium"
                  imageUrl={card.imageUrl}
                  intensity={0.9}
                  width="100%"
                  height="100%"
                  showEditor={false}
                />
              ) : (
                /* Standard shader renderer for all other rarities */
                <Card3DCanvas
                  key={shaderPresetId}
                  imageUrl={card.imageUrl}
                  presetId={shaderPresetId}
                  intensity={0.85}
                  height="100%"
                />
              )}
            </div>

            <div className="shader-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#71717a', padding: '0 0.5rem' }}>
              <span>
                {shaderPresetId === 'gold-relic'
                  ? '🥇 Mueve el mouse · Rota · Abre ⚙️ para ajustar parámetros del shader'
                  : '💡 Haz clic y arrastra para mover/rotar la carta en 3D'}
              </span>
              <span style={{
                color: shaderPresetId === 'gold-relic' ? '#ffd060' : '#c084fc',
                fontWeight: 600
              }}>
                {shaderPresetId === 'gold-relic' ? '🥇 Gold PBR Premium' : `Shader: ${shaderPresetId}`}
              </span>
            </div>
          </div>


          {/* Technical Info Panel */}
          <div className="tech-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
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
              <h1 className="card-title" style={{ margin: 0, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>{card.name}</h1>
              <div className="card-subtitle" style={{ fontSize: '1rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                {card.collection} • #{card.number}
              </div>
            </div>

            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {card.description}
            </p>

            {/* Expansion Image */}
            <div className="expansion-panel" style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'minmax(170px, 0.8fr) minmax(0, 1.6fr)',
              alignItems: 'start',
              gap: '1.25rem',
            }}>
              <div className="expansion-copy">
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Imagen de la Expansión
                </span>
                <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.2rem', color: '#f4f4f5', fontWeight: 700 }}>
                  {card.collection}
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600 }}>
                  Se muestra en la vista de detalle de la carta
                </span>
              </div>

              {card.collectionImages && card.collectionImages.length > 0 ? (
                <div className="expansion-gallery" style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap', alignItems: 'flex-start', minWidth: 0 }}>
                  {card.collectionImages.slice(0, 3).map((image: string, index: number) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Expansión ${index + 1} de ${card.collection}`}
                      className="expansion-image"
                      style={{
                        width: 'min(28%, 180px)',
                        height: 'auto',
                        maxHeight: '240px',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        border: '1px solid #38bdf850',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.5)'
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  width: 'min(100%, 220px)',
                  aspectRatio: '11 / 15',
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
            </div>

            {/* Price & Marketplace Breakdown */}
            <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#f4f4f5' }}>Disponibilidad en Mercado</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {card.prices.map((p: any, idx: number) => (
                  <div className="price-row" key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: '#09090b', borderRadius: '6px' }}>
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
      <style jsx>{`
        .expansion-image {
          display: block;
          border-radius: 10px;
          border: 1px solid #38bdf850;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        }

        @media (max-width: 820px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }

          .holo-panel {
            height: min(560px, 105vw) !important;
          }
        }

        @media (max-width: 520px) {
          .detail-breadcrumb {
            flex-wrap: wrap;
            font-size: 0.8rem !important;
          }

          .holo-panel {
            min-height: 300px !important;
            height: 112vw !important;
            max-height: 500px;
          }

          .shader-caption {
            align-items: flex-start !important;
            flex-direction: column;
            font-size: 0.72rem !important;
          }

          .expansion-panel {
            padding: 1rem !important;
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .expansion-gallery {
            width: 100%;
            justify-content: center;
            flex-direction: column;
            align-items: center !important;
          }

          .expansion-image {
            width: 100% !important;
            max-height: none !important;
          }

          .price-row {
            align-items: flex-start !important;
            flex-direction: column;
          }
        }

        @media (min-width: 521px) and (max-width: 820px) {
          .expansion-gallery {
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </div>
  );
}
