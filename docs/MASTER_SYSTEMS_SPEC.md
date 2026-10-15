# Master Systems Specification — The Undercity and NeathBound
**Version:** 1.0 · **Date:** 16 October 2026 · **Stage:** Session 1, technical design (not a claim of implementation)

This document is the **complete ten-part implementation contract** for two *different* original quality-based narrative RPGs. It adopts the numerical requirements supplied in the 15 October master brief as a **proposed target**, differentiates them from code observed on 16 October, and makes conflicts explicit. No code, lore, character, imagery, prose, or inaccessible commercial internals are to be copied from any reference game. Achieving a numerical similarity is not proof of identical unpublished mechanics. Each part is independently assignable to one agent after Agent 1 integration approval. Refer to each game's [Narrative Studio](narrative-studio/README.md) for editorial gates.

## Product-specific source-of-truth mapping
| Contract | The Undercity | NeathBound |
| --- | --- | --- |
| Four ability IDs | `observation, guile, persuasion, resolve` | `nerve, insight, poise, shadow` |
| Menace IDs | `suspicion, notoriety, wounds, delirium` | `suspicion, dread, wounds, scandal` |
| Economic unit | pennies, `coin` in older saves | obols, `obols` |
| Starting story hub | Lantern Court (`court`) | Lantern Quay (`lantern-quay`) |
| Existing major paths | Moth / Tide / Mirror / Ember (32 chapters each) | Gloomwing Hunt / Missing Name / Last Light / River Debt / Stolen Hour (30 each) |
| Rules source | `src/game/rules.js` with generated `rules.global.js` | `src/game/rules.js` plus `src/game/engine.js` |
| Cards | `index.html` runtime and `content/*.js` | `src/game/decks.js` + `src/game/content.js` |
| Serialization | browser-local `the-undercity-v1` save | `src/game/state.js` + service/database adapters |
| Authoring | `src/types/storylet.ts`, `tools/cms/`, `scripts/validate.mjs` | `src/types/storylet.ts`, `tools/cms/`, `scripts/validate.mjs` |

**Invariants:** retain canonical IDs and all valid existing saves; keep any game-specific names even if the generic brief says “four Vows”; never rename Undercity pennies to Lumens or NeathBound obols to Lumens. Authoring drafts are not live stories. Any new module in Parts I–IX must be integrated through an adapter with focused tests, not silently replace an existing engine.

## Design conflicts and unresolved decisions (do not bury these)
| ID | Supplied brief versus reality | Binding rule for the next implementation |
| --- | --- | --- |
| D-01 | “Broad chance = floor(0.6×stat/difficulty×100)” **and** “stat ≥ difficulty always 100%”. At equal levels the formula gives 60%, not 100%. | Preserve current profiles: **Undercity auto-passes**, **NeathBound does not**. An explicit project-specific decision is required before changing either. New checks must record which profile they use. |
| D-02 | The brief's four Vows are not Undercity's four epics and do not cover all five NeathBound paths. | Preserve all existing paths. The named four hypothetical Vows are an **optional proposal requiring a canon review**, never replacements or a forced removal of the fifth path. |
| D-03 | “Use no reference vocabulary” conflicts with names in the brief: *Time, the Healer*, *Notability*, *Person of Some Importance*, *Parabola*, *Fate*. | These are **design concepts only**, not publishable game terms. Use game-specific original equivalents approved in the bible; no new premium spending is authorised. |
| D-04 | The nine proposed quirks differ from the quirks already stored in both games; the brief illustrates Austere/Hedonist and Daring too. | Do not change IDs in legacy saves. Introduce aliases/display names only after a migration map and content audit. |
| D-05 | Fixed 10/20/50/80/100/200/500/1000 frequency tiers differ from current NeathBound relative weights and Undercity authored conventions. | Treat tiers as target weights, with a compatibility adapter. Record before/after sampled distributions before any migration. |
| D-06 | “Every session ends in deployment” conflicts with gated PRs, editorial sign-off, production health and safe migrations. | Every session ends in a **commit/PR and automated verification**. Production deployment requires Agent 1 review, green checks, save test and rollback; never deploy a failing branch just to satisfy a schedule. |
| D-07 | “Exact replica” cannot be independently proved and conflicts with original worlds. | Target **specified observable behaviour**, not borrowed prose, art, setting or private internals. |
| D-08 | The brief asks for first ten chapters per Vow; many complete 30/32-stage sequences already exist. | First validate/rework ten **distinct meaningful chapters per existing ambition** rather than overwriting their later chapters. |
| D-09 | Two games have distinct schema, economy and backend; a “single module” might accidentally share persistence keys. | Pure mathematical utilities can be shared **by tests**, not by importing stateful modules across repositories. Each owns its own adapters. |
| D-10 | Narrow tests / rare successes / CP awards do not define whether a narrow success can become rare or gain CP. | Use the game's currently recorded behaviour until a testable written decision specifies a change; do not silently award extra CP or rewards. |

## Part I — Quality Change Point System

**Owner:** Systems agent. **Deliverable:** `src/engine/cp.js` (or a project-native `src/game/quality-cp.js` adapter), exported functions + JSDoc + tests for levels 0–100.

**Mathematical contract (total CP to *reach* level N):**

```text
totalCP(N) = 0                                  if N <= 0
           = N(N+1)/2                           if 1 <= N <= 70
           = 2485 + 70*(N-70)                    if N > 70
level(C)   = floor((sqrt(8*C+1)-1)/2)            if 0 <= C < 2485
           = 70 + floor((C-2485)/70)             if C >= 2485
```

The level-70 threshold is **2485**, level 71 **2555**, level 100 **4585**. `cpToNextLevel(cp)` returns the positive difference between the next total and current total; when a caller is already at its configured max, the caller-facing response is **0**. The first level takes 1 CP, the seventieth costs 70 CP and every later level also costs 70 CP.

**API:** `levelToTotalCp(level:number):number`; `cpToLevel(cp:number):number`; `cpToNextLevel(cp:number,maxLevel?:number):number`; `addCp(state:{id,cp,level?},amount:number,maxLevel=Infinity):{id,cp,level}`. Validate finite integer CP inputs; reject NaN/negative amounts or explicitly clamp and document the behaviour, never allow overflow. With `maxLevel=15`, discard all CP beyond the threshold for level 15 and never stockpile overflow; allow negative CP effects only down to 0.

**State contract:** maintain *total CP* as canonical for pyramidal qualities and expose a derived integer level; the migration adapter must preserve old numeric/level-only saves and compare their effective progress. Do not migrate legacy fields by discarding existing levels. Pure functions may not mutate caller input.

**Unit proof:** exhaustive inverse round-trip at every integer level 0–100; boundary CP values 0, 1, 2484, 2485, 2554, 2555, 4585; max cap at 15 and 70; negative delta at zero; 1000-level random sample; safe finite-input handling. **Current evidence:** both rules engines already implement the pyramid; NeathBound still has compatibility effects with direct numeric level awards.

## Part II — Challenge Resolution System

**Owner:** Systems agent. **Deliverable:** `src/engine/check.js` or project-native pure adapter with deterministic seeded tests and explicit rules-profile.

**API:** `broadChance(qualityLevel,difficultyLevel,scaler=0.60,profile)`, `narrowChance(probability)`, `roll(chancePercent,rng)`, `resolveChallenge(challenge,qualityLevel,rng)`, `cpAward(chance,success)`. Percent probabilities are integer 0–100; broad calculation **floor(scaler * level / difficulty * 100)**, clamp at 10–100. A zero/nonpositive difficulty must be validated or handled as an explicitly auto-passing check. Profiles are `undercity-easy-equal` (existing `qualityLevel>=difficulty => 100%`) and `neathbound-scaled-equal` (existing equal level gives 60% with default scaler). Scalars of 0.66 and 0.68 must be supported as authored overrides.

**Sequence:** snapshot effective quality including equipped bonuses; calculate visible odds *before spending*; validate and spend action; roll ordinary check once; if success, roll independent rare-success chance **0.04 by default** when the check's native profile supports it; apply **exactly one** outcome's rewards; award 1 CP for any failure, 2 for a success below 80% odds, 1 on success at or above 80%. Clamp Narrow chance 0–100. Remember that Narrow rare eligibility requires D-10 sign-off. Return `{chance, success, rare, outcome, cpAwarded, roll?}` and emit an accessible receipt.

**Tests:** deterministic RNG boundaries at 0/0.04/0.8/1, stat 0, huge stat, invalid difficulty, scalers .60/.66/.68, broad equal-level conflict profiles, Narrow 0 and 100, rare after-success ordering, failure no rare, 79% vs 80% CP, equipment bonus integration, zero-action no mutation. Never infer that these are the undocumented commercial game's *exact* rules.

## Part III — Fourteen-Type Quality Taxonomy

**Owner:** Systems and save-schema agent. **Deliverable:** `src/engine/quality.js`, declarations and typed adapters; existing legacy types remain readable.

| # | Canonical type | Storage semantics | Gameplay examples |
|---|---|---|---|
| 1 | `primary_stat` | pyramidal CP | four per-game ability IDs |
| 2 | `menace` | pyramidal CP | four per-game menace IDs |
| 3 | `quirk` | pyramidal CP, cap 15 | opposed dispositions |
| 4 | `story` | additive | plot progress, counters |
| 5 | `item` | additive integer | physical property and equipment |
| 6 | `status` | additive | temporary/permanent conditions |
| 7 | `circumstance` | additive | living situation |
| 8 | `accomplishment` | additive/once marker | earned achievement |
| 9 | `route` | boolean/binary | discovered district road |
| 10 | `restricted_story_access` | boolean/binary | optional content gate, not an instruction to charge money |
| 11 | `living_story` | additive event metadata | delayed letters |
| 12 | `connection` | pyramidal CP | affiliation favour |
| 13 | `dream` | pyramidal CP | long-form reverie track, original terminology |
| 14 | `metaquality` | additive | meta-progress/status about qualities |

**API:** `isPyramidal(type)`, `applyEffect(player,effect,qualityDefs)`, `getQualityLevel(player,id)`, `assertDeclaredQuality(id)`, `removeQuality(player,id)`. Every registry entry declares `{id,type,maxLevel?,description,aliases?,opposites?,persistence}`. Effects support additive `set` or signed `delta`, pyramidal `cp_delta`, removal and mutually opposed quirk CP updates. Unknown types/IDs are a validation failure, not an invisible no-op in new data. Existing Undercity `disposition/affiliation/fate_marker` and NeathBound `connection/unlocked_by_fate` require explicit aliases; old saves retain original IDs.

**Tests:** all fourteen recognised, CP vs additive invariants, binary idempotence, no unknown refs, quality cleanup and zero-value removal, permanent award once, round-trip serialization and compatibility fixtures for both games.

## Part IV — Quirk Opposition and Titles

**Owner:** Systems + narrative continuity. **Deliverable:** `src/engine/quirk.js`, quirk registry, tests.

Every defined quirk has `{id, opposite: string|string[], maxLevel:15, levelTitles:[{max,title}]}`. A positive CP change of `k` reduces each opposite's **total CP** by `k`, floors at zero and does not recurse the reductions back into the original quirk. An ordinary negative delta to a quirk does **not** automatically raise its opposites. Apply and persist the entire effect atomically. Level titles are derived, never saved as separate progress. The source brief's Austere tier examples (Restrained 1–2; Temperate 3–4; Disciplined 5–9; Ascetic 10+) and Daring examples are **editorial examples**: game-local labels must be approved and existing quirk IDs preserved.

For NeathBound, inspect `QUIRK_OPPOSITES` already in `src/game/rules.js`: `austere↔hedonist`, `magnanimous↔ruthless`, `steadfast↔fickle`, `honest↔devious` and the `daring/subtle/forceful` triangle. For Undercity, use its actual `content/world.js` declarations rather than treating the proposed nine display names as persisted IDs.

**Tests:** level 0, boundary CP, max 15, at least two opposites on gain, symmetric pair activation, save migration, title changes at 2/3/4/5/9/10/15; non-quirk quality cannot trigger opposition.

## Part V — Opportunity Deck Draw Algorithm

**Owner:** Systems agent. **Deliverable:** `src/engine/deck.js` or project-native deck adapter with simulation report.

**Algorithm:** (1) determine per-game region/deck; (2) select cards in that deck; (3) reject failed requirements and cards already held; (4) apply frequency weight and number of *satisfied* independent unlocks, using multiplicity at least 1 for an unconditional card; (5) if any legal high-urgency card exists, choose it **before** the weighted pool, even at weight 0; (6) weighted RNG selection; (7) append card to hand if capacity under 6. Use frequencies `rare=10`, `unusual=20`, `very_infrequent=50`, `infrequent=80`, `standard=100`, `frequent=200`, `abundant=500`, `ubiquitous=1000` as the proposed target. Existing NeathBound tiers are relative multipliers; add a conversion table and note authored `very_rare`/ `unique` tiers before changing production weights.

**API:** `draw({setting,hand,qualities,cards,now},rng)`, `regenerateHand(state,now)`, `discardCard(state,id)`. A card draw never duplicates a held ID. Free redraw interval is four minutes. When hand reaches 6, store the pause time **without banking unlimited hidden draws**. When a card leaves a full hand, resume one normal four-minute wait, unless a specific game rule explicitly specifies a free immediate replacement. Expired timer with fewer than six cards may catch up only to a bounded 6-card hand.

**Tests:** deterministic urgent bypass, duplicate prevention, all weights, zero-weight except urgency, unlocked multiplicity, no-card pool, paused full hand, offline accrual, clock rollback, and 100k seeded draws approximating 1:3 weighted ratio within a defined tolerance. Never advertise proprietary distribution fidelity without measurement.

## Part VI — Menace Lifecycle and Recovery Hubs

**Owner:** Systems + narrative author. **Deliverable:** `src/engine/menace.js`, recovery storypack, save tests.

**Contract:** at derived menace level **8**, transition immediately and exactly once per entry to the appropriate recovery location. Arrivals cost **0 actions**, cannot be bypassed by travel, show a clear action outcome, and do not lose the previous location. A player may leave only when the triggering menace is below 8. Provide at least two **viable** recovery routes per hub plus a free explanatory first visit, with costs and penalties visible.

| Gameplay | Suspicion | Second menace | Wounds | Fourth menace |
| --- | --- | --- | --- | --- |
| Undercity | Watch House | Notoriety → Tribunal | Ward | Delirium → Pale Rooms |
| NeathBound | Holding Vaults | Scandal → Whisper Court | Stitchery | Dread → Pale Rooms |

Undercity's permanent `the_record` and NeathBound's `criminal_record` remain separate save fields, both conceptually capped at **7**, incremented once per arrest. Permanent record reduction is not offered by default. The brief's paid premium override is **not** permission to add a paid product.

**API:** `checkMenaceThreshold(player)`, `sendToPenaltyHub(player,menace)`, `canLeavePenaltyHub(player,menace)`. **Tests:** each hub at CP just before/at 8, idempotent arrival, clear last location, retry with no actions, inaccessible leave, recovery unlock, double-menace priority and permanent record boundaries.

## Part VII — Real-Time Living Stories

**Owner:** Systems + UI/QA. **Deliverable:** `src/engine/livingstory.js`, Messages UI adapter, offline and time-travel tests.

**Event shape:** `{id,trigger_quality,requirements,delay_hours:1..168,trigger_time:number,storylet_id,message,on_arrival?,fired:false}`. On first satisfied trigger persist `trigger_time=Date.now()` immediately and never restart the timer just because the page reloaded. On load, polling and return from background, if `now>=trigger_time+delay_hours*3600000`, mark fired **once** and add a single message, with its resulting storylet ID. Message delivery is idempotent across online device retries, uses an event ID, preserves ordering, and does not duplicate item grants.

The supplied prototype “Time, the Healer” at 24 hours is a reference-world term, **not** an approved game story. Create an original **daily renewal event** for each game, after human story/lore approval, with an explicit list of which qualities renew and which persistent crimes/ambitions never reset. Never reset all menaces or undo irreversible choices without approved design.

**API:** `triggerLivingStory(state,spec,now)`, `tickLivingStories(state,now)`, `pendingTime(event,now)`. **Tests:** 1h and 168h boundaries, reload, duplicate event IDs, offline catch-up, server vs client timestamps, clock rollback, persistent message receipt, accessible countdown, and no reset of permanent qualities.

## Part VIII — Four-Tier Profession Progression

**Owner:** Systems + profession narrative author. **Deliverable:** `src/engine/profession.js`, `content/professions/` **original source**, promotion/work stories and economic tests.

**Tier 1:** available early, named workplace, one earned item and weekly pay in the game's native currency. **Tier 2:** faction standing gate, an authored promotion scene, dual-stat equipment bonus target +6 each, approximately 35 *reference units per week* as a **design benchmark only**, not an unexplained penny/obol conversion. **Tier 3:** public reputation/prestige threshold and an original “unsealed invitation” analogue; a +12 specialised item and increased salary. **Tier 4:** late-game standing and quest consequences, original unique unlocks.

Each profession has an explicit advancement path, one 7-day **idempotent** salary event, **2–3 nontrivial activities** (different rewards/risks), and a distinct earned equipment item. No promotion should depend on unavailable premium content. Each workplace's income must have real sinks and no unlimited repeatable salary exploit. Offline pay catch-up should be bounded and logged to the journal. Existing Undercity Tier 1–4 definitions and NeathBound professions must be **audited and augmented**, not discarded.

**API:** `canPromote(player,target,registry)`, `promote(player,target)`, `accrueWage(player,now)`, `listProfessionActivities(player,location)`. **Tests:** gates, all 4 tier paths, item stat totals, 7-day timestamp boundary, repeat/reload idempotence, capped catch-up, failed promotion does not spend resources, distinct play choices and economy balance before public launch.

## Part IX — Mutually Exclusive Ambitions

**Owner:** Narrative author + continuity keeper + integrator. **Deliverable:** `src/engine/vow.js` or game-native ambition helpers, `content/ambitions/` storypacks, 10-stories-per-arc depth review.

A single ambition can be selected *after* onboarding at a prominent game-specific gate. It cannot be changed in the same saved life. Each chapter `n` requires `selectedAmbition===id && progress===n-1`; any valid completion advances **exactly one** to `n`, never skips. Failure routes must not deadlock progress; choices can still diverge in witness/relationship flags, risks, rare items and final solutions. Each arc has multiple acts, recurring characters, meaningful rivals, 30–40 chapters and an original **Treasure-slot** conclusion.

**Existing live Undercity epics:** Moth, River Testament, Mirror Childhood and Council Furnace, 32 chapters each. **Existing live NeathBound epics:** Gloomwing Hunt, Missing Name, Last Light, River Debt and Stolen Hour, 30 chapters each. The new four proposed Vows (Gloomwing, Locked Door, Unnamed, Broken Hand) are **not currently the authoritative five-path NeathBound canon**; the latter three must be pitched as optional original additions, not silently renamed onto existing ambition IDs. Do not replace NeathBound “Missing Name” (identity mystery) with an unrelated murder revenge plot.

**API:** `chooseAmbition(state,id)`, `availableAmbitionChapter(state,content)`, `applyAmbitionOutcome(state,outcome)`, `awardAmbitionTreasure(state,itemId)`. **Tests:** exclusivity, one-step progress, each of 30/32 chapters reachable by legal routes, ordinary/rare/failure branches, each climax earns exactly one unique Treasure, starter gate is accessible, NPC callbacks, rerun prevention, save migration and earned ending visible in the journal.

**Session-5 proof of concept:** revise/review the **first ten** existing chapters of each live arc, proving consequence callbacks into the next ten; this is more valuable than mechanically adding chapters that already exist.

## Part X — Content Authoring, Validator and Tracker

**Owner:** Agent 4 content tools, reviewed by Agent 1. **Deliverables:** `src/types/storylet.ts` contract compatibility, `scripts/validate.mjs`, `content/tracker.json`, root `MASTER_PROMPT.md`, authoring metadata and CI gate.

The authoring schema declares `Storylet`, `Branch`, `Challenge`, `Outcome`, `QualityRequirement`, `QualityEffect`, `ItemEffect`. Required story fields: unique `id`, `title`, `location`, `description`, `unlocked_with`, `locked_with`, `options`, `rarity`, `tags`, author/reviewer status, version and reveal depth. Branches need ID, non-empty title/text, a declared stat/challenge or deliberate free outcome, result title/prose, action cost, effects and `next_storylet` or explicit terminal flag. Approved narrative CMS exports and the playable runtime use **different shapes**: convert via a reviewed adapter, never blindly load user-drafted JSON.

Validator must recursively inspect every JSON source under content storylets, cards, qualities and items **where those directories exist**, along with current compiled JS source registries. Fail on unresolved next story ID, undeclared quality/item, invalid challenge stat, duplicate ID, 0 or 1 branch on a **new** multi-choice story (with documented exemptions for 0-choice autofire/arrival and old compatibility packs), empty text or result title, broken chain progress, impossible location routes, invalid secrecy depth, missing editor approval on new published material, and generated bundle drift. It exits **1** on any error and reports path+story ID+field.

The **tracker** stores `[{id,kind,description,source,status,requires,grants,reviewed_at?}]` with a sorted stable ID order and deterministic regeneration; never count draft packets as playable content. Keep the shipped `docs/CONTENT_TRACKER.md` (Undercity) and `content/catalogue/` (NeathBound) intact during migration and reconcile counts before replacing them.

**Editorial production loop:** Pitch → human sign-off → Midflight skeleton → mechanical gate → Prose → content QA → design QA → mechanical QA → continuity review against Bible/40-secret ledger/20 preceding chapters → final human approval → compile/publish PR → release checks → real browser/device proof. AI cannot mark its own output as human-approved. A ten-story batch is only allowed after at least fifty individually reviewed stories and must still pass all individual checks.

**Tests:** static type contracts, 2–5 choice paths (with exceptions), wrong IDs/stat, dangling next ID, unknown item, invalid quality, intentional failure fixtures, tracker stable ordering, CMS JSON export/import, browser branch check and original-world vocabulary scan restricted to player-facing prose.

## Sessions and release gates

| Session | Task | Required acceptance before declaring complete |
|---|---|---|
| **1** | This 10-part specification, architecture mapping, conflict decisions and schema audit | Both repositories contain this document, a game-specific Master Prompt, a machine-readable gap register; existing validators/tests green. **No claims of migrated gameplay.** |
| **2** | CP / Challenge / Quality modules | All boundary tests and save migration fixtures green; D-01 rule choice approved; bundles regenerated; no double CP award. |
| **3** | Quirk / Deck / Menace modules | Deterministic opposition and draw tests; every hub playtested, zero-action arrival; legacy saves preserved. |
| **4** | Living Story / Profession | Offline/reload simulation, 7-day income, representative career ladder and playable Messages. |
| **5** | Ambition modules + deep-review first ten chapters per live arc | Unique treasures, one-step progress, human-reviewed evidence and downstream callbacks. |
| **6** | Consolidated schema / references / tracker | All native storylets and cards validated; previous generated artifacts still match sources. |
| **7** | Data migration and old-save matrix | Live content under versioned JSON with adapters; existing exported saves round-trip and deterministic rebuilds. |
| **8+** | One ambition/profession tier/festival per production slice | Pitch and review packet, integrated test, accessibility, balanced rewards, human editor sign-off. |

**Every agent PR must provide:** proposed behaviour; source files; test/fixture proof; before/after play scenario; save/version implications; economy impacts; reviewer status; exactly what was not verified; and an explicit rollback plan. Agent 1 retains final production merge/deployment responsibility. Do not force a deployment from every agent session.

## Cross-game acceptance suite and source ownership

1. `node scripts/validate.mjs` and the native game validators must remain green; include the full runner (Undercity: `node --test tests/*.test.mjs`; NeathBound: `npm run release:check`) where appropriate.
2. New logic is isolated from legacy scripts and server mirrors until compatibility tests pass. NeathBound's browser/server code and `?v=` import tags must stay in lockstep; Undercity's rules global bundle must be regenerated from canonical module.
3. Test a new game, a partially progressed save, an old versioned save, a maximum-level character, an empty and full card hand, a penalty hub and an offline return. **No save resets.**
4. Simulate thousands of draws/rolls with a seeded RNG; assert relative distributions and invariants rather than assert undocumented commercial behaviours.
5. Real mobile browser and keyboard/screen-reader checks: choice → immediate outcome → receipts → return; no inaccessible actions under the sticky header.
6. For Cloudflare/Pages/Render/Vercel production, record **exact SHA**, active release and success/failed HTTP check. A green repository CI build does not prove online backend persistence or user-visible deployment.
7. A feature is **complete** only with a reachable, meaningful player path and grounded tests. A defined array entry, a generated template or a checked box alone is not completion.
