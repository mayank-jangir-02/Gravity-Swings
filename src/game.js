// Ovo: minimalist black-and-white gravity-switching platform game.
// Level generation, rendering, controls, physics, hazards and completion are kept in clearly marked sections below.
const W = 4600, H = 3000, K = '#000';
let seed = 5; const R = () => (seed = seed * 16807 % 2147483647) / 2147483647;
const wc = document.createElement('canvas'); wc.width = W; wc.height = H; const g = wc.getContext('2d', { willReadFrequently: true });
g.fillStyle = K; g.fillRect(0, 0, W, H); g.lineCap = 'round'; g.lineJoin = 'round';
// ---- level: one winding white cave (corridors + chambers) carved through a huge black mass; x,y,width
const WP = [[250, 420, 300], [900, 470, 320], [1600, 640, 300], [2250, 820, 520], [2300, 1350, 300], [2000, 1800, 500], [1100, 1850, 300], [600, 2000, 300], [600, 2500, 320], [1300, 2650, 300], [2200, 2650, 520], [3000, 2500, 300], [3500, 2250, 300], [3500, 1700, 300], [3900, 1200, 320], [4300, 800, 420]];
const cr = (a, b, c, d, t) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
const path = [];
for (let i = 0; i < WP.length - 1; i++) {
  const p0 = WP[Math.max(0, i - 1)], p1 = WP[i], p2 = WP[i + 1], p3 = WP[Math.min(WP.length - 1, i + 2)], n = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 20);
  for (let k = 0; k < n; k++)path.push([0, 1, 2].map(j => cr(p0[j], p1[j], p2[j], p3[j], k / n)))
}
path.push(WP[WP.length - 1]);
g.fillStyle = '#fff';
path.forEach((q, i) => { const r = q[2] / 2 * (.92 + .1 * Math.sin(i * .31) + .07 * Math.sin(i * 1.1 + 2)); g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fill() });
const wd = new Uint8Array(W * H);
function scan() { const d = g.getImageData(0, 0, W, H).data; for (let i = 0; i < W * H; i++)wd[i] = d[i * 4] > 127 }
const raw = (x, y) => { x = Math.floor(x); y = Math.floor(y); return x < 0 || x >= W || y < 0 || y >= H ? 0 : wd[y * W + x] };
scan();
const edge = (x, y0, d) => { for (let y = y0; y >= 0 && y < H; y += d)if (!raw(x, y)) return y; return null };
// ---- sparse decoration
g.fillStyle = '#6a6a6a'; for (let i = 0; i < 900; i++) { const x = R() * W, y = R() * H; if (!raw(x, y)) { g.beginPath(); g.arc(x, y, .7 + R() * 1.6, 0, 7); g.fill() } }
for (let n = 0, c = 0; n < 900 && c < 16; n++) {
  const x = 100 + R() * (W - 200), y = 100 + R() * (H - 200), r = 30 + R() * 38; let ok = !raw(x, y);
  for (let a = 0; a < 12 && ok; a++)for (const m of [1.8, 3]) if (raw(x + Math.cos(a * .5236) * r * m, y + Math.sin(a * .5236) * r * m)) ok = 0;
  if (!ok) continue; c++; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = K;
  for (let k = 0; k < r / 3; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * (r - 6); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + R() * 2.5, 0, 7); g.fill() }
  g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.setLineDash([12, 8]); g.beginPath(); g.arc(x, y, r + 12, 0, 7); g.stroke(); g.setLineDash([])
}
function bubble(x, y, r) {
  g.fillStyle = K; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#fff';
  for (let k = 0; k < r / 2.2; k++) { const a = R() * 6.28, d = Math.pow(R(), .7) * (r - 8); g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, .8 + R() * R() * 3.5, 0, 7); g.fill() }
}
[[2150, 780, 52], [2380, 860, 34], [1950, 1740, 48], [2090, 1880, 32], [2100, 2600, 55], [2330, 2700, 36], [4220, 740, 50], [4400, 860, 32]].forEach(b => bubble(...b));
function tree(x, y, a, l, w, d) {
  if (d < 1) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.strokeStyle = K; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + (R() - .5) * 12, (y + y2) / 2, x2, y2); g.stroke();
  tree(x2, y2, a - .4 - R() * .3, l * .78, w * .7, d - 1); tree(x2, y2, a + .4 + R() * .3, l * .78, w * .7, d - 1)
}
[[1000, 500], [2150, 830], [1700, 2650]].forEach(([x, y]) => { const f = edge(x, y, 1); if (f) tree(x, f + 12, -Math.PI / 2, 58, 14, 5) });
function fern(x, y, h, lean) {
  g.strokeStyle = K; g.fillStyle = K; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x, y - h * .6, x + lean, y - h); g.stroke();
  for (let i = 1; i < 12; i++) { const t = i / 12, px = x + lean * t * t, py = y - t * h * .98, l = (1 - t * .8) * h * .3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(px, py); g.lineTo(px + s * l * .55, py - l * .5); g.lineTo(px + s * l, py - l * .28); g.lineTo(px + s * l * .55, py - l * .1); g.fill() } }
}
[[800, 470], [1200, 560], [900, 1900], [1100, 2650], [2550, 2650], [4100, 1000]].forEach(([x, y]) => { const f = edge(x, y, 1); if (f) fern(x, f + 10, 50 + R() * 40, (R() - .5) * 60) });
[[1100, 1280, 540], [2900, 3050, 2500]].forEach(([a, b, y0]) => {
  for (let x = a; x < b; x += 28) {
    const c = edge(x, y0, -1); if (c == null) continue; const L = 40 + R() * 90; g.strokeStyle = K; g.fillStyle = K; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, c - 4); g.lineTo(x, c + L); g.stroke();
    for (let t = .3; t <= 1; t += .25) { g.save(); g.translate(x, c + L * t); g.rotate((R() - .5) * .9); g.beginPath(); g.ellipse(0, 0, 4, 12, 0, 0, 7); g.fill(); g.restore() }
  }
});
g.strokeStyle = '#aaa'; g.fillStyle = '#aaa'; g.lineWidth = 1;
for (let n = 0, c = 0; n < 2500 && c < 130; n++) { const x = R() * W, y = R() * H; if (!raw(x, y) || !raw(x, y + 30) || !raw(x, y - 20)) continue; c++; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); for (const dx of [-5, 0, 5]) { g.beginPath(); g.arc(x + dx, y - 3 - (dx ? 0 : 3), 1.6, 0, 7); g.fill() } }
// ---- hazards: jagged spike clusters and a thorn bramble (kept as geometry)
const tris = [], segs = [];
function spikes(x0, x1, y0, dir, a, b) { for (let x = x0; x < x1;) { const w = 14 + R() * 22, h = a + R() * (b - a), f = edge(x, y0, dir); if (f != null) { const y = f + dir * 6; tris.push([x, y, x + w, y, x + w * .4, y - dir * (h + 6)]) } x += w * .55 } }
spikes(560, 800, 450, 1, 55, 150); spikes(1250, 1450, 560, -1, 60, 160); spikes(1300, 1600, 1830, 1, 60, 150); spikes(1500, 1850, 2640, 1, 70, 160); spikes(2700, 2900, 2570, -1, 60, 140);
function bram(x0, x1, y0, A) { let p = null; for (let x = x0; x <= x1; x += 10) { const q = [x, y0 + Math.sin(x / 38) * A + Math.sin(x / 90) * A * 1.2]; if (p) segs.push([p[0], p[1], q[0], q[1]]); p = q; if ((x / 10 | 0) % 3 == 0) { const s = (x / 10 | 0) % 2 ? -1 : 1; tris.push([x - 4, q[1], x + 4, q[1], x + s * 2, q[1] + s * 16]) } } }
bram(1950, 2400, 2610, 22);
g.fillStyle = K; g.strokeStyle = K; g.lineWidth = 5;
tris.forEach(t => { g.beginPath(); g.moveTo(t[0], t[1]); g.lineTo(t[2], t[3]); g.lineTo(t[4], t[5]); g.fill() });
segs.forEach(s => { g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[2], s[3]); g.stroke() });
scan();
function hit(px, py) {
  for (const t of tris) {
    if (px < Math.min(t[0], t[2], t[4]) || px > Math.max(t[0], t[2], t[4])) continue;
    const d1 = (px - t[2]) * (t[1] - t[3]) - (t[0] - t[2]) * (py - t[3]), d2 = (px - t[4]) * (t[3] - t[5]) - (t[2] - t[4]) * (py - t[5]), d3 = (px - t[0]) * (t[5] - t[1]) - (t[4] - t[0]) * (py - t[1]);
    if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) return 1
  }
  for (const s of segs) { if (Math.abs(px - s[0]) > 16) continue; const dx = s[2] - s[0], dy = s[3] - s[1], u = Math.max(0, Math.min(1, ((px - s[0]) * dx + (py - s[1]) * dy) / (dx * dx + dy * dy))); if (Math.hypot(px - s[0] - u * dx, py - s[1] - u * dy) < 7) return 1 } return 0
}
// ---- game
const cv = document.getElementById('c'), ctx = cv.getContext('2d'); let cw, ch;
function fit() { const d = devicePixelRatio || 1; cw = cv.width = innerWidth * d; ch = cv.height = innerHeight * d } fit(); addEventListener('resize', fit);
const CPS = [[250, 420], [1100, 1850], [1300, 2650], [3500, 1750]], GATE = [4300, 800], RAD = 16;
// p = the colour the ball lives in: 1 = white (gravity down), 0 = black (gravity up). It only changes when you press a swap key.
const P = { x: 0, y: 0, vx: 0, vy: 0 }; let p = 1, cp = 0, dead = 0, won = 0, cool = 0, clicked = 0, time = 0, fx = [], cx = 0, cy = 0, contact = 0;
function spawn() { P.x = CPS[cp][0]; P.y = CPS[cp][1]; P.vx = P.vy = 0; p = 1 }
spawn(); cx = P.x - 300; cy = P.y - 400;
const keys = {}, MOVE = { ArrowLeft: 1, ArrowRight: 1, KeyA: 1, KeyD: 1 };
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.code == 'Tab' || e.code == 'Escape' || /^F\d+$/.test(e.code)) return; e.preventDefault();
  if (MOVE[e.code]) { keys[e.code] = 1; return } if (!e.repeat) flip()
});
addEventListener('keyup', e => keys[e.code] = 0);
// touch only (no mouse): tap the middle to swap, hold the far left/right edge to move
cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture?.(e.pointerId); const f = e.clientX / innerWidth; if (e.pointerType === 'touch') { if (f < .2) keys.tl = 1; else if (f > .8) keys.tr = 1; else flip() } else if (e.button === 0) flip() });
cv.addEventListener('pointerup', () => { keys.tl = keys.tr = 0 }); cv.addEventListener('pointercancel', () => { keys.tl = keys.tr = 0 });
function flip() {
  if (won > 2) { won = 0; dead = 0; cool = 0; clicked = 0; cp = 0; spawn(); return } if (dead > 0 || won || cool > 0) return;
  p ^= 1; cool = .12; clicked = 1; fx.push({ x: P.x, y: P.y, t: 0, s: 240 });
  if (raw(P.x, P.y) !== p) {
    let best = 1e9, bx = 0, by = 0;
    for (let a = 0; a < 24; a++) { const ca = Math.cos(a * .2618), sa = Math.sin(a * .2618); for (let d = 4; d < 500; d += 4)if (raw(P.x + ca * d, P.y + sa * d) === p) { if (d < best) { best = d; bx = ca; by = sa } break } }
    if (best < 500) { P.vx = P.vx * .3 + bx * 700; P.vy = P.vy * .3 + by * 700 }
  }
}
function die() { dead = .7; fx.push({ x: P.x, y: P.y, t: 0, s: 180 }) }
let N = [0, -1];
function collide() {
  let c = 0; for (let it = 0; it < 8; it++) {
    let nx = 0, ny = 0, k = 0;
    for (let a = 0; a < 32; a++) { const ax = P.x + Math.cos(a * .19635) * RAD, ay = P.y + Math.sin(a * .19635) * RAD; if (raw(ax, ay) !== p) { nx += P.x - ax; ny += P.y - ay; k++ } }
    if (!k) break; c = 1; const l = Math.hypot(nx, ny) || 1; N = [nx / l, ny / l]; P.x += N[0] * 1.5; P.y += N[1] * 1.5
  }
  if (c) { const vn = P.vx * N[0] + P.vy * N[1]; if (vn < 0) { const e = -vn > 170 ? .5 : 0; P.vx -= (1 + e) * vn * N[0]; P.vy -= (1 + e) * vn * N[1] } } return c
}
function step(dt) {
  time += dt; cool -= dt; fx.forEach(f => f.t += dt * 1.6); fx = fx.filter(f => f.t < 1);
  if (won) { won += dt; return }
  if (dead > 0) { dead -= dt; if (dead <= 0) spawn(); return }
  const ax = ((keys.ArrowRight || keys.KeyD || keys.tr) ? 1 : 0) - ((keys.ArrowLeft || keys.KeyA || keys.tl) ? 1 : 0);
  P.vy += (p ? 1 : -1) * 1700 * dt; P.vx += ax * 1400 * dt;
  const sp = Math.hypot(P.vx, P.vy); if (sp > 850) { P.vx *= 850 / sp; P.vy *= 850 / sp }
  contact = 0; const n = Math.max(1, Math.ceil(sp * dt / 3));
  for (let i = 0; i < n; i++) {
    P.x += P.vx * dt / n; P.y += P.vy * dt / n;
    if (P.x < RAD) { P.x = RAD; P.vx = 0 } if (P.x > W - RAD) { P.x = W - RAD; P.vx = 0 } if (P.y < RAD) { P.y = RAD; P.vy = 0 } if (P.y > H - RAD) { P.y = H - RAD; P.vy = 0 }
    if (raw(P.x, P.y) === p && collide()) contact = 1
  }
  const fr = Math.pow(contact ? .75 : .9, dt); P.vx *= fr; if (!contact) P.vy *= fr;
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; if (hit(P.x + Math.cos(a) * RAD * .78, P.y + Math.sin(a) * RAD * .78)) { die(); return } }
  CPS.forEach((c, i) => { if (i > cp && Math.hypot(P.x - c[0], P.y - c[1]) < 130) { cp = i; fx.push({ x: c[0], y: c[1], t: 0, s: 120 }) } });
  if (cp === CPS.length - 1 && Math.hypot(P.x - GATE[0], P.y - GATE[1]) < 60) won = .001;
}
function draw() {
  const s = ch / 800, vw = cw / s;
  const tx = Math.max(0, Math.min(W - vw, P.x - vw / 2 + P.vx * .25)), ty = Math.max(0, Math.min(H - 800, P.y - 400 + P.vy * .1));
  cx += (tx - cx) * .12; cy += (ty - cy) * .09;
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.drawImage(wc, cx, cy, vw, 800, 0, 0, cw, ch);
  ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
  const X = x => (x - cx) * s, Y = y => (y - cy) * s;
  CPS.forEach((c, i) => { if (!i) return; ctx.lineWidth = 2 * s; for (let k = 0; k < 3; k++) { ctx.globalAlpha = cp >= i ? 1 : .45; ctx.beginPath(); ctx.arc(X(c[0]), Y(c[1]), (8 + k * 9 + Math.sin(time * 2 + k) * 2) * s, 0, 7); ctx.stroke() } });
  ctx.globalAlpha = 1; ctx.lineWidth = 3 * s; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(X(GATE[0]), Y(GATE[1]), (10 + k * 14 + Math.sin(time * 3 - k) * 4) * s, 0, 7); ctx.stroke() }
  fx.forEach(f => { ctx.globalAlpha = 1 - f.t; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), f.t * f.s * s, 0, 7); ctx.stroke() }); ctx.globalAlpha = 1;
  if (dead <= 0) {
    const sp = Math.hypot(P.vx, P.vy), sh = contact ? Math.min(2.2, sp / 160) : 0, sq = Math.min(.25, sp / 3400), dir = p ? 1 : -1,
    bx = X(P.x), by = Y(P.y);
    ctx.save(); ctx.translate(bx, by); ctx.scale(1 - sq, 1 + sq); ctx.beginPath(); ctx.arc(0, 0, RAD * s, 0, 7); ctx.fill();
    ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(0, -dir * RAD * s * .8); ctx.quadraticCurveTo(P.vx * .01 * s, -dir * RAD * s * 1.5, P.vx * .02 * s + 3 * s, -dir * RAD * s * 1.75); ctx.stroke();
    ctx.beginPath(); ctx.arc(P.vx * .02 * s + 3 * s, -dir * RAD * s * 1.8, 3 * s, 0, 7); ctx.fill(); ctx.restore()
  }
  if (!clicked && !won) {
    const bx = X(P.x), by = Y(P.y) - 70 * s, w = 44 * s, h = 16 * s; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.roundRect(bx - w / 2, by - h / 2, w, h, 4 * s); ctx.stroke();
    ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(time * 4)); ctx.beginPath(); ctx.roundRect(bx - w / 2 + 4 * s, by - h / 2 + 4 * s, w - 8 * s, h - 8 * s, 2 * s); ctx.fill(); ctx.globalAlpha = 1
  }
  if (won) { const t = Math.min(1, won / 2.5); ctx.globalAlpha = t * .9; ctx.beginPath(); ctx.arc(X(P.x), Y(P.y), t * Math.hypot(cw, ch), 0, 7); ctx.fill(); ctx.globalAlpha = 1 }
  ctx.globalCompositeOperation = 'source-over';
}
let last = performance.now();
(function loop(n) { const dt = Math.min(.033, (n - last) / 1000); last = n; step(dt); draw(); requestAnimationFrame(loop) })(last);
