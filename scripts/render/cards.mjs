// Solarpunk HUD cards: glass panels with vines growing over the corners.
import { doc, esc, fmt, rng, DISPLAY, HAND, MONO, istStamp, timeAgo } from '../lib/theme.mjs';
import { person, bot } from '../lib/characters.mjs';

const W = 880;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE = (iso) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`;

function panel(t, w, h, { vine = true } = {}) {
  let s = `<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient>
<radialGradient id="pglow" cx="1" cy="0" r="1"><stop offset="0" stop-color="${t.accent}" stop-opacity="${t.name === 'night' ? 0.14 : 0.08}"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .05"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
<clipPath id="pc"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16"/></clipPath></defs>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="16" fill="url(#pg)" stroke="${t.border}"/><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="url(#pglow)"/>`;
  const c = t.accent;
  s += `<path d="M14 34 V14 H34 M${w - 34} 14 H${w - 14} V34 M14 ${h - 34} V${h - 14} H34 M${w - 34} ${h - 14} H${w - 14} V${h - 34}" stroke="${c}" stroke-width="1.6" fill="none" opacity=".7"/>`;
  if (vine) {
    const lf = (x, y, r) => `<path d="M${x} ${y} c-6 -2 -9 -8 -7 -12 c5 1 8 6 7 12z" fill="${t.name === 'night' ? '#2f8f6a' : '#5fae7c'}" transform="rotate(${r} ${x} ${y})"/>`;
    s += `<g class="vine"><path d="M${w - 4} 64 C${w - 30} 52 ${w - 46} 30 ${w - 80} 22 S${w - 150} 8 ${w - 190} 3" stroke="${t.name === 'night' ? '#2f8f6a' : '#5fae7c'}" stroke-width="1.8" fill="none"/>${lf(w - 30, 50, 20)}${lf(w - 62, 26, -10)}${lf(w - 104, 16, 30)}${lf(w - 150, 8, -20)}<circle cx="${w - 80}" cy="22" r="2.6" fill="${t.accent2}"/></g>`;
  }
  return s;
}
const grain = (w, h) => `<g clip-path="url(#pc)"><rect width="${w}" height="${h}" filter="url(#grain)"/></g>`;
const base = (t) => `.d{font-family:${DISPLAY};font-weight:700}.dm{font-family:${DISPLAY};font-weight:500}.hand{font-family:${HAND};font-weight:600}.mono{font-family:${MONO}}
.in{animation:in .7s ease-out both}@keyframes in{from{opacity:0;transform:translateY(6px)}}
.vine{animation:vine 5s ease-in-out infinite alternate}@keyframes vine{to{transform:translateY(1.5px)}}`;
const wobble = (cx, cy, rx, ry, seed) => { const R = rng(seed); let d = ''; for (let i = 0; i <= 26; i++) { const a = (i / 24) * Math.PI * 2 - 0.4, k = 1 + (R() - 0.5) * 0.12; d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)} `; } return d; };
const title = (t, text, sub) => `<text x="36" y="50" class="d" font-size="22" fill="${t.fg}" letter-spacing="-0.4">${esc(text)}</text><text x="36" y="72" class="mono" font-size="11.5" fill="${t.muted}">${esc(sub)}</text>`;

// ---------------------------------------------------------------- mission log
export function renderLog({ t, profile }) {
  const H = 392;
  let s = panel(t, W, H) + title(t, 'mission log', `pilot record · synced ${t.name}`);
  const rows = [
    ['pilot', `${profile.name} — ${profile.role} at ${profile.company}`],
    ['mission', profile.now],
    ['shipped', profile.projects.map((p) => p.name).join(' · ')],
    ['prior posts', profile.before],
    ['seeking', profile.status],
    ['companion', `${profile.pet}, seed-carrier unit · keeps a sapling alive and morale high`],
  ];
  const wrap = (v, n) => { const out = []; let cur = ''; for (const w of v.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } out.push(cur); return out; };
  let y = 112;
  rows.forEach(([k, v], i) => {
    const vl = wrap(v, 50);
    s += `<g class="in" style="animation-delay:${(0.1 + i * 0.1).toFixed(2)}s"><circle cx="42" cy="${y - 4}" r="3" fill="${i === 0 ? t.accent : 'none'}" stroke="${t.accent}"/><text x="56" y="${y}" class="mono" font-size="12" fill="${t.accent}">${esc(k)}</text>`;
    vl.forEach((l, j) => { s += `<text x="160" y="${y + j * 19}" class="mono" font-size="12.5" fill="${t.fg}"${i === 0 ? ' font-weight="600"' : ''}>${esc(l)}</text>`; });
    s += `</g>`;
    y += vl.length * 19 + 15;
  });
  // scanner viewport
  const cx = W - 150, cy = 206, r = 100;
  s += `<defs><clipPath id="vp"><circle cx="${cx}" cy="${cy}" r="${r - 8}"/></clipPath><linearGradient id="vps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.name === 'night' ? '#0b2236' : t.name === 'evening' ? '#7a3f7e' : '#8fd0dc'}"/><stop offset="1" stop-color="${t.name === 'night' ? '#14394d' : t.name === 'evening' ? '#ffb46b' : '#ffe0b3'}"/></linearGradient></defs>`;
  s += `<g clip-path="url(#vp)"><rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="url(#vps)"/><circle cx="${cx + 30}" cy="${cy - 30}" r="22" fill="${t.name === 'night' ? '#3b5f8a' : '#ffe9c4'}" opacity=".9"/>
<path d="M${cx - r} ${cy + 46} Q${cx} ${cy + 30} ${cx + r} ${cy + 44} V${cy + r} H${cx - r}Z" fill="${t.ink}"/>
<g transform="translate(${cx - 18} ${cy + 40}) scale(-1.5 1.5)">${person(t.name === 'morning' ? 'chai' : 'laptop', t.ink)}</g>
<g transform="translate(${cx + 44} ${cy + 2}) scale(1.05)">${bot(t)}</g>
<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="2" fill="${t.holo2}" opacity=".5" class="scan"/></g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="${t.accent}" stroke-opacity=".6"/><circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="none" stroke="${t.accent}" stroke-width="2" stroke-dasharray="4 10" class="ring"/>`;
  s += `<text x="${cx}" y="${cy + r + 30}" text-anchor="middle" class="mono" font-size="11" fill="${t.muted}">id · aman-singh · IN · +05:30</text>`;
  s += `<g class="in" style="animation-delay:1s"><text x="${cx}" y="${cy - r - 16}" text-anchor="middle" class="hand" font-size="22" fill="${t.accent2}">✦ open to work ✦</text></g>`;
  s += grain(W, H);
  return doc({ w: W, h: H, title: `${profile.name} — mission log`, desc: rows.map(([k, v]) => `${k}: ${v}`).join('. '), style: base(t) + `.ring{transform-box:fill-box;transform-origin:center;animation:spin 30s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.scan{animation:scan 4s linear infinite}@keyframes scan{to{transform:translateY(200px)}}
.hover{animation:hov 3s ease-in-out infinite alternate}@keyframes hov{to{transform:translateY(-4px)}}
.eye{transform-box:fill-box;transform-origin:center;animation:blink 5s infinite}@keyframes blink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}`, body: s });
}

// ---------------------------------------------------------------- the commit biome (hex calendar)
export function renderBiome({ t, data, d }) {
  const H = 452;
  const days = d.last365.slice(-364);
  const first = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
  const grid = [...Array(first).fill(null), ...days];
  const weeks = Math.ceil(grid.length / 7);
  const nz = days.map((x) => x.count).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => nz[Math.min(nz.length - 1, Math.floor(p * nz.length))] ?? 1;
  const th = [q(0.25), q(0.5), q(0.75)];
  const lvl = (c) => (c === 0 ? 0 : c <= th[0] ? 1 : c <= th[1] ? 2 : c <= th[2] ? 3 : 4);
  const L = 74, top = 236, P = (W - L - 40) / weeks, hr = P * 0.56;
  const pos = (g) => [L + Math.floor(g / 7) * P + P / 2, top + (g % 7) * P * 0.98 + P / 2 + (Math.floor(g / 7) % 2 ? P * 0.0 : 0)];
  const hex = (x, y, r) => { let p = ''; for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; p += `${k ? 'L' : 'M'}${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}`; } return p + 'Z'; };

  let s = panel(t, W, H) + title(t, 'the commit biome', 'every hexagon is a day of the last 52 weeks · brighter cells mean more commits');
  s += `<defs><radialGradient id="cg"><stop offset="0" stop-color="${t.cells[4]}" stop-opacity=".6"/><stop offset="1" stop-color="${t.cells[4]}" stop-opacity="0"/></radialGradient><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="${t.accent2}"/></marker></defs>`;
  const stats = [[fmt(d.allTime), 'all-time contributions'], [fmt(d.lastYearTotal), 'in the last 12 months'], [fmt(d.activeDays), 'days I showed up'], [`${d.longest}d`, 'longest streak ever'], [`${d.current}d`, 'current streak']];
  stats.forEach(([v, l], i) => {
    const x = 36 + i * 166;
    s += `<g class="in" style="animation-delay:${(i * 0.08).toFixed(2)}s"><text x="${x}" y="132" class="d" font-size="36" letter-spacing="-1" fill="${i === 0 ? t.accent : t.fg}">${esc(v)}</text><text x="${x + 1}" y="154" class="mono" font-size="11" fill="${t.muted}">${esc(l)}</text></g>`;
  });
  let lastM = '';
  for (let w = 0; w < weeks; w++) { const c = grid[w * 7 + 6] ?? grid[w * 7]; if (!c) continue; const m = c.date.slice(5, 7); if (m !== lastM && w < weeks - 2) { lastM = m; s += `<text x="${L + w * P}" y="${top - 12}" class="mono" font-size="10.5" fill="${t.faint}">${MON[+m - 1]}</text>`; } }
  [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(([n, i]) => { s += `<text x="${L - 12}" y="${pos(i)[1] + 4}" class="mono" font-size="10.5" fill="${t.faint}" text-anchor="end">${n}</text>`; });
  let cells = '';
  grid.forEach((c, g) => {
    if (!c) return;
    const [x, y] = pos(g), k = lvl(c.count);
    const dl = `style="animation-delay:${(Math.floor(g / 7) * 0.02 + (g % 7) * 0.01).toFixed(2)}s"`;
    cells += `<g class="cell" ${dl}>${k >= 3 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${hr * 2}" fill="url(#cg)" ${k === 4 ? 'class="pulse"' : ''}/>` : ''}<path d="${hex(x, y, hr)}" fill="${t.cells[k]}" ${k === 0 ? `stroke="${t.cells[1]}" stroke-opacity=".5" stroke-width=".6" fill-opacity=".6"` : ''}/></g>`;
  });
  s += cells;
  // callouts
  let best = { n: 0 }, run = 0, st = 0;
  days.forEach((x, i) => { if (x.count) { if (!run) st = i; run++; if (run > best.n) best = { n: run, s: st, e: i }; } else run = 0; });
  const bd = days.reduce((b, x, i) => (x.count > b.c ? { c: x.count, i } : b), { c: -1, i: 0 });
  const [bx, by] = pos(bd.i + first);
  s += `<path d="${wobble(bx, by, hr + 6, hr + 6, 3)}" fill="none" stroke="${t.accent2}" stroke-width="1.8"/>`;
  s += `<path d="M${bx - 4} ${top - 34} q-8 12 0 ${by - top + 20}" fill="none" stroke="${t.accent2}" stroke-width="1.5" marker-end="url(#ah)"/>`;
  s += `<text x="${bx - 10}" y="${top - 38}" class="hand" font-size="19" fill="${t.accent2}" text-anchor="${bx > W / 2 ? 'end' : 'start'}">best day: ${bd.c} commits on ${DATE(days[bd.i].date)}</text>`;
  if (best.n > 1) {
    const [sx] = pos(best.s + first), [ex] = pos(best.e + first), yb = top + 7 * P + 8;
    s += `<path d="M${sx - 6} ${yb} H${ex + 6}" stroke="${t.accent3}" stroke-width="2.4" stroke-linecap="round"/><path d="M${sx - 6} ${yb - 5} V${yb + 5} M${ex + 6} ${yb - 5} V${yb + 5}" stroke="${t.accent3}" stroke-width="2"/>`;
    s += `<text x="${sx - 6}" y="${yb + 24}" class="hand" font-size="19" fill="${t.accent3}">longest run this year: ${best.n} days (${DATE(days[best.s].date)} → ${DATE(days[best.e].date)})</text>`;
  }
  const [tx] = pos(days.length - 1 + first);
  s += `<text x="${tx + 4}" y="${top + 7 * P + 34}" class="hand" font-size="17" fill="${t.muted}" text-anchor="end">today ↑</text>`;
  const lx = W - 270, ly = H - 34;
  s += `<text x="${lx - 10}" y="${ly + 4}" class="mono" font-size="10.5" fill="${t.faint}" text-anchor="end">0</text>`;
  for (let k = 0; k < 5; k++) s += `<path d="${hex(lx + k * 20 + 6, ly, 6.5)}" fill="${t.cells[k]}"/>`;
  s += `<text x="${lx + 104}" y="${ly + 4}" class="mono" font-size="10.5" fill="${t.faint}">${th[2] + 1}+ commits/day</text>`;
  s += grain(W, H);
  return doc({ w: W, h: H, title: 'The commit biome — last 52 weeks', desc: `${d.allTime} contributions all-time, ${d.lastYearTotal} in the last 12 months over ${d.activeDays} active days; longest streak ${d.longest} days, current ${d.current}; best day ${bd.c} on ${days[bd.i].date}.`,
    style: base(t) + `.cell{transform-box:fill-box;transform-origin:center;animation:pop .5s ease-out both}@keyframes pop{from{opacity:0;transform:scale(.2)}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pl 3s ease-in-out infinite alternate}@keyframes pl{to{opacity:.4;transform:scale(1.3)}}`, body: s });
}

// ---------------------------------------------------------------- the voyage (maglev line, ribbon width = monthly commits)
export function renderVoyage({ t, data, d, profile }) {
  const H = 360;
  const start = data.createdAt.slice(0, 7);
  const months = [...d.months.entries()].filter(([k]) => k >= start).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(1, ...months.map(([, v]) => v));
  const L = 60, Rr = W - 110, C = 200, A = 54;
  const xs = (i) => L + (i / Math.max(1, months.length - 1)) * (Rr - L);
  const wv = (v) => 2 + Math.sqrt(v / max) * A;
  const up = months.map(([, v], i) => [xs(i), C - wv(v)]), dn = months.map(([, v], i) => [xs(i), C + wv(v)]);
  const smooth = (P) => { let p = `${P[0][0]} ${P[0][1]}`; for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] ?? P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] ?? p2; p += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`; } return p; };
  const years = {}; months.forEach(([k, v]) => { years[k.slice(0, 4)] = (years[k.slice(0, 4)] ?? 0) + v; });
  const bestYear = Object.entries(years).sort((a, b) => b[1] - a[1])[0][0];
  let s = panel(t, W, H) + title(t, 'the voyage so far', 'one maglev line through my years · the stream around it swells with monthly commits');
  s += `<defs><linearGradient id="rib" x1="0" x2="1">${[0, 0.5, 1].map((o, i) => `<stop offset="${o}" stop-color="${[t.accent, t.accent3, t.accent2][i]}" stop-opacity=".55"/>`).join('')}</linearGradient></defs>`;
  s += `<path d="M${smooth(up).replace(/^/, '')} L${dn[dn.length - 1][0]} ${dn[dn.length - 1][1]} L${smooth([...dn].reverse())}Z" fill="url(#rib)"/>`;
  s += `<path d="M${L} ${C} H${Rr + 40}" stroke="${t.fg}" stroke-opacity=".6" stroke-width="2"/><path d="M${L} ${C} H${Rr + 40}" stroke="${t.fg}" stroke-width="2" stroke-dasharray="2 14" class="flow"/>`;
  Object.keys(years).forEach((y, n) => {
    const i0 = months.findIndex(([k]) => k.startsWith(y)), i1 = months.map(([k]) => k.slice(0, 4)).lastIndexOf(y);
    const x = xs(i0), xm = (xs(i0) + xs(i1)) / 2, isB = y === bestYear;
    s += `<g class="in" style="animation-delay:${(0.2 + n * 0.15).toFixed(2)}s"><circle cx="${x}" cy="${C}" r="9" fill="${t.bg}" stroke="${isB ? t.accent2 : t.fg}" stroke-width="2.4"/><circle cx="${x}" cy="${C}" r="3.5" fill="${isB ? t.accent2 : t.fg}"/>
<text x="${x}" y="${C - 74}" class="mono" font-size="11" font-weight="600" text-anchor="middle" fill="${t.muted}">${y}</text></g>`;
    const above = n % 2 === 0;
    s += `<text x="${xm}" y="${above ? C + 92 : C + 92}" class="d" font-size="22" text-anchor="middle" fill="${isB ? t.accent2 : t.fg}">${fmt(years[y])}${isB ? ' ★' : ''}</text>`;
    s += `<text x="${xm}" y="${C + 114 + (n % 2 ? 22 : 0)}" class="hand" font-size="17" text-anchor="middle" fill="${t.muted}">${esc(profile.chapters?.[y] ?? '')}</text>`;
  });
  // the train heading into the next stop
  s += `<g class="train"><rect x="${Rr + 4}" y="${C - 8}" width="48" height="14" rx="7" fill="${t.fg}"/><rect x="${Rr + 10}" y="${C - 4}" width="32" height="3" rx="1.5" fill="${t.accent}"/><circle cx="${Rr + 50}" cy="${C - 1}" r="2" fill="${t.gold}"/></g>`;
  s += `<text x="${Rr + 28}" y="${C - 22}" class="hand" font-size="17" text-anchor="middle" fill="${t.muted}">next stop →</text>`;
  s += grain(W, H);
  return doc({ w: W, h: H, title: 'The voyage so far', desc: Object.entries(years).map(([y, v]) => `${y}: ${v} contributions (${profile.chapters?.[y] ?? ''})`).join('; '),
    style: base(t) + `.flow{animation:flow 1.6s linear infinite}@keyframes flow{to{stroke-dashoffset:-16}}.train{animation:tr 2.5s ease-in-out infinite alternate}@keyframes tr{to{transform:translateX(8px)}}`, body: s });
}

// ---------------------------------------------------------------- system status
export function renderStatus({ t, data, d }) {
  const H = 138, now = new Date(data.generatedAt);
  let s = panel(t, W, H, { vine: false });
  [[fmt(data.stars), 'stars'], [fmt(data.publicRepos), 'repos'], [fmt(data.followers), data.followers === 1 ? 'follower' : 'followers'], [data.npm?.lastYear != null ? fmt(data.npm.lastYear) : '—', 'npm downloads / yr']].forEach(([v, l], i) => {
    const x = 36 + i * 118; s += `<text x="${x}" y="66" class="d" font-size="28" fill="${t.fg}">${esc(v)}</text><text x="${x}" y="86" class="mono" font-size="11" fill="${t.muted}">${esc(l)}</text>`;
  });
  const bx = 520, bw = 324;
  s += `<text x="${bx}" y="42" class="mono" font-size="11" fill="${t.muted}">energy mix · languages</text><clipPath id="lb"><rect x="${bx}" y="52" width="${bw}" height="12" rx="6"/></clipPath><g clip-path="url(#lb)">`;
  let lx = bx; for (const l of data.languages) { const w = (l.pct / 100) * bw; s += `<rect x="${lx.toFixed(1)}" y="52" width="${Math.max(0, w - 2).toFixed(1)}" height="12" fill="${l.color}"/>`; lx += w; }
  s += `</g>`;
  let gx = bx; for (const l of data.languages) { const lab = `${l.name} ${Math.round(l.pct)}%`, w = lab.length * 6.6 + 26; if (gx + w - 12 > bx + bw) break; s += `<circle cx="${gx + 4}" cy="82" r="3.5" fill="${l.color}"/><text x="${gx + 12}" y="86" class="mono" font-size="11" fill="${t.muted}">${esc(lab)}</text>`; gx += w; }
  s += `<path d="M24 104 H${W - 24}" stroke="${t.border}"/><circle cx="40" cy="121" r="3.5" fill="${t.accent}" class="pulse"/>`;
  s += `<text x="52" y="125" class="mono" font-size="11" fill="${t.faint}">${esc(data.lastPush ? `last push ${data.lastPush.repo}, ${timeAgo(data.lastPush.at, now)}` : '')}   ·   ≈ ${fmt(Math.round(d.thisYear / 3))} cups of chai this year   ·   synced ${esc(istStamp(now))}</text>`;
  s += grain(W, H);
  return doc({ w: W, h: H, title: 'System status', desc: `${data.stars} stars, ${data.publicRepos} repos, ${data.followers} followers.`, style: base(t) + `.pulse{animation:p 1.6s ease-in-out infinite}@keyframes p{50%{opacity:.25}}`, body: s, use: ['display', 'mono'] });
}

// ---------------------------------------------------------------- project module
const icons = {
  bug: (c) => `<circle cx="-2" cy="-2" r="9" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M4.5 4.5 L11 11" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
  chat: (c) => `<path d="M-12 -9 h24 a3 3 0 0 1 3 3 v12 a3 3 0 0 1 -3 3 h-14 l-7 6 v-6 h-3 a3 3 0 0 1 -3 -3 v-12 a3 3 0 0 1 3 -3z" fill="none" stroke="${c}" stroke-width="2"/><circle cx="-5" cy="0" r="1.6" fill="${c}"/><circle cx="1" cy="0" r="1.6" fill="${c}"/><circle cx="7" cy="0" r="1.6" fill="${c}"/>`,
  lotus: (c) => `<path d="M0 8 C-4 0 -4 -8 0 -14 C4 -8 4 0 0 8Z M0 8 C-8 6 -13 0 -14 -6 C-7 -5 -3 0 0 8Z M0 8 C8 6 13 0 14 -6 C7 -5 3 0 0 8Z" fill="none" stroke="${c}" stroke-width="1.8"/>`,
  check: (c) => `<rect x="-11" y="-11" width="22" height="22" rx="4" fill="none" stroke="${c}" stroke-width="2"/><path d="M-6 0 l4 4 l8 -8" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
};
export function renderModule({ t, p, i }) {
  const w = 430, h = 200;
  const c = [t.accent, t.accent2, t.accent3, t.gold][i % 4];
  let s = panel(t, w, h, { vine: i % 2 === 0 });
  s += `<circle cx="64" cy="70" r="30" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-opacity=".5"/><ellipse cx="64" cy="70" rx="42" ry="12" fill="none" stroke="${c}" stroke-opacity=".5" transform="rotate(-20 64 70)" class="orb"/><g transform="translate(64 70)">${icons[p.icon](c)}</g>`;
  s += `<text x="114" y="64" class="d" font-size="19" fill="${t.fg}" letter-spacing="-0.3">${esc(p.name)}</text>`;
  s += `<rect x="114" y="74" width="${p.tag.length * 6.7 + 16}" height="18" rx="9" fill="${c}" fill-opacity=".15"/><text x="122" y="87" class="mono" font-size="10.5" fill="${c}">● ${esc(p.tag)}</text>`;
  const words = p.blurb.split(' '); const lines = []; let cur = '';
  for (const wd of words) { if ((cur + ' ' + wd).length > 50) { lines.push(cur); cur = wd; } else cur = cur ? cur + ' ' + wd : wd; } lines.push(cur);
  lines.slice(0, 3).forEach((l, k) => { s += `<text x="34" y="${126 + k * 17}" class="mono" font-size="11.5" fill="${t.muted}">${esc(l)}</text>`; });
  s += `<text x="34" y="${h - 20}" class="mono" font-size="10.5" fill="${t.faint}">${esc(p.stack)}</text><text x="${w - 30}" y="${h - 20}" text-anchor="end" class="mono" font-size="11" font-weight="600" fill="${c}">open ↗</text>`;
  s += grain(w, h);
  return doc({ w, h, title: p.name, desc: `${p.name}: ${p.blurb} Stack: ${p.stack}.`, use: ['display', 'mono'], style: base(t) + `.orb{transform-box:fill-box;transform-origin:center;animation:orb 8s linear infinite}@keyframes orb{to{transform:rotate(340deg)}}`, body: s });
}

// ---------------------------------------------------------------- loadout
export function renderLoadout({ t, profile }) {
  const R = rng(5);
  let s = '', y = 96;
  for (const [gi, [label, items]] of profile.toolkit.entries()) {
    s += `<text x="36" y="${y + 16}" class="mono" font-size="11.5" fill="${t.muted}">${esc(label)}</text>`;
    let x = 196, ry = y;
    const c = [t.accent, t.accent2, t.accent3, t.gold, t.accent][gi];
    items.forEach((it) => {
      const w = it.length * 7.6 + 30;
      if (x + w > W - 34) { x = 196; ry += 34; }
      s += `<g class="in" style="animation-delay:${(R() * 0.6).toFixed(2)}s"><rect x="${x}" y="${ry}" width="${w.toFixed(0)}" height="25" rx="12.5" fill="${c}" fill-opacity="${t.name === 'night' ? 0.16 : 0.12}" stroke="${c}" stroke-opacity=".45"/><circle cx="${x + 12}" cy="${ry + 12.5}" r="2.6" fill="${c}"/><text x="${x + 20}" y="${ry + 17}" class="mono" font-size="12" fill="${t.fg}">${esc(it)}</text></g>`;
      x += w + 9;
    });
    y = ry + 44;
  }
  const H = y + 10;
  return doc({ w: W, h: H, title: 'Loadout', use: ['display', 'mono'], desc: profile.toolkit.map(([l, i]) => `${l}: ${i.join(', ')}`).join('. '), style: base(t), body: panel(t, W, H) + title(t, 'loadout', 'tools I reach for') + s + grain(W, H) });
}

// ---------------------------------------------------------------- heading, pills, sign-off
export function renderHeading({ t, text, note = '' }) {
  const s = `<text x="4" y="38" class="d" font-size="26" letter-spacing="-0.6" fill="${t.fg}">${esc(text)}</text>${note ? `<text x="${text.length * 13.6 + 20}" y="38" class="hand" font-size="20" fill="${t.accent2}">${esc(note)}</text>` : ''}
<path d="M4 54 H180 L192 46 H420" stroke="${t.accent}" stroke-width="1.6" fill="none"/><circle cx="4" cy="54" r="3" fill="${t.accent}"/><circle cx="420" cy="46" r="3" fill="${t.accent}"/>`;
  return doc({ w: W, h: 64, title: text, desc: `${text} ${note}`, style: base(t), body: s, use: ['display', 'hand'] });
}
export function renderPill({ t, label, i }) {
  const w = label.length * 8 + 46, h = 32, c = [t.accent, t.accent2, t.accent3, t.gold][i % 4];
  const s = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${h / 2}" fill="${t.bg}" stroke="${c}" stroke-opacity=".6"/><circle cx="18" cy="16" r="4" fill="${c}"/><text x="30" y="20.5" class="mono" font-size="12.5" fill="${t.fg}">${esc(label)}</text>`;
  return doc({ w, h, title: label, desc: label, style: base(t), body: s, use: [] }); // short labels: system mono is fine, keeps pills tiny
}
export function renderSignoff({ t, profile }) {
  const H = 130;
  const s = `<g transform="translate(176 66) scale(1.4)">${bot(t, { wave: true })}</g>
<text x="226" y="58" class="hand" font-size="28" fill="${t.fg}">thanks for visiting — transmission ends here</text>
<text x="228" y="86" class="mono" font-size="11.5" fill="${t.muted}">aman &amp; ${esc(profile.pet.toLowerCase())} · the sky up top follows the time in India · come back after dark</text>`;
  return doc({ w: W, h: H, title: 'Thanks for visiting', use: ['hand', 'mono'], desc: `${profile.pet} waves goodbye.`, style: base(t) + `.hover{animation:hov 3s ease-in-out infinite alternate}@keyframes hov{to{transform:translateY(-4px)}}
.wave{transform-box:fill-box;transform-origin:left center;animation:wave .5s ease-in-out infinite alternate}@keyframes wave{to{transform:rotate(-30deg)}}
.eye{transform-box:fill-box;transform-origin:center;animation:blink 4s infinite}@keyframes blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}`, body: s });
}
export function renderAvatar({ t }) {
  const S = 400;
  let s = `<defs><linearGradient id="as" x1="0" y1="0" x2="0" y2="1">${t.sky.map((c, i) => `<stop offset="${[0, 0.45, 0.72, 0.9][i]}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect width="${S}" height="${S}" fill="url(#as)"/>`;
  s += `<circle cx="130" cy="120" r="64" fill="${t.planet[0]}"/><ellipse cx="130" cy="120" rx="128" ry="26" fill="none" stroke="${t.ring}" stroke-width="7" transform="rotate(-14 130 120)" opacity=".8"/>`;
  s += `<path d="M0 320 Q200 290 400 316 V400 H0Z" fill="${t.ink}"/><path d="M0 320 Q200 290 400 316" stroke="${t.terrace}" stroke-width="8" fill="none"/>`;
  s += `<g transform="translate(120 314) scale(-2.8 2.8)">${person(t.name === 'morning' ? 'chai' : 'laptop', t.ink)}</g><g transform="translate(310 236) scale(2.4)">${bot(t, { glow: true })}</g>`;
  return doc({ w: S, h: S, title: 'Avatar', desc: 'Aman and BODHI-01 under a ringed planet', body: s, use: [] });
}
