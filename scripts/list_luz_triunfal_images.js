const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'assets', 'card-images', 'Luz Triunfal');
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png')).sort();
console.log(files.length);
for (const file of files) {
  console.log(file);
}
