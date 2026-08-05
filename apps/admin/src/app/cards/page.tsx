'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CardItem {
  id: string;
  name: string;
  number: string;
  collection: string;
  collectionId?: string;
  rarity: string;
  rarityId?: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  hp?: number;
  imageUrl?: string;
  price?: number;
  stock?: number;
}

export default function CardsAdminPage() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [availableCollections, setAvailableCollections] = useState<{ id: string; name: string; code: string }[]>([]);
  const [availableRarities, setAvailableRarities] = useState<{ id: string; name: string; color: string; shader: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collectionFilter, setCollectionFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [deletingCard, setDeletingCard] = useState<CardItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    collectionId: '',
    rarityId: '',
    stock: 10,
    price: 49.99,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED',
    imageUrl: '',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const DEFAULT_COLLECTIONS = [
    { id: '1', name: 'Base Set', code: 'BASE1' },
    { id: '2', name: 'Scarlet & Violet Base', code: 'SV01' },
    { id: '3', name: 'Crown Zenith', code: 'CRZ' },
    { id: '4', name: 'Promotional Cards', code: 'PROMO' },
  ];

  const DEFAULT_RARITIES = [
    { id: 'rarity-1', name: '1-Star Rare', color: '#3b82f6', shader: 'basic-foil' },
    { id: 'rarity-2', name: '2-Star Secret Rare', color: '#8b5cf6', shader: 'basic-foil' },
    { id: 'rarity-3', name: 'Gold Ultra Rare', color: '#eab308', shader: 'gold-relic' },
    { id: 'rarity-4', name: 'Rainbow Hyper Rare', color: '#ec4899', shader: 'rainbow-hyper' },
    { id: 'rarity-5', name: 'Secret Rare', color: '#a855f7', shader: 'glass-shatter' },
    { id: 'rarity-6', name: 'Promotional', color: '#10b981', shader: 'promo-glow' },
  ];

  // Fetch collections list for select dropdowns
  const fetchCollectionsList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          const list = json.map((c: any) => ({ id: c.id, name: c.name, code: c.code }));
          setAvailableCollections(list);
          return;
        }
      }
    } catch (e) {
      console.warn('API error fetching collections list for select:', e);
    }

    try {
      const saved = localStorage.getItem('tcg_custom_collections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map((c: any) => ({ id: c.id, name: c.name, code: c.code }));
          setAvailableCollections(list);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load collections from localStorage:', e);
    }

    setAvailableCollections(DEFAULT_COLLECTIONS);
  };

  // Fetch rarities list for select dropdowns
  const fetchRaritiesList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/rarities`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          const list = json.map((r: any) => ({
            id: r.id,
            name: r.name,
            color: r.color || '#a855f7',
            shader: r.preset?.shader || 'basic-foil',
          }));
          setAvailableRarities(list);
          return;
        }
      }
    } catch (e) {
      console.warn('API error fetching rarities list for select:', e);
    }

    setAvailableRarities(DEFAULT_RARITIES);
  };

  // Fetch cards from API
  const fetchCardsFromApi = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const apiCards: CardItem[] = json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            number: c.number,
            collection: c.collection?.name || 'Base Set',
            collectionId: c.collectionId || c.collection?.id,
            rarity: c.rarity?.name || '1-Star Rare',
            rarityId: c.rarityId || c.rarity?.id,
            status: c.status || 'PUBLISHED',
            hp: c.hp || 100,
            price: c.products?.[0]?.price ? Number(c.products[0].price) : 49.99,
            stock: c.products?.[0]?.stock ?? 10,
            imageUrl: c.assets?.[0]?.url || c.imageUrl,
          }));

          setCards(apiCards);
          return;
        }
      }
    } catch (e) {
      console.warn('API unavailable, falling back to local state:', e);
    }

    try {
      const saved = localStorage.getItem('tcg_custom_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load cards from localStorage:', e);
    }
  };

  useEffect(() => {
    fetchCardsFromApi();
    fetchCollectionsList();
    fetchRaritiesList();
  }, []);

  const saveToLocalStorageFallback = (updated: CardItem[]) => {
    setCards(updated);
    try {
      localStorage.setItem('tcg_custom_cards', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Image Upload File Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Create Card Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.number) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      number: formData.number,
      stock: Number(formData.stock),
      price: Number(formData.price) || 49.99,
      status: formData.status,
      collectionId: formData.collectionId || (availableCollections[0]?.id ?? undefined),
      rarityId: formData.rarityId || (availableRarities[0]?.id ?? undefined),
      imageUrl: formData.imageUrl || previewImage || undefined,
    };

    let createdApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        createdApi = true;
        await fetchCardsFromApi();
      }
    } catch (err) {
      console.warn('Backend API unavailable, saving locally:', err);
    }

    if (!createdApi) {
      const selectedCol = availableCollections.find((c) => c.id === formData.collectionId);
      const selectedRar = availableRarities.find((r) => r.id === formData.rarityId);
      const card: CardItem = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        number: formData.number,
        collection: selectedCol?.name || 'Base Set',
        collectionId: formData.collectionId,
        rarity: selectedRar?.name || '1-Star Rare',
        status: formData.status,
        stock: Number(formData.stock),
        price: Number(formData.price) || 49.99,
        imageUrl: formData.imageUrl || previewImage || undefined,
      };
      saveToLocalStorageFallback([card, ...cards]);
    }

    setShowCreateModal(false);
    resetForm();
    setIsSubmitting(false);
  };

  // Edit Card Handler
  const handleEditOpen = (card: CardItem) => {
    setEditingCard(card);
    // Use card.rarityId directly if available (populated from API), otherwise lookup by name
    const resolvedRarityId = card.rarityId
      || availableRarities.find((r) => r.name === card.rarity)?.id
      || availableRarities[0]?.id
      || '';
    setFormData({
      name: card.name,
      number: card.number,
      collectionId: card.collectionId || (availableCollections.find((c) => c.name === card.collection)?.id || availableCollections[0]?.id || ''),
      rarityId: resolvedRarityId,
      stock: card.stock ?? 10,
      price: card.price || 49.99,
      status: card.status,
      imageUrl: card.imageUrl || '',
    });
    setPreviewImage(card.imageUrl || null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard || !formData.name || !formData.number) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      number: formData.number,
      stock: Number(formData.stock),
      price: Number(formData.price) || 49.99,
      status: formData.status,
      collectionId: formData.collectionId || undefined,
      rarityId: formData.rarityId || undefined,
      imageUrl: formData.imageUrl || previewImage || undefined,
    };

    let updatedApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards/${editingCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        updatedApi = true;
        await fetchCardsFromApi();
      }
    } catch (err) {
      console.warn('Backend API unavailable when updating card:', err);
    }

    if (!updatedApi) {
      const selectedCol = availableCollections.find((c) => c.id === formData.collectionId);
      const selectedRar = availableRarities.find((r) => r.id === formData.rarityId);
      const updatedList = cards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              name: formData.name,
              number: formData.number,
              collection: selectedCol?.name || c.collection,
              collectionId: formData.collectionId,
              rarity: selectedRar?.name || c.rarity,
              stock: Number(formData.stock),
              price: Number(formData.price),
              status: formData.status,
              imageUrl: formData.imageUrl || previewImage || c.imageUrl,
            }
          : c
      );
      saveToLocalStorageFallback(updatedList);
    }

    setEditingCard(null);
    resetForm();
    setIsSubmitting(false);
  };

  // Delete Card Handler
  const handleDeleteConfirm = async () => {
    if (!deletingCard) return;
    setIsSubmitting(true);

    let deletedApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/cards/${deletingCard.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        deletedApi = true;
        await fetchCardsFromApi();
      }
    } catch (err) {
      console.warn('Backend API unavailable when deleting card:', err);
    }

    if (!deletedApi) {
      const updatedList = cards.filter((c) => c.id !== deletingCard.id);
      saveToLocalStorageFallback(updatedList);
    }

    setDeletingCard(null);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      collectionId: availableCollections[0]?.id || '',
      rarityId: availableRarities[0]?.id || '',
      stock: 10,
      price: 49.99,
      status: 'PUBLISHED',
      imageUrl: '',
    });
    setPreviewImage(null);
  };

  // Filtered list
  const filteredCards = cards.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.collection.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCol = collectionFilter === 'ALL' || c.collection === collectionFilter || c.collectionId === collectionFilter;
    return matchesSearch && matchesStatus && matchesCol;
  });

  // Calculate Metrics
  const totalCards = cards.length;
  const publishedCards = cards.filter((c) => c.status === 'PUBLISHED').length;
  const totalValue = cards.reduce((acc, c) => acc + (c.price || 0), 0);
  const avgPrice = totalCards > 0 ? totalValue / totalCards : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>
            🎴 Panel de Administración de Cartas TCG
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#a1a1aa', fontSize: '0.92rem' }}>
            Control total de productos, actualización en tiempo real, gestión de inventario y activos multimedia.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            fetchCollectionsList();
            setShowCreateModal(true);
          }}
          style={{
            backgroundColor: '#a855f7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.35rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
            transition: 'transform 0.15s ease'
          }}
        >
          <span>➕</span> Registrar Nueva Carta
        </button>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>TOTAL CARTAS</span>
            <span style={{ fontSize: '1.3rem' }}>🃏</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f4f4f5', marginTop: '0.4rem' }}>{totalCards}</div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.2rem' }}>Registradas en la base de datos</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>PUBLICADAS EN TIENDA</span>
            <span style={{ fontSize: '1.3rem' }}>🟢</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>{publishedCards}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Visibles en el catálogo público</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>VALOR DE INVENTARIO</span>
            <span style={{ fontSize: '1.3rem' }}>💎</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Suma estimada del catálogo</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>PRECIO PROMEDIO</span>
            <span style={{ fontSize: '1.3rem' }}>📈</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.4rem' }}>
            ${avgPrice.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Por unidad listada</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Search Input */}
        <div style={{ flex: 2, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, número o colección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              color: '#f4f4f5',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '0.65rem',
              color: '#f4f4f5',
              fontSize: '0.9rem'
            }}
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="DRAFT">Borradores</option>
            <option value="ARCHIVED">Archivadas</option>
          </select>
        </div>

        {/* Dynamic Collection Filter */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#09090b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '0.65rem',
              color: '#f4f4f5',
              fontSize: '0.9rem'
            }}
          >
            <option value="ALL">Todas las Colecciones</option>
            {availableCollections.map((col) => (
              <option key={col.id} value={col.name}>
                {col.name} ({col.code})
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || statusFilter !== 'ALL' || collectionFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setCollectionFilter('ALL');
            }}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #3f3f46',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Cards Table */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#27272a', color: '#a1a1aa', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Ilustración</th>
              <th style={{ padding: '1rem 1.25rem' }}>Nombre / Carta</th>
              <th style={{ padding: '1rem 1.25rem' }}>Número</th>
              <th style={{ padding: '1rem 1.25rem' }}>Colección</th>
              <th style={{ padding: '1rem 1.25rem' }}>Rareza</th>
              <th style={{ padding: '1rem 1.25rem' }}>Precio</th>
              <th style={{ padding: '1rem 1.25rem' }}>Estado</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>
                  No se encontraron cartas que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredCards.map((card) => (
                <tr key={card.id} style={{ borderBottom: '1px solid #27272a', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '0.75rem 1.25rem' }}>
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        style={{
                          width: '46px',
                          height: '64px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1px solid #38bdf8',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '46px',
                        height: '64px',
                        borderRadius: '6px',
                        backgroundColor: '#27272a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}>
                        🃏
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#f4f4f5', fontSize: '0.95rem' }}>{card.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>Stock: {card.stock ?? 10} dispon.</div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                    {card.number}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      backgroundColor: '#09090b',
                      border: '1px solid #38bdf840',
                      color: '#38bdf8',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {card.collection}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      color: '#c084fc',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}>
                      {card.rarity}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#10b981', fontSize: '1rem' }}>
                    ${(card.price || 49.99).toFixed(2)}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: card.status === 'PUBLISHED' ? '#064e3b' : '#3f3f46',
                      color: card.status === 'PUBLISHED' ? '#34d399' : '#a1a1aa'
                    }}>
                      {card.status === 'PUBLISHED' ? 'PUBLICADO' : 'BORRADOR'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cards/${card.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Ver en Catálogo Público"
                        style={{
                          backgroundColor: '#27272a',
                          color: '#38bdf8',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.7rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        👁️ Ver
                      </a>

                      <button
                        onClick={() => handleEditOpen(card)}
                        title="Editar Carta"
                        style={{
                          backgroundColor: '#3f3f46',
                          color: '#f4f4f5',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.7rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        ✏️ Editar
                      </button>

                      <button
                        onClick={() => setDeletingCard(card)}
                        title="Eliminar Carta"
                        style={{
                          backgroundColor: '#7f1d1d',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.7rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <ModalWrapper title="Registrar Nueva Carta & Activo Multimedia" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ImageUploaderInput
              previewImage={previewImage}
              onImageChange={handleImageFileChange}
              onUrlChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
                setPreviewImage(url);
              }}
            />

            <div>
              <label style={labelStyle}>Nombre de la Carta</label>
              <input
                type="text"
                required
                placeholder="ej. Charizard VMAX Custom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Número de Carta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. 004/102"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Precio de Venta (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* Dynamic Collection Dropdown */}
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Colección</label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                  style={inputStyle}
                >
                  {availableCollections.length === 0 ? (
                    <option value="">Cargando colecciones...</option>
                  ) : (
                    availableCollections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Rareza & Efecto Holo</label>
                <select
                  value={formData.rarityId}
                  onChange={(e) => setFormData({ ...formData, rarityId: e.target.value })}
                  style={inputStyle}
                >
                  {availableRarities.length === 0 ? (
                    <option value="">Cargando rarezas...</option>
                  ) : (
                    availableRarities.map((rar) => (
                      <option key={rar.id} value={rar.id}>
                        {rar.name} — shader: {rar.shader}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stock (Unidades Disponibles)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Estado de Publicación</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="PUBLISHED">Publicado</option>
                  <option value="DRAFT">Borrador</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} style={submitBtnStyle}>
                {isSubmitting ? 'Guardando...' : 'Guardar y Publicar'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {editingCard && (
        <ModalWrapper title={`Editar Carta: ${editingCard.name}`} onClose={() => setEditingCard(null)}>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ImageUploaderInput
              previewImage={previewImage}
              onImageChange={handleImageFileChange}
              onUrlChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
                setPreviewImage(url);
              }}
            />

            <div>
              <label style={labelStyle}>Nombre de la Carta</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Número de Carta</label>
                <input
                  type="text"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Precio (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Colección</label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                  style={inputStyle}
                >
                  {availableCollections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Rareza & Efecto Holo</label>
                <select
                  value={formData.rarityId}
                  onChange={(e) => setFormData({ ...formData, rarityId: e.target.value })}
                  style={inputStyle}
                >
                  {availableRarities.map((rar) => (
                    <option key={rar.id} value={rar.id}>
                      {rar.name} — shader: {rar.shader}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stock (Unidades Disponibles)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="PUBLISHED">Publicado</option>
                  <option value="DRAFT">Borrador</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingCard(null)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} style={submitBtnStyle}>
                {isSubmitting ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCard && (
        <ModalWrapper title="Confirmar Eliminación" onClose={() => setDeletingCard(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#7f1d1d20', border: '1px solid #ef4444', borderRadius: '8px', padding: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
              ⚠️ <strong>¡Atención!</strong> Esta acción eliminará permanentemente la carta <strong>"{deletingCard.name}"</strong> del catálogo y de la base de datos PostgreSQL.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#09090b', padding: '1rem', borderRadius: '8px' }}>
              {deletingCard.imageUrl && (
                <img src={deletingCard.imageUrl} alt={deletingCard.name} style={{ width: '48px', height: '64px', borderRadius: '6px', objectFit: 'cover' }} />
              )}
              <div>
                <h4 style={{ margin: 0, color: '#f4f4f5' }}>{deletingCard.name}</h4>
                <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>#{deletingCard.number} • {deletingCard.collection}</div>
                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginTop: '0.2rem' }}>${(deletingCard.price || 49.99).toFixed(2)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setDeletingCard(null)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar Carta'}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

// Subcomponents & Styles
function ModalWrapper({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '14px',
        padding: '2rem',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.2rem', fontWeight: 800 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ImageUploaderInput({ previewImage, onImageChange, onUrlChange }: { previewImage: string | null; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onUrlChange: (url: string) => void }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem', fontWeight: 600 }}>
        🖼️ Ilustración / Imagen Estática
      </label>

      <div style={{
        border: '2px dashed #3f3f46',
        borderRadius: '10px',
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#09090b',
        position: 'relative',
        marginBottom: '0.75rem'
      }}>
        {previewImage ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <img src={previewImage} alt="Vista Previa" style={{ height: '140px', borderRadius: '8px', border: '1px solid #38bdf8', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>✓ Imagen cargada en memoria</span>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}>📁</span>
            <span style={{ fontSize: '0.85rem', color: '#f4f4f5', fontWeight: 600 }}>
              Haz clic para seleccionar imagen de tu computadora
            </span>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#71717a' }}>PNG, JPG, WEBP de alta resolución</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  color: '#a1a1aa',
  marginBottom: '0.4rem',
  fontWeight: 600
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid #3f3f46',
  backgroundColor: '#09090b',
  color: '#f4f4f5',
  fontSize: '0.9rem',
  boxSizing: 'border-box',
  outline: 'none'
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '0.65rem 1.25rem',
  borderRadius: '6px',
  border: '1px solid #3f3f46',
  backgroundColor: 'transparent',
  color: '#a1a1aa',
  fontWeight: 600,
  cursor: 'pointer'
};

const submitBtnStyle: React.CSSProperties = {
  padding: '0.65rem 1.25rem',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#a855f7',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer'
};
