// seed-rarities.js — Rarezas estándar Pokémon TCG Pocket
// Ejecutar con: node prisma/seed-rarities.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Las 10 rarezas de Pokémon TCG Pocket (en orden de la imagen de referencia)
const RARITIES = [
  { level: 'COMMON',           name: 'Common',           icon: '◆',        color: '#94a3b8' },
  { level: 'UNCOMMON',         name: 'Uncommon',         icon: '◆◆',       color: '#60a5fa' },
  { level: 'RARE',             name: 'Rare',             icon: '◆◆◆',      color: '#34d399' },
  { level: 'DOUBLE_RARE',      name: 'Double Rare',      icon: '◆◆◆◆',     color: '#a78bfa' },
  { level: 'STAR_1',           name: '1-Star Rare',      icon: '⭐',        color: '#fbbf24' },
  { level: 'STAR_2',           name: '2-Star Rare',      icon: '⭐⭐',       color: '#f59e0b' },
  { level: 'STAR_3',           name: '3-Star Rare',      icon: '⭐⭐⭐',      color: '#f97316' },
  { level: 'IMMERSIVE',        name: 'Immersive Rare',   icon: '✦',         color: '#e879f9' },
  { level: 'DOUBLE_IMMERSIVE', name: 'Double Immersive', icon: '✦✦',        color: '#c026d3' },
  { level: 'CROWN',            name: 'Crown Rare',       icon: '👑',        color: '#eab308' },
];

async function main() {
  console.log('🌱 Sembrando rarezas Pokémon TCG Pocket...\n');

  for (const r of RARITIES) {
    // Intentar upsert por level
    try {
      const result = await prisma.rarity.upsert({
        where: { level: r.level },
        update: { name: r.name, icon: r.icon, color: r.color },
        create: { name: r.name, level: r.level, icon: r.icon, color: r.color },
      });
      console.log(`  ✅ ${r.icon.padEnd(6)} ${r.name} (${r.level})`);
    } catch (e) {
      console.error(`  ❌ Error en ${r.name}:`, e.message);
    }
  }

  // Eliminar rarezas que ya no corresponden al esquema TCG Pocket
  const obsoleteLevels = ['GOLD', 'RAINBOW', 'SECRET', 'PROMO'];
  for (const oldLevel of obsoleteLevels) {
    try {
      await prisma.rarity.deleteMany({ where: { level: oldLevel } });
      console.log(`  🗑️  Rareza obsoleta eliminada: ${oldLevel}`);
    } catch (e) {
      // puede que ya no existan — ignorar
    }
  }

  const total = await prisma.rarity.count();
  console.log(`\n✨ Total de rarezas en BD: ${total}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
