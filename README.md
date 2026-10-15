# Neathbound

Neathbound is an original, open-source browser RPG about a city beneath the
world, built around strange stories, branching choices, and consequence-rich
exploration. It takes inspiration from the shape of text-led browser RPGs,
not from any protected setting, names, writing, art, or code.

## Play

**Playtest the game:** https://parris-tech-services.github.io/NeathBound/?api=local

This link uses your browser's local save. It works without an account or a running Supabase backend. Data is stored on the device and browser where you play, so clearing site data will erase the local save. The online Supabase project is currently inactive (restoring it is blocked by the two-active-free-project limit), so the linked local mode is the supported playtest route. Normal site entry also starts locally; `?api=supabase` explicitly tries the old online project and falls back to local if unavailable.

```bash
npm test
npm run dev
```

Then open <http://localhost:4173>.

Actions are deliberately unlimited. There are no energy timers, payment gates,
or payments. Progress is saved to an anonymous online account, or locally in
the browser when the backend is unreachable (or with `?api=local`).

## Backend

NeathBound uses an independent quality-based narrative architecture inspired by public design discussions
(see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)):

| Fallen London | NeathBound |
|---|---|
| Browser-based narrative UI (exact private frontend stack not established here) | Static client hosted on GitHub Pages |
| Server-authoritative actions (exact current API implementation not verified here) | Optional Supabase Edge Function `api`, presently inactive |
| Persistent qualities and story progression (private production schema not verified) | Supabase Postgres schema when backend operates; localStorage for current play |
| Player identity and saves | Local-only by default; optional Supabase anonymous login |
| Quality-based narrative design | Original, testable `src/game/` rules engine |

The *optional* Supabase API resolves choices on the server when it is online;
the default game currently runs locally and saves in the browser. It cannot
claim server-authoritative anti-cheat or cross-device saves in local mode.
Changes to `src/game/` are mirrored into the Supabase function; deploying the
function currently remains blocked by the inactive project and credential issues.

`server/` is an optional local Node + SQLite API from the earlier migration
plan. The game does not use it; the Supabase function is the online backend.

## Story and exploration

The Missing Name is the guided opening mystery. Follow the **Current lead** panel to investigate the bell, trace your record through the Hollow Archive, and pursue its skyward reference. The City Map shows both visited destinations and clues for opening new routes; on mobile, it appears in the main story column rather than the hidden sidebar. Choices still allow detours, and failed checks never strand a character in the opening investigation.

See [Narrative clarity and continuity](docs/NARRATIVE-CLARITY.md) for the authored chapter route, alternative choices, and outstanding narrative work.

## Testing

```bash
npm test          # rules, backend API, content and module-integrity checks (no browser)
npm run smoke     # static smoke check
npm run test:e2e  # plays the site in Chromium; needs: npm i --no-save playwright axe-core && npx playwright install chromium
```

`npm test` includes a module-integrity check: every import reachable from
`index.html` must exist, and each module must use a single `?v=` version
(two versions make the browser run the module twice).

CI runs the browser test on every push and PR (`e2e.yml`) and, after each
GitHub Pages deploy, against the live site (`live-check.yml`), including an
API health check. Both publish a report with an axe-core accessibility audit
and any third-party assets that failed to load. These two are reported, not
enforced; failures of the game's own files fail the run.

## Five parallel agent lanes

The repository is split into five modular lanes described in
[`docs/AGENT_LANES.md`](docs/AGENT_LANES.md): engine, narrative, interface,
save/accessibility, and QA/tooling. Each lane has a narrow ownership boundary
so up to five agents can work concurrently on separate branches or worktrees.

## Engineering standard

Engineering principles: v5.1  
Assurance tier: 2  
Canonical repository: https://github.com/Parris-Tech-Services/NeathBound

## License

MIT. All game writing and code in this repository are original contributions.

## Explore the expanded Undercity

There are nine ordinary map locations, including **Ashrail Station**, **Cinder Ward**, and the **Registry of Hours**. From Lantern Quay, the story **Three Roads Out of Lantern Quay** leads to the new districts; their routes remain on your map afterwards. Follow the on-screen **Your Journey** guide for the main mystery across Chapters One and Two, or explore independent encounters in any order. The new prologue supports all four attributes: Nerve, Insight, Poise, and Shadow. The Chapter Two finale has two distinct permanent outcomes in each saved life.

The game intentionally has unlimited actions and no waiting or payment gates. Local saves are separate from any previous online account.
