(async () => {
  const API = process.env.API_URL || 'https://trading-cards-pokemon.onrender.com';
  console.log('Using API base:', API);
  const fetch = globalThis.fetch || (await import('node-fetch')).default;

  try {
    const cardsRes = await fetch(`${API}/api/cards`);
    if (!cardsRes.ok) throw new Error('Failed fetching cards: ' + cardsRes.status);
    const cardsJson = await cardsRes.json();
    const card = Array.isArray(cardsJson.data) ? cardsJson.data[0] : cardsJson[0];
    if (!card) {
      console.error('No cards found to test.');
      process.exit(1);
    }
    console.log('Found card id:', card.id, 'name:', card.name);

    const raritiesRes = await fetch(`${API}/api/rarities`);
    const rarities = raritiesRes.ok ? await raritiesRes.json() : [];
    const energyRes = await fetch(`${API}/api/energy-types`);
    const energies = energyRes.ok ? await energyRes.json() : [];

    const newRarity = (Array.isArray(rarities) && rarities[1]) || rarities[0] || null;
    const newEnergy = (Array.isArray(energies) && energies[1]) || energies[0] || null;

    if (!newRarity && !newEnergy) {
      console.error('No rarities or energy types available to assign.');
      process.exit(1);
    }

    const payload = {};
    if (newRarity) payload.rarityId = newRarity.id;
    if (newEnergy) payload.energyTypeId = newEnergy.id;

    console.log('Updating card with:', payload);
    const putRes = await fetch(`${API}/api/cards/${card.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('PUT status:', putRes.status);
    const after = await (putRes.ok ? putRes.json() : putRes.text());
    console.log('PUT response:', after);

    const verifyRes = await fetch(`${API}/api/cards/${card.id}`);
    if (!verifyRes.ok) {
      console.error('Failed to fetch card after update:', verifyRes.status);
      process.exit(1);
    }
    const verified = await verifyRes.json();
    console.log('Verified card rarityId:', verified.rarityId, 'energyTypeId:', verified.energyTypeId);
  } catch (err) {
    console.error('Error during test:', err.message || err);
    process.exit(1);
  }
})();
