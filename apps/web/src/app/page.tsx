'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trading-cards-pokemon.onrender.com';

interface CardItem {
  id: string;
  name: string;
  number: string;
  collection: string;
  rarity: string;
  rarityId?: string;
  cardType?: string | null;
  rarityColor?: string;
  energyType?: string | null;
  energyTypeId?: string | null;
  energyTypeIcon?: string | null;
  energyTypeColor?: string | null;
  category?: string;
  price: number;
  color?: string;
  imageUrl?: string;
}

interface CollectionOption { id: string; name: string; code: string; }
interface RarityOption    { id: string; name: string; color?: string; icon?: string; level?: string; }
interface EnergyOption    { id: string; name: string; icon?: string; color?: string; }

const RARITY_LEVEL_ORDER: Record<string, number> = {
  COMMON: 0, UNCOMMON: 1, RARE: 2, DOUBLE_RARE: 3,
  STAR_1: 4, STAR_2: 5, STAR_3: 6,
  IMMERSIVE: 7, DOUBLE_IMMERSIVE: 8, CROWN: 9, PROMO: 10,
};

const CARD_TYPE_OPTIONS = [
  { value: 'POKEMON', label: 'Pokémon' },
  { value: 'PARTIDARIO', label: 'Partidario' },
  { value: 'OBJETO', label: 'Objeto' },
  { value: 'HERRAMIENTA', label: 'Herramienta' },
  { value: 'ESTADIO', label: 'Estadio' },
];

// ─── Helper: renders icon(s) — supports JSON array for multi-image rarities ──
function parseIcons(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return [raw];
}

function IconDisplay({ icon, size = 18 }: { icon?: string | null; size?: number }) {
  const icons = parseIcons(icon);
  if (icons.length === 0) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {icons.map((src, i) => {
        const isImage = src.startsWith('data:image') || src.startsWith('http');
        return isImage
          ? <img key={i} src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', borderRadius: 2 }} />
          : <span key={i} style={{ fontSize: size * 0.85, lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}>{src}</span>;
      })}
    </span>
  );
}

// ─── Custom dropdown that supports image icons ───────────────────────────────
interface DropdownOption { id: string; name: string; icon?: string | null; color?: string | null; }

function IconSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = value === 'ALL' ? null : options.find(o => o.id === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div ref={ref} style={{ position: 'relative' }}>
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%',
            padding: '0.65rem 2.5rem 0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid #3f3f46',
            backgroundColor: '#09090b',
            color: '#f4f4f5',
            fontSize: '0.9rem',
            cursor: 'pointer',
            outline: 'none',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'relative',
          }}
        >
          {selected ? (
            <>
              <IconDisplay icon={selected.icon} size={18} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</span>
            </>
          ) : (
            <span style={{ flex: 1, color: '#a1a1aa' }}>{placeholder}</span>
          )}
          <span style={{ position: 'absolute', right: '12px', color: '#a1a1aa', fontSize: '0.7rem', pointerEvents: 'none' }}>
            {open ? '▲' : '▼'}
          </span>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#18181b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            zIndex: 100,
            maxHeight: '260px',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {/* "All" option */}
            <button
              type="button"
              onClick={() => { onChange('ALL'); setOpen(false); }}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                border: 'none',
                backgroundColor: value === 'ALL' ? '#27272a' : 'transparent',
                color: value === 'ALL' ? '#f4f4f5' : '#a1a1aa',
                fontSize: '0.88rem',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {placeholder}
            </button>

            {options.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  border: 'none',
                  backgroundColor: value === opt.id ? '#27272a' : 'transparent',
                  color: '#f4f4f5',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <IconDisplay icon={opt.icon} size={20} />
                <span>{opt.name}</span>
                {opt.color && (
                  <span style={{ marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%', backgroundColor: opt.color, flexShrink: 0 }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main catalog page ───────────────────────────────────────────────────────
const DEFAULT_DEMO_CARDS: CardItem[] = [
  {
    id: 'demo-charizard-004',
    name: 'Charizard Holo',
    number: '004/102',
    collection: 'Base Set',
    rarity: '1-Star Rare',
    energyType: 'Fuego',
    energyTypeIcon: '🔥',
    energyTypeColor: '#ef4444',
    category: 'Pokémon',
    price: 349.99,
    color: '#eab308',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
  },
  {
    id: 'demo-pikachu-058',
    name: 'Pikachu',
    number: '058/102',
    collection: 'Base Set',
    rarity: '2-Star Rare',
    energyType: 'Eléctrico',
    energyTypeIcon: '⚡',
    energyTypeColor: '#eab308',
    category: 'Pokémon',
    price: 899.99,
    color: '#8b5cf6',
    imageUrl: 'https://images.pokemontcg.io/base1/58_hires.png',
  },
  {
    id: 'demo-mewtwo-010',
    name: 'Mewtwo Holo',
    number: '010/102',
    collection: 'Base Set',
    rarity: 'Immersive Rare',
    energyType: 'Psíquico',
    energyTypeIcon: '🔮',
    energyTypeColor: '#a855f7',
    category: 'Pokémon',
    price: 120.0,
    color: '#ec4899',
    imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
  },
];

export default function PublicHomePage() {
  const [cards, setCards]                     = useState<CardItem[]>([]);
  const [collectionsList, setCollectionsList] = useState<CollectionOption[]>([]);
  const [raritiesList, setRaritiesList]       = useState<RarityOption[]>([]);
  const [energyTypesList, setEnergyTypesList] = useState<EnergyOption[]>([]);
  const [loading, setLoading]                 = useState(true);

  const [search, setSearch]                         = useState('');
  const [selectedCollection, setSelectedCollection] = useState('ALL');
  const [selectedRarityId, setSelectedRarityId]     = useState('ALL');
  const [selectedEnergyTypeId, setSelectedEnergyTypeId] = useState('ALL');
  const [selectedCardType, setSelectedCardType]     = useState('ALL');

  useEffect(() => {
    async function loadCatalogData() {
      setLoading(true);

      const [resCol, resRar, resEnergy, resCards] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/collections`),
        fetch(`${API_BASE_URL}/api/rarities`),
        fetch(`${API_BASE_URL}/api/energy-types`),
        fetch(`${API_BASE_URL}/api/cards?limit=100`),
      ]);

      try {
        if (resCol.status === 'fulfilled' && resCol.value.ok) {
          const json = await resCol.value.json();
          if (Array.isArray(json) && json.length > 0)
            setCollectionsList(json.map((c: any) => ({ id: c.id, name: c.name, code: c.code })));
        }
      } catch (e) { console.warn('Collections fetch error', e); }

      try {
        if (resRar.status === 'fulfilled' && resRar.value.ok) {
          const json = await resRar.value.json();
          if (Array.isArray(json)) {
            const mapped = json.map((r: any) => ({ id: r.id, name: r.name, color: r.color, icon: r.icon, level: r.level }));
            // Sort by defined level order (API already sorts, but guarantee it on frontend too)
            mapped.sort((a, b) => (RARITY_LEVEL_ORDER[a.level] ?? 99) - (RARITY_LEVEL_ORDER[b.level] ?? 99));
            setRaritiesList(mapped);
          }
        }
      } catch (e) { console.warn('Rarities fetch error', e); }

      try {
        if (resEnergy.status === 'fulfilled' && resEnergy.value.ok) {
          const json = await resEnergy.value.json();
          if (Array.isArray(json))
            setEnergyTypesList(json.map((e: any) => ({ id: e.id, name: e.name, icon: e.icon, color: e.color })));
        }
      } catch (e) { console.warn('Energy types fetch error', e); }

      let apiCards: CardItem[] = [];
      try {
        if (resCards.status === 'fulfilled' && resCards.value.ok) {
          const jsonCards = await resCards.value.json();
          const data = jsonCards.data && Array.isArray(jsonCards.data) ? jsonCards.data : [];
          apiCards = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            number: c.number,
            collection: c.collection?.name || 'Base Set',
            rarity: c.rarity?.name || 'Common',
            rarityId: c.rarityId,
            rarityColor: c.rarity?.color || '#a855f7',
            cardType: c.cardType ?? null,
            energyType: c.energyType?.name || null,
            energyTypeId: c.energyTypeId || null,
            energyTypeIcon: c.energyType?.icon || null,
            energyTypeColor: c.energyType?.color || null,
            category: c.category?.name || 'Pokémon',
            price: c.products?.[0]?.price ? Number(c.products[0].price) : 49.99,
            color: c.rarity?.color || '#a855f7',
            imageUrl: c.assets?.[0]?.url || c.imageUrl,
          }));
        }
      } catch (e) { console.warn('Cards fetch error', e); }

      setCards(apiCards.length > 0 ? apiCards : DEFAULT_DEMO_CARDS);
      setLoading(false);
    }

    loadCatalogData();
  }, []);

  const filteredCards = cards.filter(c => {
    const matchesSearch  = c.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.number.toLowerCase().includes(search.toLowerCase());
    const matchesCol     = selectedCollection === 'ALL' || c.collection === selectedCollection;
    const matchesRarity  = selectedRarityId === 'ALL' || c.rarityId === selectedRarityId;
    const matchesEnergy  = selectedEnergyTypeId === 'ALL' || c.energyTypeId === selectedEnergyTypeId;
    const matchesCardType = selectedCardType === 'ALL' || c.cardType === selectedCardType;
    return matchesSearch && matchesCol && matchesRarity && matchesEnergy && matchesCardType;
  });

  const clearAll = () => {
    setSearch('');
    setSelectedCollection('ALL');
    setSelectedRarityId('ALL');
    setSelectedEnergyTypeId('ALL');
    setSelectedCardType('ALL');
  };

  const hasActiveFilters = search || selectedCollection !== 'ALL' || selectedRarityId !== 'ALL' || selectedEnergyTypeId !== 'ALL' || selectedCardType !== 'ALL';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      {/* Header */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 2.5rem auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #27272a',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.1rem', color: '#ffffff',
          }}>TCG</div>
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

      <main style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Title */}
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Catálogo de Cartas TCG</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
            Explora las cartas en tiempo real. Usa los filtros para encontrar exactamente lo que buscas.
          </p>
        </div>

        {/* ── Filter bar ── */}
        <div style={{
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre o número de carta..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #3f3f46',
                backgroundColor: '#09090b',
                color: '#f4f4f5',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 3 dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {/* Collection — standard select (names only, no icons) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📦 Colección
              </label>
              <select
                value={selectedCollection}
                onChange={e => setSelectedCollection(e.target.value)}
                style={{
                  padding: '0.65rem 2.5rem 0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  backgroundColor: '#09090b',
                  color: '#f4f4f5',
                  fontSize: '0.9rem',
                  width: '100%',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="ALL">Todas las Colecciones</option>
                {collectionsList.map(col => (
                  <option key={col.id} value={col.name}>{col.name} ({col.code})</option>
                ))}
              </select>
            </div>

            {/* Rarity — custom dropdown with image icon support */}
            <IconSelect
              label="⭐ Rareza"
              placeholder="Todas las Rarezas"
              value={selectedRarityId}
              options={raritiesList}
              onChange={setSelectedRarityId}
            />

            {/* Energy Type — custom dropdown with image icon support */}
            <IconSelect
              label="⚡ Tipo de Energía"
              placeholder="Todos los Tipos"
              value={selectedEnergyTypeId}
              options={energyTypesList}
              onChange={setSelectedEnergyTypeId}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🃏 Tipo de Carta
              </label>
              <select
                value={selectedCardType}
                onChange={e => setSelectedCardType(e.target.value)}
                style={{
                  padding: '0.65rem 2.5rem 0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #3f3f46',
                  backgroundColor: '#09090b',
                  color: '#f4f4f5',
                  fontSize: '0.9rem',
                  width: '100%',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="ALL">Todos los Tipos</option>
                {CARD_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Filtros activos:</span>
              {search && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}>
                  🔍 "{search}"
                </span>
              )}
              {selectedCollection !== 'ALL' && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#a855f720', color: '#c084fc', border: '1px solid #a855f740' }}>
                  📦 {selectedCollection}
                </span>
              )}
              {selectedRarityId !== 'ALL' && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#f59e0b20', color: '#fbbf24', border: '1px solid #f59e0b40', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <IconDisplay icon={raritiesList.find(r => r.id === selectedRarityId)?.icon} size={14} />
                  {raritiesList.find(r => r.id === selectedRarityId)?.name}
                </span>
              )}
              {selectedEnergyTypeId !== 'ALL' && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#10b98120', color: '#34d399', border: '1px solid #10b98140', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <IconDisplay icon={energyTypesList.find(e => e.id === selectedEnergyTypeId)?.icon} size={14} />
                  {energyTypesList.find(e => e.id === selectedEnergyTypeId)?.name}
                </span>
              )}
              {selectedCardType !== 'ALL' && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#f43f5e20', color: '#fb7185', border: '1px solid #f43f5e40' }}>
                  🃏 {CARD_TYPE_OPTIONS.find(option => option.value === selectedCardType)?.label}
                </span>
              )}
              <button onClick={clearAll} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px', backgroundColor: '#27272a', color: '#a1a1aa', border: '1px solid #3f3f46', cursor: 'pointer' }}>
                ✕ Limpiar
              </button>
            </div>
          )}
        </div>

        {/* Result count */}
        {!loading && (
          <div style={{ fontSize: '0.875rem', color: '#71717a' }}>
            {filteredCards.length === cards.length
              ? `${cards.length} cartas en el catálogo`
              : `${filteredCards.length} de ${cards.length} cartas`}
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>Cargando cartas del catálogo...</div>
        ) : filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📇</div>
            <h3 style={{ margin: 0, color: '#f4f4f5' }}>No se encontraron cartas</h3>
            <p style={{ color: '#a1a1aa', marginTop: '0.5rem' }}>
              Prueba cambiando los filtros o{' '}
              <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>
                limpia los filtros
              </button>.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filteredCards.map(card => (
              <Link key={card.id} href={`/cards/${card.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>#{card.number}</span>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      {card.energyTypeIcon && <IconDisplay icon={card.energyTypeIcon} size={18} />}
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        backgroundColor: '#38bdf820',
                        color: '#38bdf8',
                      }}>
                        {card.cardType ? CARD_TYPE_OPTIONS.find(option => option.value === card.cardType)?.label || card.cardType : 'Tipo no disponible'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        backgroundColor: `${card.color || '#a855f7'}20`,
                        color: card.color || '#c084fc',
                      }}>
                        {card.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Card image */}
                  <div style={{
                    height: '240px', borderRadius: '10px',
                    backgroundColor: '#09090b', border: '1px solid #27272a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {card.imageUrl
                      ? <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <div style={{ fontSize: '3rem' }}>📇</div>}
                  </div>

                  {/* Card info */}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f4f4f5', fontWeight: 700 }}>{card.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.2rem' }}>{card.collection}</div>
                    {card.energyType && (
                      <div style={{ fontSize: '0.75rem', color: card.energyTypeColor || '#a1a1aa', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <IconDisplay icon={card.energyTypeIcon} size={14} />
                        {card.energyType}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
