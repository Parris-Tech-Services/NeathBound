# NeathBound agent instructions (7-agent collaboration)

**Read first:** [Seven-agent production plan](docs/SEVEN_AGENT_PRODUCTION.md), [README](README.md), [agent lanes](docs/AGENT_LANES.md), and the [Narrative Studio production process](docs/narrative-studio/README.md). The seven-agent plan supersedes historical five-lane assignments whenever roles conflict.

1. Agents **2–7 work on their assigned feature branch**, for example `agent/2-gloomwing-depth`; open a PR. **Agent 1 alone integrates and promotes production releases.** Do not directly push to `main` or silently deploy the API.
2. Don't change files another agent owns without a documented handoff. Especially protect `src/game/content.js`, `engine.js`, `rules.js`, `state.js` and service adapters. Author independent content modules and let Agent 1 integrate.
3. Use original narrative prose and original game art. Do not copy names, setting, text, assets or code from Fallen London or paid stories.
4. Keep old saves playable and server/local outcomes consistent. The *current game* uses a starting pool of **10 actions**, replenished every ten minutes (maximum unlockable cap 20); no paid action refills. Changing action economy requires explicit review. Ignore old docs that call actions unlimited.
5. The live online backend is a **Cloudflare Worker + D1**, not the historical Supabase or legacy Node backend. `src/game/` is the canonical gameplay source; `scripts/sync-engine.mjs` mirrors modules for legacy/API packaging. Agent 1 alone changes/deploys live Cloudflare.
6. Run `npm run release:check` for code/content changes; run `npm run test:e2e` when browser or journey behaviour changes, and report **exactly** which checks passed or failed.
7. Narrative drafts follow the existing pitch → skeleton → prose → four independent QA reviews → real human approval. Draft/editorial packets are **not playable** until integrated and tested.
8. Flag a broken save, dead-end story, duplicated reward, inaccessible gameplay, missing item/quality reference or deployment regression immediately.

All role definitions and first deliverables: [Seven-agent production plan](docs/SEVEN_AGENT_PRODUCTION.md).
