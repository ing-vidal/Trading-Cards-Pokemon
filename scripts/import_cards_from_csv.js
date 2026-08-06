(async () => {
  const fs = require('fs');
  const path = require('path');
  const API = process.env.API_URL || 'https://trading-cards-pokemon.onrender.com';
  const file = path.join(__dirname, 'sample_cards.csv');
  if (!fs.existsSync(file)) {
    console.error('Sample CSV not found:', file);
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    // naive CSV split (no quoted commas)
    const cols = line.split(',');
    const obj = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = (cols[i] || '').trim();
    return obj;
  });

  for (const r of rows) {
    const payload = {
      name: r.name,
      number: r.number,
      collectionId: r.collectionId || undefined,
      rarityId: r.rarityId || undefined,
      energyTypeId: r.energyTypeId || undefined,
      price: r.price ? Number(r.price) : undefined,
      stock: r.stock ? Number(r.stock) : undefined,
      status: r.status || undefined,
      description: r.description || undefined,
    };

    try {
      if (r.id) {
        const res = await fetch(`${API}/api/cards/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const body = await (res.ok ? res.json() : res.text());
        console.log('Updated', r.id, 'status', res.status, body && (typeof body === 'object' ? JSON.stringify(body).slice(0,200) : body));
      } else {
        const res = await fetch(`${API}/api/cards`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const body = await (res.ok ? res.json() : res.text());
        console.log('Created status', res.status, body && (typeof body === 'object' ? JSON.stringify(body).slice(0,200) : body));
      }
    } catch (err) {
      console.error('Network error for row', r, err.message || err);
    }
  }
})();
