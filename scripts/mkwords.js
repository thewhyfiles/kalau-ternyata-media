// timing.json (hasil tts_workbench: [{beat,start,dur,words:[[w,s,e],...]}]) + caps.json (opsional) -> web/words.js + audio/warp.json
// pakai: node mkwords.js <job-dir> <reel-dir>
const fs = require('fs'), [jd, rd] = process.argv.slice(2);
const T = JSON.parse(fs.readFileSync(jd + '/timing.json', 'utf8'));
const caps = fs.existsSync(jd + '/caps.json') ? JSON.parse(fs.readFileSync(jd + '/caps.json', 'utf8')) : {};
let W = [], g = 0; T.forEach((b, li) => b.words.forEach(([w, s, e]) => W.push({ w, s, e, line: li, g: g++ })));
const norm = x => x.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
for (const [k, v] of Object.entries(caps)) { // "dua puluh ribu": "20 ribu"
  const ks = k.split(' ').map(norm);
  for (let i = 0; i + ks.length <= W.length; i++) if (ks.every((x, j) => norm(W[i + j].w) === x && W[i + j].line === W[i].line)) { W.splice(i, ks.length, { w: v, s: W[i].s, e: W[i + ks.length - 1].e, line: W[i].line, g: W[i].g }); }
}
W.forEach((w, i) => { const n = W[i + 1]; w.e = Math.min(w.e, n ? n.s : w.e); });
const total = T[T.length - 1].start + T[T.length - 1].dur;
fs.writeFileSync(rd + '/web/words.js', 'const WORDS=' + JSON.stringify(W) + ';');
fs.mkdirSync(rd + '/audio', { recursive: true });
fs.writeFileSync(rd + '/audio/warp.json', JSON.stringify({ anchors: [[0, 0], [total, total]], old_end: total, new_end: total }));
console.log('words', W.length, 'total', total.toFixed(2));
