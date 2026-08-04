'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface UserCardItem {
  id: string;
  name: string;
  number: string;
  collection: string;
  rarity: string;
  condition: string;
  quantity: number;
  estimatedValue: number;
  favorite: boolean;
}

const INITIAL_USER_CARDS: UserCardItem[] = [
  { id: '1', name: 'Charizard VMAX', number: '004/102', collection: 'Base Set', rarity: 'Rainbow Hyper Rare', condition: 'Near Mint', quantity: 1, estimatedValue: 299.99, favorite: true },
  { id: '2', name: 'Pikachu EX Gold', number: '025/102', collection: 'Base Set', rarity: 'Gold Ultra Rare', condition: 'PSA 10', quantity: 2, estimatedValue: 299.00, favorite: true },
  { id: '3', name: 'Blastoise Holo', number: '002/102', collection: 'Base Set', rarity: '1-Star Rare', condition: 'Lightly Played', quantity: 1, estimatedValue: 89.00, favorite: false },
];

export default function MyCollectionPage() {
  const [userCards, setUserCards] = useState<UserCardItem[]>(INITIAL_USER_CARDS);

  const totalValue = userCards.reduce((acc, c) => acc + c.estimatedValue * c.quantity, 0);
  const totalCards = userCards.reduce((acc, c) => acc + c.quantity, 0);

  const toggleFavorite = (id: string) => {
    setUserCards(userCards.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Mi Colección Personal</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.95rem' }}>
              Gestión de tu inventario privado, seguimiento de estados y estimación de valor.
            </p>
          </div>
          <Link href="/catalog" style={{ backgroundColor: '#a855f7', color: '#ffffff', textDecoration: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600 }}>
            + Agregar Cartas
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Total Cartas Guardadas</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>{totalCards} un.</div>
          </div>

          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Valor Estimado Total</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
              ${totalValue.toFixed(2)} USD
            </div>
          </div>

          <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Favoritas</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ec4899', marginTop: '0.25rem' }}>
              {userCards.filter(c => c.favorite).length} cartas
            </div>
          </div>
        </div>

        {/* Collection Table */}
        <div style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#27272a', color: '#a1a1aa', borderBottom: '1px solid #3f3f46' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Fav</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Carta</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Colección</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Rareza</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Condición</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Cant.</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Valor Est.</th>
              </tr>
            </thead>
            <tbody>
              {userCards.map((card) => (
                <tr key={card.id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '1rem 1.25rem', cursor: 'pointer' }} onClick={() => toggleFavorite(card.id)}>
                    {card.favorite ? '⭐' : '☆'}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#f4f4f5' }}>{card.name}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#38bdf8' }}>{card.collection}</td>
                  <td style={{ padding: '1rem 1.25rem', color: '#c084fc' }}>{card.rarity}</td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: '0.8rem' }}>
                      {card.condition}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>{card.quantity}</td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                    ${(card.estimatedValue * card.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
