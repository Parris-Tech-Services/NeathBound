# Architecture

NeathBound is an original quality-based narrative game inspired by public
narrative design research, not a copy of Failbetter's source or alleged
database internals. Its online mode currently targets Cloudflare Workers +
D1; the browser explicitly supports offline play.

```text
Browser / GitHub Pages
  | src/services/index.js
  +-- CloudflareGameService (default when no ?api= selector)
  |      anonymous 256-bit session token -> Worker API -> D1
  +-- LocalGameService (?api=local or first-contact offline fallback)
  |      original shared rules -> localStorage (device/browser only)
  +-- SupabaseGameService (?api=supabase, legacy inactive experiment)

Original engine source: src/game/
Historical Supabase content mirror: supabase/functions/api/game/
Legacy local Node API: server/
```

**Deployment caveat:** Cloudflare service code and automated client tests are
present in this repository. Runtime health and production protection must be
verified independently; CI passing is not proof of cross-device save safety.
Cloudflare and local saves are not identical accounts. Cloudflare session
tokens must be guarded as account access credentials.

**Public-source boundary:** [FailbetterGames engineering research](https://github.com/joshualparris/FailbetterGames/tree/main/fallen-london/engineering)
marks the original game's private frontend, server stack and schemas as
unverified. Earlier documentation guessed specific infrastructure; those
claims must not be treated as discoveries.

## API

| Route | Does |
|---|---|
| `POST /api/player` | create the player (idempotent) |
| `GET /api/player` | player state |
| `GET /api/location` | current location and its storylets |
| `GET /api/storylets` | storylets available here |
| `GET /api/journal` | journal |
| `GET /api/world` | world qualities |
| `POST /api/reset` | begin a new life |
| `POST /api/storylets/:story/branches/:choice/choose` | resolve a choice; `409` if the rules refuse it |

## Security model

- Cloudflare mode authenticates requests with a browser-generated random
  session token; the API maps it to an isolated player record. Treat that
  token like a password. Do not log it or put it in URL query strings.
- Historical Supabase code instead uses Supabase Auth and row-level security.
- Local mode has no trusted server and therefore offers no anti-cheat or
  cross-device account promises.

## Changing the game

- **Content or rules:** edit `src/game/`, run `npm run sync:engine` and
  `npm test`, open a PR. Merging to `main` deploys the website (`pages.yml`). The
  Supabase backend deployment workflow is legacy and may fail while the
  Supabase project remains inactive; check current Cloudflare deployment
  separately.
- **Database:** maintain the active Cloudflare D1 schema/migrations in
  its separately managed backend project; do not apply Supabase migrations
  to D1 as if the schemas were identical.
