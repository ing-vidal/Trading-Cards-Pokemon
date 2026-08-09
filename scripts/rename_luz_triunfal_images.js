const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'card-images', 'Luz Triunfal');
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
const mainFiles = files.filter((f) => !f.startsWith('cTR_')).sort();
const extraFiles = files.filter((f) => f.startsWith('cTR_')).sort();
if (mainFiles.length !== 96) {
  console.error(`Expected 96 Luz Triunfal main images, found ${mainFiles.length}. Aborting.`);
  process.exit(1);
}
for (let i = 0; i < mainFiles.length; i += 1) {
  const src = path.join(dir, mainFiles[i]);
  const dest = path.join(dir, `A2a-${String(i + 1).padStart(3, '0')}.png`);
  if (src === dest) continue;
  if (fs.existsSync(dest)) {
    console.error(`Destination already exists: ${dest}. Aborting.`);
    process.exit(1);
  }
  fs.renameSync(src, dest);
  console.log(`${mainFiles[i]} -> ${path.basename(dest)}`);
}
console.log(`Renamed ${mainFiles.length} Luz Triunfal main images to A2a-001..A2a-096.`);
if (extraFiles.length > 0) {
  console.log(`Left ${extraFiles.length} trainer/extra files untouched:`);
  extraFiles.forEach((f) => console.log(`  ${f}`));
}
