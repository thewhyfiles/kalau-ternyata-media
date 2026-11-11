// node dl.js <url> <file>
const fs = require('fs');
fetch(process.argv[2]).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); }).then(b => fs.writeFileSync(process.argv[3], Buffer.from(b))).catch(e => { console.error('unduh gagal:', e.message); process.exit(1); });
