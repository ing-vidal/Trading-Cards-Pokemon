'use client';

import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trading-cards-pokemon.onrender.com';

interface Rarity {
  id: string;
  name: string;
  level: string;
  icon?: string | null;
  color?: string | null;
  _count?: { cards: number };
}

const RARITY_LEVELS = [
  { value: 'COMMON',           label: '◆  Common' },
  { value: 'UNCOMMON',         label: '◆◆  Uncommon' },
  { value: 'RARE',             label: '◆◆◆  Rare' },
  { value: 'DOUBLE_RARE',      label: '◆◆◆◆  Double Rare' },
  { value: 'STAR_1',           label: '⭐  1-Star Rare' },
  { value: 'STAR_2',           label: '⭐⭐  2-Star Rare' },
  { value: 'STAR_3',           label: '⭐⭐⭐  3-Star Rare' },
  { value: 'IMMERSIVE',        label: '✦  Immersive Rare' },
  { value: 'DOUBLE_IMMERSIVE', label: '✦✦  Double Immersive' },
  { value: 'CROWN',            label: '👑  Crown Rare' },
];

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

export default function RaritiesAdminPage() {
  const [rarities, setRarities] = useState<Rarity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    level: 'COMMON',
    icon: '',
    color: '#a855f7',
    iconMode: 'emoji' as 'emoji' | 'image',
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const fetchRarities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rarities`);
      if (res.ok) {
        const json = await res.json();
        setRarities(Array.isArray(json) ? json : []);
      }
    } catch (e) {
      console.warn('Error fetching rarities:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRarities(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', level: 'COMMON', icon: '', color: '#a855f7', iconMode: 'emoji' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (r: Rarity) => {
    setEditingId(r.id);
    const isImage = r.icon?.startsWith('data:image') || r.icon?.startsWith('http');
    setForm({
      name: r.name,
      level: r.level,
      icon: r.icon || '',
      color: r.color || '#a855f7',
      iconMode: isImage ? 'image' : 'emoji',
    });
    setError('');
    setShowModal(true);
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
      level: form.level,
      icon: form.icon || null,
      color: form.color,
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/rarities/${editingId}`
        : `${API_BASE_URL}/api/rarities`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        await fetchRarities();
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
      const res = await fetch(`${API_BASE_URL}/api/rarities/${deletingId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingId(null);
        await fetchRarities();
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
            ⭐ Gestión de Rarezas
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
            Agrega, edita o elimina las rarezas. El icono y nombre se muestran en los filtros del catálogo web.
          </p>
        </div>
        <button onClick={openCreate} style={{
          backgroundColor: '#a855f7', color: '#fff', border: 'none', borderRadius: '10px',
          padding: '0.75rem 1.35rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
        }}>
          ➕ Agregar Rareza
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#27272a', color: '#a1a1aa', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Icono</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Nombre</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Nivel</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Color</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Cartas</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>Cargando rarezas...</td></tr>
            ) : rarities.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>
                No hay rarezas. Agrega la primera con el botón de arriba.
              </td></tr>
            ) : rarities.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <IconPreview icon={r.icon} color={r.color} />
                </td>
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#f4f4f5' }}>{r.name}</td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', backgroundColor: '#27272a', color: '#a1a1aa', fontFamily: 'monospace' }}>
                    {r.level}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: r.color || '#a855f7', border: '1px solid #3f3f46' }} />
                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontFamily: 'monospace' }}>{r.color || '—'}</span>
                  </div>
                </td>
                <td style={{ padding: '0.85rem 1.25rem', color: '#38bdf8', fontWeight: 600 }}>
                  {r._count?.cards ?? 0}
                </td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(r)} style={{
                      backgroundColor: '#3f3f46', color: '#f4f4f5', border: 'none', borderRadius: '6px',
                      padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}>✏️ Editar</button>
                    <button onClick={() => setDeletingId(r.id)} style={{
                      backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px',
                      padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    }}>🗑️ Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.25rem', fontWeight: 700 }}>
                {editingId ? '✏️ Editar Rareza' : '➕ Nueva Rareza'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Crown Rare"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Nivel */}
              <div>
                <label style={labelStyle}>Nivel de Rareza</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} style={inputStyle}>
                  {RARITY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              {/* Icono */}
              <div>
                <label style={labelStyle}>Icono</label>
                {/* Mode toggle */}
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
                        borderColor: form.iconMode === mode ? '#a855f7' : '#3f3f46',
                        backgroundColor: form.iconMode === mode ? '#a855f720' : 'transparent',
                        color: form.iconMode === mode ? '#c084fc' : '#a1a1aa',
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
                    placeholder="ej. 👑  ⭐  ◆◆◆  ✦"
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
                    {form.icon && (
                      <img src={form.icon} alt="preview" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #3f3f46' }} />
                    )}
                    {!form.icon && <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Sin imagen seleccionada</span>}
                  </div>
                )}
              </div>

              {/* Color + Preview */}
              <div>
                <label style={labelStyle}>Color de la Rareza</label>
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
                    placeholder="#a855f7"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  {/* Live badge preview */}
                  <div style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '99px',
                    backgroundColor: `${form.color}20`,
                    border: `1px solid ${form.color}60`,
                    color: form.color,
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                  }}>
                    <IconPreview icon={form.icon} color={form.color} />
                    {form.name || 'Vista Previa'}
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
                  backgroundColor: '#a855f7', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? 'Guardando...' : editingId ? '💾 Guardar Cambios' : '✅ Crear Rareza'}
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
            <h3 style={{ margin: '0 0 0.5rem', color: '#f4f4f5' }}>¿Eliminar esta rareza?</h3>
            <p style={{ color: '#a1a1aa', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
              Las cartas vinculadas perderán su rareza. Esta acción no se puede deshacer.
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
