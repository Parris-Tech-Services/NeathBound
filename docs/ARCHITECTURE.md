# Architecture

NeathBound uses a broadly similar quality-based narrative architecture,
based on publicly documented design principles. Failbetter's proprietary
current source, hosting and database architecture have NOT been verified.
NeathBound is local-first; its optional Supabase online backend is inactive.

```text
Browser (GitHub Pages: index.html, src/)
  │ src/services/index.js
  │   ├─ LocalGameService     (default / ?api=local, same engine, localStorage)
  │   └─ SupabaseGameService  (opt-in ?api=supabase, fallback offline)
  │
  │ HTTPS/JSON, Authorization: anonymous Supabase session
  ▼
Supabase Edge Function `api`            supabase/functions/api/
  index.ts    auth, CORS, Postgres repository (load_player / save_player)
  handler.js  routes
  game/       copy of src/game (npm run sync:engine; tests fail on drift)
  │
  ▼
Supabase Postgres                       supabase/migrations/
  players, player_qualities, player_menaces, player_items, player_flags,
  player_locations, player_acquaintances, journal_entries, world_qualities
```

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

- Every request needs a Supabase session (anonymous is fine); the function
  verifies it and uses the user id as the player id.
- Row level security: players may read only their own rows. There are no
  write policies; `save_player` and `load_player` are callable only by the
  service role inside the function. Players cannot edit their own state.

## Changing the game

- **Content or rules:** edit `src/game/`, run `npm run sync:engine` and
  `npm test`, open a PR. Merging to `main` redeploys the function
  (`backend.yml`, secret `SUPABASE_ACCESS_TOKEN`) and the site (`pages.yml`).
- **Database:** add a file to `supabase/migrations/` and apply it to project
  `ynrfskgfrgqxwjswtnka`.
