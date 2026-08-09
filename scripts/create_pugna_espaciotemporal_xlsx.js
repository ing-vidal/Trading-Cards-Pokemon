const path = require('path');
const XLSX = require('../apps/admin/node_modules/xlsx');

const rawCards = `
Oddish|A2-001|Pugna Espaciotemporal|Planta|Un Diamante
Gloom|A2-002|Pugna Espaciotemporal|Planta|Un Diamante
Bellossom|A2-003|Pugna Espaciotemporal|Planta|Dos Diamantes
Tangela|A2-004|Pugna Espaciotemporal|Planta|Un Diamante
Tangrowth|A2-005|Pugna Espaciotemporal|Planta|Dos Diamantes
Yanma|A2-006|Pugna Espaciotemporal|Planta|Un Diamante
Yanmega ex|A2-007|Pugna Espaciotemporal|Planta|Cuatro Diamantes
Roselia|A2-008|Pugna Espaciotemporal|Planta|Un Diamante
Roserade|A2-009|Pugna Espaciotemporal|Planta|Dos Diamantes
Turtwig|A2-010|Pugna Espaciotemporal|Planta|Un Diamante
Grotle|A2-011|Pugna Espaciotemporal|Planta|Dos Diamantes
Torterra|A2-012|Pugna Espaciotemporal|Planta|Tres Diamantes
Kricketot|A2-013|Pugna Espaciotemporal|Planta|Un Diamante
Kricketune|A2-014|Pugna Espaciotemporal|Planta|Un Diamante
Burmy|A2-015|Pugna Espaciotemporal|Planta|Un Diamante
Wormadam|A2-016|Pugna Espaciotemporal|Planta|Un Diamante
Combee|A2-017|Pugna Espaciotemporal|Planta|Un Diamante
Vespiquen|A2-018|Pugna Espaciotemporal|Planta|Dos Diamantes
Carnivine|A2-019|Pugna Espaciotemporal|Planta|Dos Diamantes
Leafeon|A2-020|Pugna Espaciotemporal|Planta|Tres Diamantes
Rotom Corte|A2-021|Pugna Espaciotemporal|Planta|Un Diamante
Shaymin|A2-022|Pugna Espaciotemporal|Planta|Tres Diamantes
Magmar|A2-023|Pugna Espaciotemporal|Guego|Un Diamante
Magmortar|A2-024|Pugna Espaciotemporal|Guego|Tres Diamantes
Slugma|A2-025|Pugna Espaciotemporal|Guego|Un Diamante
Magcargo|A2-026|Pugna Espaciotemporal|Guego|Dos Diamantes
Chimchar|A2-027|Pugna Espaciotemporal|Guego|Un Diamante
Monferno|A2-028|Pugna Espaciotemporal|Guego|Dos Diamantes
Infernape ex|A2-029|Pugna Espaciotemporal|Guego|Cuatro Diamantes
Rotom Calor|A2-030|Pugna Espaciotemporal|Guego|Un Diamante
Swinub|A2-031|Pugna Espaciotemporal|Agua|Un Diamante
Piloswine|A2-032|Pugna Espaciotemporal|Agua|Dos Diamantes
Mamoswine|A2-033|Pugna Espaciotemporal|Agua|Tres Diamantes
Regice|A2-034|Pugna Espaciotemporal|Agua|Dos Diamantes
Piplup|A2-035|Pugna Espaciotemporal|Agua|Un Diamante
Prinplup|A2-036|Pugna Espaciotemporal|Agua|Dos Diamantes
Empoleon|A2-037|Pugna Espaciotemporal|Agua|Tres Diamantes
Buizel|A2-038|Pugna Espaciotemporal|Agua|Un Diamante
Floatzel|A2-039|Pugna Espaciotemporal|Agua|Dos Diamantes
Shellos|A2-040|Pugna Espaciotemporal|Agua|Un Diamante
Gastrodon|A2-041|Pugna Espaciotemporal|Agua|Dos Diamantes
Finneon|A2-042|Pugna Espaciotemporal|Agua|Un Diamante
Lumineon|A2-043|Pugna Espaciotemporal|Agua|Dos Diamantes
Snover|A2-044|Pugna Espaciotemporal|Agua|Un Diamante
Abomasnow|A2-045|Pugna Espaciotemporal|Agua|Dos Diamantes
Glaceon|A2-046|Pugna Espaciotemporal|Agua|Tres Diamantes
Rotom Lavado|A2-047|Pugna Espaciotemporal|Agua|Un Diamante
Rotom Frío|A2-048|Pugna Espaciotemporal|Agua|Un Diamante
Palkia ex|A2-049|Pugna Espaciotemporal|Agua|Cuatro Diamantes
Manaphy|A2-050|Pugna Espaciotemporal|Agua|Dos Diamantes
Magnemite|A2-051|Pugna Espaciotemporal|Rayo|Un Diamante
Magneton|A2-052|Pugna Espaciotemporal|Rayo|Dos Diamantes
Magnezone|A2-053|Pugna Espaciotemporal|Rayo|Tres Diamantes
Voltorb|A2-054|Pugna Espaciotemporal|Rayo|Un Diamante
Electrode|A2-055|Pugna Espaciotemporal|Rayo|Dos Diamantes
Electabuzz|A2-056|Pugna Espaciotemporal|Rayo|Un Diamante
Electivire|A2-057|Pugna Espaciotemporal|Rayo|Tres Diamantes
Shinx|A2-058|Pugna Espaciotemporal|Rayo|Un Diamante
Luxio|A2-059|Pugna Espaciotemporal|Rayo|Dos Diamantes
Luxray|A2-060|Pugna Espaciotemporal|Rayo|Tres Diamantes
Pachirisu ex|A2-061|Pugna Espaciotemporal|Rayo|Cuatro Diamantes
Rotom|A2-062|Pugna Espaciotemporal|Rayo|Un Diamante
Togepi|A2-063|Pugna Espaciotemporal|Psíquico|Un Diamante
Togetic|A2-064|Pugna Espaciotemporal|Psíquico|Dos Diamantes
Togekiss|A2-065|Pugna Espaciotemporal|Psíquico|Tres Diamantes
Misdreavus|A2-066|Pugna Espaciotemporal|Psíquico|Un Diamante
Mismagius ex|A2-067|Pugna Espaciotemporal|Psíquico|Cuatro Diamantes
Ralts|A2-068|Pugna Espaciotemporal|Psíquico|Un Diamante
Kirlia|A2-069|Pugna Espaciotemporal|Psíquico|Un Diamante
Duskull|A2-070|Pugna Espaciotemporal|Psíquico|Un Diamante
Dusclops|A2-071|Pugna Espaciotemporal|Psíquico|Dos Diamantes
Dusknoir|A2-072|Pugna Espaciotemporal|Psíquico|Tres Diamantes
Drifloon|A2-073|Pugna Espaciotemporal|Psíquico|Un Diamante
Drifblim|A2-074|Pugna Espaciotemporal|Psíquico|Dos Diamantes
Uxie|A2-075|Pugna Espaciotemporal|Psíquico|Dos Diamantes
Mesprit|A2-076|Pugna Espaciotemporal|Psíquico|Tres Diamantes
Azelf|A2-077|Pugna Espaciotemporal|Psíquico|Dos Diamantes
Giratina|A2-078|Pugna Espaciotemporal|Psíquico|Tres Diamantes
Cresselia|A2-079|Pugna Espaciotemporal|Psíquico|Tres Diamantes
Rhyhorn|A2-080|Pugna Espaciotemporal|Lucha|Un Diamante
Rhydon|A2-081|Pugna Espaciotemporal|Lucha|Dos Diamantes
Rhyperior|A2-082|Pugna Espaciotemporal|Lucha|Tres Diamantes
Gligar|A2-083|Pugna Espaciotemporal|Lucha|Un Diamante
Gliscor|A2-084|Pugna Espaciotemporal|Lucha|Dos Diamantes
Hitmontop|A2-085|Pugna Espaciotemporal|Lucha|Un Diamante
Nosepass|A2-086|Pugna Espaciotemporal|Lucha|Un Diamante
Regirock|A2-087|Pugna Espaciotemporal|Lucha|Dos Diamantes
Cranidos|A2-088|Pugna Espaciotemporal|Lucha|Dos Diamantes
Rampardos|A2-089|Pugna Espaciotemporal|Lucha|Tres Diamantes
Wormadam|A2-090|Pugna Espaciotemporal|Lucha|Un Diamante
Riolu|A2-091|Pugna Espaciotemporal|Lucha|Un Diamante
Lucario|A2-092|Pugna Espaciotemporal|Lucha|Tres Diamantes
Hippopotas|A2-093|Pugna Espaciotemporal|Lucha|Un Diamante
Hippowdon|A2-094|Pugna Espaciotemporal|Lucha|Dos Diamantes
Gallade ex|A2-095|Pugna Espaciotemporal|Lucha|Cuatro Diamantes
Murkrow|A2-096|Pugna Espaciotemporal|Oscura|Un Diamante
Honchkrow|A2-097|Pugna Espaciotemporal|Oscura|Dos Diamantes
Sneasel|A2-098|Pugna Espaciotemporal|Oscura|Un Diamante
Weavile ex|A2-099|Pugna Espaciotemporal|Oscura|Cuatro Diamantes
Poochyena|A2-100|Pugna Espaciotemporal|Oscura|Un Diamante
Mightyena|A2-101|Pugna Espaciotemporal|Oscura|Dos Diamantes
Stunky|A2-102|Pugna Espaciotemporal|Oscura|Un Diamante
Skuntank|A2-103|Pugna Espaciotemporal|Oscura|Dos Diamantes
Spiritomb|A2-104|Pugna Espaciotemporal|Oscura|Dos Diamantes
Skorupi|A2-105|Pugna Espaciotemporal|Oscura|Un Diamante
Drapion|A2-106|Pugna Espaciotemporal|Oscura|Dos Diamantes
Croagunk|A2-107|Pugna Espaciotemporal|Oscura|Un Diamante
Toxicroak|A2-108|Pugna Espaciotemporal|Oscura|Dos Diamantes
Darkrai|A2-109|Pugna Espaciotemporal|Oscura|Tres Diamantes
Darkrai ex|A2-110|Pugna Espaciotemporal|Oscura|Cuatro Diamantes
Skarmory|A2-111|Pugna Espaciotemporal|Metálica|Dos Diamantes
Registeel|A2-112|Pugna Espaciotemporal|Metálica|Dos Diamantes
Shieldon|A2-113|Pugna Espaciotemporal|Metálica|Dos Diamantes
Bastiodon|A2-114|Pugna Espaciotemporal|Metálica|Tres Diamantes
Wormadam|A2-115|Pugna Espaciotemporal|Metálica|Un Diamante
Bronzor|A2-116|Pugna Espaciotemporal|Metálica|Un Diamante
Bronzong|A2-117|Pugna Espaciotemporal|Metálica|Dos Diamantes
Probopass|A2-118|Pugna Espaciotemporal|Metálica|Dos Diamantes
Dialga ex|A2-119|Pugna Espaciotemporal|Metálica|Cuatro Diamantes
Heatran|A2-120|Pugna Espaciotemporal|Metálica|Tres Diamantes
Gible|A2-121|Pugna Espaciotemporal|Dragón|Un Diamante
Gabite|A2-122|Pugna Espaciotemporal|Dragón|Dos Diamantes
Garchomp|A2-123|Pugna Espaciotemporal|Dragón|Tres Diamantes
Lickitung|A2-124|Pugna Espaciotemporal|Incolora|Un Diamante
Lickilicky ex|A2-125|Pugna Espaciotemporal|Incolora|Cuatro Diamantes
Eevee|A2-126|Pugna Espaciotemporal|Incolora|Un Diamante
Porygon|A2-127|Pugna Espaciotemporal|Incolora|Un Diamante
Porygon2|A2-128|Pugna Espaciotemporal|Incolora|Dos Diamantes
Porygon-Z|A2-129|Pugna Espaciotemporal|Incolora|Tres Diamantes
Aipom|A2-130|Pugna Espaciotemporal|Incolora|Un Diamante
Ambipom|A2-131|Pugna Espaciotemporal|Incolora|Un Diamante
Starly|A2-132|Pugna Espaciotemporal|Incolora|Un Diamante
Staravia|A2-133|Pugna Espaciotemporal|Incolora|Un Diamante
Staraptor|A2-134|Pugna Espaciotemporal|Incolora|Dos Diamantes
Bidoof|A2-135|Pugna Espaciotemporal|Incolora|Un Diamante
Bibarel|A2-136|Pugna Espaciotemporal|Incolora|Un Diamante
Buneary|A2-137|Pugna Espaciotemporal|Incolora|Un Diamante
Lopunny|A2-138|Pugna Espaciotemporal|Incolora|Un Diamante
Glameow|A2-139|Pugna Espaciotemporal|Incolora|Un Diamante
Purugly|A2-140|Pugna Espaciotemporal|Incolora|Dos Diamantes
Chatot|A2-141|Pugna Espaciotemporal|Incolora|Un Diamante
Rotom Ventilador|A2-142|Pugna Espaciotemporal|Incolora|Un Diamante
Regigigas|A2-143|Pugna Espaciotemporal|Incolora|Tres Diamantes
Fósil Cráneo|A2-144|Pugna Espaciotemporal||Un Diamante
Fósil Coraza|A2-145|Pugna Espaciotemporal||Un Diamante
Comunicación Pokémon|A2-146|Pugna Espaciotemporal||Dos Diamantes
Capa Gigante|A2-147|Pugna Espaciotemporal||Dos Diamantes
Casco Dentado|A2-148|Pugna Espaciotemporal||Dos Diamantes
Baya Ziuela|A2-149|Pugna Espaciotemporal||Dos Diamantes
Helio|A2-150|Pugna Espaciotemporal||Dos Diamantes
Recluta del Equipo Galaxia|A2-151|Pugna Espaciotemporal||Dos Diamantes
Cintia|A2-152|Pugna Espaciotemporal||Dos Diamantes
Lectro|A2-153|Pugna Espaciotemporal||Dos Diamantes
Maya|A2-154|Pugna Espaciotemporal||Dos Diamantes
Venus|A2-155|Pugna Espaciotemporal||Dos Diamantes
Tangrowth|A2-156|Pugna Espaciotemporal|Planta|Una Estrella
Combee|A2-157|Pugna Espaciotemporal|Planta|Una Estrella
Carnivine|A2-158|Pugna Espaciotemporal|Planta|Una Estrella
Shaymin|A2-159|Pugna Espaciotemporal|Planta|Una Estrella
Mamoswine|A2-160|Pugna Espaciotemporal|Agua|Una Estrella
Gastrodon|A2-161|Pugna Espaciotemporal|Agua|Una Estrella
Manaphy|A2-162|Pugna Espaciotemporal|Agua|Una Estrella
Shinx|A2-163|Pugna Espaciotemporal|Rayo|Una Estrella
Rotom|A2-164|Pugna Espaciotemporal|Rayo|Una Estrella
Drifloon|A2-165|Pugna Espaciotemporal|Psíquico|Una Estrella
Mesprit|A2-166|Pugna Espaciotemporal|Psíquico|Una Estrella
Giratina|A2-167|Pugna Espaciotemporal|Psíquico|Una Estrella
Cresselia|A2-168|Pugna Espaciotemporal|Psíquico|Una Estrella
Rhyperior|A2-169|Pugna Espaciotemporal|Lucha|Una Estrella
Lucario|A2-170|Pugna Espaciotemporal|Lucha|Una Estrella
Hippopotas|A2-171|Pugna Espaciotemporal|Lucha|Una Estrella
Spiritomb|A2-172|Pugna Espaciotemporal|Oscura|Una Estrella
Croagunk|A2-173|Pugna Espaciotemporal|Oscura|Una Estrella
Heatran|A2-174|Pugna Espaciotemporal|Metálica|Una Estrella
Garchomp|A2-175|Pugna Espaciotemporal|Dragón|Una Estrella
Staraptor|A2-176|Pugna Espaciotemporal|Incolora|Una Estrella
Bidoof|A2-177|Pugna Espaciotemporal|Incolora|Una Estrella
Glameow|A2-178|Pugna Espaciotemporal|Incolora|Una Estrella
Regigigas|A2-179|Pugna Espaciotemporal|Incolora|Una Estrella
Yanmega ex|A2-180|Pugna Espaciotemporal|Planta|Dos Estrellas
Infernape ex|A2-181|Pugna Espaciotemporal|Guego|Dos Estrellas
Palkia ex|A2-182|Pugna Espaciotemporal|Agua|Dos Estrellas
Pachirisu ex|A2-183|Pugna Espaciotemporal|Rayo|Dos Estrellas
Mismagius ex|A2-184|Pugna Espaciotemporal|Psíquico|Dos Estrellas
Gallade ex|A2-185|Pugna Espaciotemporal|Lucha|Dos Estrellas
Weavile ex|A2-186|Pugna Espaciotemporal|Oscura|Dos Estrellas
Darkrai ex|A2-187|Pugna Espaciotemporal|Oscura|Dos Estrellas
Dialga ex|A2-188|Pugna Espaciotemporal|Metálica|Dos Estrellas
Lickilicky ex|A2-189|Pugna Espaciotemporal|Incolora|Dos Estrellas
Helio|A2-190|Pugna Espaciotemporal||Dos Estrellas
Recluta del Equipo Galaxia|A2-191|Pugna Espaciotemporal||Dos Estrellas
Cintia|A2-192|Pugna Espaciotemporal||Dos Estrellas
Lectro|A2-193|Pugna Espaciotemporal||Dos Estrellas
Maya|A2-194|Pugna Espaciotemporal||Dos Estrellas
Venus|A2-195|Pugna Espaciotemporal||Dos Estrellas
Yanmega ex|A2-196|Pugna Espaciotemporal|Planta|Dos Estrellas
Infernape ex|A2-197|Pugna Espaciotemporal|Guego|Dos Estrellas
Pachirisu ex|A2-198|Pugna Espaciotemporal|Rayo|Dos Estrellas
Mismagius ex|A2-199|Pugna Espaciotemporal|Psíquico|Dos Estrellas
Gallade ex|A2-200|Pugna Espaciotemporal|Lucha|Dos Estrellas
Weavile ex|A2-201|Pugna Espaciotemporal|Oscura|Dos Estrellas
Darkrai ex|A2-202|Pugna Espaciotemporal|Oscura|Dos Estrellas
Lickilicky ex|A2-203|Pugna Espaciotemporal|Incolora|Dos Estrellas
Palkia ex|A2-204|Pugna Espaciotemporal|Agua|Tres Estrellas
Dialga ex|A2-205|Pugna Espaciotemporal|Metálica|Tres Estrellas
Palkia ex|A2-206|Pugna Espaciotemporal|Agua|Corona
Dialga ex|A2-207|Pugna Espaciotemporal|Metálica|Corona
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
const energyMap = { Guego: 'Fuego', Rayo: 'Eléctrico', Metálica: 'Metálico' };

const cards = rawCards.split('\n').map((line) => {
  const [name, number, collectionId, rawEnergy, rawRarity] = line.split('|');
  const energyTypeId = energyMap[rawEnergy] || rawEnergy;
  return {
    id: '',
    name,
    number,
    collectionId,
    rarityId: rarityMap[rawRarity],
    energyTypeId,
    cardType: energyTypeId ? 'POKEMON' : 'PARTIDARIO',
    imageFilename: `${number}.png`,
    price: 100,
    stock: 10,
    status: 'PUBLISHED',
  };
});

if (cards.length !== 207 || cards[0].number !== 'A2-001' || cards.at(-1).number !== 'A2-207') {
  throw new Error(`Unexpected card data: ${cards.length} rows`);
}

const worksheet = XLSX.utils.json_to_sheet(cards, {
  header: ['id', 'name', 'number', 'collectionId', 'rarityId', 'energyTypeId', 'cardType', 'imageFilename', 'price', 'stock', 'status'],
});
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'cards');
const outputPath = path.join(__dirname, '..', 'assets', 'Pugna Espaciotemporal.xlsx');
XLSX.writeFile(workbook, outputPath);
console.log(`Created ${outputPath} with ${cards.length} cards.`);
