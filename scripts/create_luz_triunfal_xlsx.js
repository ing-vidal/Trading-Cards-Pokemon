const fs = require('fs');
const path = require('path');
const XLSX = require('../apps/admin/node_modules/xlsx');

const rawCards = `
Heracross|A2a-001|Luz Triunfal|Planta|Dos Diamantes
Burmy|A2a-002|Luz Triunfal|Planta|Un Diamante
Mothim|A2a-003|Luz Triunfal|Planta|Dos Diamantes
Combee|A2a-004|Luz Triunfal|Planta|Un Diamante
Vespiquen|A2a-005|Luz Triunfal|Planta|Dos Diamantes
Cherubi|A2a-006|Luz Triunfal|Planta|Un Diamante
Cherrim|A2a-007|Luz Triunfal|Planta|Dos Diamantes
Cherrim|A2a-008|Luz Triunfal|Planta|Dos Diamantes
Carnivine|A2a-009|Luz Triunfal|Planta|Un Diamante
Leafeon ex|A2a-010|Luz Triunfal|Planta|Dos Diamantes
Houndour|A2a-011|Luz Triunfal|Oscura|Un Diamante
Houndoom|A2a-012|Luz Triunfal|Oscura|Dos Diamantes
Heatran|A2a-013|Luz Triunfal|Fuego|Un Diamante
Marill|A2a-014|Luz Triunfal|Agua|Un Diamante
Azumarill|A2a-015|Luz Triunfal|Agua|Dos Diamantes
Barboach|A2a-016|Luz Triunfal|Agua|Un Diamante
Whiscash|A2a-017|Luz Triunfal|Agua|Dos Diamantes
Snorunt|A2a-018|Luz Triunfal|Agua|Un Diamante
Froslass|A2a-019|Luz Triunfal|Psíquico|Un Diamante
Snover|A2a-020|Luz Triunfal|Planta|Un Diamante
Abomasnow|A2a-021|Luz Triunfal|Planta|Dos Diamantes
Glaceon ex|A2a-022|Luz Triunfal|Agua|Dos Diamantes
Palkia Origen|A2a-023|Luz Triunfal|Agua|Tres Diamantes
Phione|A2a-024|Luz Triunfal|Agua|Un Diamante
Pikachu|A2a-025|Luz Triunfal|Eléctrico|Un Diamante
Raichu|A2a-026|Luz Triunfal|Eléctrico|Dos Diamantes
Electrike|A2a-027|Luz Triunfal|Eléctrico|Un Diamante
Manectric|A2a-028|Luz Triunfal|Eléctrico|Dos Diamantes
Clefairy|A2a-029|Luz Triunfal|Incolora|Un Diamante
Clefable|A2a-030|Luz Triunfal|Incolora|Dos Diamantes
Gastly|A2a-031|Luz Triunfal|Oscura|Un Diamante
Haunter|A2a-032|Luz Triunfal|Oscura|Un Diamante
Gengar|A2a-033|Luz Triunfal|Oscura|Dos Diamantes
Unown|A2a-034|Luz Triunfal|Psíquico|Un Diamante
Rotom|A2a-035|Luz Triunfal|Rayo|Un Diamante
Sudowoodo|A2a-036|Luz Triunfal|Lucha|Un Diamante
Togepi|A2a-037|Luz Triunfal|Incolora|Un Diamante
Togetic|A2a-038|Luz Triunfal|Incolora|Dos Diamantes
Togekiss|A2a-039|Luz Triunfal|Incolora|Tres Diamantes
Heracross|A2a-040|Luz Triunfal|Lucha|Un Diamante
Miltank|A2a-041|Luz Triunfal|Normal|Un Diamante
Chansey|A2a-042|Luz Triunfal|Incolora|Un Diamante
Skarmory|A2a-043|Luz Triunfal|Metal|Un Diamante
Braviary|A2a-044|Luz Triunfal|Volador|Un Diamante
Noctowl|A2a-045|Luz Triunfal|Volador|Un Diamante
Inkay|A2a-046|Luz Triunfal|Psíquico|Un Diamante
Malamar|A2a-047|Luz Triunfal|Psíquico|Dos Diamantes
Starly|A2a-048|Luz Triunfal|Incolora|Un Diamante
Staravia|A2a-049|Luz Triunfal|Incolora|Un Diamante
Staraptor ex|A2a-050|Luz Triunfal|Incolora|Cuatro Diamantes
Murkrow|A2a-051|Luz Triunfal|Oscura|Un Diamante
Honchkrow|A2a-052|Luz Triunfal|Oscura|Dos Diamantes
Sneasel|A2a-053|Luz Triunfal|Oscura|Un Diamante
Weavile ex|A2a-054|Luz Triunfal|Oscura|Cuatro Diamantes
Pichu|A2a-055|Luz Triunfal|Eléctrico|Un Diamante
Cleffa|A2a-056|Luz Triunfal|Incolora|Un Diamante
Jigglypuff|A2a-057|Luz Triunfal|Incolora|Un Diamante
Wigglytuff|A2a-058|Luz Triunfal|Incolora|Dos Diamantes
Zubat|A2a-059|Luz Triunfal|Psíquico|Un Diamante
Golbat|A2a-060|Luz Triunfal|Psíquico|Dos Diamantes
Crobat|A2a-061|Luz Triunfal|Psíquico|Tres Diamantes
Altaria|A2a-062|Luz Triunfal|Dragón|Un Diamante
Sableye|A2a-063|Luz Triunfal|Oscura|Un Diamante
Swablu|A2a-064|Luz Triunfal|Dragón|Un Diamante
Zangoose|A2a-065|Luz Triunfal|Normal|Un Diamante
Seviper|A2a-066|Luz Triunfal|Veneno|Un Diamante
Ninjask|A2a-067|Luz Triunfal|Incolora|Un Diamante
Shedinja|A2a-068|Luz Triunfal|Incolora|Un Diamante
Aron|A2a-069|Luz Triunfal|Metal|Un Diamante
Lairon|A2a-070|Luz Triunfal|Metal|Dos Diamantes
Aggron|A2a-071|Luz Triunfal|Metal|Tres Diamantes
Tynamo|A2a-072|Luz Triunfal|Rayo|Un Diamante
Eelektrik|A2a-073|Luz Triunfal|Rayo|Un Diamante
Eelektross|A2a-074|Luz Triunfal|Rayo|Dos Diamantes
Misdreavus|A2a-075|Luz Triunfal|Psíquico|Un Diamante
Mismagius ex|A2a-076|Luz Triunfal|Psíquico|Cuatro Diamantes
Drifloon|A2a-077|Luz Triunfal|Psíquico|Un Diamante
Drifblim|A2a-078|Luz Triunfal|Psíquico|Dos Diamantes
Druddigon|A2a-079|Luz Triunfal|Dragón|Un Diamante
Gible|A2a-080|Luz Triunfal|Dragón|Dos Diamantes
Gabite|A2a-081|Luz Triunfal|Dragón|Dos Diamantes
Garchomp ex|A2a-082|Luz Triunfal|Dragón|Dos Estrellas
Buizel|A2a-083|Luz Triunfal|Agua|Un Diamante
Floatzel|A2a-084|Luz Triunfal|Agua|Dos Diamantes
Cherubi|A2a-085|Luz Triunfal|Planta|Una Estrella
Cherrim|A2a-086|Luz Triunfal|Planta|Una Estrella
Gastly|A2a-087|Luz Triunfal|Oscura|Una Estrella
Haunter|A2a-088|Luz Triunfal|Oscura|Una Estrella
Gengar|A2a-089|Luz Triunfal|Oscura|Dos Estrellas
Rotom|A2a-090|Luz Triunfal|Rayo|Una Estrella
Beldum|A2a-091|Luz Triunfal|Metal|Un Diamante
Glaceon ex|A2a-092|Luz Triunfal|Agua|Dos Estrellas
Garchomp ex|A2a-093|Luz Triunfal|Lucha|Dos Estrellas
Probopass ex|A2a-094|Luz Triunfal|Metálica|Dos Estrellas
Arceus ex|A2a-095|Luz Triunfal|Incolora|Tres Estrellas
Arceus ex|A2a-096|Luz Triunfal|Incolora|Corona
`.trim();

const rarityMap = {
  'Un Diamante': 'Common',
  'Dos Diamantes': 'Uncommon',
  'Tres Diamantes': 'Rare',
  'Cuatro Diamantes': 'Double Rare',
  'Una Estrella': '1 Star Rare',
  'Dos Estrellas': '2 Star Rare',
  'Tres Estrellas': '3 Star Rare',
  'Un Variocolor': 'Immersive Rare',
  'Dos Variocolor': 'Double Immersive',
  'Corona': 'Crown Rare',
};

const energyMap = {
  'Rayo': 'Eléctrico',
  'Magia': 'Fantasma',
  'Metálica': 'Metálico',
  'Metal': 'Metálico',
  'Incolora': 'Incoloro',
  'Oscura': 'Oscuridad',
};

const cards = rawCards.split('\n').map((line) => {
  const [name, number, collectionId, rawEnergy, rawRarity] = line.split('|');
  const energyTypeId = rawEnergy ? (energyMap[rawEnergy] || rawEnergy) : '';
  return {
    id: '',
    name,
    number,
    collectionId,
    rarityId: rarityMap[rawRarity] || rawRarity,
    energyTypeId,
    cardType: energyTypeId ? 'POKEMON' : 'PARTIDARIO',
    imageFilename: `${number}.png`,
    price: 100,
    stock: 10,
    status: 'PUBLISHED',
  };
});

if (cards.length !== 96 || cards[0].number !== 'A2a-001' || cards.at(-1).number !== 'A2a-096') {
  throw new Error(`Unexpected card count or sequence: ${cards.length}`);
}

const worksheet = XLSX.utils.json_to_sheet(cards, {
  header: ['id', 'name', 'number', 'collectionId', 'rarityId', 'energyTypeId', 'cardType', 'imageFilename', 'price', 'stock', 'status'],
});
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'cards');
const outputPath = path.join(__dirname, '..', 'assets', 'Luz Triunfal.xlsx');
XLSX.writeFile(workbook, outputPath);
console.log(`Created ${outputPath} with ${cards.length} cards.`);
