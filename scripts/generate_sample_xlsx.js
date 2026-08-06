// Generate a sample .xlsx file containing cards data
// Usage:
// 1) Install dependencies: `pnpm install` (root) or `pnpm install xlsx` in this folder
// 2) Run: `node scripts/generate_sample_xlsx.js`
// This will create `scripts/sample_cards.xlsx` with example rows.

(async () => {
  try {
    const XLSX = require('xlsx');
    const fs = require('fs');
    const path = require('path');

    const rows = [
      {
        id: 'bd0093f0-test',
        name: 'test',
        number: '123',
        collectionId: '1576a5a9-fcaa-4ab4-af3e-145c5f563896',
        rarityId: '5f563896-b57f-4c72-9cb3-833727f45c5c',
        energyTypeId: '5cc929c6-b2a4-4251-b437-3aacf4IYCtq',
        imageFilename: 'test-image.webp',
        price: 49.99,
        stock: 10,
        status: 'PUBLISHED',
        description: 'Imported sample card'
      },
      {
        id: '',
        name: 'Import Test',
        number: 'IMP-001',
        collectionId: '',
        rarityId: '',
        energyTypeId: '',
        imageFilename: '',
        price: 19.99,
        stock: 5,
        status: 'PUBLISHED',
        description: 'Sample card imported from XLSX'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'cards');

    const outPath = path.join(__dirname, 'sample_cards.xlsx');
    XLSX.writeFile(wb, outPath);

    console.log('Wrote', outPath);
  } catch (err) {
    console.error('Failed to generate .xlsx — make sure the package "xlsx" is installed.');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
})();
