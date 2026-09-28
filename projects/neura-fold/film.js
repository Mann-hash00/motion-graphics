/* Neura — "The Fold". 24s, 1080x1920, 30fps.
   Every pixel is a pure function of time: seek(t) draws frame t (seconds). No timers, no state between frames.
   Spec: specs/neura-explainer/SPEC.md. Frame numbers below (f###) are the spec's absolute frames. */
(() => {
const W = 1080, H = 1920, FPS = 30, T = 24;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');

// ───────────────────────────── math ─────────────────────────────
const F = f => f / FPS;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const eo = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const DEG = Math.PI / 180;
// closed-form damped spring step response 0 -> 1 (engine/motion.js)
const S = (tau, w, z) => {
  if (tau <= 0) return 0;
  if (z < 1) { const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + z * w / wd * Math.sin(wd * tau)); }
  return 1 - Math.exp(-w * tau) * (1 + w * tau);
};
// spring from stiffness/damping (mass 1), started at frame f0
const sp = (t, f0, k = 170, c = 26) => { const w = Math.sqrt(k); return S(t - F(f0), w, Math.min(1, c / (2 * w))); };
const spU = (t, f0, k, c) => { const w = Math.sqrt(k); return S(t - F(f0), w, c / (2 * w)); }; // allows underdamped
function pchip(xs, ys) {
  const n = xs.length, h = [], d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { h[i] = xs[i + 1] - xs[i]; d[i] = (ys[i + 1] - ys[i]) / h[i]; }
  for (let i = 1; i < n - 1; i++) if (d[i - 1] * d[i] > 0) { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const u = (x - xs[i]) / h[i], u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * ys[i] + (u3 - 2 * u2 + u) * h[i] * m[i] + (-2 * u3 + 3 * u2) * ys[i + 1] + (u3 - u2) * h[i] * m[i + 1];
  };
}

// ───────────────────────────── palette (spec §4, exact) ─────────────────────────────
const C = { bg0: '#0A0908', bg1: '#101010', orange: '#FF7A5C', gold: '#F0B958', green: '#3DDC97', red: '#FF6B5E',
  fg: '#F2F1EC', mute: '#8A8880', mute2: '#6E6C67', card: '#141312', line: '#1C1B19', axis: '#2A2926' };
const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const rgba = (h, a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(4)})`; };
const mixc = (h1, h2, u, a = 1) => { const x = rgb(h1), y = rgb(h2); return `rgba(${[0, 1, 2].map(i => Math.round(lerp(x[i], y[i], clamp(u)))).join(',')},${clamp(a).toFixed(4)})`; };

// ───────────────────────────── data: a seeded 12-week history (spec §6.3) ─────────────────────────────
let seed = 20260302;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const OPEN = 9.5 / 24, SLEN = 2 / 24, T0 = OPEN;            // sessions 09:30–11:30 ET; fold anchor = Monday 09:30
const DATE0 = Date.UTC(2026, 2, 2);                            // Monday 2 March 2026
const dateStr = day => { const d = new Date(DATE0 + day * 864e5); return String(d.getUTCMonth() + 1).padStart(2, '0') + '·' + String(d.getUTCDate()).padStart(2, '0'); };
const BIG_MONDAYS = [1, 2, 4, 5, 7, 9, 10];
const sessions = [], trades = [];
for (let w = 0; w < 12; w++) for (let d = 0; d < 5; d++) {
  const day = 7 * w + d, s = { day, w, d, start: day + OPEN, end: day + OPEN + SLEN, i: sessions.length };
  sessions.push(s);
  let mins = [];
  if (w === 11 && d === 4) mins = [[8, 'g', 5], [31, 's', 5], [64, 'g', 7]];           // Friday wk12: drawn live in S6
  else {
    const n = 5 + Math.floor(rnd() * 3); let m = 5 + rnd() * 6;
    for (let k = 0; k < n && m < 116; k++) { const r = rnd(); mins.push([m, r < 0.45 ? 'g' : r < 0.8 ? 'l' : 's', rnd() < 0.5 ? 5 : 7]); m += 9 + rnd() * 14; }
    if (d === 0 && BIG_MONDAYS.includes(w)) {
      mins[0] = [4, 'l', 5];                                                              // the losing first trade
      const bm = 12 + rnd() * 14 + (rnd() - 0.5) * 10;                                    // the large loss, 45-min window
      mins = mins.filter(x => x === mins[0] || Math.abs(x[0] - bm) > 7);
      mins.push([bm, 'l', 10, true]);
    }
    if (w === 3 && d === 2) { mins = mins.filter(x => Math.abs(x[0] - 78) > 7); mins.push([78, 'l', 10, true]); } // stray: Wed
    if (w === 7 && d === 4) { mins = mins.filter(x => Math.abs(x[0] - 101) > 7); mins.push([101, 'l', 10, true]); } // stray: Fri
  }
  mins.sort((a, b) => a[0] - b[0]);
  for (const [m, kind, size, big] of mins) trades.push({ td: day + OPEN + m / 1440, kind, size, big: !!big, day, w, d, live: w === 11 && d === 4 });
}
sessions.push({ day: 84, w: 12, d: 0, start: 84 + OPEN, end: 84 + OPEN + SLEN, i: sessions.length });
const LAND = { td: 84 + OPEN + 22 / 1440, kind: 'g', size: 7, big: false, day: 84, w: 12, d: 0, live: true, landing: true };
trades.push(LAND);
trades.forEach((k, i) => { k.i = i; k.col = k.big && k.d === 0; });
const BIGS = trades.filter(k => k.big), COL = trades.filter(k => k.col);
const THU_END = sessions[58].end, FRI = sessions[59];

// compressed time c: 1 unit per trading minute, G units per overnight/weekend gap (flat layout only)
const G = 40, BLK = 120 + G;
function cOf(td) {
  let j = -1; for (let i = 0; i < sessions.length; i++) if (sessions[i].start <= td) j = i; else break;
  if (j < 0) return 0;
  const s = sessions[j], base = j * BLK;
  if (td <= s.end) return base + (td - s.start) * 1440;
  const nx = sessions[j + 1]; if (!nx) return base + 120 + (td - s.end) * 1440;
  return base + 120 + G * (td - s.end) / (nx.start - s.end);
}
function tOfC(c) {
  const j = clamp(Math.floor(c / BLK), 0, sessions.length - 1), r = c - j * BLK, s = sessions[j];
  if (r <= 120) return s.start + r / 1440;
  const nx = sessions[j + 1]; if (!nx) return s.end + (r - 120) / 1440;
  return s.end + (r - 120) / G * (nx.start - s.end);
}
const inSession = td => sessions.some(s => td >= s.start - 1e-6 && td <= s.end + 1e-6);

// ───────────────────────────── flat layout (S1–S3): 3 passes, 180° turns ─────────────────────────────
const U = 5.9, R_TURN = 1400;
const TD0 = sessions[0].start, TD1 = sessions[60].end;
const C_MAX = cOf(TD1), L_TOT = C_MAX * U, LP = (L_TOT - 2 * Math.PI * R_TURN) / 3;
const X0 = -LP / 2, Y0 = -2 * R_TURN;
function flatPos(c) {
  let s = c * U;
  const turn = (cx, cy, a, dir) => [cx + dir * R_TURN * Math.sin(a), cy - R_TURN * Math.cos(a)];
  if (s < LP) return [X0 + s, Y0];
  s -= LP; if (s < Math.PI * R_TURN) return turn(X0 + LP, Y0 + R_TURN, s / R_TURN, 1);
  s -= Math.PI * R_TURN; if (s < LP) return [X0 + LP - s, Y0 + 2 * R_TURN];
  s -= LP; if (s < Math.PI * R_TURN) return turn(X0, Y0 + 3 * R_TURN, s / R_TURN, -1);
  s -= Math.PI * R_TURN; return [X0 + s, Y0 + 4 * R_TURN];
}
const S_FULL = 900 / (LP + 2 * R_TURN);

// samples along the thread
const samples = [];
for (let td = TD0; td <= TD1 + 1e-9; td += 0.008) samples.push({ td });
for (const k of trades) samples.push({ td: k.td });
samples.sort((a, b) => a.td - b.td);
for (const s of samples) { s.c = cOf(s.td); [s.fx, s.fy] = flatPos(s.c); s.frac = (s.td - TD0) / (TD1 - TD0); s.ins = inSession(s.td); }
for (const k of trades) { k.c = cOf(k.td); [k.fx, k.fy] = flatPos(k.c); k.frac = (k.td - TD0) / (TD1 - TD0); }

// ───────────────────────────── the head (present moment) ─────────────────────────────
const S1K = trades.slice(0, 6).map(k => k.c);
const S1PATH = [0, ...S1K, S1K[5] + 14];
const knotEase = x => x - 0.85 * Math.sin(2 * Math.PI * x) / (2 * Math.PI);  // speed 15% at each knot: a pen pausing
function cS1(t) {
  const q = clamp((t - F(10)) / (F(60) - F(10))) * (S1PATH.length - 1.001);
  const i = Math.floor(q); return lerp(S1PATH[i], S1PATH[i + 1], knotEase(q - i));
}
const C_S1END = cS1(F(60)), C_END = cOf(THU_END);
const headS6 = pchip([F(360), F(372), F(396), F(405), F(450), F(479)],
  [THU_END, FRI.start, FRI.start + 70 / 1440, 84 + OPEN - (40 / 360) * 7, LAND.td, LAND.td + 0.012]);
function headTD(t) {
  if (t < F(60)) return tOfC(cS1(t));
  if (t < F(360)) return tOfC(C_S1END + (C_END - C_S1END) * sp(t, 60, 20, 9));
  return headS6(t);
}
// when did the head pass each knot (for pops + audio)
(() => {
  let j = 0; const order = [...trades].sort((a, b) => a.td - b.td);
  for (let t = 0; t <= T && j < order.length; t += 0.001) { const h = headTD(t); while (j < order.length && order[j].td <= h + 1e-9) { order[j].tp = t; j++; } }
  for (; j < order.length; j++) order[j].tp = Infinity;
})();

// ───────────────────────────── cameras ─────────────────────────────
// flat 2D camera (S1–S3): screen = (world - focus) * s + (540, 960)
const FOCUS1 = [flatPos(0)[0] + 360, flatPos(0)[1]];
function cam2D(t) {
  const push = 1 + 0.02 * sp(t, 0, 16, 8);
  const p = spU(t, 60, 120, 14), q = sp(t, 60, 70, 17);
  const s = Math.exp(lerp(Math.log(push), Math.log(S_FULL), p)) * (1 + 0.08 * sp(t, 120, 90, 22));
  return { s, fx: lerp(FOCUS1[0], 0, q), fy: lerp(FOCUS1[1], 0, q) };
}
// helix period (days per turn): 6.2 -> tuning -> hold -> snap to 7.0 at f270
function period(t) {
  const tune = u => 6.2 + 0.8 * sp(u, 210, 6, 4.9);
  if (t < F(262)) return tune(t);
  const p262 = tune(F(262));
  return p262 + (7 - p262) * spU(t, 270, 900, 50);
}
const R_HX = 300, K_HX = 95, TMID = (TD0 + THU_END) / 2, CY_HX = 830, FOC = 1500, DIST = 1800;
function cam3(t) {
  const yaw = 28 * sp(t, 180, 40, 12) - 16 * sp(t, 271, 40, 12) - 8 * sp(t, 300, 30, 11);
  const pitch = 12 * sp(t, 180, 40, 12) + 20 * sp(t, 360, 30, 11) - 32 * sp(t, 480, 40, 12);
  const zp = sp(t, 360, 30, 11) * (1 - sp(t, 480, 40, 12));
  const Z = (1 + 0.03 * sp(t, 300, 20, 9)) * lerp(1, 1.32, zp);
  return { yaw: yaw * DEG, pitch: pitch * DEG, P: period(t), Z, src: [540, lerp(CY_HX, 360, zp)], dst: [540, lerp(CY_HX, 620, zp)] };
}
function helixScreen(td, K) {
  const th = 2 * Math.PI * (td - T0) / K.P, y = -K_HX * (td - TMID) / K.P;
  const x = R_HX * Math.sin(th), z = -R_HX * Math.cos(th);
  const x1 = x * Math.cos(K.yaw) + z * Math.sin(K.yaw), z1 = -x * Math.sin(K.yaw) + z * Math.cos(K.yaw);
  const y2 = y * Math.cos(K.pitch) - z1 * Math.sin(K.pitch), z2 = y * Math.sin(K.pitch) + z1 * Math.cos(K.pitch);
  const pp = FOC / (DIST + z2);
  let sx = 540 + x1 * pp, sy = CY_HX + y2 * pp;
  sx = (sx - K.src[0]) * K.Z + K.dst[0]; sy = (sy - K.src[1]) * K.Z + K.dst[1];
  const back = smooth((z1 / R_HX + 0.35) / 0.7);            // 0 front .. 1 back
  return { x: sx, y: sy, a: lerp(1, 0.3, back), sc: pp * K.Z, z: z1 };
}
// timeline (S7)
const TL_X0 = 100, TL_X1 = 980, TL_Y = 520, TL_T0 = TD0 - 0.4, TL_T1 = LAND.td + 0.5;
const tlX = td => lerp(TL_X0, TL_X1, (td - TL_T0) / (TL_T1 - TL_T0));

function frameState(t) {
  const c2 = cam2D(t), K = cam3(t);
  return { t, c2, K, lift0: F(180), unw0: F(480) };
}
// one position function for every point on the thread (samples, knots, head)
function place(pt, St) {
  const { t, c2, K } = St;
  let x = 540 + (pt.fx - c2.fx) * c2.s, y = 960 + (pt.fy - c2.fy) * c2.s, a = 1, sc = clamp(c2.s, 0.5, 1), z = -1;
  const lift = t < St.lift0 ? 0 : sp(t, 180 + 18 * pt.frac, 120, 22);
  if (lift > 0) {
    const h = helixScreen(pt.td, K);
    x = lerp(x, h.x, lift); y = lerp(y, h.y, lift); a = lerp(1, h.a, lift); sc = lerp(sc, h.sc * 0.9, lift); z = h.z;
  }
  const unw = t < St.unw0 ? 0 : sp(t, 480 + 10 * (1 - pt.frac), 110, 21);
  if (unw > 0) { x = lerp(x, tlX(pt.td), unw); y = lerp(y, TL_Y, unw); a = lerp(a, 1, unw); sc = lerp(sc, 1, unw); }
  return { x, y, a, sc, z, lift, unw };
}

// ───────────────────────────── text (spec §3) ─────────────────────────────
const FONT = { geist: w => `${w} %spx Geist`, mono: () => `500 %spx GeistMono` };
const mcache = new Map();
function glyphs(str, font, size, trackEm) {
  const key = str + '|' + font + size + '|' + trackEm;
  if (mcache.has(key)) return mcache.get(key);
  ctx.font = font.replace('%s', size); ctx.letterSpacing = (trackEm * size).toFixed(2) + 'px';
  const xs = []; for (let i = 0; i <= str.length; i++) xs.push(ctx.measureText(str.slice(0, i)).width);
  const r = { xs, w: xs[str.length] - trackEm * size };
  mcache.set(key, r); return r;
}
// thread-write entry + reabsorb exit. line = {s,y,size,weight,color,track,x?,align?}
function writeLine(t, L, tin, tout, opt = {}) {
  if (t < tin) return;
  const font = L.mono ? FONT.mono() : FONT.geist(L.weight || 500), size = L.size, track = L.track ?? -0.02;
  const g = glyphs(L.s, font, size, track), n = L.s.length;
  const cx = L.x ?? 540, x0 = L.align === 'left' ? cx : L.align === 'right' ? cx - g.w : cx - g.w / 2;
  const dur = n * F(opt.stagger ?? 1.2) + F(4), rule = opt.rule !== false;
  const ex = tout == null ? 0 : eo((t - tout) / F(6));
  if (tout != null && t > tout + F(12)) return;
  ctx.save();
  ctx.font = font.replace('%s', size); ctx.letterSpacing = (track * size).toFixed(2) + 'px';
  ctx.fillStyle = L.color || C.fg; ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < n; i++) {
    const ch = L.s[i]; if (ch === ' ') continue;
    const gx = x0 + g.xs[i], gw = g.xs[i + 1] - g.xs[i];
    const gin = tin + ((g.xs[i] + gw / 2) / g.w) * (dur - F(4));
    const p = S(t - gin, 13.04, 1);
    if (p <= 0.001) continue;
    const shift = -(i - n / 2) * 0.04 * size * ex;
    const bottom = L.y + 0.3 * size, top = bottom - 1.4 * size * p;
    const topE = lerp(top, bottom, ex);
    ctx.save(); ctx.beginPath(); ctx.rect(gx + shift - 4, topE, gw + 8, bottom - topE); ctx.clip();
    ctx.fillText(ch, gx + shift, L.y + (1 - p) * 0.18 * size);
    ctx.restore();
  }
  ctx.restore();
  if (!rule) return;
  // baseline rule: draws with the glyphs, retracts once they land; reappears on exit then retracts to centre
  const ruleY = L.y + 0.16 * size;
  let a = 0, l = x0, r = x0;
  const pr = eo((t - tin) / dur);
  if (tout == null || t < tout) { a = 1 - clamp((t - (tin + dur + F(6))) / F(6)); r = x0 + g.w * pr; }
  else { const q = (t - tout) / F(6); a = q > 0.5 ? 1 : 0; const k = clamp((t - tout - F(6)) / F(4)); const mid = x0 + g.w / 2; l = lerp(x0, mid, eo(k)); r = lerp(x0 + g.w, mid, eo(k)); if (k >= 1) a = 0; }
  if (a > 0.002 && r > l) { ctx.fillStyle = rgba(L.ruleColor || C.fg, a * 0.9); ctx.fillRect(l, ruleY, r - l, 1.5); }
}
const statement = (t, lines, tin, tout, opt) => lines.forEach((L, i) => writeLine(t, L, tin + F(6) * i, tout, opt));
// scaffold print: separators cut on first, then fields one per 2 frames. parts: [text, isSep, color?]
function scaffold(t, parts, x, y, size, tin, tout, align = 'left', defColor = C.mute) {
  if (t < tin || (tout != null && t >= tout)) return;
  const font = FONT.mono(), full = parts.map(p => p[0]).join(''), g = glyphs(full, font, size, 0.04);
  let x0 = align === 'left' ? x : align === 'right' ? x - g.w : x - g.w / 2;
  ctx.font = font.replace('%s', size); ctx.letterSpacing = (0.04 * size).toFixed(2) + 'px'; ctx.textBaseline = 'alphabetic';
  let off = 0, field = 0;
  for (const [s, sep, col] of parts) {
    const on = sep ? t >= tin : t >= tin + F(2) * (++field);
    if (on) { ctx.fillStyle = sep ? C.mute2 : (col || defColor); ctx.fillText(s, x0 + g.xs[off], y); }
    off += s.length;
  }
}
// odometer: every digit column rolls; higher digits roll only while the lower digit passes 9 -> 0
function odometer(v, decimals, suffix, x, y, size, color, align = 'right') {
  const font = FONT.mono(); ctx.font = font.replace('%s', size); ctx.letterSpacing = '0px'; ctx.textBaseline = 'alphabetic';
  const cw = ctx.measureText('0').width;
  const intDigits = Math.max(1, Math.floor(Math.abs(v) + 1e-9).toString().length);
  const cols = []; for (let j = intDigits - 1; j >= -decimals; j--) cols.push(j);
  const sw = ctx.measureText(suffix).width, total = (cols.length + (decimals ? 0.6 : 0)) * cw + sw;
  let px = align === 'right' ? x - total : align === 'center' ? x - total / 2 : x;
  const lh = size * 1.15;
  ctx.fillStyle = color;
  for (const j of cols) {
    const dv = (v / Math.pow(10, j)) % 10, low = j === -decimals ? null : ((v / Math.pow(10, j - 1)) % 10);
    const base = Math.floor(dv + 1e-6) % 10;
    const roll = low == null ? dv - Math.floor(dv + 1e-6) : clamp(low - 9);
    ctx.save(); ctx.beginPath(); ctx.rect(px - 2, y - size * 0.95, cw + 4, size * 1.2); ctx.clip();
    ctx.fillText(String(base), px, y - roll * lh); ctx.fillText(String((base + 1) % 10), px, y + (1 - roll) * lh);
    ctx.restore(); px += cw;
    if (j === 0 && decimals) { ctx.fillText('.', px - cw * 0.2, y); px += cw * 0.6; }
  }
  ctx.fillText(suffix, px, y);
}

// ───────────────────────────── background + grain ─────────────────────────────
const grains = [0, 1, 2, 3].map(() => {
  const g = document.createElement('canvas'); g.width = 540; g.height = 960;
  const gx = g.getContext('2d'), im = gx.createImageData(540, 960);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(rnd() * 6); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0); return g;
});
const bgGrad = ctx.createRadialGradient(540, 960, 0, 540, 960, 1100);
bgGrad.addColorStop(0, C.bg1); bgGrad.addColorStop(1, C.bg0);
function glow(x, y, r, color, a) {
  if (a <= 0.002) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function rrect(x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), r); }

// ───────────────────────────── derived per-frame geometry helpers ─────────────────────────────
function columnBox(St) {
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const k of COL) { const p = place(k, St); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  // S6: the column's outline reaches up to next Monday's turn, where the landing will happen
  const ext = sp(St.t, 398, 80, 18);
  if (ext > 0) { const L = place(LAND, St); y0 = lerp(y0, Math.min(y0, L.y), ext); }
  return { x0: x0 - 16, x1: x1 + 16, y0: y0 - 20, y1: y1 + 20 };
}
const FROZEN = {};
const frozenBox = () => FROZEN.box || (FROZEN.box = columnBox(frameState(F(479))));

// ───────────────────────────── the frame ─────────────────────────────
function seek(t) {
  const fr = t * FPS;
  const St = frameState(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

  const hTD = headTD(t);
  const headA = clamp((t - F(6)) / F(4)) * (1 - clamp((t - F(600)) / F(12)));
  const dimNon = 1 - 0.75 * sp(t, 120, 300, 35);           // S3 onward: everything but the large losses drops to 25%
  const tickUp = sp(t, 490, 170, 26);                       // S7: ticks come back to 70%
  const collapse = sp(t, 600, 170, 26);                     // S8: panels collapse to their centre lines

  // S8 clip: the timeline panel's collapse also clips the thread + ticks
  ctx.save();
  if (t >= F(600)) { const hh = 110 * (1 - collapse); ctx.beginPath(); ctx.rect(0, 530 - hh, W, 2 * hh); ctx.clip(); }

  // ── thread
  const thrW = t < F(180) ? lerp(1.5, 1.15, clamp((1 - cam2D(t).s) / 0.9)) : 1.3;
  const colT = t < F(480) ? C.fg : null;
  const buckets = new Map();
  let prev = null, headPt = null;
  const drawTo = hTD;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i]; if (s.td > drawTo) break;
    const p = place(s, St);
    if (prev) {
      let a = p.a * (s.ins && prev.s.ins ? 1 : 0.35);
      const b = Math.round(clamp(a) * 16);
      if (!buckets.has(b)) buckets.set(b, new Path2D());
      const pa = buckets.get(b); pa.moveTo(prev.p.x, prev.p.y); pa.lineTo(p.x, p.y);
    }
    prev = { s, p };
  }
  if (headA > 0) headPt = place({ td: hTD, fx: flatPos(cOf(hTD))[0], fy: flatPos(cOf(hTD))[1], frac: (hTD - TD0) / (TD1 - TD0) }, St);
  if (prev && headPt) { const b = Math.round(clamp(headPt.a) * 16); if (!buckets.has(b)) buckets.set(b, new Path2D()); buckets.get(b).moveTo(prev.p.x, prev.p.y); buckets.get(b).lineTo(headPt.x, headPt.y); }
  const unwAll = t < F(480) ? 0 : sp(t, 485, 110, 21);
  const threadColor = C.fg, threadAlpha = lerp(0.9, 1, unwAll);
  const tcol = unwAll > 0 ? mixc(C.fg, C.axis, unwAll) : null;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const keys = [...buckets.keys()].sort((a, b) => a - b);
  for (const b of keys) {       // glow pass
    if (unwAll > 0.9) break;
    ctx.strokeStyle = rgba(threadColor, 0.12 * b / 16 * (1 - unwAll)); ctx.lineWidth = 6; ctx.stroke(buckets.get(b));
  }
  for (const b of keys) {
    ctx.strokeStyle = tcol ? mixc(C.fg, C.axis, unwAll, b / 16) : rgba(threadColor, threadAlpha * b / 16);
    ctx.lineWidth = lerp(thrW * (t > F(405) && t < F(480) ? lerp(1, 0.75, sp(t, 405, 80, 18) * (1 - sp(t, 452, 80, 18))) : 1), 1, unwAll);
    ctx.stroke(buckets.get(b));
  }

  // ── S6 foresight arc: the path ahead lights up, drawn backwards from the future
  if (t >= F(405) && t < F(480)) {
    const aEnd = LAND.td - 0.0, aStart = 84 + OPEN - (40 / 360) * 7;
    const grow = eo((t - F(405)) / F(14)), cool = sp(t, 430, 60, 16);
    const from = Math.max(lerp(aEnd, aStart, grow), hTD);
    if (aEnd > from) {
      const path = new Path2D(); let first = true;
      for (let td = aEnd; td >= from - 1e-6; td -= 0.004) { const p = place({ td, fx: 0, fy: 0, frac: 1 }, St); first ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y); first = false; }
      const fade = 1 - clamp((t - F(452)) / F(8));
      ctx.strokeStyle = mixc(C.gold, C.fg, cool, 0.18 * fade); ctx.lineWidth = 12; ctx.stroke(path);
      ctx.strokeStyle = mixc(C.gold, C.fg, cool, 0.6 * fade); ctx.lineWidth = 3; ctx.stroke(path);
    }
  }

  // ── knots / ticks
  const colFlash = t >= F(270) ? 1 + 0.15 * (1 - sp(t, 270, 500, 20)) * (t < F(285) ? 1 : 0) : 1;
  for (const k of trades) {
    if (t < k.tp) continue;
    const p = place(k, St), age = t - k.tp;
    const pop = spU(age * FPS / FPS, 0, 400, 25);
    let col = k.kind === 'g' ? C.green : k.kind === 'l' ? C.red : C.mute2;
    let alpha = k.big ? 1 : (k.live ? 1 : dimNon);
    if (t >= F(480)) alpha = k.big ? 1 : lerp(dimNon, 0.7, tickUp);
    if (k.landing) {  // lands grey, holds 4 frames, fills green from the centre
      const fill = clamp((t - k.tp - F(4)) / F(6));
      const r0 = 1.4 * k.size / 2 * p.sc * pop;
      ctx.fillStyle = C.mute2; ctx.beginPath(); ctx.arc(p.x, p.y, r0, 0, 7); ctx.fill();
      if (fill > 0) { ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(p.x, p.y, r0 * fill, 0, 7); ctx.fill(); }
      glow(p.x, p.y, 12 * p.sc, C.green, fill * lerp(0.25, 0.12, clamp((t - k.tp - F(10)) / F(10))));
      if (fill > 0 && fill < 1 || age < F(12)) { ctx.strokeStyle = rgba(C.green, 0.8 * (1 - clamp(age / F(14)))); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, r0 + lerp(4, 12, eo(age / F(14))), 0, 7); ctx.stroke(); }
      continue;
    }
    const unw = p.unw;
    let r = 1.4 * k.size / 2 * p.sc * pop * (k.col ? colFlash : 1);
    if (!(t < F(180) && St.c2.s > 0.5)) r = Math.max(r, k.big ? 3.2 : 1.4);
    const a = alpha * p.a;
    if (k.big && t >= F(120) && unw < 1) glow(p.x, p.y, 16 * Math.max(p.sc, 0.7), C.red, 0.2 * a * (1 - unw));
    if (unw > 0) {  // disc -> 2x14 tick
      const hgt = lerp(2 * r, k.big ? 22 : 14, unw), wid = lerp(2 * r, 2, unw);
      ctx.fillStyle = rgba(col, a); rrect(p.x - wid / 2, p.y - hgt / 2, wid, hgt, wid / 2); ctx.fill();
    } else {
      ctx.fillStyle = rgba(col, a); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill();
      if (age < F(10)) { ctx.strokeStyle = rgba(col, a * (1 - age / F(10))); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, r + lerp(4, 9, age / F(10)) * Math.max(p.sc, 0.5), 0, 7); ctx.stroke(); }
    }
  }
  if (t >= F(480) && t < F(620)) glow(tlX(LAND.td), TL_Y, 12, C.green, 0.08 * tickUp);
  ctx.restore();

  // ── the head
  if (headPt && headA > 0) {
    const pulse = t > F(110) && (t < F(360) || t > F(479)) ? 0.075 * Math.sin(2 * Math.PI * t * 2) : 0;
    glow(headPt.x, headPt.y, 24 * Math.max(headPt.sc, 0.7), C.fg, (0.2 + pulse) * headA * 1.6);
    ctx.fillStyle = rgba(C.fg, headA); ctx.beginPath(); ctx.arc(headPt.x, headPt.y, 2.5 * Math.max(headPt.sc, 0.8), 0, 7); ctx.fill();
  }

  // ── S2 session labels: the thread dims across the gap but never breaks
  [[17, 72], [40, 86], [56, 100]].forEach(([j, f0]) => {
    if (fr < f0 || fr >= f0 + 8) return;
    const gc = j * BLK + 120 + G / 2, [fx, fy] = flatPos(gc), c2 = St.c2;
    const x = 540 + (fx - c2.fx) * c2.s, y = 960 + (fy - c2.fy) * c2.s;
    ctx.fillStyle = rgba(C.mute, 0.8); ctx.fillRect(x - 0.5, y - 26, 1, 16);
    scaffold(t, [['SESSION ', 0], [String(j + 1), 0, C.fg], [' → ', 1], [String(j + 2), 0, C.fg]], x, y - 34, 20, F(f0), F(f0 + 8), 'center');
  });

  // ── S3 brackets between consecutive large losses: the spacing is irregular, and it's measured
  if (t >= F(132) && t < F(196)) {
    const c2 = St.c2, scr = (fx, fy) => [540 + (fx - c2.fx) * c2.s, 960 + (fy - c2.fy) * c2.s];
    const bigs = [...BIGS].sort((a, b) => a.td - b.td);
    for (let k = 0; k < bigs.length - 1; k++) {
      const A = bigs[k], B = bigs[k + 1], st = F(134 + 3 * k);
      const pin = clamp((t - st) / F(9)), pout = clamp((t - F(184 + k)) / F(6));
      if (pin <= 0 || pout >= 1) continue;
      const pts = [scr(A.fx, A.fy)]; for (const s of samples) if (s.c > A.c && s.c < B.c) pts.push(scr(s.fx, s.fy)); pts.push(scr(B.fx, B.fy));
      const side = k % 2 ? 1 : -1, off = 13;
      const offPts = pts.map((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)]; const dx = q[0] - o[0], dy = q[1] - o[1], L = Math.hypot(dx, dy) || 1; return [p[0] - dy / L * off * side * -1, p[1] + dx / L * off * side * -1]; });
      const lens = [0]; for (let i = 1; i < offPts.length; i++) lens.push(lens[i - 1] + Math.hypot(offPts[i][0] - offPts[i - 1][0], offPts[i][1] - offPts[i - 1][1]));
      const Lt = lens[lens.length - 1];
      const tick1 = clamp(pin * 3), span = clamp(pin * 3 - 1), tick2 = clamp(pin * 3 - 2);
      const s0 = lerp(0, Lt / 2, eo(pout)), s1 = lerp(span * Lt, Lt / 2, eo(pout));
      ctx.strokeStyle = rgba(C.mute, 0.9); ctx.lineWidth = 1;
      const tick = (i, pr) => { if (pr <= 0 || pout > 0.3) return; const p = offPts[i], q = pts[i]; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(lerp(p[0], q[0], 0.55 * pr), lerp(p[1], q[1], 0.55 * pr)); ctx.stroke(); };
      tick(0, tick1); tick(offPts.length - 1, tick2);
      if (s1 > s0) { ctx.beginPath(); let started = false; for (let i = 0; i < offPts.length; i++) { if (lens[i] < s0 || lens[i] > s1) continue; started ? ctx.lineTo(...offPts[i]) : ctx.moveTo(...offPts[i]); started = true; } ctx.stroke(); }
      if (tick2 >= 1 && pout < 0.2) {
        let mi = 0; while (lens[mi] < Lt / 2) mi++;
        const p = offPts[mi], q = pts[mi], dx = p[0] - q[0], dy = p[1] - q[1], L = Math.hypot(dx, dy) || 1;
        scaffold(t, [[Math.round(B.td - A.td) + 'd', 0, C.fg]], p[0] + dx / L * 20, p[1] + dy / L * 20 + 7, 20, st + F(9), F(184 + k), 'center');
      }
    }
  }

  // ── S4 period readout (odometer)
  if (t >= F(212) && t < F(360)) {
    scaffold(t, [['PERIOD', 0]], 960, 300, 22, F(212), F(360), 'right');
    if (t >= F(214)) { ctx.globalAlpha = 1; odometer(period(t), 1, 'd', 960, 346, 34, t >= F(270) ? C.gold : C.fg, 'right'); }
  }
  // ── S4 snap flash: one red hairline through the column
  if (t >= F(270) && t < F(310)) {
    const b = columnBox(St), a = t < F(271) ? 1 : lerp(1, 0.3, clamp((t - F(271)) / F(12))) * (1 - clamp((t - F(300)) / F(10)));
    const cx = (b.x0 + b.x1) / 2;
    ctx.fillStyle = rgba(C.red, a); ctx.fillRect(cx - 1, b.y0, 2, b.y1 - b.y0);
    glow(cx, (b.y0 + b.y1) / 2, 40, C.red, 0);
  }
  // ── S5 gold scan, dates, condition label, bracket
  if (t >= F(300) && t < F(521)) {
    const b = t < F(479) ? columnBox(St) : frozenBox(), cx = (b.x0 + b.x1) / 2;
    const scan = sp(t, 300, 60, 15.5), sy = lerp(b.y1, b.y0, scan);
    const scanA = 1 - clamp((t - F(322)) / F(6));
    if (scanA > 0) { ctx.fillStyle = rgba(C.gold, scanA); ctx.fillRect(cx - 70, sy - 1, 140, 2); glow(cx, sy, 40, C.gold, 0.25 * scanA); }
    const lblOut = F(362);
    for (const k of COL) {
      const p = place(k, St); if (p.y < sy - 2 && t < F(320)) continue;
      const tin = t >= F(320) ? F(300) : t;   // printed as the scan passes
      const passT = (() => { for (let u = F(300); u < F(322); u += F(0.5)) if (lerp(b.y1, b.y0, sp(u, 300, 60, 15.5)) <= p.y) return u; return F(318); })();
      scaffold(t, [['MON', 0], [' ', 1], [dateStr(k.day), 0, C.fg]], p.x + 22, p.y + 7, 18, passT, lblOut, 'left');
    }
    // bracket: corners (gold, S5) -> faint red outline (S6)
    const bin = eo((t - F(320)) / F(6)), toRed = sp(t, 370, 60, 16);
    if (bin > 0) {
      const col = mixc(C.gold, C.red, toRed, lerp(1, 0.55, toRed)), cl = lerp(18 * bin, (b.y1 - b.y0) / 2, toRed), lw = lerp(2, 1, toRed);
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      for (const [x, y, dx, dy] of [[b.x0, b.y0, 1, 1], [b.x1, b.y0, -1, 1], [b.x0, b.y1, 1, -1], [b.x1, b.y1, -1, -1]]) {
        const cw = Math.min(lerp(14 * bin, (b.x1 - b.x0) / 2, toRed), (b.x1 - b.x0) / 2);
        ctx.moveTo(x + dx * cw, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * cl);
      }
      if (t < F(479) || t < F(520)) ctx.stroke();
      // leader to the condition label
      const lead = bin * (1 - eo((t - F(368)) / F(6)));
      if (lead > 0 && b.y1 < 1370) { ctx.strokeStyle = rgba(C.gold, lead); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, b.y1); ctx.lineTo(cx, lerp(b.y1, 1360, lead)); ctx.stroke(); }
    }
    scaffold(t, [['MON', 0, C.gold], [' · ', 1], ['09:30–10:15 ET', 0, C.gold], [' · ', 1], ['AFTER FIRST LOSS', 0, C.gold]], 540, 1392, 24, F(322), F(370), 'center');
  }

  // ── S7 UI: timeline panel, card (the column's outline IS the card), Control Room row
  if (t >= F(480)) {
    const fb = frozenBox();
    // timeline panel
    const pin = sp(t, 484, 170, 26), ph = 230 * pin * (1 - collapse);
    if (ph > 0.5) {
      ctx.save(); rrect(60, 530 - ph / 2, 960, ph, 16 * Math.min(1, ph / 40)); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke(); ctx.clip();
      scaffold(t, [['TRADE TIMELINE', 0], [' · ', 1], ['NQ', 0, C.fg], [' · ', 1], ['LAST 12 WEEKS', 0]], 100, 460, 20, F(492));
      [[0, '03·02'], [28, '03·30'], [56, '04·27'], [84, '05·25'.replace('05·25', dateStr(84))]].forEach(([d, s], i) => scaffold(t, [[s, 0, C.mute2]], tlX(d + OPEN), 590, 18, F(500 + 2 * i), null, 'center'));
      ctx.restore();
    }
    // card
    const m1 = sp(t, 520), m2 = sp(t, 523), m3 = sp(t, 526), m4 = sp(t, 529);
    let cx = lerp((fb.x0 + fb.x1) / 2, 540, m1), cw = lerp(fb.x1 - fb.x0, 920, m1), cy = lerp((fb.y0 + fb.y1) / 2, 1060, m2), ch = lerp(fb.y1 - fb.y0, 460, m2);
    ch *= (1 - collapse); const cr = lerp(0, 20, m3) * Math.min(1, ch / 40);
    if (t >= F(520) && ch > 0.3) {
      ctx.save(); rrect(cx - cw / 2, cy - ch / 2, cw, ch, cr);
      ctx.fillStyle = rgba(C.card, m4); ctx.fill(); ctx.strokeStyle = mixc(C.red, C.line, m4, lerp(0.55, 1, m4)); ctx.lineWidth = 1; ctx.stroke(); ctx.clip();
      scaffold(t, [['◆ ', 0, C.orange], ['AUREX', 0, C.orange], [' · ', 1], ['PATTERN', 0, C.orange]], 120, 886, 22, F(534));
      if (t >= F(534)) scaffold(t, [['7', 0, C.gold], [' of ', 1], ['9', 0, C.gold]], 960, 892, 40, F(536), null, 'right');
      const body = [['Your largest losses start after a', C.fg], ['losing first trade on Monday.', C.fg], ['In the 45 minutes that follow, your', C.mute], ['next entry averages 1.8× planned size.', C.mute]];
      body.forEach(([s, col], i) => writeLine(t, { s, y: 968 + i * 48 + (i > 1 ? 16 : 0), size: 33, color: col, align: 'left', x: 120, track: -0.01 }, F(538 + 5 * i), null, { rule: false, stagger: 0.35 }));
      const dv = eo((t - F(552)) / F(8)); if (dv > 0) { ctx.fillStyle = C.line; ctx.fillRect(120, 1180, 840 * dv, 1); }
      scaffold(t, [['LAST REPEAT', 0], [' · ', 1], ['MON ' + dateStr(70), 0, C.fg]], 120, 1232, 19, F(556));
      scaffold(t, [['MON ' + dateStr(84), 0, C.fg], [' · ', 1], ['HELD AT PLAN', 0, C.green]], 960, 1232, 19, F(558), null, 'right');
      ctx.restore();
    }
    // Control Room row: slides out of the card's bottom edge (discipline appears late, as proof)
    const rh = 96 * sp(t, 562) * (1 - collapse);
    if (rh > 0.3) {
      const top = t < F(600) ? 1302 : lerp(1302, 1354 - rh / 2, 1);
      ctx.save(); rrect(80, top, 920, rh, 16 * Math.min(1, rh / 40)); ctx.fillStyle = rgba(C.card, 0.6); ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke(); ctx.clip();
      scaffold(t, [['CONTROL ROOM', 0]], 120, 1338, 19, F(566));
      scaffold(t, [['[', 1], ['SET BY YOU', 0], [']', 1]], 960, 1338, 19, F(568), null, 'right');
      writeLine(t, { s: 'Size after first loss (Mon)', y: 1382, size: 30, color: C.fg, align: 'left', x: 120, track: -0.01 }, F(566), null, { rule: false, stagger: 0.35 });
      if (t >= F(570)) odometer(lerp(1.8, 1.0, sp(t, 572, 200, 28)), 1, '×', 960, 1384, 36, C.fg, 'right');
      ctx.restore();
    }
    // S8: the card collapses to a hairline, which retracts into the head at x=100
    if (t >= F(600) && t < F(640)) {
      const ret = eo((t - F(615)) / F(15)), a = collapse;
      const l = 80 + (100 - 80) * ret, r = lerp(1000, 100, ret);
      if (r - l > 0.5) { ctx.fillStyle = mixc(C.line, C.fg, a, 0.9); ctx.fillRect(l, 1059.25, r - l, 1.5); }
    }
  }

  // ── S8 close: master line written by the thread
  if (t >= F(600)) {
    const hx = lerp(100, 980, eo((t - F(660)) / F(30)));
    const hA = clamp((t - F(626)) / F(4));
    if (hA > 0) {
      if (hx > 100.5) { ctx.fillStyle = rgba(C.fg, 0.9); ctx.fillRect(100, 1059.25, hx - 100, 1.5); ctx.fillStyle = rgba(C.fg, 0.12); ctx.fillRect(100, 1057.5, hx - 100, 5); }
      const pulse = 0.075 * Math.sin(2 * Math.PI * t * 2);
      glow(hx, 1060, 24, C.fg, (0.2 + pulse) * 1.6 * hA);
      ctx.fillStyle = rgba(C.fg, hA); ctx.beginPath(); ctx.arc(hx, 1060, 2.5, 0, 7); ctx.fill();
    }
    statement(t, [{ s: 'The market already', y: 890, size: 54, color: C.mute }, { s: 'has intelligence.', y: 956, size: 54, color: C.mute, ruleColor: C.mute }], F(630), null);
    // line 2: glyphs rise out of the thread as the head passes them
    const L2 = { s: 'Now the trader does too.', y: 1036, size: 64, color: C.fg }, g = glyphs(L2.s, FONT.geist(500), 64, -0.02);
    const x0 = 540 - g.w / 2;
    ctx.font = FONT.geist(500).replace('%s', 64); ctx.letterSpacing = (-0.02 * 64).toFixed(2) + 'px'; ctx.fillStyle = C.fg;
    for (let i = 0; i < L2.s.length; i++) {
      if (L2.s[i] === ' ') continue;
      const gx = x0 + g.xs[i], gw = g.xs[i + 1] - g.xs[i];
      const passT = F(660) + F(30) * (() => { for (let u = 0; u <= 1; u += 0.005) if (lerp(100, 980, eo(u)) >= gx + gw / 2) return u; return 1; })();
      const p = S(t - passT, 13.04, 1); if (p <= 0.001) continue;
      const bottom = L2.y + 0.3 * 64 - 6, top = bottom - 1.4 * 64 * p;
      ctx.save(); ctx.beginPath(); ctx.rect(gx - 4, top, gw + 8, bottom - top); ctx.clip();
      ctx.fillText(L2.s[i], gx, L2.y + (1 - p) * 0.18 * 64); ctx.restore();
    }
    writeLine(t, { s: 'NEURA', y: 1320, size: 44, weight: 600, track: 0.24, color: C.fg }, F(690), null, { rule: false, stagger: 2 });
    scaffold(t, [['tradeneura', 0, C.mute2], ['.', 1], ['com', 0, C.mute2]], 540, 1372, 24, F(700), null, 'center');
  }

  // ── statements (spec §2, holds per §3.5)
  statement(t, [{ s: "Every trade you've ever taken.", y: 1260, size: 64 }], F(12), F(64));
  statement(t, [{ s: 'Neura keeps every session.', y: 1260, size: 64 }, { s: 'Nothing resets.', y: 1336, size: 64, color: C.mute, ruleColor: C.mute }], F(70), F(130));
  statement(t, [{ s: 'From inside,', y: 1260, size: 64 }, { s: 'losses look random.', y: 1336, size: 64 }], F(132), F(184));
  if (t >= F(360) && t < F(480)) {   // scrim so type reads over the foreground helix
    const sa = sp(t, 360, 60, 16) * (1 - sp(t, 474, 60, 16));
    const gr = ctx.createLinearGradient(0, 1340, 0, 1640); gr.addColorStop(0, rgba(C.bg0, 0)); gr.addColorStop(0.35, rgba(C.bg0, 0.85 * sa)); gr.addColorStop(1, rgba(C.bg0, 0.85 * sa));
    ctx.fillStyle = gr; ctx.fillRect(0, 1340, W, 300);
  }
  statement(t, [{ s: "They aren't.", y: 1520, size: 88, weight: 600, track: -0.035 }], F(276), F(318));
  statement(t, [{ s: 'Same day. Same hour.', y: 1480, size: 64 }, { s: 'Same first loss.', y: 1556, size: 64 }], F(324), F(394));
  statement(t, [{ s: 'Next Monday,', y: 1480, size: 64 }, { s: 'you see it coming.', y: 1556, size: 64 }], F(412), F(474));

  // ── grain (re-seeded every 2 frames)
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(grains[Math.floor(fr / 2) % 4], 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

// ───────────────────────────── exports for the renderer + audio ─────────────────────────────
window.DURATION = T; window.seek = seek;
window.buildEvents = () => {
  const ev = [];
  for (const k of trades) if (isFinite(k.tp)) ev.push({ t: k.tp, type: 'knot', kind: k.kind, big: k.big, landing: !!k.landing });
  const curves = { period: [], headSpeed: [] };
  let prevX = null;
  for (let f = 0; f < T * FPS; f++) {
    const t = F(f); curves.period.push(t >= F(180) && t < F(480) ? period(t) : 0);
    const St = frameState(t), h = headTD(t), p = place({ td: h, fx: flatPos(cOf(h))[0], fy: flatPos(cOf(h))[1], frac: (h - TD0) / (TD1 - TD0) }, St);
    let v = prevX ? Math.hypot(p.x - prevX[0], p.y - prevX[1]) : 0; if (f >= 600) v = 0; prevX = [p.x, p.y]; curves.headSpeed.push(v);
  }
  return { fps: FPS, duration: T, events: ev, curves };
};
const RENDER = location.search.includes('render');
document.body.classList.add(RENDER ? 'render' : 'preview');
window.READY = Promise.all([document.fonts.load('500 64px Geist'), document.fonts.load('600 64px Geist'), document.fonts.load('500 20px GeistMono')]).then(() => {
  mcache.clear(); seek(0);
  if (!RENDER) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % T); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
});
})();
