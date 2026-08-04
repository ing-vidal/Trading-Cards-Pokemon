'use client';

import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ProductItem {
  id: string;
  cardId: string;
  cardName: string;
  sku: string;
  condition: string;
  price: number;
  stock: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'RESERVED';
  imageUrl?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [cardsList, setCardsList] = useState<{ id: string; name: string; number: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cardId: '',
    condition: 'NEAR_MINT',
    price: 49.99,
    stock: 10,
    status: 'AVAILABLE' as 'AVAILABLE' | 'OUT_OF_STOCK' | 'RESERVED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Products & Cards List from API
  const fetchProductsData = async () => {
    setLoading(true);
    try {
      const [resProd, resCards] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`),
        fetch(`${API_BASE_URL}/api/cards`),
      ]);

      if (resProd.ok) {
        const prodJson = await resProd.json();
        if (Array.isArray(prodJson)) {
          const apiProducts: ProductItem[] = prodJson.map((p: any) => ({
            id: p.id,
            cardId: p.cardId,
            cardName: p.card?.name || 'Carta Desconocida',
            sku: p.sku || `SKU-${p.id.slice(0, 8)}`,
            condition: p.condition || 'NEAR_MINT',
            price: Number(p.price) || 0,
            stock: p.stock ?? 0,
            status: p.status || (p.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'),
            imageUrl: p.card?.assets?.[0]?.url,
          }));
          setProducts(apiProducts);
        }
      }

      if (resCards.ok) {
        const cardsJson = await resCards.json();
        if (cardsJson.data && Array.isArray(cardsJson.data)) {
          setCardsList(cardsJson.data.map((c: any) => ({ id: c.id, name: c.name, number: c.number })));
        }
      }
    } catch (e) {
      console.warn('API error when fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const resetForm = () => {
    setFormData({
      cardId: cardsList[0]?.id || '',
      condition: 'NEAR_MINT',
      price: 49.99,
      stock: 10,
      status: 'AVAILABLE',
    });
  };

  // Create Product Listing
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardId) return;
    setIsSubmitting(true);

    const payload = {
      cardId: formData.cardId,
      condition: formData.condition,
      price: Number(formData.price),
      stock: Number(formData.stock),
      status: formData.status,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchProductsData();
      }
    } catch (err) {
      console.warn('Error creating product:', err);
    }

    setShowCreateModal(false);
    resetForm();
    setIsSubmitting(false);
  };

  // Edit Product Listing
  const handleEditOpen = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormData({
      cardId: prod.cardId,
      condition: prod.condition,
      price: prod.price,
      stock: prod.stock,
      status: prod.status,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSubmitting(true);

    const payload = {
      condition: formData.condition,
      price: Number(formData.price),
      stock: Number(formData.stock),
      status: Number(formData.stock) === 0 ? 'OUT_OF_STOCK' : formData.status,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchProductsData();
      }
    } catch (err) {
      console.warn('Error updating product:', err);
    }

    setEditingProduct(null);
    resetForm();
    setIsSubmitting(false);
  };

  // Delete Product Listing
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchProductsData();
      }
    } catch (err) {
      console.warn('Error deleting product:', err);
    }

    setDeletingProduct(null);
    setIsSubmitting(false);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCondition = conditionFilter === 'ALL' || p.condition === conditionFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesCondition && matchesStatus;
  });

  // Calculate Metrics
  const totalListings = products.length;
  const availableListings = products.filter((p) => p.status === 'AVAILABLE' && p.stock > 0).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + (p.price * (p.stock || 1)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#f4f4f5', letterSpacing: '-0.02em' }}>
            🏷️ Gestión de Productos & Inventario
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#a1a1aa', fontSize: '0.92rem' }}>
            Control de stock, variantes de condición (PSA 10, RAW) y precios en tiempo real.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          style={{
            backgroundColor: '#10b981',
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
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            transition: 'transform 0.15s ease'
          }}
        >
          <span>➕</span> Agregar Nuevo Listing
        </button>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>TOTAL LISTINGS</span>
            <span style={{ fontSize: '1.3rem' }}>🏷️</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f4f4f5', marginTop: '0.4rem' }}>{totalListings}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Variantes de producto en tienda</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>DISPONIBLES</span>
            <span style={{ fontSize: '1.3rem' }}>🟢</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.4rem' }}>{availableListings}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Con stock disponible</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>UNIDADES DE STOCK</span>
            <span style={{ fontSize: '1.3rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.4rem' }}>{totalStockUnits}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Unidades físicas en almacén</div>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa', fontWeight: 600 }}>VALORACIÓN DE STOCK</span>
            <span style={{ fontSize: '1.3rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.4rem' }}>
            ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.2rem' }}>Valor total en inventario</div>
        </div>
      </div>

      {/* Toolbar Filters */}
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
        <div style={{ flex: 2, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por carta, SKU o condición..."
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

        <div style={{ flex: 1, minWidth: '160px' }}>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
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
            <option value="ALL">Todas las Condiciones</option>
            <option value="NEAR_MINT">Near Mint (RAW)</option>
            <option value="PSA_10">PSA 10 Gem Mint</option>
            <option value="LIGHTLY_PLAYED">Lightly Played</option>
            <option value="HEAVILY_PLAYED">Heavily Played</option>
          </select>
        </div>

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
            <option value="AVAILABLE">Disponible</option>
            <option value="OUT_OF_STOCK">Agotado</option>
            <option value="RESERVED">Reservado</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
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
              <th style={{ padding: '1rem 1.25rem' }}>Producto / Carta</th>
              <th style={{ padding: '1rem 1.25rem' }}>SKU</th>
              <th style={{ padding: '1rem 1.25rem' }}>Condición</th>
              <th style={{ padding: '1rem 1.25rem' }}>Precio (USD)</th>
              <th style={{ padding: '1rem 1.25rem' }}>Stock</th>
              <th style={{ padding: '1rem 1.25rem' }}>Estado</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#a1a1aa' }}>
                  Cargando productos de la base de datos...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#71717a' }}>
                  No hay productos registrados en el sistema.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {prod.imageUrl ? (
                        <img src={prod.imageUrl} alt={prod.cardName} style={{ width: '38px', height: '52px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '38px', height: '52px', borderRadius: '4px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎴</div>
                      )}
                      <span style={{ fontWeight: 700, color: '#f4f4f5' }}>{prod.cardName}</span>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: '#a1a1aa', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {prod.sku}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: '#38bdf8', fontWeight: 600 }}>
                    {prod.condition}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: '#10b981', fontWeight: 800, fontSize: '1rem' }}>
                    ${prod.price.toFixed(2)}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: prod.stock > 0 ? '#f4f4f5' : '#ef4444', fontWeight: 700 }}>
                    {prod.stock} un.
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: prod.status === 'AVAILABLE' && prod.stock > 0 ? '#064e3b' : '#7f1d1d',
                      color: prod.status === 'AVAILABLE' && prod.stock > 0 ? '#34d399' : '#fca5a5'
                    }}>
                      {prod.status === 'AVAILABLE' && prod.stock > 0 ? 'DISPONIBLE' : 'AGOTADO'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEditOpen(prod)}
                        style={{
                          backgroundColor: '#3f3f46',
                          color: '#f4f4f5',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.7rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => setDeletingProduct(prod)}
                        style={{
                          backgroundColor: '#7f1d1d',
                          color: '#fca5a5',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.45rem 0.7rem',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
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
        <ModalWrapper title="🏷️ Agregar Nuevo Listing de Producto" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Seleccionar Carta Asociada</label>
              <select
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">-- Selecciona una carta --</option>
                {cardsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (#{c.number})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Condición</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={inputStyle}
                >
                  <option value="NEAR_MINT">Near Mint (RAW)</option>
                  <option value="PSA_10">PSA 10 Gem Mint</option>
                  <option value="LIGHTLY_PLAYED">Lightly Played</option>
                  <option value="HEAVILY_PLAYED">Heavily Played</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Precio (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stock Disponible</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="OUT_OF_STOCK">Agotado</option>
                  <option value="RESERVED">Reservado</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} style={submitBtnStyle}>
                {isSubmitting ? 'Guardando...' : 'Crear Listing'}
              </button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* EDIT MODAL */}
      {editingProduct && (
        <ModalWrapper title={`Editar Product Listing: ${editingProduct.cardName}`} onClose={() => setEditingProduct(null)}>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Condición</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  style={inputStyle}
                >
                  <option value="NEAR_MINT">Near Mint (RAW)</option>
                  <option value="PSA_10">PSA 10 Gem Mint</option>
                  <option value="LIGHTLY_PLAYED">Lightly Played</option>
                  <option value="HEAVILY_PLAYED">Heavily Played</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Precio (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Stock Disponible</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={inputStyle}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="OUT_OF_STOCK">Agotado</option>
                  <option value="RESERVED">Reservado</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setEditingProduct(null)} style={cancelBtnStyle}>
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
      {deletingProduct && (
        <ModalWrapper title="Confirmar Eliminación" onClose={() => setDeletingProduct(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#7f1d1d20', border: '1px solid #ef4444', borderRadius: '8px', padding: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
              ⚠️ <strong>¡Atención!</strong> Esta acción eliminará el listing <strong>"{deletingProduct.cardName}" ({deletingProduct.sku})</strong> del mercado.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setDeletingProduct(null)} style={cancelBtnStyle}>
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
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar Listing'}
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
  backgroundColor: '#10b981',
  color: '#09090b',
  fontWeight: 700,
  cursor: 'pointer'
};
