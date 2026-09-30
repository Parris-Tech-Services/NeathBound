# Architecture decisions

## Unlimited actions

Actions are always available. The game may track choices and consequences, but
it never blocks play behind a timer, energy refill, payment, or account.

## Local-first persistence

The first release stores one save in `localStorage`. There are no accounts,
analytics, external APIs, or server-side player data.

This remains the Phase 0 implementation, but it is no longer the long-term
architecture. NeathBound may add an optional server-backed mode provided that
offline/local development remains possible and the game does not require paid
hosting, energy timers, analytics, or monetisation.

## Server architecture target

The target online architecture is a static browser client plus a separate JSON
API, a server-authoritative quality-based narrative rules engine, and relational
persistence.

For a genuinely free deployment, prefer Cloudflare Pages/Workers with D1 over
a literal ASP.NET/IIS clone. The important compatibility target is
architectural: data-driven storylets, qualities, requirements, effects, a
relational repository layer, and server-side choice resolution.

See `docs/FREE_QBN_BACKEND.md`.

## Backend shape

The current local backend is a free-to-run modular monolith: Node's built-in
HTTP server, JSON REST endpoints, SQLite persistence, and data-only storylet
content. This mirrors the useful shape of a legacy narrative API without
requiring Windows Server, IIS, AWS, a paid database, or a proprietary
authoring platform.

## Original setting

Neathbound uses its own setting, names, prose, and visual identity. It is not a
port, fan recreation, or asset replacement for another commercial game.

## Online backend: Supabase (2026-09-30)

Supersedes the Cloudflare Workers + D1 target above. Two agents built
backends in parallel; the owner chose to combine them: this repository's game
(engine, content, decks, menaces, interface) on the Supabase backend, which was
already deployed and verified.

- Static client on GitHub Pages; JSON API in the Supabase Edge Function `api`,
  serving the same routes the Worker defined; relational player state in
  Supabase Postgres; anonymous Supabase Auth accounts.
- Server-authoritative: row level security lets players read only their own
  rows, and all writes go through the API via `save_player` (service role only).
- The Postgres schema persists the whole state, including menaces, unlocked
  locations, acquaintances and the last card drawn (the D1 repository did not).
- Offline play is kept: if the API is unreachable, the same engine runs in the
  browser with a local save. `?api=local` forces it.
- The Cloudflare worker, `wrangler.jsonc` and D1 migrations were removed so the
  game has one backend and one source of truth.
- Free-tier care: a scheduled workflow pings the project twice a week so it
  does not pause after 7 idle days.

## Browser tests and test-only tools (2026-09-30)

Playwright (Chromium) and axe-core are used only by tests. CI installs them
with `npm install --no-save`, so they are not project dependencies and the game
stays dependency-free. Why: static checks cannot catch a module that fails to
load in a real browser, or a save that silently stops persisting, and several
cache-busting fixes were needed on 2026-09-30.

- Browser tests run in offline mode (`?api=local`) so they never create online
  players. The live check verifies the API separately (CORS preflight 200,
  unauthenticated request 401).
- The accessibility audit and third-party asset failures are reported in the
  run summary but do not fail the run, so they don't block other lanes.
  `A11Y_STRICT=1` makes serious or critical accessibility issues fail.

