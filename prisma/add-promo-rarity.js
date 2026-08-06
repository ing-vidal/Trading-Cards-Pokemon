// add-promo-rarity.js — Agrega PROMO al enum RarityLevel en PostgreSQL
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // PostgreSQL permite agregar valores a un enum existente
  await prisma.$executeRawUnsafe(`ALTER TYPE "RarityLevel" ADD VALUE IF NOT EXISTS 'PROMO'`);
  console.log('✅ PROMO agregado al enum RarityLevel');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
