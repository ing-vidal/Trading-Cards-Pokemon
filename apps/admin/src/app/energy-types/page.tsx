'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trading-cards-pokemon.onrender.com';

interface EnergyType {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  _count?: { cards: number };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 1rem',
  borderRadius: '8px',
  border: '1px solid #3f3f46',
  backgroundColor: '#09090b',
  color: '#f4f4f5',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#a1a1aa',
  fontWeight: 600,
  marginBottom: '0.4rem',
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function IconPreview({ icon, color }: { icon?: string | null; color?: string | null }) {
  if (!icon) return <span style={{ color: '#3f3f46', fontSize: '1.4rem' }}>—</span>;
  const isImage = icon.startsWith('data:image') || icon.startsWith('http');
  return isImage ? (
    <img src={icon} alt="icon" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} />
  ) : (
    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
  );
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function EnergyTypesAdminPage() {
  const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    icon: '',
    color: '#3b82f6',
    iconMode: 'emoji' as 'emoji' | 'image',
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const fetchEnergyTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/energy-types`);
      if (res.ok) {
        const json = await res.json();
        setEnergyTypes(Array.isArray(json) ? json : []);
      }
    } catch (e) {
      console.warn('Error fetching energy types:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchEnergyTypes(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', icon: '', color: '#3b82f6', iconMode: 'emoji' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (et: EnergyType) => {
    setEditingId(et.id);
    const isImage = et.icon?.startsWith('data:image') || et.icon?.startsWith('http');
    setForm({
      name: et.name,
      slug: et.slug,
      icon: et.icon || '',
      color: et.color || '#3b82f6',
      iconMode: isImage ? 'image' : 'emoji',
    });
    setError('');
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, icon: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setSubmitting(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      icon: form.icon || null,
      color: form.color,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/energy-types/${editingId}`
        : `${API_BASE_URL}/api/energy-types`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchEnergyTypes();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || `Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      setError('Error de conexión con la API');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/energy-types/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingId(null);
        await fetchEnergyTypes();
      }
    } catch (e) { console.warn('Delete error:', e); }
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f4f4f5' }}>
            ⚡ Tipos de Energía
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
            Gestiona los tipos de energía. El icono y nombre se muestran en los filtros del catálogo y en las cartas.
          </p>
        </div>
        <button onClick={openCreate} style={{
          backgroundColor: '#38bdf8', color: '#09090b', border: 'none', borderRadius: '10px',
          padding: '0.75rem 1.35rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(56,189,248,0.35)',
        }}>
          ➕ Agregar Tipo
        </button>
      </div>

      {/* Grid de tarjetas de energía */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>Cargando tipos de energía...</div>
      ) : energyTypes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#18181b', borderRadius: '14px', border: '1px solid #27272a', color: '#71717a' }}>
          No hay tipos de energía. Agrega el primero con el botón de arriba.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {energyTypes.map(et => (
            <div key={et.id} style={{
              backgroundColor: '#18181b',
              border: `1px solid ${et.color || '#27272a'}40`,
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              position: 'relative',
            }}>
              {/* Color accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '12px 12px 0 0', backgroundColor: et.color || '#38bdf8' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '10px',
                  backgroundColor: `${et.color || '#38bdf8'}20`,
                  border: `1px solid ${et.color || '#38bdf8'}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconPreview icon={et.icon} color={et.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f4f4f5', fontSize: '1rem' }}>{et.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#71717a', fontFamily: 'monospace' }}>{et.slug}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>{et._count?.cards ?? 0} cartas</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button onClick={() => openEdit(et)} style={{
                    backgroundColor: '#3f3f46', color: '#f4f4f5', border: 'none', borderRadius: '6px',
                    padding: '0.35rem 0.65rem', fontSize: '0.78rem', cursor: 'pointer',
                  }}>✏️</button>
                  <button onClick={() => setDeletingId(et.id)} style={{
                    backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px',
                    padding: '0.35rem 0.65rem', fontSize: '0.78rem', cursor: 'pointer',
                  }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.25rem', fontWeight: 700 }}>
                {editingId ? '✏️ Editar Tipo de Energía' : '➕ Nuevo Tipo de Energía'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre del Tipo de Energía</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Agua"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Slug (auto) */}
              <div>
                <label style={labelStyle}>Slug (identificador único)</label>
                <input
                  type="text"
                  placeholder="ej. agua"
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  style={{ ...inputStyle, color: '#71717a' }}
                />
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#71717a' }}>Auto-generado desde el nombre. Solo letras, números y guiones.</p>
              </div>

              {/* Icono */}
              <div>
                <label style={labelStyle}>Icono</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  {(['emoji', 'image'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, iconMode: mode, icon: '' }))}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: form.iconMode === mode ? '#38bdf8' : '#3f3f46',
                        backgroundColor: form.iconMode === mode ? '#38bdf820' : 'transparent',
                        color: form.iconMode === mode ? '#38bdf8' : '#a1a1aa',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {mode === 'emoji' ? '😀 Emoji / Símbolo' : '🖼️ Subir Imagen'}
                    </button>
                  ))}
                </div>

                {form.iconMode === 'emoji' ? (
                  <input
                    type="text"
                    placeholder="ej. 💧  🔥  ⚡  🌿"
                    value={form.icon}
                    onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                    style={{ ...inputStyle, fontSize: '1.2rem' }}
                  />
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: '1px dashed #3f3f46',
                        backgroundColor: '#09090b',
                        color: '#a1a1aa',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      📁 Elegir imagen...
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    {form.icon ? (
                      <img src={form.icon} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #3f3f46' }} />
                    ) : (
                      <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Sin imagen seleccionada</span>
                    )}
                  </div>
                )}
              </div>

              {/* Color + Preview */}
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={{ width: '48px', height: '40px', padding: '0', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    placeholder="#3b82f6"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {/* Live card preview */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '10px',
                    backgroundColor: `${form.color}20`,
                    border: `1px solid ${form.color}60`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconPreview icon={form.icon || '⚡'} color={form.color} />
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ backgroundColor: '#7f1d1d20', border: '1px solid #7f1d1d', borderRadius: '8px', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #3f3f46',
                  backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontWeight: 600,
                }}>Cancelar</button>
                <button type="submit" disabled={submitting} style={{
                  padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none',
                  backgroundColor: '#38bdf8', color: '#09090b', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? 'Guardando...' : editingId ? '💾 Guardar Cambios' : '✅ Crear Tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #7f1d1d', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f4f4f5' }}>¿Eliminar este tipo de energía?</h3>
            <p style={{ color: '#a1a1aa', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              Las cartas vinculadas perderán su tipo de energía. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)} style={{
                padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #3f3f46',
                backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontWeight: 600,
              }}>Cancelar</button>
              <button onClick={handleDelete} disabled={submitting} style={{
                padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none',
                backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700,
                opacity: submitting ? 0.6 : 1,
              }}>
                {submitting ? 'Eliminando...' : '🗑️ Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
