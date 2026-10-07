// Pulls everything the cards need from the GitHub GraphQL API (and npm) and
// normalises it into one small object. Local runs without a token render from
// data/snapshot.json instead.
import fs from 'node:fs';

const GQL = 'https://api.github.com/graphql';

async function gql(token, query, variables) {
  const res = await fetch(GQL, {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-readme' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

const USER_Q = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    name createdAt
    followers { totalCount }
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC,
                 orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name stargazerCount pushedAt
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }
      }
    }
  }
}`;

const CAL_Q = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

async function npmLastYear(pkg) {
  try {
    const r = await fetch(`https://api.npmjs.org/downloads/point/last-year/${pkg}`);
    if (!r.ok) return null;
    return (await r.json()).downloads ?? null;
  } catch { return null; }
}

export async function fetchData({ login, token, npmPackage }) {
  // repos (paginated) → stars, languages, last push
  let cursor = null, repos = [], user;
  do {
    const d = await gql(token, USER_Q, { login, cursor });
    user = d.user;
    repos.push(...user.repositories.nodes);
    cursor = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null;
  } while (cursor);

  const langBytes = new Map();
  for (const r of repos) {
    for (const e of r.languages.edges) {
      const cur = langBytes.get(e.node.name) ?? { name: e.node.name, color: e.node.color ?? '#888888', size: 0 };
      cur.size += e.size;
      langBytes.set(e.node.name, cur);
    }
  }
  const total = [...langBytes.values()].reduce((a, l) => a + l.size, 0) || 1;
  const sorted = [...langBytes.values()].sort((a, b) => b.size - a.size);
  const top = sorted.slice(0, 5);
  const otherPct = sorted.slice(5).reduce((a, l) => a + l.size, 0) / total * 100;
  const languages = top.map((l) => ({ name: l.name, color: l.color, pct: +(l.size / total * 100).toFixed(1) }));
  if (otherPct >= 0.5) languages.push({ name: 'Other', color: '#8b8b8b', pct: +otherPct.toFixed(1) });

  // contribution calendar, one year at a time since the account was created
  const created = new Date(user.createdAt);
  const now = new Date();
  const days = [];
  for (let y = created.getUTCFullYear(); y <= now.getUTCFullYear(); y++) {
    const from = new Date(Math.max(Date.UTC(y, 0, 1), created.getTime()));
    const to = new Date(Math.min(Date.UTC(y, 11, 31, 23, 59, 59), now.getTime()));
    const d = await gql(token, CAL_Q, { login, from: from.toISOString(), to: to.toISOString() });
    for (const w of d.user.contributionsCollection.contributionCalendar.weeks)
      for (const c of w.contributionDays) days.push({ date: c.date, count: c.contributionCount });
  }
  const seen = new Set();
  const uniq = days.filter((d) => (seen.has(d.date) ? false : seen.add(d.date))).sort((a, b) => a.date.localeCompare(b.date));

  const last = repos.find((r) => r.name !== login) ?? repos[0];

  return {
    login,
    name: user.name ?? login,
    createdAt: user.createdAt,
    generatedAt: now.toISOString(),
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
    languages,
    lastPush: last ? { repo: last.name, at: last.pushedAt } : null,
    npm: npmPackage ? { pkg: npmPackage, lastYear: await npmLastYear(npmPackage) } : null,
    days: uniq,
  };
}

export function loadSnapshot(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

// ---- derived numbers used by several cards
export function derive(data) {
  const days = data.days;
  // "today" in India
  const today = new Date(new Date(data.generatedAt).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const upto = days.filter((d) => d.date <= today);

  let longest = 0, run = 0;
  for (const d of upto) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }

  let current = 0;
  let i = upto.length - 1;
  if (i >= 0 && upto[i].count === 0) i--; // today not done yet is fine
  for (; i >= 0 && upto[i].count > 0; i--) current++;

  const year = today.slice(0, 4);
  const thisYear = upto.filter((d) => d.date.startsWith(year)).reduce((a, d) => a + d.count, 0);
  const allTime = upto.reduce((a, d) => a + d.count, 0);
  const last365 = upto.slice(-365);
  const lastYearTotal = last365.reduce((a, d) => a + d.count, 0);
  const best = upto.reduce((b, d) => (d.count > (b?.count ?? -1) ? d : b), null);

  const months = new Map();
  for (const d of upto) months.set(d.date.slice(0, 7), (months.get(d.date.slice(0, 7)) ?? 0) + d.count);

  const activeDays = last365.filter((x) => x.count > 0).length;
  return { today, longest, current, thisYear, allTime, lastYearTotal, best, months, last365, upto, activeDays };
}
