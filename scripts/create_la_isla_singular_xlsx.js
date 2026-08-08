const fs = require('fs');
const path = require('path');
const XLSX = require('../apps/admin/node_modules/xlsx');

const rawCards = `
Exeggcute|A1a-001|La Isla Singular|Planta|Un Diamante
Exeggutor|A1a-002|La Isla Singular|Planta|Dos Diamantes
Celebi ex|A1a-003|La Isla Singular|Planta|Cuatro Diamantes
Snivy|A1a-004|La Isla Singular|Planta|Un Diamante
Servine|A1a-005|La Isla Singular|Planta|Dos Diamantes
Serperior|A1a-006|La Isla Singular|Planta|Tres Diamantes
Morelull|A1a-007|La Isla Singular|Planta|Un Diamante
Shiinotic|A1a-008|La Isla Singular|Planta|Dos Diamantes
Dhelmise|A1a-009|La Isla Singular|Planta|Dos Diamantes
Ponyta|A1a-010|La Isla Singular|Guego|Un Diamante
Rapidash|A1a-011|La Isla Singular|Guego|Dos Diamantes
Magmar|A1a-012|La Isla Singular|Guego|Dos Diamantes
Larvesta|A1a-013|La Isla Singular|Guego|Un Diamante
Volcarona|A1a-014|La Isla Singular|Guego|Tres Diamantes
Salandit|A1a-015|La Isla Singular|Guego|Un Diamante
Salazzle|A1a-016|La Isla Singular|Guego|Un Diamante
Magikarp|A1a-017|La Isla Singular|Agua|Un Diamante
Gyarados ex|A1a-018|La Isla Singular|Agua|Cuatro Diamantes
Vaporeon|A1a-019|La Isla Singular|Agua|Tres Diamantes
Finneon|A1a-020|La Isla Singular|Agua|Un Diamante
Lumineon|A1a-021|La Isla Singular|Agua|Dos Diamantes
Chewtle|A1a-022|La Isla Singular|Agua|Un Diamante
Drednaw|A1a-023|La Isla Singular|Agua|Dos Diamantes
Cramorant|A1a-024|La Isla Singular|Agua|Un Diamante
Pikachu|A1a-025|La Isla Singular|Rayo|Un Diamante
Raichu|A1a-026|La Isla Singular|Rayo|Tres Diamantes
Electabuzz|A1a-027|La Isla Singular|Rayo|Dos Diamantes
Joltik|A1a-028|La Isla Singular|Rayo|Un Diamante
Galvantula|A1a-029|La Isla Singular|Rayo|Dos Diamantes
Dedenne|A1a-030|La Isla Singular|Rayo|Un Diamante
Mew|A1a-031|La Isla Singular|Psíquico|Tres Diamantes
Mew ex|A1a-032|La Isla Singular|Psíquico|Cuatro Diamantes
Sigilyph|A1a-033|La Isla Singular|Psíquico|Dos Diamantes
Elgyem|A1a-034|La Isla Singular|Psíquico|Un Diamante
Beheeyem|A1a-035|La Isla Singular|Psíquico|Dos Diamantes
Flabébé|A1a-036|La Isla Singular|Psíquico|Un Diamante
Floette|A1a-037|La Isla Singular|Psíquico|Un Diamante
Florges|A1a-038|La Isla Singular|Psíquico|Dos Diamantes
Swirlix|A1a-039|La Isla Singular|Psíquico|Un Diamante
Slurpuff|A1a-040|La Isla Singular|Psíquico|Un Diamante
Mankey|A1a-041|La Isla Singular|Lucha|Un Diamante
Primeape|A1a-042|La Isla Singular|Lucha|Un Diamante
Geodude|A1a-043|La Isla Singular|Lucha|Un Diamante
Graveler|A1a-044|La Isla Singular|Lucha|Dos Diamantes
Golem|A1a-045|La Isla Singular|Lucha|Tres Diamantes
Aerodactyl ex|A1a-046|La Isla Singular|Lucha|Cuatro Diamantes
Marshadow|A1a-047|La Isla Singular|Lucha|Tres Diamantes
Stonjourner|A1a-048|La Isla Singular|Lucha|Dos Diamantes
Koffing|A1a-049|La Isla Singular|Oscura|Un Diamante
Weezing|A1a-050|La Isla Singular|Oscura|Dos Diamantes
Purrloin|A1a-051|La Isla Singular|Oscura|Un Diamante
Liepard|A1a-052|La Isla Singular|Oscura|Un Diamante
Venipede|A1a-053|La Isla Singular|Oscura|Un Diamante
Whirlipede|A1a-054|La Isla Singular|Oscura|Un Diamante
Scolipede|A1a-055|La Isla Singular|Oscura|Dos Diamantes
Druddigon|A1a-056|La Isla Singular|Dragón|Dos Diamantes
Pidgey|A1a-057|La Isla Singular|Incolora|Un Diamante
Pidgeotto|A1a-058|La Isla Singular|Incolora|Un Diamante
Pidgeot ex|A1a-059|La Isla Singular|Incolora|Cuatro Diamantes
Tauros|A1a-060|La Isla Singular|Incolora|Tres Diamantes
Eevee|A1a-061|La Isla Singular|Incolora|Un Diamante
Chatot|A1a-062|La Isla Singular|Incolora|Un Diamante
Ámbar Viejo|A1a-063|La Isla Singular||Un Diamante
Pokéflauta|A1a-064|La Isla Singular||Dos Diamantes
Losa Singular|A1a-065|La Isla Singular||Dos Diamantes
Explorador Novel|A1a-066|La Isla Singular||Dos Diamantes
Azul|A1a-067|La Isla Singular||Dos Diamantes
Hoja|A1a-068|La Isla Singular||Dos Diamantes
Exeggutor|A1a-069|La Isla Singular|Planta|Una Estrella
Serperior|A1a-070|La Isla Singular|Planta|Una Estrella
Salandit|A1a-071|La Isla Singular|Guego|Una Estrella
Vaporeon|A1a-072|La Isla Singular|Agua|Una Estrella
Dedenne|A1a-073|La Isla Singular|Rayo|Una Estrella
Marshadow|A1a-074|La Isla Singular|Lucha|Una Estrella
Celebi ex|A1a-075|La Isla Singular|Planta|Dos Estrellas
Gyarados ex|A1a-076|La Isla Singular|Agua|Dos Estrellas
Mew ex|A1a-077|La Isla Singular|Psíquico|Dos Estrellas
Aerodactyl ex|A1a-078|La Isla Singular|Lucha|Dos Estrellas
Pidgeot ex|A1a-079|La Isla Singular|Incolora|Dos Estrellas
Explorador Novel|A1a-080|La Isla Singular||Dos Estrellas
Azul|A1a-081|La Isla Singular||Dos Estrellas
Hoja|A1a-082|La Isla Singular||Dos Estrellas
Mew ex|A1a-083|La Isla Singular|Psíquico|Dos Estrellas
Aerodactyl ex|A1a-084|La Isla Singular|Lucha|Dos Estrellas
Celebi ex|A1a-085|La Isla Singular|Planta|Tres Estrellas
Mew ex|A1a-086|La Isla Singular|Psíquico|Corona
`.trim();

const rarityMap = {
  'Un Diamante': 'Common',
  'Dos Diamantes': 'Uncommon',
  'Tres Diamantes': 'Rare',
  'Cuatro Diamantes': 'Double Rare',
  'Una Estrella': '1 Star Rare',
  'Dos Estrellas': '2 Star Rare',
  'Tres Estrellas': '3 Star Rare',
  Corona: 'Crown Rare',
};

const cards = rawCards.split('\n').map((line) => {
  const [name, number, collectionId, rawEnergy, rawRarity] = line.split('|');
  const energyTypeId = rawEnergy === 'Guego' ? 'Fuego' : rawEnergy;
  return {
    id: '',
    name,
    number,
    collectionId,
    rarityId: rarityMap[rawRarity],
    energyTypeId,
    cardType: energyTypeId ? 'POKEMON' : 'PARTIDARIO',
    imageFilename: '',
    price: 100,
    stock: 10,
    status: 'PUBLISHED',
  };
});

const worksheet = XLSX.utils.json_to_sheet(cards, {
  header: ['id', 'name', 'number', 'collectionId', 'rarityId', 'energyTypeId', 'cardType', 'imageFilename', 'price', 'stock', 'status'],
});
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'cards');
const outputPath = path.join(__dirname, '..', 'assets', 'La Isla Singular.xlsx');
XLSX.writeFile(workbook, outputPath);
console.log(`Created ${outputPath} with ${cards.length} cards.`);