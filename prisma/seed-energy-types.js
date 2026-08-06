// seed-energy-types.js — Los 10 tipos de energía de Pokémon TCG Pocket
// Ejecutar con: node prisma/seed-energy-types.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Los 10 tipos según el screenshot de referencia
const ENERGY_TYPES = [
  { name: 'Incolora',   slug: 'incolora',  icon: '⬡', color: '#f4f4f5' },
  { name: 'Oscura',     slug: 'oscura',    icon: '🌑', color: '#6b7280' },
  { name: 'Dragón',     slug: 'dragon',    icon: '🐉', color: '#6366f1' },
  { name: 'Lucha',      slug: 'lucha',     icon: '🥊', color: '#f97316' },
  { name: 'Fuego',      slug: 'fuego',     icon: '🔥', color: '#ef4444' },
  { name: 'Planta',     slug: 'planta',    icon: '🌿', color: '#22c55e' },
  { name: 'Eléctrico',  slug: 'electrico', icon: '⚡', color: '#eab308' },
  { name: 'Metálico',   slug: 'metalico',  icon: '⚙️', color: '#94a3b8' },
  { name: 'Psíquico',   slug: 'psiquico',  icon: '🔮', color: '#a855f7' },
  { name: 'Agua',       slug: 'agua',      icon: '💧', color: '#3b82f6' },
];

async function main() {
  console.log('🌱 Sembrando los 10 tipos de energía Pokémon TCG Pocket...\n');

  // Eliminar tipos que ya no corresponden (los que no están en la lista)
  const slugsToKeep = ENERGY_TYPES.map(e => e.slug);
  const deleted = await prisma.energyType.deleteMany({
    where: { slug: { notIn: slugsToKeep } }
  });
  if (deleted.count > 0) console.log(`  🗑️  Eliminados ${deleted.count} tipos obsoletos\n`);

  for (const energyType of ENERGY_TYPES) {
    const result = await prisma.energyType.upsert({
      where: { slug: energyType.slug },
      update: { name: energyType.name, icon: energyType.icon, color: energyType.color },
      create: energyType,
    });
    console.log(`  ✅ ${result.icon.padEnd(4)} ${result.name}`);
  }

  const total = await prisma.energyType.count();
  console.log(`\n✨ Total tipos de energía en BD: ${total}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
