import { PrismaClient, RoleType, RarityLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seeding de la base de datos TCG Vision...');

  // 1. Crear Roles por Defecto
  const roles = [
    { name: RoleType.SUPER_ADMIN, description: 'Administrador total del sistema con acceso completo.' },
    { name: RoleType.CONTENT_MANAGER, description: 'Gestor de contenidos, cartas, colecciones y categorías.' },
    { name: RoleType.DESIGNER, description: 'Diseñador visual de rarezas, shaders y presets 3D.' },
    { name: RoleType.CUSTOMER, description: 'Usuario final registrado para compras y colecciones personales.' },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
  }
  console.log('✅ Roles creados o actualizados.');

  // 2. Crear Visual Presets Base
  const defaultPreset = await prisma.visualPreset.upsert({
    where: { id: 'preset-holo-base-001' },
    update: {},
    create: {
      id: 'preset-holo-base-001',
      name: 'Standard Holo Foil',
      shader: 'basic-foil',
      material: 'StandardHoloMaterial',
      foil: 'linear-rainbow',
      intensity: 60,
    },
  });
  console.log('✅ Preset visual base creado.');

  // 3. Crear Rarezas por Defecto
  const rarities = [
    { name: '1-Star Rare', level: RarityLevel.STAR_1, color: '#3b82f6', presetId: defaultPreset.id },
    { name: '2-Star Secret Rare', level: RarityLevel.STAR_2, color: '#8b5cf6', presetId: defaultPreset.id },
    { name: 'Gold Ultra Rare', level: RarityLevel.GOLD, color: '#eab308', presetId: defaultPreset.id },
    { name: 'Rainbow Hyper Rare', level: RarityLevel.RAINBOW, color: '#ec4899', presetId: defaultPreset.id },
    { name: 'Secret Rare', level: RarityLevel.SECRET, color: '#a855f7', presetId: defaultPreset.id },
    { name: 'Promotional', level: RarityLevel.PROMO, color: '#10b981', presetId: null },
  ];

  for (const rarityData of rarities) {
    await prisma.rarity.upsert({
      where: { level: rarityData.level },
      update: { name: rarityData.name, color: rarityData.color, presetId: rarityData.presetId },
      create: rarityData,
    });
  }
  console.log('✅ Rarezas iniciales creadas.');

  // 4. Crear Colección de Prueba
  const collection = await prisma.collection.upsert({
    where: { code: 'BASE1' },
    update: {},
    create: {
      name: 'Base Set',
      slug: 'base-set',
      code: 'BASE1',
      releaseDate: new Date('1999-01-09'),
      description: 'Colección icónica original de Pokémon TCG.',
    },
  });
  console.log(`✅ Colección "${collection.name}" creada.`);

  // 5. Crear Categorías Iniciales
  const categories = [
    { name: 'Pokémon', slug: 'pokemon', description: 'Cartas de Criaturas Pokémon' },
    { name: 'Trainer', slug: 'trainer', description: 'Cartas de Entrenador y Objetos' },
    { name: 'Energy', slug: 'energy', description: 'Cartas de Energía' },
  ];

  for (const catData of categories) {
    await prisma.category.upsert({
      where: { slug: catData.slug },
      update: { description: catData.description },
      create: catData,
    });
  }
  console.log('✅ Categorías iniciales creadas.');

  console.log('🌱 Seeding de la base de datos completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en Seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
