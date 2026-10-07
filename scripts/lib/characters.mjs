// The two characters drawn in vector: Aman (seated silhouette, facing left; mirror with
// scale(-1 1) to face right) and BODHI-01, the hovering seed-bot with a sapling on its back.

export function person(pose, c) {
  const L = (x1, y1, x2, y2, w) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  let s = '';
  // torso + head
  s += `<path d="M3 0 C5 -12 3 -25 -1 -32 C-4 -37 -11 -37 -14.5 -31.5 C-14 -22 -12.5 -10 -11 0 Z" fill="${c}"/>`;
  s += `<path d="M-6 -35 L-7 -39" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<circle cx="-8" cy="-46" r="8.6" fill="${c}"/>`;
  s += `<path d="M-16.4 -46.5 L-18.4 -43.2 L-16 -42.6 Z" fill="${c}"/>`; // nose
  s += `<g class="hair"><path d="M-17.5 -46 C-17 -55 -8 -59 -1 -55 C3 -52 3 -46 -0.5 -40.5 C-1 -45 -4 -48.5 -9 -49.5 C-12.5 -50 -15.5 -48.5 -17.5 -46Z M-9 -55.5 q4 -4.5 9 -3 q-3 1 -4.5 3.5Z M-2 -53.5 q4 -2 7 0 q-3 .5 -4.5 2.8Z" fill="${c}"/></g>`;
  // legs, knees up
  s += L(-5, -4, -27, -20, 10) + L(-27, -20, -31, -1, 8) + L(-31, -1, -38, 0, 5);
  if (pose === 'chai') {
    s += L(-6, -30, -12, -17, 6) + L(-12, -17, -19, -33, 5);
    s += `<rect x="-24" y="-41" width="7" height="8" rx="1.5" fill="${c}"/>`;
  } else {
    s += L(-6, -30, -14, -16, 6) + L(-14, -16, -27, -23, 5);
    s += L(-36, -23, -16, -19, 2.8) + `<path d="M-37 -23 L-33 -42 L-29.6 -41.4 L-33.4 -22.4Z" fill="${c}"/>`; // laptop
  }
  return s;
}

export function bot(t, { eye = true, glow = true, wave = false } = {}) {
  const body = t.name === 'night' ? '#cfe3ea' : '#f4f8f6', shade = t.name === 'night' ? '#8fb0bb' : '#c9d9d5';
  return `<g class="hover">
${glow ? `<ellipse cx="0" cy="26" rx="12" ry="3" fill="${t.holo}" opacity=".35" class="thrust"/>` : ''}
<path d="M-6 16 L-3 23 L3 23 L6 16Z" fill="${shade}"/><circle cx="0" cy="22.5" r="2.4" fill="${t.holo}" class="thrust"/>
<path d="M-17 2 L-24 -2 L-23 6Z" fill="${shade}"/>
<g ${wave ? 'class="wave"' : ''}><path d="M17 2 L24 -2 L23 6Z" fill="${shade}"/></g>
<circle cx="0" cy="0" r="17" fill="${body}"/>
<path d="M-17 0 A17 17 0 0 0 17 0 A17 9 0 0 1 -17 0Z" fill="${shade}"/>
<path d="M-15 -7 C-12 -16 -2 -19 6 -16 C2 -13 -6 -12 -15 -7Z" fill="${t.bio}" opacity=".9"/>
<circle cx="-10" cy="-11" r="1.6" fill="${t.bio2}"/>
<g class="sprout"><path d="M2 -17 C2 -24 1 -28 3 -33" stroke="#4c9a52" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M3 -30 C-4 -34 -9 -31 -10 -27 C-4 -26 0 -27 3 -30Z" fill="#6cc46a"/><path d="M3 -27 C9 -32 14 -30 15 -26 C10 -24 6 -25 3 -27Z" fill="#8fdc6e"/></g>
<circle cx="4" cy="1" r="8.5" fill="#0e2230"/>
${eye ? `<circle cx="5" cy="0.5" r="5" fill="${t.holo}" class="eye"/><circle cx="7" cy="-1.5" r="1.6" fill="#fff"/>` : ''}
</g>`;
}
