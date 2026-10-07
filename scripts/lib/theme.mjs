// Shared palettes, fonts and SVG helpers.
// The README re-skins itself with the time of day in India (IST, UTC+5:30):
//   morning 05:00–15:59 · evening 16:00–19:29 · night 19:30–04:59
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const TIMES = {
  morning: {
    name: 'morning', greeting: 'morning sync · chai, sunlight, deploys',
    ink: '#163a3a', holo: '#0f9f8b', holo2: '#0a6e62', bio: '#3fbf7f', bio2: '#ff8a65',
    sky: ['#79c3d6', '#b9e2dc', '#f3ead0', '#ffd4a8'], planet: ['#f5e6d0', '#d9c4b0'], ring: '#fff5e6', terrace: '#5fae7c',
    bg: '#f4fbf8', bg2: '#e8f5f1', border: '#cfe6df', fg: '#12323a', muted: '#4f7470', faint: '#97b8b2',
    accent: '#13a58f', accent2: '#ff7f5c', accent3: '#7a8cff', gold: '#f2b84b',
    cells: ['#e2efeb', '#a8e3d5', '#5fd0b8', '#20aa92', '#0d7a6b'],
  },
  evening: {
    name: 'evening', greeting: 'golden hour · the city glows, the build goes green',
    ink: '#1a1430', holo: '#5ff2d8', holo2: '#b5fff1', bio: '#9ff57a', bio2: '#ffd27a',
    sky: ['#2b2a66', '#7a3f7e', '#ee7d5f', '#ffc56d'], planet: ['#ffcf9a', '#d9706a'], ring: '#ffe0b5', terrace: '#9fd37a',
    bg: '#fff4ec', bg2: '#fde3d6', border: '#f2cdbd', fg: '#2e1a33', muted: '#83606f', faint: '#c9a3a6',
    accent: '#e2603f', accent2: '#16a08c', accent3: '#9b5bbf', gold: '#f2a33a',
    cells: ['#f6e1d8', '#f8c0a0', '#f39470', '#df6447', '#a8403a'],
  },
  night: {
    name: 'night', greeting: 'night shift · stars out, commits glowing',
    ink: '#040b13', holo: '#5ff2d8', holo2: '#c4fff4', bio: '#7dffb2', bio2: '#c58bff',
    sky: ['#030816', '#081a30', '#0d2a40', '#13394d'], planet: ['#3b5f8a', '#13243d'], ring: '#7fb3d9', terrace: '#2f8f6a',
    bg: '#06141f', bg2: '#0a1e2c', border: '#16384a', fg: '#e3fbff', muted: '#8fb8c0', faint: '#3f6573',
    accent: '#5ff2d8', accent2: '#ff8fb1', accent3: '#b48bff', gold: '#ffd479',
    cells: ['#0c2433', '#0f4a52', '#13817a', '#3fcfb4', '#b8fff0'],
  },
};

export function timeForIST(date = new Date()) {
  const m = (date.getUTCHours() * 60 + date.getUTCMinutes() + 330) % 1440;
  if (m >= 300 && m < 960) return 'morning';
  if (m >= 960 && m < 1170) return 'evening';
  return 'night';
}

// ---- fonts (subset woff2, embedded so they render inside <img> on GitHub)
const b64 = (f) => fs.readFileSync(path.join(here, '..', 'fonts', f)).toString('base64');
let F;
export function fonts(which) {
  F ??= { d7: b64('sg-700.woff2'), d5: b64('sg-500.woff2'), h: b64('caveat-600.woff2'), m: b64('jbm-400.woff2'), mb: b64('jbm-600.woff2') };
  const ff = (fam, file, extra = '') => `@font-face{font-family:'${fam}';${extra}src:url(data:font/woff2;base64,${file}) format('woff2')}`;
  let css = '';
  if (which.includes('display')) css += ff('SG', F.d7, 'font-weight:700;') + ff('SG', F.d5, 'font-weight:500;');
  if (which.includes('hand')) css += ff('Hand', F.h, 'font-weight:600;');
  if (which.includes('mono')) css += ff('JB', F.m, 'font-weight:400;') + ff('JB', F.mb, 'font-weight:600;');
  return css;
}
export const DISPLAY = `'SG', 'Segoe UI', system-ui, sans-serif`;
export const HAND = `'Hand', 'Segoe Print', cursive`;
export const MONO = `'JB', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fmt = (n) => Number(n).toLocaleString('en-IN');

export function doc({ w, h, title, desc, body, style = '', use = ['display', 'hand', 'mono'] }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<style>${fonts(use)}
${style}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
${body}
</svg>
`;
}

// deterministic randomness, so re-renders don't jitter
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function istStamp(date = new Date()) {
  const d = new Date(date.getTime() + 5.5 * 3600e3);
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${String(d.getUTCDate()).padStart(2, '0')} ${mon}, ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} IST`;
}

export function timeAgo(iso, now = new Date()) {
  const s = Math.max(0, (now - new Date(iso)) / 1000);
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : `${d}d ago`;
}
