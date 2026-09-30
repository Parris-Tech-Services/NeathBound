# Architecture

Neathbound copies Fallen London's architecture (not its content): a static
single-page front end, an authoritative JSON API, a relational database, and a
quality-based narrative (QBN) engine driven by authored data.

```text
Browser (GitHub Pages: index.html, src/, content/)
  │  src/api/client.js ── offline? ──> src/game/engine.js + localStorage
  │
  │ HTTPS/JSON  (Authorization: anonymous Supabase session)
  ▼
Supabase Edge Function `api`        supabase/functions/api/
  index.ts   auth, CORS, database adapter
  handler.js routes (begin / choosebranch / goback / reset)
  engine.js  copy of src/game/engine.js (CI checks they match)
  │
  ▼
Supabase Postgres                   supabase/migrations/
  content:  qualities, areas, storylets, branches, world   (synced from /content)
  players:  characters, character_qualities                (written only by `api`)
```

## The QBN model

- **Quality**: anything a character has a level in (stats, Echoes, items, story progress).
  A character is a sparse map `qualityId -> level`; level 0 means absent.
- **Area**: where the character is. Storylets belong to an area.
- **Storylet**: shown when its `requirements` hold, and contains branches.
- **Branch**: its own `requirements` (shown locked when unmet), an optional
  `challenge` (roll 1–10 + quality level ≥ difficulty), and `success` / `failure`
  outcomes of `effects` (`add` or `set` a quality) plus an optional `moveTo` area.

## API

| Method and path | Body | Does |
|---|---|---|
| `GET /api/character/myself` |  | character sheet and current storylets |
| `GET /api/storylet` |  | storylets here (`phase: Available`) or the one in progress (`phase: In`) |
| `POST /api/storylet/begin` | `{storyletId}` | enter a storylet |
| `POST /api/storylet/choosebranch` | `{branchId}` | resolve a branch; returns `outcome` |
| `POST /api/storylet/goback` |  | leave the current storylet |
| `POST /api/character/reset` |  | start a new life |

A refused action returns `409` with the error and fresh state.

## Writing content (the CMS)

Edit `content/*.json` on a branch and open a PR. CI validates every reference
(`npm run content:check`). On merge to `main`, `.github/workflows/backend.yml`
syncs the database. Needs repository secret `SUPABASE_ACCESS_TOKEN`.

## Editing the engine

Change `src/game/engine.js`, then `npm run sync:engine` to copy it into the
function. `npm test` fails if the two copies differ.
