/**
 * Seed script: crea los 18 tipos de energía estándar de Pokémon TCG
 * Ejecutar con: npx ts-node prisma/seed-energy-types.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ENERGY_TYPES = [
  { name: 'Fuego',      slug: 'fuego',      icon: '🔥', color: '#ef4444' },
  { name: 'Agua',       slug: 'agua',       icon: '💧', color: '#3b82f6' },
  { name: 'Eléctrico',  slug: 'electrico',  icon: '⚡', color: '#eab308' },
  { name: 'Planta',     slug: 'planta',     icon: '🌿', color: '#22c55e' },
  { name: 'Psíquico',   slug: 'psiquico',   icon: '🔮', color: '#a855f7' },
  { name: 'Lucha',      slug: 'lucha',      icon: '🥊', color: '#f97316' },
  { name: 'Oscuridad',  slug: 'oscuridad',  icon: '🌑', color: '#6b7280' },
  { name: 'Metal',      slug: 'metal',      icon: '⚙️', color: '#94a3b8' },
  { name: 'Dragón',     slug: 'dragon',     icon: '🐉', color: '#6366f1' },
  { name: 'Incoloro',   slug: 'incoloro',   icon: '🌟', color: '#f4f4f5' },
  { name: 'Hielo',      slug: 'hielo',      icon: '❄️', color: '#67e8f9' },
  { name: 'Hada',       slug: 'hada',       icon: '🌸', color: '#f9a8d4' },
  { name: 'Fantasma',   slug: 'fantasma',   icon: '👻', color: '#818cf8' },
  { name: 'Normal',     slug: 'normal',     icon: '🦅', color: '#d4d4d8' },
  { name: 'Roca',       slug: 'roca',       icon: '🪨', color: '#a78bfa' },
  { name: 'Tierra',     slug: 'tierra',     icon: '🌍', color: '#92400e' },
  { name: 'Volador',    slug: 'volador',    icon: '💨', color: '#bae6fd' },
  { name: 'Veneno',     slug: 'veneno',     icon: '🧬', color: '#84cc16' },
];

async function main() {
  console.log('🌱 Sembrando tipos de energía Pokémon TCG...');

  for (const energyType of ENERGY_TYPES) {
    const result = await prisma.energyType.upsert({
      where: { slug: energyType.slug },
      update: {
        name: energyType.name,
        icon: energyType.icon,
        color: energyType.color,
      },
      create: energyType,
    });
    console.log(`  ✅ ${result.icon} ${result.name}`);
  }

  console.log(`\n✨ ${ENERGY_TYPES.length} tipos de energía creados/actualizados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
