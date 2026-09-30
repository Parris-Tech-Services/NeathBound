# Free Fallen-London-style backend architecture

> **Status:** the hosting target below (Cloudflare Workers + D1) was superseded
> on 2026-09-30 by Supabase; see `docs/DECISIONS.md` and `docs/ARCHITECTURE.md`.
> The domain model and API shape here still describe the implemented design.

NeathBound should reproduce the architectural **shape** of a mature quality-based
narrative browser RPG while remaining original and free to host.

This does not copy Fallen London code, content, names, art, UI, or proprietary
StoryNexus implementation.

## Target stack

| Role | NeathBound | Fallen-London-style analogue |
| --- | --- | --- |
| Static browser client | Cloudflare Pages / Worker static assets | CDN-served static web client |
| API | Cloudflare Worker, JSON over HTTPS | Separate JSON web API |
| Runtime | TypeScript/JavaScript Worker | C#/ASP.NET application |
| Narrative engine | NeathBound QBN rules engine | StoryNexus-style quality rules |
| ORM/query layer | Drizzle ORM or thin typed repository layer | NHibernate-style ORM layer |
| Relational data | Cloudflare D1 (SQLite semantics) | relational SQL database |
| CDN | Cloudflare global network | CloudFront-style CDN |
| Source/deploy | GitHub + Cloudflare Git integration | CI/deployment pipeline |

The runtime differs deliberately. A literal ASP.NET deployment can be hosted on
Azure App Service F1 for free, but the free tier has a very small daily CPU
quota. Cloudflare Workers + D1 gives NeathBound a much larger practical free
budget while preserving the architecture that matters to the game.

## Core design

The browser should become a client of a server-authoritative rules engine.

```text
Browser
  |
  | HTTPS / JSON
  v
/api/*
  |
  v
QBN engine
  |
  +-- story eligibility
  +-- branch requirements
  +-- challenge resolution
  +-- effects / quality mutation
  +-- deck and card selection
  +-- location rules
  |
  v
Repository layer
  |
  v
D1 relational database
```

Static assets and public narrative presentation data may be cached aggressively.
Player state and choice resolution must remain server-authoritative once the
online mode is enabled.

## Narrative domain model

The engine should grow around these entities:

- Player
- Quality
- PlayerQuality
- Location
- Storylet
- Branch
- Requirement
- Effect
- Challenge
- Deck
- Card
- InventoryItem
- PlayerItem
- JournalEntry
- WorldQuality

A player is conceptually a sparse map of qualities:

```text
quality_id -> numeric/string state
```

Storylets and branches are data. Code evaluates predicates and applies effects.

## Initial relational schema

A first D1 schema can use:

```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE qualities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE player_qualities (
  player_id TEXT NOT NULL,
  quality_id TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, quality_id)
);

CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE player_items (
  player_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, item_id)
);

CREATE TABLE storylets (
  id TEXT PRIMARY KEY,
  location_id TEXT,
  title TEXT NOT NULL,
  kicker TEXT,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  storylet_id TEXT NOT NULL,
  label TEXT NOT NULL,
  success_text TEXT,
  failure_text TEXT,
  target_location_id TEXT
);

CREATE TABLE requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  quality_id TEXT NOT NULL,
  operator TEXT NOT NULL,
  compare_value REAL NOT NULL
);

CREATE TABLE effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id TEXT NOT NULL,
  outcome TEXT NOT NULL,
  effect_type TEXT NOT NULL,
  target_id TEXT,
  amount REAL,
  value_text TEXT
);

CREATE TABLE journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  text TEXT NOT NULL
);

CREATE INDEX idx_player_qualities_player ON player_qualities(player_id);
CREATE INDEX idx_storylets_location ON storylets(location_id);
CREATE INDEX idx_requirements_owner ON requirements(owner_type, owner_id);
CREATE INDEX idx_journal_player ON journal_entries(player_id, created_at);
```

Narrative content can remain version-controlled JS/JSON initially and migrate
into database-backed authoring later. This avoids making content editing harder
before the engine is stable.

## API shape

Start with a small REST-like API:

```text
GET  /api/player
GET  /api/location
GET  /api/storylets
POST /api/storylets/:storyletId/branches/:branchId/choose
GET  /api/journal
POST /api/reset
```

A choice request should be a transaction:

1. Load player state.
2. Re-check storylet and branch requirements server-side.
3. Roll any challenge server-side.
4. Apply effects atomically.
5. Persist location/quality/item changes.
6. Append journal entry.
7. Return the new public state and result text.

Never trust a browser-supplied reward, roll, quality value, or destination.

## Free-tier target

As of September 2026, the intended free deployment target is Cloudflare:

- static asset requests: free on Pages
- Workers Free: 100,000 requests/day
- D1 Free: 5 million rows read/day
- D1 Free: 100,000 rows written/day
- D1 Free: 5 GB total included storage

The schema must therefore avoid full-table scans and use indexes for all common
player and eligibility lookups.

## Migration plan

### Phase 0 — current game

Keep the existing static game and tests working.

### Phase 1 — strengthen the QBN engine

Refactor the existing engine so story visibility is predicate-driven instead of
every story in a location always being visible.

Add:

- reusable requirement evaluation
- reusable effect application
- challenge objects per branch
- quantities instead of item-name arrays
- schema/version validation
- deterministic random injection for tests

### Phase 2 — API boundary locally

Introduce an API/client abstraction even before deployment.

The UI should call a game service rather than import and mutate state directly.
Provide:

- `LocalGameService` for current offline play
- `RemoteGameService` for the Worker API

This keeps local/offline development possible.

### Phase 3 — D1 persistence

Add the relational schema and repository layer. Use anonymous generated player
IDs initially; full user accounts are not required.

Move authoritative player state from `localStorage` to D1 for online mode.
Keep local export/import as a backup and accessibility feature.

### Phase 4 — server-authoritative choices

Move eligibility, challenge rolls, state mutation and journal writes into the
Worker.

The browser becomes presentation only for game-changing actions.

### Phase 5 — decks and world state

Add:

- opportunity-card decks
- weighted card draws
- discard/hand state
- world qualities
- seasonal/global flags

### Phase 6 — authoring tools

Only after the domain model stabilises, add an internal authoring interface for
storylets, branches, requirements and effects.

Content should remain data-driven. Writers should not need to write application
code for ordinary narrative content.

## Non-goals

- no copied Fallen London prose, lore, art, names or proprietary code
- no action-energy timers
- no payment gates
- no mandatory monetisation
- no microservice split for its own sake
- no premature CMS before the game model is stable

## Architectural principle

Replicate the useful architecture, not the historical baggage:

> static client + JSON API + relational persistence + data-driven QBN rules
> engine + server-authoritative state

That gives NeathBound the important properties of the architecture while
remaining maintainable by a very small team and viable on a $0 hosting budget.
