// reset-rarities-sql.js — Solo SQL directo, sin ORM de Prisma
// Usa el driver de postgres directamente
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Paso 1: Buscar id de rareza STAR_1 para reasignar cartas...');
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id FROM "rarities" WHERE "level"::text = 'STAR_1' LIMIT 1`
  );
  const star1Id = rows[0]?.id;
  console.log(`   STAR_1 id: ${star1Id}`);

  if (star1Id) {
    console.log('🧹 Paso 2: Reasignar cartas de rarezas obsoletas a STAR_1...');
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE "cards" SET "rarity_id" = '${star1Id}' WHERE "rarity_id" IN (
        SELECT id FROM "rarities" WHERE "level"::text IN ('GOLD','RAINBOW','SECRET','PROMO')
      )`
    );
    console.log(`   Cartas actualizadas: ${updated}`);
  }

  console.log('🧹 Paso 3: Eliminar rarezas obsoletas...');
  const deleted = await prisma.$executeRawUnsafe(
    `DELETE FROM "rarities" WHERE "level"::text IN ('GOLD','RAINBOW','SECRET','PROMO')`
  );
  console.log(`   Rarezas eliminadas: ${deleted}`);

  console.log('🧹 Paso 4: Convertir columna level a TEXT...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "rarities" ALTER COLUMN "level" TYPE TEXT`);

  console.log('🧹 Paso 5: Eliminar enum RarityLevel antiguo...');
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "RarityLevel" CASCADE`);

  console.log('🧹 Paso 6: Crear nuevo enum RarityLevel con 10 valores TCG Pocket...');
  await prisma.$executeRawUnsafe(
    `CREATE TYPE "RarityLevel" AS ENUM ('COMMON','UNCOMMON','RARE','DOUBLE_RARE','STAR_1','STAR_2','STAR_3','IMMERSIVE','DOUBLE_IMMERSIVE','CROWN')`
  );

  console.log('🧹 Paso 7: Reconvertir columna al nuevo enum...');
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "rarities" ALTER COLUMN "level" TYPE "RarityLevel" USING "level"::"RarityLevel"`
  );

  console.log('🧹 Paso 8: Recrear unique constraint...');
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "rarities" ADD CONSTRAINT "rarities_level_key" UNIQUE ("level")`
    );
  } catch (e) { console.log('  (unique ya existe, ok)'); }

  const countRows = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM "rarities"`);
  console.log(`\n✅ Listo! Rarezas en BD: ${countRows[0].cnt}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
