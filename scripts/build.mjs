#!/usr/bin/env node
// Paints every image the README uses.
//
//   node scripts/build.mjs                    render the current time of day into dist/
//   node scripts/build.mjs --preview          render morning, evening and night into dist/preview/ + an index.html
//   TIME_OF_DAY=night node scripts/build.mjs  force a time of day
//   GH_TOKEN=ghp_xxx node scripts/build.mjs   use live GitHub data (the workflow does this)
//
// Without a token it renders from data/snapshot.json. In CI a failed fetch stops the
// job, so the last good images on the `output` branch stay up.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TIMES, timeForIST } from './lib/theme.mjs';
import { fetchData, loadSnapshot, derive } from './lib/data.mjs';
import { renderHero } from './render/hero.mjs';
import * as C from './render/cards.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const preview = args.includes('--preview');
const outArg = args.indexOf('--out');
const outDir = path.resolve(root, outArg >= 0 ? args[outArg + 1] : 'dist');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'data', 'profile.json'), 'utf8'));
const snapshot = path.join(root, 'data', 'snapshot.json');
const token = process.env.GH_TOKEN || process.env.GH_PAT || process.env.GITHUB_TOKEN;

let data;
if (token) {
  try {
    data = await fetchData({ login: profile.login, token, npmPackage: profile.npmPackage });
    console.log(`live data: ${data.days.length} days, ${data.publicRepos} repos, ${data.stars} stars`);
    if (!process.env.CI) fs.writeFileSync(snapshot, JSON.stringify(data));
  } catch (e) {
    if (process.env.CI) { console.error(`GitHub fetch failed, keeping the previous images: ${e.message}`); process.exit(1); }
    console.warn(`GitHub fetch failed, using data/snapshot.json: ${e.message}`);
  }
}
data ??= loadSnapshot(snapshot);
const d = derive(data);

function paint(tName, dir) {
  const t = TIMES[tName];
  fs.mkdirSync(dir, { recursive: true });
  const w = (name, svg) => fs.writeFileSync(path.join(dir, name), svg);
  w('hero.svg', renderHero({ t, profile, d, artPath: path.join(root, 'art', `${tName}.jpg`) }));
  for (const [i, l] of profile.links.entries()) w(`pill-${l.id}.svg`, C.renderPill({ t, label: l.label ?? l.id, i }));
  w('log.svg', C.renderLog({ t, profile }));
  w('biome.svg', C.renderBiome({ t, data, d }));
  w('voyage.svg', C.renderVoyage({ t, data, d, profile }));
  w('status.svg', C.renderStatus({ t, data, d }));
  w('h-shipped.svg', C.renderHeading({ t, text: 'modules I shipped', note: 'tap one to open ↓' }));
  for (const [i, p] of profile.projects.entries()) w(`mod-${p.slug}.svg`, C.renderModule({ t, p, i }));
  w('loadout.svg', C.renderLoadout({ t, profile }));
  w('signoff.svg', C.renderSignoff({ t, profile }));
  w('avatar.svg', C.renderAvatar({ t }));
}

if (preview) {
  const names = Object.keys(TIMES);
  for (const n of names) paint(n, path.join(outDir, 'preview', n));
  const img = (n, f, wd = '100%') => `<img src="${n}/${f}" style="width:${wd};display:block;margin:0 0 14px">`;
  const col = (n) => `<section><h2>${n}</h2>${img(n, 'hero.svg')}<p style="text-align:center">${profile.links.map((l) => `<img src="${n}/pill-${l.id}.svg"> `).join('')}</p>
${['log', 'biome', 'voyage', 'status', 'h-shipped'].map((f) => img(n, `${f}.svg`)).join('')}
<div style="display:flex;flex-wrap:wrap;gap:12px 2%">${profile.projects.map((p) => `<img src="${n}/mod-${p.slug}.svg" style="width:49%">`).join('')}</div><br>
${img(n, 'loadout.svg')}${img(n, 'signoff.svg')}</section>`;
  fs.writeFileSync(path.join(outDir, 'preview', 'index.html'), `<!doctype html><meta charset="utf-8"><title>profile preview</title>
<body style="margin:0;padding:24px;background:#0d1117;color:#e6edf3;font:14px system-ui"><div style="max-width:880px;margin:auto">${names.map(col).join('<hr style="margin:40px 0;border-color:#30363d">')}</div></body>`);
  console.log(`preview → ${path.join(outDir, 'preview', 'index.html')}`);
} else {
  const tName = process.env.TIME_OF_DAY in TIMES ? process.env.TIME_OF_DAY : timeForIST();
  paint(tName, outDir);
  console.log(`painted ${tName} → ${outDir}`);
}
