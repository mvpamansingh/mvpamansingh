// Hero built on Aman's own painting ("Code and Dreams Beneath Alien Skies").
// The painting is the base layer (graded for morning / evening / night); everything that
// moves or carries live data is SVG on top of it:
//   sun + lantern + pylon glows, flickering holo panels, ships with trails, a beam pulsing
//   down from the floating city, waterfall + lake shimmer, butterflies, fireflies, stars —
//   and the glowing pylon (BODHI-01) projecting his real contribution graph.
import fs from 'node:fs';
import { doc, esc, rng, DISPLAY, HAND, MONO } from '../lib/theme.mjs';

const W = 880, H = 495;

// Positions are in the 880×495 space of the painting.
const P = {
  sun: [595, 245], lantern: [85, 118], pylon: [499, 412], pylonTop: [499, 392], moon: [837, 56],
  beam: [779, 176, 256], waterfall: [805, 340, 372],
  panels: [[77, 213, 64, 63], [192, 250, 36, 48], [229, 249, 62, 50], [296, 256, 75, 60]],
  laptop: [213, 300, 78, 50],
  butterflies: [[33, 300], [434, 462], [841, 426]],
  city: [[748, 104], [764, 92], [781, 70], [795, 96], [812, 108], [770, 128], [790, 132], [756, 118], [803, 122]],
};

function ship(k = 1) {
  return `<g transform="scale(${k})"><rect x="-120" y="-1" width="110" height="2" rx="1" fill="url(#trail)"/>
<path d="M-12 0 L6 -3 L14 0 L6 3Z" fill="#1d2433"/><path d="M-6 -2 L-2 -7 L2 -2Z M-6 2 L-2 7 L2 2Z" fill="#2a3245"/>
<circle cx="-12" cy="0" r="2.6" fill="#8fe9ff"/><circle cx="-12" cy="0" r="6" fill="#8fe9ff" opacity=".3"/></g>`;
}

function butterfly(x, y, i) {
  return `<g class="bfly" style="animation-delay:-${i * 2.3}s"><g transform="translate(${x} ${y})">
<circle r="9" fill="#7fdcff" opacity=".16"/>
<g class="wing" opacity=".95"><path d="M0 0 C-2 -7 -10 -9 -9 -3 C-8.5 0 -4 0.6 0 0Z M0 0 C-3.5 1.5 -7 5.5 -3.8 6.4 C-1.2 7 0 3 0 0Z" fill="#9eeaff"/><path d="M0 0 C2 -7 10 -9 9 -3 C8.5 0 4 0.6 0 0Z M0 0 C3.5 1.5 7 5.5 3.8 6.4 C1.2 7 0 3 0 0Z" fill="#c4f4ff"/></g>
<path d="M0 -3.5 V4" stroke="#1d3550" stroke-width="1"/></g></g>`;
}

function hologram(t, d) {
  const x = 532, y = 360, w = 214, h = 82;
  const days = d.last365.slice(-364);
  const first = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
  const grid = [...Array(first).fill(null), ...days];
  const weeks = Math.ceil(grid.length / 7);
  const max = Math.max(1, ...days.map((q) => q.count));
  const cw = (w - 20) / weeks, ch = (h - 34) / 7;
  let cells = '';
  grid.forEach((c, g) => {
    if (!c) return;
    const k = c.count ? 0.35 + 0.65 * Math.sqrt(c.count / max) : 0.12;
    cells += `<rect x="${(x + 10 + Math.floor(g / 7) * cw).toFixed(1)}" y="${(y + 26 + (g % 7) * ch).toFixed(1)}" width="${(cw - 0.6).toFixed(1)}" height="${(ch - 0.8).toFixed(1)}" rx=".5" fill="${c.count ? '#c9fbff' : '#5fd8ff'}" opacity="${k.toFixed(2)}"/>`;
  });
  const [px, py] = P.pylonTop;
  const cx = x + w / 2, cy = y + h / 2;
  return `<path d="M${px - 6} ${py} L${x} ${y + 10} L${x} ${y + h}Z M${px + 6} ${py} L${x + 30} ${y + h} L${x} ${y + h}Z" fill="url(#beam)"/>
<g class="holo" transform="translate(${cx} ${cy}) skewY(-4) translate(${-cx} ${-cy})">
${t.name === 'morning' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#062238" fill-opacity=".42"/>` : ''}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#5fd8ff" fill-opacity=".12" stroke="#7fe6ff" stroke-opacity=".9"/>
<path d="M${x} ${y + 9} V${y} H${x + 10} M${x + w - 10} ${y} H${x + w} V${y + 9} M${x} ${y + h - 9} V${y + h} H${x + 10} M${x + w - 10} ${y + h} H${x + w} V${y + h - 9}" stroke="#d6fdff" stroke-width="1.8" fill="none"/>
<text x="${x + 10}" y="${y + 16}" font-family="${MONO}" font-size="8.6" fill="#d6fdff">holo-pylon · live commits</text>
<text x="${x + w - 10}" y="${y + 16}" font-family="${MONO}" font-size="8.6" fill="#d6fdff" text-anchor="end" font-weight="600">${d.lastYearTotal} / 12 mo</text>
${cells}
<rect x="${x}" y="${y}" width="${w}" height="2.5" fill="#d6fdff" opacity=".45" class="scan"/></g>`;
}

export function renderHero({ t, profile, d, artPath }) {
  const R = rng(9);
  const art = fs.readFileSync(artPath).toString('base64');
  const night = t.name === 'night', morning = t.name === 'morning';
  let s = `<defs>
<radialGradient id="glow"><stop offset="0" stop-color="#fff2c6" stop-opacity=".85"/><stop offset=".35" stop-color="#ffc874" stop-opacity=".35"/><stop offset="1" stop-color="#ffb05c" stop-opacity="0"/></radialGradient>
<radialGradient id="bglow"><stop offset="0" stop-color="#a6f1ff" stop-opacity=".9"/><stop offset=".4" stop-color="#5fd8ff" stop-opacity=".35"/><stop offset="1" stop-color="#5fd8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="ray" cx="595" cy="245" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff4c8" stop-opacity=".38"/><stop offset="1" stop-color="#fff4c8" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx="0.2" cy="0.05" r="0.55"><stop offset="0" stop-color="#05040c" stop-opacity="${morning ? 0.45 : 0.55}"/><stop offset="1" stop-color="#05040c" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7fe6ff" stop-opacity=".45"/><stop offset="1" stop-color="#7fe6ff" stop-opacity=".03"/></linearGradient>
<linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#bff4ff" stop-opacity="0"/><stop offset="1" stop-color="#bff4ff" stop-opacity=".85"/></linearGradient>
<linearGradient id="shoot" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<filter id="shadow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dy="2"/><feComponentTransfer><feFuncA type="linear" slope=".85"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="mistb" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
</defs><g clip-path="url(#frame)">
<image href="data:image/jpeg;base64,${art}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;

  // stars (more at night), a shooting star at night
  const nStars = night ? 90 : morning ? 0 : 22;
  for (let i = 0; i < nStars; i++) {
    let x, y; do { x = 360 + R() * 520; y = R() * (night ? 175 : 60); } while (Math.hypot(x - 537, y - 130) < 116);
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.4 + R() * 0.9).toFixed(2)}" fill="#fff" class="tw" style="animation-delay:-${(R() * 5).toFixed(1)}s;animation-duration:${(2.5 + R() * 3).toFixed(1)}s"/>`;
  }
  if (night) s += `<g class="shoot"><path d="M430 30 l120 34" stroke="url(#shoot)" stroke-width="1.6" stroke-linecap="round"/></g>`;

  // sun / moon-glow on the horizon, lake shimmer
  const [sx, sy] = P.sun;
  s += `<circle cx="${sx}" cy="${sy}" r="${night ? 34 : morning ? 90 : 70}" fill="${night ? 'url(#bglow)' : 'url(#glow)'}" class="pulse" opacity="${night ? 0.5 : 0.9}"/>`;
  let sh = '';
  for (let i = 0; i < 16; i++) { const y = 300 + i * 4.2 + R() * 2, w = 4 + R() * 14 * (1 - i / 22), x = sx - w / 2 + (R() - 0.5) * 10; sh += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="1.2" rx=".6" fill="#fff6d8" class="tw" style="animation-delay:-${(R() * 3).toFixed(1)}s;animation-duration:${(1.4 + R() * 1.8).toFixed(1)}s"/>`; }
  s += `<g opacity="${night ? 0.35 : 0.75}">${sh}</g>`;

  // morning sunshine: gentle light shafts fanning out from the sun
  if (morning) {
    let rays = '';
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.95 + i * 0.13), w = 0.035 + (i % 3) * 0.015, L = 520; const p = (ang) => `${(sx + Math.cos(ang) * L).toFixed(0)} ${(sy + Math.sin(ang) * L).toFixed(0)}`; rays += `<path d="M${sx} ${sy} L${p(a - w)} L${p(a + w)}Z"/>`; }
    s += `<g fill="url(#ray)" class="rays" style="mix-blend-mode:screen">${rays}</g>`;
  }
  // drifting mist over the mountains
  s += `<g class="mist" filter="url(#mistb)" opacity="${morning ? 0.14 : night ? 0.18 : 0.3}"><ellipse cx="300" cy="226" rx="160" ry="10" fill="#fff"/><ellipse cx="700" cy="270" rx="140" ry="8" fill="#fff"/><ellipse cx="${300 + W}" cy="226" rx="160" ry="10" fill="#fff"/></g>`;

  // ships crossing the sky
  s += `<g class="ship1" transform="translate(470 40)">${ship(1)}</g><g class="ship2" transform="translate(250 160)">${ship(0.6)}</g>`;

  // floating city: beam pulse + twinkling windows
  const [bx, by0, by1] = P.beam;
  s += `<path d="M${bx} ${by0} V${by1}" stroke="#bff4ff" stroke-width="1.6" stroke-dasharray="3 9" class="beamflow" opacity=".9"/>`;
  for (const [x, y] of P.city) s += `<circle cx="${x}" cy="${y}" r="1.4" fill="#c9f6ff" class="tw" style="animation-delay:-${(R() * 3).toFixed(1)}s;animation-duration:${(1.2 + R() * 2).toFixed(1)}s"/>`;
  const [mx, my] = P.moon;
  s += `<circle cx="${mx}" cy="${my}" r="28" fill="url(#bglow)" opacity="${night ? 0.55 : 0.25}" class="pulse"/>`;
  // waterfall shimmer
  const [wx, wy0, wy1] = P.waterfall;
  s += `<path d="M${wx} ${wy0} V${wy1}" stroke="#fff" stroke-width="1.6" stroke-dasharray="3 6" class="fall" opacity=".7"/>`;

  // lantern, holo panels, laptop
  const [lx, ly] = P.lantern;
  s += `<circle cx="${lx}" cy="${ly}" r="30" fill="url(#bglow)" class="pulse" opacity=".85"/>`;
  P.panels.forEach(([x, y, w, h], i) => {
    s += `<g style="mix-blend-mode:screen"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#7fe6ff" class="flick" style="animation-delay:-${(i * 1.7).toFixed(1)}s"/><rect x="${x + 2}" y="${y}" width="${w - 4}" height="1.6" fill="#e6fdff" class="pscan" style="animation-delay:-${(i * 0.9).toFixed(1)}s;--h:${h - 2}px"/></g>`;
  });
  const [tx, ty, tw, th] = P.laptop;
  s += `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="#9fdcff" opacity=".0" class="screen" style="mix-blend-mode:screen"/>`;

  // the pylon is BODHI-01: pulsing core, spinning rings, projecting live commits
  const [ppx, ppy] = P.pylon;
  s += `<circle cx="${ppx}" cy="${ppy}" r="40" fill="url(#bglow)" class="pulse"/>`;
  s += `<ellipse cx="${ppx}" cy="${ppy - 19}" rx="20" ry="5" fill="none" stroke="#c9fbff" stroke-width="1.4" stroke-dasharray="6 5" class="ringspin"/>`;
  s += hologram(t, d);

  // butterflies + floating motes
  P.butterflies.forEach(([x, y], i) => { s += butterfly(x, y, i); });
  s += butterfly(620, 440, 3) + butterfly(170, 455, 4);
  const moteC = night ? '#9fffe0' : morning ? '#ffffff' : '#ffe2a0';
  for (let i = 0; i < 26; i++) { const x = R() * W, y = 330 + R() * 160; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + R() * 1.4).toFixed(1)}" fill="${moteC}" class="mote" style="animation-delay:-${(R() * 10).toFixed(1)}s;animation-duration:${(8 + R() * 8).toFixed(1)}s"/>`; }

  // words: soft vignette under the canopy, then the name block
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  s += `<g class="rise" filter="url(#shadow)">
<text x="128" y="56" font-family="${DISPLAY}" font-weight="700" font-size="44" letter-spacing="-1.2" fill="#fbf7ff">${esc(profile.name)}</text>
<text x="131" y="84" font-family="${HAND}" font-weight="600" font-size="23" fill="#ffe7c9">${esc(t.greeting)}</text>
<text x="131" y="105" font-family="${MONO}" font-size="11.5" fill="#e9f3ff">${esc(profile.heroLine)}</text></g>`;
  s += `<g class="rise" style="animation-delay:.8s" filter="url(#shadow)"><text x="752" y="462" font-family="${HAND}" font-weight="600" font-size="17" fill="#e8fdff" text-anchor="end">↑ my real commits, projected live · ${d.activeDays} days lit</text></g>`;
  s += `</g>`;

  const style = `
.rays{transform-origin:595px 245px;animation:rays 14s ease-in-out infinite alternate}@keyframes rays{from{opacity:.55;transform:rotate(-2deg)}to{opacity:.9;transform:rotate(2deg)}}
.tw{animation:tw 3s ease-in-out infinite}@keyframes tw{50%{opacity:.15}}
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 4.5s ease-in-out infinite}@keyframes pulse{50%{transform:scale(1.12);opacity:.55}}
.shoot{opacity:0;animation:shoot 9s linear infinite 2s}@keyframes shoot{0%{opacity:0;transform:translate(0,0)}3%{opacity:1}8%{opacity:0;transform:translate(170px,48px)}100%{opacity:0}}
.mist{animation:mist 60s linear infinite}@keyframes mist{to{transform:translateX(-${W}px)}}
.ship1{animation:s1 26s linear infinite}@keyframes s1{from{transform:translate(-60px,64px)}to{transform:translate(${W + 140}px,22px)}}
.ship2{animation:s2 38s linear infinite -14s}@keyframes s2{from{transform:translate(-60px,170px)}to{transform:translate(${W + 140}px,150px)}}
.beamflow{animation:bf 1.2s linear infinite}@keyframes bf{to{stroke-dashoffset:-24}}
.fall{animation:bf .8s linear infinite}
.flick{opacity:0;animation:flick 5s steps(1) infinite}@keyframes flick{0%,100%{opacity:0}10%{opacity:.16}12%{opacity:.04}14%{opacity:.14}40%{opacity:.06}70%{opacity:.12}}
.pscan{animation:ps 2.8s linear infinite}@keyframes ps{from{transform:translateY(0);opacity:.8}to{transform:translateY(var(--h));opacity:0}}
.screen{animation:scr 3.2s ease-in-out infinite alternate}@keyframes scr{to{opacity:.14}}
.ringspin{animation:bf 2s linear infinite}
.holo{animation:holo 4s steps(1) infinite}@keyframes holo{0%,100%{opacity:1}47%{opacity:.78}49%{opacity:1}51%{opacity:.88}}
.scan{animation:sc 3s linear infinite}@keyframes sc{to{transform:translateY(79px)}}
.bfly{animation:bfly 9s ease-in-out infinite alternate}@keyframes bfly{0%{transform:translate(0,0)}33%{transform:translate(14px,-12px)}66%{transform:translate(-8px,-20px)}100%{transform:translate(10px,-4px)}}
.wing{transform-box:fill-box;transform-origin:center;animation:wing .22s ease-in-out infinite alternate}@keyframes wing{to{transform:scaleX(.25)}}
.mote{animation-name:mote;animation-iteration-count:infinite;animation-timing-function:linear}@keyframes mote{0%{transform:translate(0,0);opacity:0}20%{opacity:.9}100%{transform:translate(-30px,-110px);opacity:0}}
.rise{animation:rise 1.1s ease-out both}@keyframes rise{from{opacity:0;transform:translateY(8px)}}`;

  return doc({
    w: W, h: H, title: `${profile.name} — ${t.greeting}`,
    desc: `Painting, ${t.name} version: a developer in a dark hoodie codes on a laptop under a tree on a flowered hillside, a golden retriever lying beside him, holographic panels floating in front of him. Below, a lake reflects the ${night ? 'moonlit horizon' : 'sun'} between snowy mountains; a giant ringed planet, a small moon, a floating sci-fi city with a light beam and passing ships fill the sky. A glowing pylon on a rock projects his live contribution graph: ${d.lastYearTotal} contributions in the last year.`,
    body: s, style, use: ['display', 'hand', 'mono'],
  });
}
