// dijalankan dari folder reel: tulis audio/cues.json (SFX otomatis dari spesifikasi shot) dan jumlah shot
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.log('[err]', e.message); process.exitCode = 1; });
  await p.goto('file://' + process.cwd() + '/web/index.html');
  const r = await p.evaluate(() => ({ cues: window.KT_CUES, shots: SHOTS.length, total: window.KT_TOTAL, dur: window.DUR, spans: window.SHOT_SPANS }));
  fs.writeFileSync('audio/cues.json', JSON.stringify(r.cues)); fs.writeFileSync('audio/shots.json', JSON.stringify(r));
  console.log('shots', r.shots, 'cues', r.cues.length, 'dur', r.dur.toFixed(2)); await b.close();
})();
