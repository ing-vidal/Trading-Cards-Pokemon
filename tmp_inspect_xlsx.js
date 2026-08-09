const XLSX = require('./apps/admin/node_modules/xlsx');
const path = require('path');
const fs = require('fs');
const workbookPath = path.join(process.cwd(), 'assets', 'Luz Triunfal.xlsx');
if (!fs.existsSync(workbookPath)) {
  console.error('File not found:', workbookPath);
  process.exit(1);
}
const wb = XLSX.readFile(workbookPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
rows.slice(0, 40).forEach((row, i) => console.log('ROW', i+1, JSON.stringify(row)));
console.log('TOTAL', rows.length);
