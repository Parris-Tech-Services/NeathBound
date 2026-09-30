# Parallel agent lanes

Six agents can work concurrently when each uses a separate branch/worktree
and stays inside one lane. Integration is owned by the release coordinator.

| Lane | Owns | Avoids touching |
|---|---|---|
| Engine | `src/game/engine.js`, `src/game/state.js`, `src/game/content.js` (loader and validator); run `npm run sync:engine` | narrative prose and CSS |
| Backend | `supabase/` (migrations, `api` function), `src/api/client.js`, `scripts/`, `.github/workflows/backend.yml` | story content and CSS |
| Narrative | `content/*.json` (qualities, areas, storylets) | engine algorithms and layout |
| Interface | `src/ui/`, `index.html`, `src/styles.css` | save schema and story rules |
| Save & accessibility | persistence adapters, settings, keyboard/ARIA behavior | story balance and visual restyling |
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
