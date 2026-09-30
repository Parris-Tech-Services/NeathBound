# Parallel agent lanes

Five agents can work concurrently when each uses a separate branch/worktree
and stays inside one lane. Integration is owned by the release coordinator.

| Lane | Owns | Avoids touching |
|---|---|---|
| Engine | `src/game/state.js`, `src/game/engine.js`, `server/src/domain.mjs`, deterministic rules and tests | narrative prose and CSS |
| Narrative | `src/game/content.js`, `server/content/storylets.json`, story cards, locations, item text | engine algorithms and layout |
| Interface | `src/ui/`, `index.html`, `src/styles.css` | save schema and story rules |
| Save & accessibility | `src/game/state.js` persistence adapters, settings, keyboard/ARIA behavior, API client integration | story balance and visual restyling |
| Backend | `supabase/` (migrations, `api` function), `src/services/`, `src/config.js`, `scripts/sync-engine.mjs`, backend workflows | story content and visual restyling |
| QA & tooling | `tests/`, docs, fixtures, smoke scripts, release checks | production game behavior unless fixing a test contract |

Suggested worktrees:

```bash
git worktree add ../Neathbound-engine -b agent/engine
git worktree add ../Neathbound-narrative -b agent/narrative
git worktree add ../Neathbound-interface -b agent/interface
git worktree add ../Neathbound-save-a11y -b agent/save-a11y
git worktree add ../Neathbound-qa -b agent/qa
```

Before merging any lane, run `npm test` and `npm run smoke`. Keep content
changes data-shaped and engine changes deterministic so cherry-picks remain
low-conflict.
