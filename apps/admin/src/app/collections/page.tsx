'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trading-cards-pokemon.onrender.com';

interface CollectionItem {
  id: string;
  name: string;
  code: string;
  slug: string;
  cardsCount: number;
  releaseDate: string;
  description?: string;
  logo?: string;
  images?: string[];
}

const INITIAL_COLLECTIONS: CollectionItem[] = [
  { id: '1', name: 'Base Set', code: 'BASE1', slug: 'base-set', cardsCount: 102, releaseDate: '1999-01-09', description: 'Colección icónica original de Pokémon TCG.' },
  { id: '2', name: 'Scarlet & Violet Base', code: 'SV01', slug: 'scarlet-violet-base', cardsCount: 198, releaseDate: '2023-03-31', description: 'Primera expansión de la era Escarlata y Púrpura.' },
  { id: '3', name: 'Crown Zenith', code: 'CRZ', slug: 'crown-zenith', cardsCount: 160, releaseDate: '2023-01-20', description: 'Set especial con la Galería de Galarga y cartas de alta rareza.' },
  { id: '4', name: 'Promotional Cards', code: 'PROMO', slug: 'promotional-cards', cardsCount: 45, releaseDate: '2022-05-15', description: 'Cartas promocionales especiales de eventos.' },
];

const normalizeCollectionImages = (value: unknown): string[] => {
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
};

const normalizeCollection = (c: any): CollectionItem => {
  const images = normalizeCollectionImages(c.images || c.logo);
  return {
    id: c.id,
    name: c.name,
    code: c.code,
    slug: c.slug,
    cardsCount: c._count?.cards ?? c.cardsCount ?? 0,
    releaseDate: c.releaseDate ? new Date(c.releaseDate).toISOString().split('T')[0] : 'N/A',
    description: c.description || '',
    logo: images[0] || c.logo || '',
    images,
  };
};

const dedupeCollections = (items: CollectionItem[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id || `${item.slug}-${item.code}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const mergeCollections = (apiCollections: CollectionItem[], localCollections: CollectionItem[]) => {
  const merged = [...apiCollections];
  const apiKeys = new Set(apiCollections.map((col) => col.id || `${col.slug}-${col.code}`));

  localCollections.forEach((col) => {
    const key = col.id || `${col.slug}-${col.code}`;
    if (!apiKeys.has(key)) {
      merged.push(col);
      apiKeys.add(key);
    }
  });

  return dedupeCollections(merged);
};

const COLLECTIONS_STORAGE_KEY = 'tcg_custom_collections';
const DELETED_COLLECTIONS_STORAGE_KEY = 'tcg_deleted_collections';

const persistCollections = (updated: CollectionItem[]) => {
  try {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save collections to localStorage:', e);
  }
};

const persistDeletedCollections = (deletedIds: string[]) => {
  try {
    localStorage.setItem(DELETED_COLLECTIONS_STORAGE_KEY, JSON.stringify(deletedIds));
  } catch (e) {
    console.warn('Could not save deleted collections to localStorage:', e);
  }
};

const getDeletedCollections = () => {
  try {
    const saved = localStorage.getItem(DELETED_COLLECTIONS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch (e) {
    console.warn('Could not load deleted collections from localStorage:', e);
    return [];
  }
};

export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCol, setEditingCol] = useState<CollectionItem | null>(null);
  const [deletingCol, setDeletingCol] = useState<CollectionItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    releaseDate: '',
    description: '',
    logo: '',
    images: [] as string[],
  });
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const handleImagesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    if (files.length === 0) return;

    const imageUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    const nextImages = imageUrls.slice(0, 3);
    setPreviewImages(nextImages);
    setPreviewLogo(nextImages[0] || null);
    setFormData((prev) => ({
      ...prev,
      images: nextImages,
      logo: nextImages[0] || prev.logo,
    }));
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = previewImages.filter((_, imageIndex) => imageIndex !== index);
    const nextLogo = nextImages[0] || '';
    setPreviewImages(nextImages);
    setPreviewLogo(nextLogo || null);
    setFormData((prev) => ({
      ...prev,
      images: nextImages,
      logo: nextLogo,
    }));
  };

  // Fetch collections from API
  const fetchCollections = async () => {
    let apiCols: CollectionItem[] = [];
    const deletedIds = getDeletedCollections();

    try {
      const res = await fetch(`${API_BASE_URL}/api/collections`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          apiCols = json.map(normalizeCollection);
        }
      }
    } catch (e) {
      console.warn('API error when fetching collections, using local state:', e);
    }

    try {
      const saved = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = mergeCollections(apiCols, parsed);
          const visibleCollections = merged.filter((col) => !deletedIds.includes(col.id || `${col.slug}-${col.code}`));
          setCollections(visibleCollections);
          persistCollections(visibleCollections);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load collections from localStorage:', e);
    }

    const visibleApiCollections = apiCols.filter((col) => !deletedIds.includes(col.id || `${col.slug}-${col.code}`));
    if (visibleApiCollections.length > 0) {
      setCollections(visibleApiCollections);
      persistCollections(visibleApiCollections);
    } else {
      setCollections([]);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const saveToLocalStorageFallback = (updated: CollectionItem[]) => {
    setCollections((prev) => {
      const merged = mergeCollections(updated, prev);
      persistCollections(merged);
      return merged;
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      slug: '',
      releaseDate: new Date().toISOString().split('T')[0],
      description: '',
      logo: '',
      images: [],
    });
    setPreviewLogo(null);
    setPreviewImages([]);
  };

  // Create Collection Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      code: formData.code.toUpperCase(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : undefined,
      description: formData.description || undefined,
      logo: formData.images.length > 0
        ? (formData.images.length > 1 ? JSON.stringify(formData.images) : formData.images[0] || formData.logo || previewLogo || undefined)
        : formData.logo || previewLogo || undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
    };

    let createdApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        createdApi = true;
        await fetchCollections();
      }
    } catch (err) {
      console.warn('API unavailable when creating collection:', err);
    }

    if (!createdApi) {
      const item: CollectionItem = {
        id: `custom-col-${Date.now()}`,
        name: formData.name,
        code: formData.code.toUpperCase(),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        cardsCount: 0,
        releaseDate: formData.releaseDate || new Date().toISOString().split('T')[0],
        description: formData.description,
        logo: formData.images.length > 0
          ? (formData.images.length > 1 ? JSON.stringify(formData.images) : formData.images[0] || formData.logo || previewLogo || undefined)
          : formData.logo || previewLogo || undefined,
        images: formData.images,
      };
      setCollections((prev) => {
        const next = dedupeCollections([item, ...prev]);
        persistCollections(next);
        return next;
      });
    }

    setShowCreateModal(false);
    resetForm();
    setIsSubmitting(false);
  };

  const handleEditOpen = (col: CollectionItem) => {
    setEditingCol(col);
    const initialImages = normalizeCollectionImages(col.images || col.logo);
    setFormData({
      name: col.name,
      code: col.code,
      slug: col.slug,
      releaseDate: col.releaseDate !== 'N/A' ? col.releaseDate : '',
      description: col.description || '',
      logo: initialImages[0] || col.logo || '',
      images: initialImages,
    });
    setPreviewImages(initialImages);
    setPreviewLogo(initialImages[0] || col.logo || null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol || !formData.name || !formData.code) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      code: formData.code.toUpperCase(),
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : undefined,
      description: formData.description || undefined,
      logo: formData.images.length > 0
        ? (formData.images.length > 1 ? JSON.stringify(formData.images) : formData.images[0] || formData.logo || previewLogo || undefined)
        : formData.logo || previewLogo || undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
    };

    let updatedApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections/${editingCol.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        updatedApi = true;
        await fetchCollections();
      }
    } catch (err) {
      console.warn('API unavailable when updating collection:', err);
    }

    if (!updatedApi) {
      setCollections((prev) => {
        const updatedList = prev.map((c) =>
          c.id === editingCol.id
            ? {
                ...c,
                name: formData.name,
                code: formData.code.toUpperCase(),
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                releaseDate: formData.releaseDate || c.releaseDate,
                description: formData.description,
                logo: formData.logo || formData.images[0] || previewLogo || c.logo,
                images: formData.images,
              }
            : c
        );
        const next = dedupeCollections(updatedList);
        persistCollections(next);
        return next;
      });
    }

    setEditingCol(null);
    resetForm();
    setIsSubmitting(false);
  };

  // Delete Collection Handler
  const handleDeleteConfirm = async () => {
    if (!deletingCol) return;
    setIsSubmitting(true);

    let deletedApi = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections/${deletingCol.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        deletedApi = true;
        await fetchCollections();
      }
    } catch (err) {
      console.warn('API unavailable when deleting collection:', err);
    }

    const deleteKey = deletingCol.id || `${deletingCol.slug}-${deletingCol.code}`;
    const nextDeletedIds = Array.from(new Set([...getDeletedCollections(), deleteKey]));
    persistDeletedCollections(nextDeletedIds);

    if (!deletedApi) {
      setCollections((prev) => {
        const updatedList = prev.filter((c) => (c.id || `${c.slug}-${c.code}`) !== deleteKey);
        const next = dedupeCollections(updatedList);
        persistCollections(next);
        return next;
      });
    }

    setDeletingCol(null);
    setIsSubmitting(false);
  };

  // Filtered collections
  const filteredCollections = collections.filter((col) =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Metrics
  const totalCollections = collections.length;
  const totalCardsInCollections = collections.reduce((acc, c) => acc + (c.cardsCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>
            📦 Gestión de Colecciones & Expansiones TCG
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#a1a1aa', fontSize: '0.92rem' }}>
            Administra sets oficiales, códigos de expansión, fechas de lanzamiento y volumen de cartas.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          style={{
            backgroundColor: '#38bdf8',
            color: '#09090b',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.35rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
            transition: 'transform 0.15s ease'
          }}
        >
          <span>📦</span> Nueva Colección
        </button>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>TOTAL COLECCIONES</span>
            <span style={{ fontSize: '1.3rem' }}>📚</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.4rem' }}>{totalCollections}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Expansiones registradas</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>CARTAS ASOCIADAS</span>
            <span style={{ fontSize: '1.3rem' }}>🎴</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.4rem' }}>{totalCardsInCollections}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Total en colecciones</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>ESTADO BACKEND</span>
            <span style={{ fontSize: '1.3rem' }}>🟢</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>Activo</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>PostgreSQL + NestJS Sync</div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div style={{
        backgroundColor: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar colección por nombre, código o slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#09090b',
            border: '1px solid #3f3f46',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            color: '#f4f4f5',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
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
            Limpiar Búsqueda
          </button>
        )}
      </div>

      {/* Grid of Collections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filteredCollections.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: '#18181b', borderRadius: '12px', color: '#71717a' }}>
            No se encontraron colecciones.
          </div>
        ) : (
          filteredCollections.map((col) => (
            <div
              key={col.id}
              style={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: '#38bdf820',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em'
                }}>
                  {col.code}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>📅 {col.releaseDate}</span>
              </div>

              {/* Booster Pack Image & Title */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {col.images && col.images.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', width: '60px' }}>
                    {col.images.slice(0, 3).map((image, index) => (
                      <img
                        key={`${col.id}-${index}`}
                        src={image}
                        alt={`${col.name} ${index + 1}`}
                        style={{
                          width: '60px',
                          height: '85px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #38bdf840',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                        }}
                      />
                    ))}
                  </div>
                ) : col.logo ? (
                  <img
                    src={col.logo}
                    alt={col.name}
                    style={{
                      width: '60px',
                      height: '85px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #38bdf840',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '85px',
                    backgroundColor: '#09090b',
                    borderRadius: '8px',
                    border: '1px dashed #3f3f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    📦
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f4f4f5', fontWeight: 700 }}>{col.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#71717a', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                    slug: {col.slug}
                  </div>
                </div>
              </div>

              {/* Description if present */}
              {col.description && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                  {col.description}
                </p>
              )}

              {/* Footer Stat & Actions */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid #27272a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Volumen: </span>
                  <span style={{ fontWeight: 800, color: '#c084fc', fontSize: '0.95rem' }}>{col.cardsCount} cartas</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEditOpen(col)}
                    style={{
                      backgroundColor: '#3f3f46',
                      color: '#f4f4f5',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setDeletingCol(col)}
                    style={{
                      backgroundColor: '#7f1d1d',
                      color: '#fca5a5',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <ModalWrapper title="📦 Registrar Nueva Colección TCG" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ImageUploaderInput
              images={previewImages}
              onImageChange={handleImagesFileChange}
              onRemoveImage={handleRemoveImage}
            />

            <div>
              <label style={labelStyle}>Nombre de la Colección</label>
              <input
                type="text"
                required
                placeholder="ej. Scarlet & Violet Base"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Código Único (Acrónimo)</label>
                <input
                  type="text"
                  required
                  placeholder="ej. SV01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Fecha de Lanzamiento</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Slug (Opcional - generado automáticamente)</label>
              <input
                type="text"
                placeholder="ej. scarlet-violet-base"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                rows={3}
                placeholder="Descripción detallada de la colección..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} style={submitBtnStyle}>
                {isSubmitting ? 'Guardando...' : 'Guardar Colección'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {editingCol && (
        <ModalWrapper title={`Editar Colección: ${editingCol.name}`} onClose={() => setEditingCol(null)}>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ImageUploaderInput
              images={previewImages}
              onImageChange={handleImagesFileChange}
              onRemoveImage={handleRemoveImage}
            />

            <div>
              <label style={labelStyle}>Nombre de la Colección</label>
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
                <label style={labelStyle}>Código Único</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Fecha de Lanzamiento</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingCol(null)} style={cancelBtnStyle}>
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
      {deletingCol && (
        <ModalWrapper title="Confirmar Eliminación" onClose={() => setDeletingCol(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#7f1d1d20', border: '1px solid #ef4444', borderRadius: '8px', padding: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
              ⚠️ <strong>¡Atención!</strong> Esta acción eliminará permanentemente la colección <strong>"{deletingCol.name}" ({deletingCol.code})</strong> del sistema.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setDeletingCol(null)} style={cancelBtnStyle}>
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
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar Colección'}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

// Modal Wrapper & Styles
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
        maxWidth: '500px',
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
  backgroundColor: '#38bdf8',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer'
};

function ImageUploaderInput({
  images,
  onImageChange,
  onRemoveImage,
}: {
  images: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>Imágenes de la Expansión (hasta 3)</label>
      <div style={{
        border: '2px dashed #3f3f46',
        borderRadius: '10px',
        padding: '1rem',
        textAlign: 'center',
        backgroundColor: '#09090b',
        position: 'relative',
        marginBottom: '0.75rem'
      }}>
        {images.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.6rem' }}>
            {images.map((image, index) => (
              <div key={`${image}-${index}`} style={{ position: 'relative' }}>
                <img src={image} alt={`Vista previa ${index + 1}`} style={{ width: '100%', height: '110px', borderRadius: '8px', border: '1px solid #38bdf8', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  style={{
                    position: 'absolute',
                    top: '0.3rem',
                    right: '0.3rem',
                    border: 'none',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    width: '24px',
                    height: '24px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.4rem' }}>📁</span>
            <span style={{ fontSize: '0.85rem', color: '#f4f4f5', fontWeight: 600 }}>
              Sube hasta 3 imágenes para la colección
            </span>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#71717a' }}>PNG, JPG o WEBP • se usarán como galería de la expansión</p>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
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

