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
  { value: 'PROMO',            label: '🎁  Promo' },
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse icon field: may be a JSON array of up to 4 icons, or a single string */
function parseIcons(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}
  return [raw];
}

/** Serialize icon array back to storage format */
function serializeIcons(icons: (string | null)[]): string | null {
  const filtered = icons.filter(Boolean) as string[];
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0]; // backward compat: single icon stored as plain string
  return JSON.stringify(filtered);
}

/** Renders a single icon (image or emoji) */
function SingleIcon({ src, size = 28 }: { src: string; size?: number }) {
  const isImage = src.startsWith('data:image') || src.startsWith('http');
  return isImage
    ? <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 3, display: 'block' }} />
    : <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{src}</span>;
}

/** Renders all icons in a rarity side by side */
function RarityIconRow({ icon, size = 28 }: { icon?: string | null; size?: number }) {
  const icons = parseIcons(icon);
  if (icons.length === 0) return <span style={{ color: '#3f3f46', fontSize: '1.2rem' }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {icons.map((src, i) => <SingleIcon key={i} src={src} size={size} />)}
    </div>
  );
}

// ─── Slot uploader (one image slot) ──────────────────────────────────────────
function ImageSlot({
  index,
  value,
  onChange,
}: {
  index: number;
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ fontSize: '0.7rem', color: '#71717a', fontWeight: 600 }}>#{index + 1}</div>
      <div
        onClick={() => ref.current?.click()}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '10px',
          border: value ? '2px solid #a855f7' : '2px dashed #3f3f46',
          backgroundColor: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
          position: 'relative',
        }}
      >
        {value ? (
          <img src={value} alt={`icon ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '1.5rem', color: '#3f3f46' }}>＋</span>
        )}
        <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{
            fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '4px',
            border: 'none', backgroundColor: '#7f1d1d', color: '#fca5a5', cursor: 'pointer',
          }}
        >
          ✕ Quitar
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
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
    color: '#a855f7',
    iconMode: 'emoji' as 'emoji' | 'images',
    // emoji mode
    emojiIcon: '',
    // image mode: up to 4 slots
    imageSlots: [null, null, null, null] as (string | null)[],
  });

  const fetchRarities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rarities`);
      if (res.ok) {
        const json = await res.json();
        setRarities(Array.isArray(json) ? json : []);
      }
    } catch (e) { console.warn('Error fetching rarities:', e); }
    setLoading(false);
  };

  useEffect(() => { fetchRarities(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', level: 'COMMON', color: '#a855f7', iconMode: 'emoji', emojiIcon: '', imageSlots: [null, null, null, null] });
    setError('');
    setShowModal(true);
  };

  const openEdit = (r: Rarity) => {
    setEditingId(r.id);
    const icons = parseIcons(r.icon);
    const hasImages = icons.some(i => i.startsWith('data:image') || i.startsWith('http'));
    const slots: (string | null)[] = [null, null, null, null];
    if (hasImages) {
      icons.forEach((img, idx) => { if (idx < 4) slots[idx] = img; });
    }
    setForm({
      name: r.name,
      level: r.level,
      color: r.color || '#a855f7',
      iconMode: hasImages ? 'images' : 'emoji',
      emojiIcon: hasImages ? '' : (icons[0] || ''),
      imageSlots: slots,
    });
    setError('');
    setShowModal(true);
  };

  const updateSlot = (idx: number, val: string | null) => {
    setForm(prev => {
      const slots = [...prev.imageSlots] as (string | null)[];
      slots[idx] = val;
      return { ...prev, imageSlots: slots };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setSubmitting(true);
    setError('');

    const iconValue = form.iconMode === 'emoji'
      ? (form.emojiIcon || null)
      : serializeIcons(form.imageSlots);

    const payload = {
      name: form.name.trim(),
      level: form.level,
      icon: iconValue,
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
        setError(err.message || `Error ${res.status}`);
      }
    } catch { setError('Error de conexión con la API'); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rarities/${deletingId}`, { method: 'DELETE' });
      if (res.ok) { setDeletingId(null); await fetchRarities(); }
    } catch (e) { console.warn('Delete error:', e); }
    setSubmitting(false);
  };

  // Computed icon preview in the form
  const previewIcon = form.iconMode === 'emoji' ? form.emojiIcon || null : serializeIcons(form.imageSlots);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f4f4f5' }}>⭐ Gestión de Rarezas</h1>
          <p style={{ margin: '0.3rem 0 0', color: '#a1a1aa', fontSize: '0.9rem' }}>
            Agrega iconos personalizados (hasta 4 imágenes para representar ◆◆◆◆). Se muestran en los filtros del catálogo.
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
              <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }}>Icono(s)</th>
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
              <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>No hay rarezas. Agrega la primera.</td></tr>
            ) : rarities.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <RarityIconRow icon={r.icon} size={28} />
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
                <td style={{ padding: '0.85rem 1.25rem', color: '#38bdf8', fontWeight: 600 }}>{r._count?.cards ?? 0}</td>
                <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(r)} style={{ backgroundColor: '#3f3f46', color: '#f4f4f5', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={() => setDeletingId(r.id)} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>🗑️ Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px', width: '100%', maxWidth: '560px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#f4f4f5', fontSize: '1.25rem', fontWeight: 700 }}>
                {editingId ? '✏️ Editar Rareza' : '➕ Nueva Rareza'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Nombre */}
              <div>
                <label style={labelStyle}>Nombre</label>
                <input type="text" required placeholder="ej. Double Rare" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>

              {/* Nivel */}
              <div>
                <label style={labelStyle}>Nivel de Rareza</label>
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} style={inputStyle}>
                  {RARITY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              {/* ── Icono ── */}
              <div>
                <label style={labelStyle}>Icono de la Rareza</label>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {(['emoji', 'images'] as const).map(mode => (
                    <button key={mode} type="button"
                      onClick={() => setForm(p => ({ ...p, iconMode: mode }))}
                      style={{
                        padding: '0.35rem 0.85rem', borderRadius: '6px', border: '1px solid',
                        borderColor: form.iconMode === mode ? '#a855f7' : '#3f3f46',
                        backgroundColor: form.iconMode === mode ? '#a855f720' : 'transparent',
                        color: form.iconMode === mode ? '#c084fc' : '#a1a1aa',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      }}
                    >
                      {mode === 'emoji' ? '😀 Emoji / Símbolo' : '🖼️ Imágenes (hasta 4)'}
                    </button>
                  ))}
                </div>

                {form.iconMode === 'emoji' ? (
                  <input type="text" placeholder="ej. ◆◆◆  ⭐⭐  👑  ✦✦"
                    value={form.emojiIcon}
                    onChange={e => setForm(p => ({ ...p, emojiIcon: e.target.value }))}
                    style={{ ...inputStyle, fontSize: '1.3rem' }} />
                ) : (
                  <div>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#71717a' }}>
                      Sube la misma imagen del símbolo tantas veces como necesites mostrar.
                      Por ejemplo, para ◆◆◆ sube el mismo diamante 3 veces.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {form.imageSlots.map((slot, idx) => (
                        <ImageSlot key={idx} index={idx} value={slot} onChange={val => updateSlot(idx, val)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color + live preview */}
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input type="color" value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={{ width: '48px', height: '40px', padding: 0, border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }} />
                  <input type="text" value={form.color} placeholder="#a855f7"
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={{ ...inputStyle, flex: 1 }} />

                  {/* Live badge preview */}
                  <div style={{
                    padding: '0.3rem 0.85rem', borderRadius: '99px',
                    backgroundColor: `${form.color}20`, border: `1px solid ${form.color}60`,
                    color: form.color, display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
                  }}>
                    <RarityIconRow icon={previewIcon} size={20} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{form.name || 'Preview'}</span>
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

      {/* ── DELETE CONFIRM ── */}
      {deletingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #7f1d1d', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#f4f4f5' }}>¿Eliminar esta rareza?</h3>
            <p style={{ color: '#a1a1aa', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>Las cartas vinculadas perderán su rareza. No se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setDeletingId(null)} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #3f3f46', backgroundColor: 'transparent', color: '#a1a1aa', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleDelete} disabled={submitting} style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? 'Eliminando...' : '🗑️ Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
