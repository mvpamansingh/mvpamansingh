# How this profile works

Every image in the README is an SVG painted by `scripts/build.mjs` (plain Node 20, no dependencies).
A GitHub Action repaints them and force-pushes them to an `output` branch; the README points at
`raw.githubusercontent.com/mvpamansingh/mvpamansingh/output/...`, so the main branch history stays clean.

The whole page follows the time in India (IST):

| Time (IST) | Look |
| --- | --- |
| 05:00 – 15:59 | **morning** · your painting graded to a fresh sunrise, light rays, blue sky |
| 16:00 – 19:29 | **evening** · your painting exactly as drawn, golden hour |
| 19:30 – 04:59 | **night** · graded to night; holograms, lantern, city and village lights stay lit, stars + shooting star |

## Install (5 minutes)

1. Copy everything in this folder into the root of the `mvpamansingh/mvpamansingh` repo (replace the old README) and push to `main`.
2. Repo → **Settings → Actions → General → Workflow permissions** → choose **Read and write permissions** → Save.
3. **Actions** tab → **paint the profile** → **Run workflow**. The first run creates the `output` branch; the images appear on your profile a minute or two later.

From then on it runs by itself at 05:00, 10:00, 16:00, 19:30 and 23:00 IST, and on every push that touches `scripts/`, `data/`, `art/` or the workflow.

**Optional:** to count private contributions too, create a classic token with the `read:user` scope and save it as a repo secret named `GH_PAT`.

## Editing

| Want to change… | Edit |
| --- | --- |
| Name line, role, current work, status, past roles, companion | `data/profile.json` (`heroLine`, `role`, `company`, `now`, `status`, `before`, `pet`) |
| Project cards | `data/profile.json` → `projects` (name, tag, blurb, stack, icon: `bug` / `chat` / `lotus` / `check`). Also update the links in `README.md`. |
| One-line story under each year in "the voyage so far" | `data/profile.json` → `chapters` (add a line for each new year) |
| Toolkit | `data/profile.json` → `toolkit` |
| Link pills | `data/profile.json` → `links`, plus the matching `<a href>` in `README.md` |
| The painting | `art/morning.jpg`, `art/evening.jpg`, `art/night.jpg` (1760×990, 16:9). If you make proper morning/night versions of the painting with the same composition, just replace these files. |
| Colors per time of day | `scripts/lib/theme.mjs` |

Please double-check the **resume**, **YouTube** and two **Play Store** links in `README.md`; they came from your portfolio but are worth a click.

## Try it locally

```bash
node scripts/build.mjs --preview          # all three times → dist/preview/index.html
TIME_OF_DAY=night node scripts/build.mjs  # one time of day → dist/
GH_TOKEN=ghp_xxx node scripts/build.mjs   # with live GitHub data (also refreshes data/snapshot.json)
```

Without a token the build uses `data/snapshot.json` (your real public contribution history; stars and languages there are placeholders until the first live run).

## Files

```
README.md                      the profile page
art/                           your painting, graded for morning / evening / night
data/profile.json              all the words on the cards
data/snapshot.json             offline data for local previews
scripts/build.mjs              paints everything
scripts/lib/theme.mjs          palettes, fonts, helpers
scripts/lib/data.mjs           GitHub GraphQL + npm fetch, streaks and totals
scripts/lib/characters.mjs     Aman's silhouette and BODHI-01
scripts/render/hero.mjs        the painting + live overlays (glows, ships, butterflies, holo-pylon commit graph)
scripts/render/cards.mjs       mission log, commit biome, voyage, status, modules, loadout, pills, sign-off, avatar
scripts/fonts/                 Space Grotesk, Caveat, JetBrains Mono (OFL, subset and embedded)
extras/avatar-*.png            optional matching profile pictures
.github/workflows/profile.yml  the scheduler
```

## Notes

- GitHub caches README images for a few minutes, so a new paint can take a moment to show.
- If GitHub pauses the schedule after a long quiet spell, open the Actions tab and re-enable it.
- Animations respect `prefers-reduced-motion`.
