// ===== KT: perpustakaan adegan Kalau Ternyata (dipakai bersama lib.js, chars.js, env.js dari skill stick-figure) =====
(function () {
const KT = window.KT = { cues: [] };
const CAST = {
  kamu: { cols: PAL.red, hat: 'bandana', hatCol: '#d8312b', dotCol: '#fff' },
  teman: { cols: PAL.blue, hat: 'none' }, sunny: { cols: PAL.yellow, hat: 'none' }, hijau: { cols: PAL.green, hat: 'none' },
  ungu: { cols: PAL.purple, hat: 'none' }, kapten: { cols: PAL.navy, hat: 'captain' }, pelaut: { cols: PAL.blue, hat: 'sailor' },
};
const MOOD = {
  senang: { eyes: 'happy', mouth: 'smile' }, kaget: { eyes: 'wide', mouth: 'o', browUp: 1 }, mikir: { eyes: 'normal', look: [.7, -.7], mouth: 'flat', browOne: 1 },
  puas: { eyes: 'smug', mouth: 'smirk' }, sedih: { eyes: 'normal', mouth: 'frown', browAng: .35 }, pusing: { eyes: 'spiral', mouth: 'o' },
  nyengir: { eyes: 'normal', mouth: 'grin' }, bingung: { eyes: 'normal', mouth: 'flat', browOne: -1, look: [.5, 0] }, datar: { eyes: 'half', mouth: 'flat' },
  takut: { eyes: 'wide', mouth: 'frown', browAng: .3, browUp: 1 }, teriak: { eyes: 'squint', mouth: 'o' },
};
const wl = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const wa = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const POSES = {
  diam: { arms: { L: [.3, -.1], R: [.3, -.1] }, legs: { L: [.1, -.04], R: [.1, -.04] } },
  angkat: POSE.handsUp, pinggang: POSE.hips,
  tunjuk: { arms: { L: [.3, -.1], R: [1.75, .05] }, legs: { L: [.1, -.04], R: [.1, -.04] } },
  tunjukatas: { arms: { L: [.3, -.1], R: [2.7, .1] }, legs: { L: [.1, -.04], R: [.1, -.04] } },
  garuk: { arms: { L: [.3, -.1], R: { ik: [.1, -.85], bend: -1 } }, legs: { L: [.1, -.04], R: [.1, -.04] } },
  lari: t => ({ arms: wa(t), legs: wl(t) }),
  lambai: t => ({ arms: { L: [.3, -.1], R: [2.4 + Math.sin(t * 9) * .3, .3] }, legs: { L: [.1, -.04], R: [.1, -.04] } }),
  loncat: t => ({ arms: { L: [2.2, .3], R: [2.2, .3] }, legs: { L: [.5, -.9], R: [.4, -.8] } }),
  bingung: { arms: { L: [1.0, -2.0], R: [.3, -.1] }, legs: { L: [.1, -.04], R: [.12, -.04] } },
  takut: t => ({ arms: { L: [2.3 + Math.sin(t * 25) * .05, .9], R: [2.3 + Math.sin(t * 25 + 1) * .05, .9] }, legs: { L: [.2, -.1], R: [.2, -.1] } }),
};
const lv = (v, p) => Array.isArray(v) ? lerp(v[0], v[1], ease(p)) : (v == null ? 0 : v);

// ---------- props (unit space, centre at 0,0, size 1) ----------
const L = .035, FS = (ctx, f, lw = L) => fillStroke(ctx, f, lw);
const PROPS = {
  globe(ctx, t) {
    circle(ctx, 0, 0, .5); FS(ctx, '#3fa7f5');
    ctx.save(); circle(ctx, 0, 0, .5); ctx.clip(); const off = (t * .1) % 1.7; ctx.fillStyle = '#4cae5c';
    for (const dx of [-1.7, 0, 1.7]) { ctx.save(); ctx.translate(dx - off, 0); [[-.22, -.14, .22, .15], [.28, .1, .17, .22], [-.02, .3, .16, .1], [.6, -.2, .2, .12]].forEach(([x, y, a, b]) => { ellipse(ctx, x, y, a, b, .4); ctx.fill(); }); ctx.restore(); }
    const g = ctx.createRadialGradient(-.15, -.15, .1, 0, 0, .55); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(20,10,60,.28)'); ctx.fillStyle = g; ctx.fillRect(-.5, -.5, 1, 1); ctx.restore();
    circle(ctx, 0, 0, .5); FS(ctx, null); line(ctx, -.22, .72, .22, .72, .06, INK); line(ctx, 0, .5, 0, .72, .05, INK);
  },
  scroll(ctx) { rrect(ctx, -.4, -.5, .8, 1, .05); FS(ctx, '#f4e3b8'); for (let i = 0; i < 5; i++) line(ctx, -.26, -.3 + i * .15, .26 - (i % 2) * .12, -.3 + i * .15, .035, '#a98a55'); rrect(ctx, -.46, -.56, .92, .12, .06); FS(ctx, '#c9953f'); rrect(ctx, -.46, .44, .92, .12, .06); FS(ctx, '#c9953f'); },
  bulb(ctx, t, o) { const lit = o.lit == null ? 1 : o.lit; if (lit) { ctx.save(); ctx.globalAlpha = .5 * lit; circle(ctx, 0, -.1, .75); ctx.fillStyle = '#fff3a0'; ctx.fill(); ctx.restore(); } circle(ctx, 0, -.12, .36); FS(ctx, lit ? '#ffe45c' : '#d8d2c4'); rrect(ctx, -.16, .2, .32, .24, .05); FS(ctx, '#9aa0a8'); line(ctx, -.1, -.05, 0, .12, .035, INK); line(ctx, 0, .12, .1, -.05, .035, INK); },
  clock(ctx, t, o) { circle(ctx, 0, 0, .5); FS(ctx, '#fff'); for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line(ctx, Math.sin(a) * .4, -Math.cos(a) * .4, Math.sin(a) * .45, -Math.cos(a) * .45, .035, INK); } const sp = o.speed || 1, a1 = t * sp * 2, a2 = a1 / 12; line(ctx, 0, 0, Math.sin(a1) * .38, -Math.cos(a1) * .38, .03, INK); line(ctx, 0, 0, Math.sin(a2) * .26, -Math.cos(a2) * .26, .05, INK); circle(ctx, 0, 0, .04); ctx.fillStyle = INK; ctx.fill(); },
  qmark(ctx) { burst(ctx, 0, 0, .55, 10, '#ffd23a', 4, .62); text(ctx, '?', 0, .03, .8, '#fff', INK, .1); },
  excl(ctx) { burst(ctx, 0, 0, .55, 10, '#f08a5d', 6, .62); text(ctx, '!', 0, .03, .8, '#fff', INK, .1); },
  book(ctx) { rrect(ctx, -.4, -.5, .8, 1, .05); FS(ctx, '#3fa7f5'); rrect(ctx, -.4, -.5, .12, 1, .04); FS(ctx, '#2a63c8'); rrect(ctx, -.18, -.3, .46, .3, .04); FS(ctx, '#fff6e5', .025); line(ctx, -.18, .2, .25, .2, .035, '#fff6e5'); line(ctx, -.18, .32, .1, .32, .035, '#fff6e5'); },
  house(ctx) { rrect(ctx, -.4, -.1, .8, .6, .03); FS(ctx, '#fff6e5'); path(ctx, [[-.5, -.08], [0, -.5], [.5, -.08]]); FS(ctx, '#e0392f'); rrect(ctx, -.09, .2, .18, .3, .03); FS(ctx, '#9a5a2a'); rrect(ctx, .15, .0, .17, .17, .02); FS(ctx, '#8fd8ff'); rrect(ctx, -.32, .0, .17, .17, .02); FS(ctx, '#8fd8ff'); },
  tree(ctx) { rrect(ctx, -.07, 0, .14, .5, .03); FS(ctx, '#9a5a2a'); circle(ctx, 0, -.18, .34); FS(ctx, '#4cae5c'); circle(ctx, -.22, -.02, .22); FS(ctx, '#4cae5c'); circle(ctx, .24, -.04, .24); FS(ctx, '#4cae5c'); circle(ctx, 0, -.18, .34); ctx.fillStyle = '#4cae5c'; ctx.fill(); },
  gunung(ctx) { path(ctx, [[-.6, .45], [-.1, -.45], [.15, -.05], [.3, -.25], [.65, .45]]); FS(ctx, '#8a8f9c'); path(ctx, [[-.22, -.2], [-.1, -.45], [.02, -.22], [-.06, -.28]]); FS(ctx, '#fff', .02); },
  volcano(ctx, t) { path(ctx, [[-.6, .45], [-.2, -.25], [.2, -.25], [.6, .45]]); FS(ctx, '#8a5a3c'); path(ctx, [[-.2, -.25], [.2, -.25], [.12, -.1], [0, -.16], [-.12, -.1]]); FS(ctx, '#f08a5d', .025); for (let i = 0; i < 3; i++) { const p = ((t * .5 + i / 3) % 1); puff(ctx, Math.sin(i * 2 + t) * .08, -.3 - p * .8, .16 + p * .22, t, '#cfc8c0', i + 3, 1 - p); } },
  rocket(ctx, t) { ctx.save(); const f = .8 + .2 * Math.sin(t * 40); path(ctx, [[-.1, .45], [0, .45 + .3 * f], [.1, .45]]); FS(ctx, '#ffc93c', .03); ctx.restore(); path(ctx, [[-.2, .1], [-.38, .42], [-.14, .36]]); FS(ctx, '#e0392f'); path(ctx, [[.2, .1], [.38, .42], [.14, .36]]); FS(ctx, '#e0392f'); ctx.beginPath(); ctx.moveTo(0, -.55); ctx.quadraticCurveTo(.26, -.2, .2, .42); ctx.lineTo(-.2, .42); ctx.quadraticCurveTo(-.26, -.2, 0, -.55); FS(ctx, '#fff6e5'); circle(ctx, 0, -.1, .09); FS(ctx, '#8fd8ff', .03); },
  coin(ctx) { circle(ctx, 0, 0, .45); FS(ctx, '#ffc93c'); circle(ctx, 0, 0, .33); FS(ctx, null, .02); text(ctx, 'Rp', 0, .02, .3, INK, INK, 0); },
  crown(ctx) { path(ctx, [[-.45, .3], [-.5, -.25], [-.25, -.02], [0, -.4], [.25, -.02], [.5, -.25], [.45, .3]]); FS(ctx, '#ffc93c'); rrect(ctx, -.45, .22, .9, .14, .03); FS(ctx, '#e0a81f'); [[-.5, -.25], [0, -.4], [.5, -.25]].forEach(([x, y]) => { circle(ctx, x, y, .06); FS(ctx, '#e0392f', .025); }); },
  phone(ctx, t) { rrect(ctx, -.28, -.5, .56, 1, .1); FS(ctx, '#2a2530'); rrect(ctx, -.23, -.43, .46, .86, .06); ctx.fillStyle = '#3fa7f5'; ctx.fill(); ctx.save(); rrect(ctx, -.23, -.43, .46, .86, .06); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.22)'; path(ctx, [[-.23, -.43], [.05, -.43], [-.23, .1]]); ctx.fill(); ctx.restore(); circle(ctx, 0, .46, .02); ctx.fillStyle = '#6a6470'; ctx.fill(); },
  fire(ctx, t) { const w = Math.sin(t * 14) * .03; ctx.beginPath(); ctx.moveTo(0, -.55 + w); ctx.quadraticCurveTo(.4, -.1, .32, .25); ctx.quadraticCurveTo(.2, .5, 0, .5); ctx.quadraticCurveTo(-.25, .5, -.32, .2); ctx.quadraticCurveTo(-.36, -.15, 0, -.55 + w); FS(ctx, '#f08a5d'); ctx.beginPath(); ctx.moveTo(0, -.15); ctx.quadraticCurveTo(.2, .1, .14, .3); ctx.quadraticCurveTo(0, .44, -.14, .3); ctx.quadraticCurveTo(-.2, .05, 0, -.15); FS(ctx, '#ffc93c', .025); },
  bolt(ctx) { path(ctx, [[.1, -.55], [-.32, .08], [-.04, .08], [-.14, .55], [.34, -.12], [.05, -.12]]); FS(ctx, '#ffd23a'); },
  heart(ctx) { ctx.beginPath(); ctx.moveTo(0, .42); ctx.bezierCurveTo(-.7, -.05, -.3, -.55, 0, -.2); ctx.bezierCurveTo(.3, -.55, .7, -.05, 0, .42); FS(ctx, '#e0392f'); },
  matahari(ctx, t) { ctx.save(); ctx.rotate(t * .3); for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); path(ctx, [[-.06, -.58], [0, -.76], [.06, -.58]]); FS(ctx, '#ffc93c', .025); } ctx.restore(); circle(ctx, 0, 0, .5); FS(ctx, '#ffd23a'); },
  bulan(ctx) { ctx.beginPath(); ctx.arc(0, 0, .5, .7, TAU - .7); ctx.arc(.2, 0, .42, TAU - .95, .95, true); ctx.closePath(); FS(ctx, '#fff3b0'); },
  bintang(ctx, t) { star5(ctx, 0, 0, .5, Math.sin(t * 2) * .1, '#ffe14d'); },
  awan(ctx, t) { drawCloud(ctx, 0, 0, .45, 2); },
  gear(ctx, t) { ctx.save(); ctx.rotate(t * .8); ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16, r = i % 2 ? .38 : .5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); FS(ctx, '#9aa0a8'); circle(ctx, 0, 0, .14); FS(ctx, '#fff6e5'); ctx.restore(); },
  kaca(ctx) { circle(ctx, -.08, -.08, .34); FS(ctx, 'rgba(143,216,255,.55)', .06); line(ctx, .17, .17, .5, .5, .1, INK); },
  chip(ctx) { for (let i = -2; i <= 2; i++) for (const s of [-1, 1]) { line(ctx, i * .15, s * .32, i * .15, s * .46, .05, '#c9d0d8'); line(ctx, s * .32, i * .15, s * .46, i * .15, .05, '#c9d0d8'); } rrect(ctx, -.32, -.32, .64, .64, .05); FS(ctx, '#2a2530'); circle(ctx, -.18, -.18, .04); ctx.fillStyle = '#ffc93c'; ctx.fill(); },
  baterai(ctx, t, o) { const lv = o.level == null ? .7 : o.level; rrect(ctx, -.5, -.28, .9, .56, .07); FS(ctx, '#fff6e5'); rrect(ctx, .4, -.1, .1, .2, .03); FS(ctx, INK); rrect(ctx, -.44, -.22, .78 * lv, .44, .04); ctx.fillStyle = lv < .25 ? '#e0392f' : '#4cae5c'; ctx.fill(); },
  bendera(ctx, t, o) { line(ctx, -.35, .55, -.35, -.55, .07, INK); ctx.beginPath(); ctx.moveTo(-.35, -.52); for (let i = 0; i <= 10; i++) ctx.lineTo(-.35 + i * .08, -.52 + Math.sin(t * 5 + i * .6) * .04 * i / 4); for (let i = 10; i >= 0; i--) ctx.lineTo(-.35 + i * .08, -.14 + Math.sin(t * 5 + i * .6) * .04 * i / 4); ctx.closePath(); FS(ctx, o.col || '#e0392f'); },
  kapal(ctx, t, o) { ctx.scale(1 / 380, 1 / 380); ctx.translate(0, 110); drawShip(ctx, 0, 0, 1, t, Object.assign({ flag: '#2a63c8', hull: '#9a5428', ph: 1 }, o)); },
  papan(ctx, t, o) { rrect(ctx, -.5, -.3, 1, .6, .05); FS(ctx, '#fff6e5'); line(ctx, -.5, .1, -.5, .55, .06, INK); line(ctx, .5, .1, .5, .55, .06, INK); },
  pulau(ctx) { ellipse(ctx, 0, .35, .6, .2); FS(ctx, '#f2d58a'); ctx.beginPath(); ctx.moveTo(0, .3); ctx.quadraticCurveTo(.1, -.1, .05, -.4); ctx.lineWidth = .07; ctx.strokeStyle = INK; ctx.stroke(); [-.9, -.3, .3, .9].forEach(a => { ctx.beginPath(); ctx.moveTo(.05, -.4); ctx.quadraticCurveTo(.05 + Math.sin(a) * .25, -.62, .05 + Math.sin(a) * .45, -.4 + Math.abs(a) * .1); ctx.lineWidth = .08; ctx.strokeStyle = '#2f8f45'; ctx.stroke(); }); },
  rumah(ctx) { PROPS.house(ctx); },
};

// ---------- backgrounds ----------
function hills(ctx, base, col, seed, amp = 60) {
  ctx.beginPath(); ctx.moveTo(-700, 1500); for (let x = -700; x <= 1800; x += 40) ctx.lineTo(x, base - amp * Math.sin(x * .004 + seed) - amp * .6 * Math.sin(x * .011 + seed * 2)); ctx.lineTo(1800, 1500); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function ground(ctx, y, col = '#5cc06c', dark = '#4cae5c') {
  ctx.fillStyle = col; ctx.fillRect(-900, y, 2880, 1400); ctx.fillStyle = dark; ctx.fillRect(-900, y + 150, 2880, 1400);
  line(ctx, -900, y, 1980, y, 7, INK); const R = rng(9); for (let i = 0; i < 18; i++) { const x = -300 + R() * 1700, yy = y + 40 + R() * 200; line(ctx, x - 12, yy, x, yy - 22, 5, 'rgba(34,28,34,.35)'); line(ctx, x, yy - 22, x + 12, yy, 5, 'rgba(34,28,34,.35)'); }
}
function stars(ctx, t, n = 70, a = 1) { const R = rng(21); for (let i = 0; i < n; i++) { const x = -300 + R() * 1700, y = -400 + R() * 1500, r = 2 + R() * 4; ctx.globalAlpha = a * (.5 + .5 * Math.sin(t * 2 + i)); circle(ctx, x, y, r); ctx.fillStyle = '#fff6e5'; ctx.fill(); } ctx.globalAlpha = 1; }
KT.bgs = {
  day(ctx, t, cam, o) {
    applyCam(ctx, cam, .08); drawSky(ctx, o.top || '#4aaeea', o.bot || '#fbe9c4', -500, 1300);
    if (o.sun !== false) { applyCam(ctx, cam, .1); const s = o.sun || [860, 330, 80]; drawSun(ctx, s[0], s[1], s[2], t, .9); }
    applyCam(ctx, cam, .14); drawCloud(ctx, 160 + t * 6, 300, 120, 1); drawCloud(ctx, 780 + t * 4, 190, 90, 2); drawCloud(ctx, 1000 + t * 5, 540, 70, 3, .9);
    applyCam(ctx, cam, .3); hills(ctx, o.gy ? o.gy - 60 : 1160, '#a6dfa9', 1); hills(ctx, o.gy ? o.gy - 10 : 1210, '#86cf8f', 3, 40);
    applyCam(ctx, cam, 1); ground(ctx, o.gy || 1250);
  },
  sea(ctx, t, cam, o) {
    applyCam(ctx, cam, .08); drawSky(ctx, o.top || '#4aaeea', o.bot || '#fbe9c4', -300, 950);
    if (o.sun !== false) { applyCam(ctx, cam, .1); const s = o.sun || [820, 330, 90]; drawSun(ctx, s[0], s[1], s[2], t, 1.1); }
    applyCam(ctx, cam, .15); drawCloud(ctx, 150, 420, 110, 5); drawCloud(ctx, 1000, 560, 80, 6);
    applyCam(ctx, cam, .55); drawSea(ctx, o.hz || 930, t); applyCam(ctx, cam, 1);
  },
  night(ctx, t, cam, o) {
    applyCam(ctx, cam, .08); drawSky(ctx, '#0f0e1a', o.bot || '#2f3478', -500, 1300); stars(ctx, t); applyCam(ctx, cam, .1);
    if (o.moon !== false) { const m = o.moon || [820, 300, 90]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(m[0], m[1], 10, m[0], m[1], m[2] * 3); g.addColorStop(0, 'rgba(255,245,200,.5)'); g.addColorStop(1, 'rgba(255,245,200,0)'); ctx.fillStyle = g; ctx.fillRect(m[0] - m[2] * 3, m[1] - m[2] * 3, m[2] * 6, m[2] * 6); ctx.restore(); circle(ctx, m[0], m[1], m[2]); ctx.fillStyle = '#fff6e5'; ctx.fill(); }
    applyCam(ctx, cam, .3); hills(ctx, 1190, '#1d2250', 2); applyCam(ctx, cam, 1); ground(ctx, o.gy || 1250, '#2b3a5c', '#243050');
  },
  room(ctx, t, cam, o) {
    applyCam(ctx, cam, .5); ctx.fillStyle = o.wall || '#ffe3b3'; ctx.fillRect(-900, -900, 2880, 2200); ctx.fillStyle = 'rgba(255,255,255,.35)'; for (let x = -900; x < 1980; x += 120) ctx.fillRect(x, -900, 50, 2200);
    applyCam(ctx, cam, 1); ctx.fillStyle = o.floor || '#c98a5a'; ctx.fillRect(-900, 1250, 2880, 1400); line(ctx, -900, 1250, 1980, 1250, 8, INK); for (let x = -900; x < 1980; x += 220) line(ctx, x, 1250, x - 120, 2000, 4, 'rgba(34,28,34,.25)');
    if (o.window !== false) { rrect(ctx, 700, 330, 280, 360, 14); FS(ctx, '#8fd8ff', 9); line(ctx, 840, 330, 840, 690, 9, INK); line(ctx, 700, 510, 980, 510, 9, INK); }
  },
  space(ctx, t, cam, o) { applyCam(ctx, cam, .1); ctx.fillStyle = '#0b0a14'; ctx.fillRect(-900, -900, 2880, 3600); stars(ctx, t, 110); applyCam(ctx, cam, .25); circle(ctx, 180, 420, 110); FS(ctx, '#f08a5d', 8); circle(ctx, 900, 1000, 60); FS(ctx, '#3fa7f5', 8); },
  flat(ctx, t, cam, o) { applyCam(ctx, cam, .2); ctx.fillStyle = o.col || '#ffc93c'; ctx.fillRect(-900, -900, 2880, 3600); ctx.fillStyle = 'rgba(255,255,255,.22)'; const off = (t * 10) % 64; for (let x = -900; x < 1980; x += 64) for (let y = -900; y < 2700; y += 64) { circle(ctx, x + off + (((y / 64) | 0) % 2) * 32, y, 9); ctx.fill(); } applyCam(ctx, cam, 1); },
};

// ---------- drawing a shot ----------
function drawChar(ctx, c, lt, t) {
  if (lt < c.a) return; const q = lt - c.a, k = c.nopop ? 1 : backOut(clamp(q / .28));
  let mood = c.m || 'senang'; (c.m2 || []).forEach(([mt, mm]) => { if (lt >= mt) mood = mm; });
  let pose = c.p || 'diam'; (c.p2 || []).forEach(([pt, pp]) => { if (lt >= pt) pose = pp; });
  const P = typeof POSES[pose] === 'function' ? POSES[pose](t) : POSES[pose];
  let x = c.x, y = c.y; if (c.in === 'kiri') x += -700 * (1 - easeOut(clamp(q / .5))); if (c.in === 'kanan') x += 700 * (1 - easeOut(clamp(q / .5))); if (c.in === 'atas') y += -900 * (1 - easeIn(clamp(q / .35)));
  if (c.go) { const g = c.go; const pp = clamp((lt - g.t0) / (g.t1 - g.t0)); x = lerp(g.x0 == null ? x : g.x0, g.x1, ease(pp)); }
  const blink = ((t * .8 + (c.x || 0) * .01) % 3.4) > 3.28 ? 1 : 0;
  drawStick(ctx, Object.assign({}, CAST[c.c || 'kamu'], P, { x, y, s: (c.s || 520) * (c.in ? 1 : k), flip: c.f || 1, bob: Math.sin(t * 3 + (c.x || 0)) * .004, headTilt: Math.sin(t * 1.6 + (c.x || 0)) * .03 + (c.tilt || 0), lean: c.lean || 0, t, face: Object.assign({ blink }, MOOD[mood]), blush: c.blush }));
}
function drawProp(ctx, p, lt, t) {
  if (lt < p.a) return; const q = lt - p.a, k = p.nopop ? 1 : backOut(clamp(q / .3)); const s = (p.s || 220) * k;
  ctx.save(); let x = p.x, y = p.y + (p.float ? Math.sin(t * 2.4 + p.x) * 10 : 0); if (p.go) { const g = p.go, pp = clamp((lt - g.t0) / (g.t1 - g.t0)); x = lerp(p.x, g.x1, ease(pp)); y = lerp(p.y, g.y1 == null ? p.y : g.y1, ease(pp)); }
  ctx.translate(x, y); ctx.rotate((p.rot || 0) + (p.wobble ? Math.sin(t * 5) * .08 : 0)); ctx.scale(s * (p.f || 1), s); if (p.fade && lt > p.fade) ctx.globalAlpha = clamp(1 - (lt - p.fade) / .3);
  PROPS[p.n](ctx, t, p); ctx.restore();
}
function drawLabel(ctx, tx, lt) {
  if (lt < tx.a) return; const q = lt - tx.a, k = backOut(clamp(q / .25)); if (tx.until && lt > tx.until) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(tx.x, tx.y); ctx.rotate(tx.rot || 0); ctx.scale(k, k);
  const sz = tx.s || 110; ctx.font = `700 ${sz}px Poppins`; const lines = String(tx.t).split('\n'), w = Math.max(...lines.map(l => ctx.measureText(l).width)) + sz * .7, h = lines.length * sz * 1.1 + sz * .35;
  if (tx.card !== false) { rrect(ctx, -w / 2 + 9, -h / 2 + 9, w, h, 26); ctx.fillStyle = INK; ctx.fill(); rrect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = tx.bg || '#fff6e5'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); lines.forEach((l, i) => text(ctx, l, 0, (i - (lines.length - 1) / 2) * sz * 1.1, sz, tx.col || INK, INK, 0)); }
  else lines.forEach((l, i) => text(ctx, l, 0, (i - (lines.length - 1) / 2) * sz * 1.1, sz, tx.col || '#fff', INK, sz * .16));
  ctx.restore();
}
function drawFx(ctx, f, lt, t) {
  const q = lt - f.at; if (q < 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (f.k === 'burst' && q < .6) { const p = q / .6; ctx.globalAlpha = 1 - p * p * p; burst(ctx, f.x, f.y, (f.r || 220) * (.5 + .7 * easeOut(p)), 11, f.col || '#ffd23a', 5); }
  if (f.k === 'flash' && q < .3) { ctx.globalAlpha = (1 - q / .3) * .85; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); }
  if (f.k === 'puff' && q < 1) { const p = q; puff(ctx, f.x, f.y - p * 90, (f.r || 120) * (.6 + p), t, '#f3efe6', 3, 1 - p); }
  if (f.k === 'spark' && q < .7) { const p = q / .7; sparkle(ctx, f.x, f.y, (f.r || 70) * Math.sin(p * Math.PI), 1); }
  ctx.restore();
}

// ---------- build shots from compact specs ----------
KT.build = function (specs) {
  const total = WORDS[WORDS.length - 1].e, byLine = {}; WORDS.forEach(w => (byLine[w.line] = byLine[w.line] || []).push(w));
  const firstS = li => byLine[li] ? byLine[li][0].s : total;
  const starts = specs.map((sp, i) => i === 0 ? 0 : firstS(sp.l));
  specs.forEach((sp, i) => {
    const start = starts[i], end = i === specs.length - 1 ? total + 0.6 : starts[i + 1], dur = end - start;
    const sw = WORDS.filter(w => w.s >= start - 1e-6 && w.s < end);
    const R = v => { if (typeof v !== 'string' || v[0] !== 'w') return v == null ? 0 : v; const tg = sw[0].g + (+v.slice(1)), w = sw.find(x => x.g >= tg) || sw[sw.length - 1]; return Math.max(0, w.s - start); };
    const chars = (sp.ch || []).map(c => Object.assign({}, c, { a: R(c.a), m2: (c.m2 || []).map(([t, m]) => [R(t), m]), p2: (c.p2 || []).map(([t, m]) => [R(t), m]), go: c.go && { ...c.go, t0: R(c.go.t0), t1: R(c.go.t1) } }));
    const props = (sp.pr || []).map(p => Object.assign({}, p, { a: R(p.a), fade: p.fade == null ? null : R(p.fade), go: p.go && { ...p.go, t0: R(p.go.t0), t1: R(p.go.t1) } }));
    const labels = (sp.tx || []).map(x => Object.assign({}, x, { a: R(x.a), until: x.until == null ? null : R(x.until) }));
    const fxs = (sp.fx || []).map(f => Object.assign({}, f, { at: R(f.at) }));
    if (i < specs.length - 1) KT.cues.push({ t: +(end - .22).toFixed(3), k: 'whoosh' });
    fxs.forEach(f => KT.cues.push({ t: +(start + f.at).toFixed(3), k: { burst: 'thud', flash: 'sparkle', shake: 'thud', spark: 'sparkle', puff: 'pop' }[f.k] || 'pop' }));
    [...chars, ...props, ...labels].forEach(e => { if (e.a > 0.05 && e.snd !== false) KT.cues.push({ t: +(start + e.a).toFixed(3), k: e.snd || 'pop' }); });
    SHOTS.push({ start, end, tr: i === specs.length - 1 ? 'cut' : (sp.tr || 'whip'), draw(ctx, lt, t) {
      const p = clamp(lt / dur), hh = shake(t * .35, 3, 1, 2); let sx = 0, sy = 0;
      fxs.forEach(f => { if (f.k === 'shake' && lt >= f.at) { const q = lt - f.at, a = (f.amp || 26) * Math.exp(-q * 6); sx += Math.sin(q * 60) * a; sy += Math.cos(q * 47) * a; } });
      const z = sp.z ? lerp(sp.z[0], sp.z[1], ease(p)) : 1 + .05 * p;
      const cam = { x: lv(sp.cx == null ? 540 : sp.cx, p) + hh[0] + sx, y: lv(sp.cy == null ? 960 : sp.cy, p) + hh[1] + sy, z, r: sp.roll || 0 };
      KT.bgs[sp.bg || 'day'](ctx, t, cam, sp); applyCam(ctx, cam, 1);
      props.filter(q => q.back).forEach(q => drawProp(ctx, q, lt, t)); chars.forEach(c => drawChar(ctx, c, lt, t)); props.filter(q => !q.back).forEach(q => drawProp(ctx, q, lt, t));
      labels.forEach(x => drawLabel(ctx, x, lt)); fxs.forEach(f => drawFx(ctx, f, lt, t));
      if (sp.dark) darkness(ctx, sp.dark);
    } });
  });
  window.KT_CUES = KT.cues; window.KT_TOTAL = total;
};
})();
