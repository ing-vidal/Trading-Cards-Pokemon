/*
Import cards from an .xlsx file into the API.
Usage:
  1) Ensure dependencies installed: `pnpm install` (project root)
  2) Run:
     node scripts/import_cards_from_xlsx.js path/to/sample_cards.xlsx

The script reads the first sheet and expects columns:
  id,name,number,collectionId,rarityId,energyTypeId,imageFilename,price,stock,status,description

If `id` is present the script will PUT /api/cards/:id, otherwise POST /api/cards.
If `imageFilename` is set and points to a local file, the script will upload it to /api/assets/upload
(before uploading, ensure the script has access to that local file path).
*/

(async () => {
  const fs = require('fs');
  const path = require('path');
  const fetch = globalThis.fetch || (await import('node-fetch')).default;
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (err) {
    console.error('xlsx module not found. Run `pnpm install` in the repo root to install dependencies.');
    process.exit(1);
  }

  const API = process.env.API_URL || 'https://trading-cards-pokemon.onrender.com';
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: node scripts/import_cards_from_xlsx.js path/to/file.xlsx [imagesFolder]');
    process.exit(1);
  }
  const filePath = path.resolve(argv[0]);
  const imagesFolder = argv[1] ? path.resolve(argv[1]) : null;

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  for (const r of rows) {
    const payload = {
      name: r.name || undefined,
      number: r.number || undefined,
      collectionId: r.collectionId || undefined,
      rarityId: r.rarityId || undefined,
      energyTypeId: r.energyTypeId || undefined,
      price: r.price !== undefined && r.price !== '' ? Number(r.price) : undefined,
      stock: r.stock !== undefined && r.stock !== '' ? Number(r.stock) : undefined,
      status: r.status || undefined,
      description: r.description || undefined,
    };

    // If imageFilename is provided and imagesFolder is set, try to upload
    if (r.imageFilename && imagesFolder) {
      const imgPath = path.join(imagesFolder, r.imageFilename);
      if (fs.existsSync(imgPath)) {
        try {
          const form = new (require('form-data'))();
          form.append('file', fs.createReadStream(imgPath));
          form.append('name', r.imageFilename);
          form.append('type', 'IMAGE');

          const upRes = await fetch(`${API}/api/assets/upload`, { method: 'POST', body: form, headers: form.getHeaders() });
          if (upRes.ok) {
            const asset = await upRes.json();
            payload.imageUrl = asset.url;
            console.log('Uploaded image for', r.name, '->', asset.url);
          } else {
            console.warn('Image upload failed for', imgPath, 'status', upRes.status);
          }
        } catch (err) {
          console.warn('Error uploading image', imgPath, err.message || err);
        }
      } else {
        console.warn('Image file not found:', imgPath);
      }
    }

    try {
      let res;
      if (r.id && r.id.toString().trim()) {
        res = await fetch(`${API}/api/cards/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const body = res.ok ? await res.json() : await res.text();
        console.log('PUT', r.id, '=>', res.status, typeof body === 'object' ? JSON.stringify(body).slice(0,200) : body);
      } else {
        res = await fetch(`${API}/api/cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const body = res.ok ? await res.json() : await res.text();
        console.log('POST', r.name, '=>', res.status, typeof body === 'object' ? JSON.stringify(body).slice(0,200) : body);
      }
    } catch (err) {
      console.error('Network error for row', r.name || r.number, err.message || err);
    }
  }

  console.log('Import finished.');
})();
