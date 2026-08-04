const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Seeding visual presets and linking rarities...');

  // 1. Upsert all shader presets
  const presets = [
    {
      id: 'preset-holo-base-001',
      name: 'Standard Holo Foil',
      shader: 'basic-foil',
      material: 'StandardHoloMaterial',
      foil: 'linear-rainbow',
      intensity: 60,
    },
    {
      id: 'preset-rainbow-hyper-001',
      name: 'Rainbow Hyper Rare',
      shader: 'rainbow-hyper',
      material: 'RainbowSpectralMaterial',
      foil: 'spectral-full',
      intensity: 80,
    },
    {
      id: 'preset-gold-relic-001',
      name: 'Gold Metallic Specular',
      shader: 'gold-relic',
      material: 'GoldMetallicMaterial',
      foil: 'gold-specular',
      intensity: 75,
    },
    {
      id: 'preset-glass-shatter-001',
      name: 'Diamond Shattered Glass',
      shader: 'glass-shatter',
      material: 'DiamondFacetMaterial',
      foil: 'faceted-glass',
      intensity: 50,
    },
    {
      id: 'preset-promo-glow-001',
      name: 'Promotional Edge Glow',
      shader: 'promo-glow',
      material: 'PromoNeonMaterial',
      foil: 'edge-neon',
      intensity: 70,
    },
  ];

  for (const preset of presets) {
    const result = await prisma.visualPreset.upsert({
      where: { id: preset.id },
      update: {
        shader: preset.shader,
        material: preset.material,
        foil: preset.foil,
        intensity: preset.intensity,
        name: preset.name,
      },
      create: preset,
    });
    console.log(`  ✅ Preset: ${result.name} (shader: ${result.shader})`);
  }

  // 2. Link each rarity to its correct shader preset
  const rarityPresetMap = [
    { name: '1-Star Rare', presetId: 'preset-holo-base-001' },
    { name: '2-Star Secret Rare', presetId: 'preset-glass-shatter-001' },
    { name: 'Secret Rare', presetId: 'preset-glass-shatter-001' },
    { name: 'Gold Ultra Rare', presetId: 'preset-gold-relic-001' },
    { name: 'Rainbow Hyper Rare', presetId: 'preset-rainbow-hyper-001' },
    { name: 'Promotional', presetId: 'preset-promo-glow-001' },
  ];

  for (const mapping of rarityPresetMap) {
    const rarity = await prisma.rarity.findFirst({ where: { name: mapping.name } });
    if (rarity) {
      await prisma.rarity.update({
        where: { id: rarity.id },
        data: { presetId: mapping.presetId },
      });
      console.log(`  🎨 Rarity "${mapping.name}" → shader: ${presets.find(p => p.id === mapping.presetId)?.shader}`);
    } else {
      console.log(`  ⚠️ Rarity "${mapping.name}" not found in DB, skipping.`);
    }
  }

  console.log('\n✨ Done! All rarities now have distinct shader presets.');
}

main()
  .catch((e) => {
    console.error('Error seeding presets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
