# Seven-agent production plan — NeathBound + The Undercity

**Coordinator:** Agent 1 (integration, playability and releases). **Date:** 15 October 2026.
**Canonical repositories:**
- [NeathBound](https://github.com/Parris-Tech-Services/NeathBound)
- [The Undercity](https://github.com/joshualparris/theUndercity)

This document is shared across both repositories. Each agent should inspect the **latest** default branch at the beginning of each task, rather than trusting the status snapshot below.

## Mission

Ship two **enjoyable, distinct, original** quality-based narrative games. Prioritise (1) satisfying player decisions, (2) legible consequences, (3) progression without softlocks, (4) stable saves and deployments, and (5) accessible mobile/desktop presentation. Chapter counts and storylet volume are **not** success measures by themselves.

### Current reference points (not permanent source-of-truth counts)

At the 15 October inspection, NeathBound had a 30-stage Gloomwing ambition, a 30-stage Missing Name ambition and three five-stage ambitions, with a JSON storypack pipeline and live Cloudflare/D1 backend. The Undercity's checked-in tracker reported 352 storylets, 851 branches and four 32-stage ambitions; its README acknowledges that many late choices converge. Both have narrative-studio/editorial pipelines and production-site deployments. Counts change while agents work.

## Ownership: seven non-overlapping roles

| Agent | Focus | Primary ownership | Deliver this first | Avoid touching |
|---|---|---|---|---|
| **1** | Producer / integrator / release QA **both games** | CI, deployment configurations, release docs, cross-module integration contracts and integration tests | Verify current live site, repro/fix blocking bugs, integrate reviewed PRs, validate browser save + journey | Unreviewed bulk prose, unilateral redesigns, speculative feature count claims |
| **2** | **NeathBound narrative** | `content/ambitions/**`, original story text and branching narrative drafts | Deepen Gloomwing's biggest choice beats; outline and implement a distinct 30-stage arc for one short ambition; earn durable NPC flags and a real ending | Game maths, save schema, UI, story-generation tooling |
| **3** | **NeathBound systems** | New isolated systems/economy modules and tests (coordinate any `src/game/rules.js` or `engine.js` changes with Agent 1) | A satisfying profession progression + weekly income vertical slice with meaningful unlock and a visible reward | Narrative prose, global UI and content pipeline |
| **4** | **Both games: authoring pipeline / editorial QA** | Story schemas, validators, CMS/editor, `tools/storylet-generator.mjs`, studio QA and generation scripts | Canonical schema/IDs, exhaustive reference + progression validation, batch proposal → multi-pass editorial reviews; keep draft separate from live content | Narrative canon, live saves, game UI and production deployment |
| **5** | **Undercity narrative** | `content/storylets/ambitions/**`, `content/late-ambitions.js` or migrated JSON, character prose | Rewrite six important formulaic late-stage chapters per ambition into distinct encounters; add NPC recognition and consequence flags | `index.html`, maths, profession economy, generated browser bundles |
| **6** | **Undercity systems** | `src/game/rules.js`, isolated economy/progression data modules and tests; use Agent 1 for shared integration | Audit skill checks, rewards, cards, menaces, income and power curves; implement and test one worthwhile loop | Narrative chapter source, interface markup and release scripts |
| **7** | **Both games: UX and independent playtesting** | NeathBound `src/ui/**` and CSS; Undercity `index.html` **UI/markup/style only**, with narrow diffs; accessibility and player-facing tests | Test first 10–20 minutes on mobile and desktop; fix unclear choices, navigation, feedback and recovery guidance | Core story state and rules without explicit integration agreement |

### Conflict hotspots

- **Agent 1 owns final merges to `main` and all production promotions** (GitHub Pages/Cloudflare for NeathBound; Vercel for Undercity). Other agents must not push directly to `main` or change production secrets.
- NeathBound's `src/game/content.js`, `src/game/engine.js`, `src/game/state.js`, `src/game/rules.js`, and service adapters are **shared integration points**. Authors produce isolated data packs and tests; Agent 1 owns wiring/merging.
- Undercity's `index.html` is a **large shared legacy file**; only Agent 7 owns direct layout/UI edits there. Agents 5/6 should produce separate module changes or a documented patch contract for Agent 1 instead of racing edits to this file.
- Generated files (content trackers, `rules.global.js`, compiled story bundles, mirrored server modules) are rebuilt from their source; **never hand-edit them**.
- If two agents need the same file, post an issue/PR describing the proposed interface; assign the source edit to one owner, then rebase the dependent PR. No conflicting PRs for the same block.

## Every agent's work protocol

1. Read current `README.md`, this plan, the repo's narrative bible/continuity ledger when authoring stories, and applicable `AGENTS.md`.
2. Start **one narrow branch** from the latest `main`: `agent/<number>-<feature>`. Keep unrelated work outside the branch. If agent tooling cannot open a PR, provide a commit SHA and explain precisely what was changed; do not silently force a default-branch update.
3. Every task must define its player benefit, data/schema change, save compatibility, a way to test success and failure, and precise acceptance criteria before writing lots of content.
4. Add unit/content tests and a short reproducible manual playthrough. Build/validate generated sources (NeathBound: `npm run release:check`, where available; Undercity: `npm test` and its content compiler/checker commands). Record tests run, failures and any parts **not** tested.
5. Open a PR addressed to Agent 1. Include before/after gameplay example, changed-file list, tests, risks and affected save versions. **No unverifiable “fully implemented”, “deployed” or “playtested” claims.**
6. Agent 1 serially rebases/merges approved PRs; runs integrated checks plus a real player journey, monitors deployment, validates remote API and preserves rollback path. Never activate changes in the server before verifying save behaviour.
7. Narrative work follows the existing pitch → skeleton → prose → content/design/mechanical/continuity QA → **real human approval** process. Agents cannot self-assert Josh's sign-off. Draft packets aren't playable until runtime-integrated.

## First concurrent work wave: short, independently shippable slices

| Agent | One deliverable suitable for its first PR | Acceptance |
|---|---|---|
| 1 | A baseline smoke/playtest report across both deployed games, CI and preview/prod parity; fix blockers discovered | Evidence links, passing targeted tests, rollback notes |
| 2 | Six polished Gloomwing storylets with divergent follow-up flags and NPC callbacks, **without changing chapter gates** | Three genuinely different meaningful options each, original writing, all three endings still work |
| 3 | A NeathBound profession/job loop prototype with an earned upgrade and a 7-day pay event | Cannot claim repeat income twice; server/local save parity |
| 4 | Validator checks for missing IDs, unreachable scenes, duplicate quality/item creation and impossible chapter chains | Bad fixture fails, good existing content passes, generator drafts remain non-playable |
| 5 | Rewrite selected Undercity Tide/Mirror/Ember late scenes with distinct character-specific stakes | Saves and 32-stage chapter gates preserved; consequences observable later |
| 6 | A first-hour Undercity economy and quality audit, plus one tested tuning change or rewarding repeatable activity | No runaway currency, low-value grind, or new softlock |
| 7 | Guided first-session playtest in both games and top three UX fixes | Location/next step is obvious, consequence is visible, keyboard/mobile controls work |

**Limit work in progress:** one PR per agent at a time. No automated 100-story dump. Release smaller **fun-to-play vertical slices** continuously, and measure actual choice quality.

## Player-experience review rubric

Before marking a feature ready, score each of these 1–5 based on actual playthroughs, not text generation alone:

- **Curiosity:** Does the hook create a question worth answering?
- **Agency:** Are at least two options meaningfully distinct, with a reason to choose either?
- **Consequences:** Does the next scene, NPC, quality or world visibly remember the decision?
- **Pacing:** Can the player do something interesting within the first minutes without pointless navigation/repetition?
- **Clarity/accessibility:** Can a first-time mobile/keyboard user understand the odds, cost, stakes and next step?

Flag any category below **4/5** for revision; prioritise blocking bugs first. Capture brief player notes rather than pretending a score is objective truth. Also test losing, low-stat builds, old saves and every major ending.

## Communication contract

Each agent's PR description starts with:
```text
Agent: <number>
Game: <NeathBound|Undercity|both>
Player problem:
Files owned/changed:
User-visible improvement:
Save/schema risk:
Tests run (with results):
What remains unverified:
Requested integration from Agent 1:
```

**Escalate immediately:** save corruption, production failures, a blocked critical path, duplicate progress/rewards, security/API issues, copyrighted source text, or an ownership conflict.

### Source and originality

These games may be inspired by quality-based narrative principles but must use their **own world, prose, characters, art, items and source**. Never copy another game's proprietary story content or rely on the number of storylets as a substitute for writing quality.
