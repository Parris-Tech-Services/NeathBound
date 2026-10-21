# Agent 2 — next 20 narrative-production tasks

**Prepared:** 15 October 2026 · **Role:** NeathBound Writer, ambitions, Making Your Name, characters and world continuity · **State:** work plan, not a claim of 20 completed tasks.

**Coordinator:** Agent 1. Read [SEVEN_AGENT_PRODUCTION.md](../SEVEN_AGENT_PRODUCTION.md), [AGENTS.md](../../AGENTS.md) and the [Narrative Studio bible](../narrative-studio/bible.md), [style](../narrative-studio/style.md) and [secrets](../narrative-studio/secrets.md). **Ownership:** NeathBound `content/ambitions/**`, narrative drafts and narrative-focused tests. Agent 4 owns storylet generator/schemas, Agent 5 owns Undercity fiction, Agent 1 owns shared engine wiring and merges.

**Protocol:** use `agent/2-<feature>` branch; one PR in flight; no direct `main` writes or deployments; all new prose remains proposed until a real human signs off and Agent 1 integrates it. Preserve original lore, existing 30 Gloomwing gates, 24-hour letter trigger, three branch-conditioned treasures and saved choices. Do not write engine maths, UI or bulk template episodes.

## Ordered next 20 tasks

| # | Task | Player benefit / work | Owner files | Acceptance including success/failure + save safety |
|---|---|---|---|---|
| 01 | **Audit shipped Gloomwing sequence** | Confirm all 30 progress gates, stage IDs, site routes, failure retries, timed letter and ending treasure contracts. | `content/ambitions/gloomwing.v1.json; tests/gloomwing.test.mjs` | Run success and forced-failure paths for all three endings; baseline issues recorded; no save changes. |
| 02 | **Humanise first Gloomwing encounter (7/30)** | Rewrite the creature's first real appearance; give investigator, defender and speaker distinct reactions and concerns. | `gloomwing_hunt_06` | Three distinct outcomes with different NPC responses; failure remains retryable and does not advance. |
| 03 | **Make the Gloomwing's bargain credible (9/30)** | Write three conflicting but defensible replies to the guardian; clarify the stakes of the lock without prematurely resolving its truth. | `gloomwing_hunt_08` | Choice-specific consequences and grounded voice; rare branch remains distinct; one progress point exactly. |
| 04 | **Pay off the 24-hour letter (17/30)** | Let the letter's witness recognise the earlier promise; distinguish reading, protecting and bargaining with the testimony. | `gloomwing_hunt_16` | Chapter remains locked before living-story-fired:moth-king-letter, opens after the 24-hour event, fails safely. |
| 05 | **Turn final moral decision into three costly commitments (26/30)** | Show what protecting, killing or negotiating actually means to the Gloomwing, its young and Bureau staff. | `gloomwing_hunt_25` | Preserve gloomwing-saved-final/killed-final/truce-final; rewards or world flags visibly mark the one choice; failure retryable. |
| 06 | **Make the Spire's collapse remember the hunter (27/30)** | Give rescuers, archivists and Bureau witnesses distinct, practical reactions; foreshadow consequences to records and evacuations. | `gloomwing_hunt_26` | Rescue/record/witness responses diverge; three original success/failure outcomes; no new story gate. |
| 07 | **Write three genuinely different endings (30/30)** | Rewrite the scale, claw and treaty turn-ins with distinct civic records, NPC cost and aftermath. | `gloomwing_hunt_29` | Each existing gate awards exactly its matching treasure; no reward to wrong outcome; cannot repeat. |
| 08 | **Verify observable cross-chapter callbacks** | Catalogue existing choice flags, especially chapter 26→30; choose future conditional variants only where the existing runtime can display them. | `content/ambitions/** narrative proposals; tests/gloomwing.test.mjs` | Every claimed callback actually uses a saved flag or is explicitly labelled prose-only; no pretend dynamic templating. |
| 09 | **Improve Gloomwing failed checks** | Replace repeated generic failure copy in other major scenes with meaningful, specific setbacks and directions for another attempt. | `future focused Gloomwing source PRs` | Each failure shows a cost, named risk and repeatable path, with progress unchanged on failure. |
| 10 | **Playtest three outcome histories and legacy saves** | Review old saves before stages 7/9/17/26/27/30 and near end; demonstrate no lost branching choice. | `tests/ or documented playtest records` | Reproducible success, failure and old-save paths for each trophy; document any unverified live-backend path. |
| 11 | **Build an NPC motivation/voice sheet** | Document Old Marrow, the Pale Archivist, Bureau clerk/director, Paper Court envoy and Gloomwing desires and distinguishing dialogue. | `content/ambitions/narrative-drafts/; studio handoff` | Three consistent speech examples each and clear limits on secret knowledge; human editor review. |
| 12 | **Map the scene-to-scene witness network** | Link earlier contacts and their callbacks across the 30 Gloomwing stages; identify empty promises or contradictory testimony. | `content/ambitions/narrative-drafts/` | Every suggested remembered fact cites a stage flag and first moment of discovery, or is marked prospective. |
| 13 | **Control Gloomwing lore-reveal depth** | Audit every major claim about the Spire/lock/Bureau against the public game bible and proposed secrets ledger. | `narrative drafts and continuity report` | No unapproved 'ultimate truth' becomes unconditional canon; later chapters retain ambiguity where intended. |
| 14 | **Protect branch economy and permanent rewards** | Account for scales, keys, letters, evidence and three treasures across success/rare/failure; propose changes without modifying the maths. | `content/ambitions/**, independent content QA` | No duplicate awards, no unknown item IDs, no missing source/sink; no change to base formula. |
| 15 | **Commission human editorial review of six revised scenes** | Run pitch→skeleton→prose→content/design/mechanical/continuity QA; present evidence without self-certifying acceptance. | `content/narrative-studio/submissions/** (existing process)` | All review reports documented, genuine human sign-off still pending until explicitly given, no production publish before approval. |
| 16 | **Audit other ambitions against CURRENT main** | Count unique authored vs template-derived chapters in Missing Name, Last Light, River Debt and Stolen Hour; distinguish progress length from writing depth. | `docs/agent-2/; content/ambitions/drafts` | Report actual source counts and player-experience gaps; do not add 25 placeholder chapters just to reach 30. |
| 17 | **Develop River Debt as a three-act epic** | Write a detailed outline with ferrymen, water rights, affected families, competing institutions, the contract's ethical price and three possible endings. | `content/ambitions/river-debt-outline.md (draft only)` | 30-stage outline if appropriate, each chapter has new event, actual NPC goal, gate, earned consequence; approved before prose. |
| 18 | **Rework River Debt opening five stages** | Give the first debt its claimant, a credible bargain and an explicit next destination, distinct from Gloomwing's chase. | `content/ambitions/river-debt-v1.json (future data pack)` | 5 scenes with >2 meaningful options; actual success/failure routes; regression tests; no forced early verdict. |
| 19 | **Author River Debt middle with consequences** | Write non-template navigation, witness interviews, changing water level, conflicting receipts and a clear consequence ledger. | `content/ambitions/river-debt-v1.json (future, next PR)` | Stages 6–20 individually justified, prior outcomes referenced with working flags, no mandatory unearned items. |
| 20 | **Complete River Debt finale and handoff** | Write stages 21–30 with meaningful choices on who owns the debt, an epilogue and different permanent costs/recognitions. | `content/ambitions/river-debt-v1.json (later PR)` | All endings reachable and different; old saves unaffected; reviewable PR, explicit human approval and Agent 1 integration. |

## Production waves and dependencies

**First Agent 2 PR:** Tasks 01–07, with focused Gloomwing prose for six chapters (7, 9, 17, 26, 27 and 30), source-driven narrative tests and a clearly identified existing callback from chapter 26/30. Task 08 is a documented audit here, not a claim that the current engine has state-templated prose. Tasks 09–15 follow only after Agent 1's review of the first PR and real editorial sign-off. Tasks 16–20 are separate serial PRs on refreshed `main`, with a **River Debt** outline reviewed before long-form writing.

**Test fixture:** begin Gloomwing at 0; on a successful roll reach chapters 6, 8, 16, 25, 26, 29; simulate 25 hours after stage 15; branch 25 into saved / killed / treaty; verify all three corresponding stage 29 reward gates. On failed rolls, assert the stage doesn't advance and the encounter remains available (except deliberately free finale). Re-run with an old save containing only existing `gloomwing-choice-*` and `gloomwing-*-final` flags. Preserve source IDs and existing item names. Never declare a backend test run solely from reading source.

**Tone / continuity rubric:** Original second-person present-tense prose, named people with concrete motives, wet iron/chalk/lamp/ledger details rather than generic portent, distinct voice per NPC, no unearned prophecy or premature secrets, success can cost the player something, failures never masquerade as success. Require **4/5 or more** in curiosity, agency, consequences, pacing, and clarity, with actual review notes. These are evaluation criteria, not pre-awarded scores.

**Save risk:** Prose-only revisions have low schema risk; altering gate IDs, requirements, existing flag values, reward item IDs, living-story delay and final branch IDs would be **high risk**, so this first PR freezes them. Story quality may still need revision after actual player tests.

## First PR handoff checklist

- [ ] Original draft in `content/ambitions/gloomwing.v1.json` (six scenes only)
- [ ] All 30 `gloomwing_hunt_XX` chapters and exact progress values intact
- [ ] Branches `investigate`, `endure`, `negotiate` preserved
- [ ] Old flags including `gloomwing-saved-final`, `gloomwing-killed-final`, `gloomwing-truce-final` preserved
- [ ] Letter 24h and `living-story-fired:moth-king-letter` untouched
- [ ] Distinct first-person NPC intentions, but narrator remains second-person
- [ ] Source/text assertions and available production checks recorded honestly
- [ ] Human editorial **sign-off requested, not assumed**
- [ ] Agent 1 approves integration and any deployment; no other agent merges directly

## Undercity coordination

This same list may appear as an informational **Agent 2 cross-repository reference** in [the Undercity repository](https://github.com/joshualparris/theUndercity). It is **not** an assignment to change Undercity narrative or its generator. Agent 5 is its author; Agent 4 owns the shared generation/QA toolchain. No cross-repo deployment or shared save changes are authorised by this roadmap.
