# Applying the Fallen London engineering research — 15 October 2026

**Independent research source:** [FailbetterGames / fallen-london](https://github.com/joshualparris/FailbetterGames/tree/main/fallen-london). The reference repository is private. This project remains an original setting, codebase and set of stories.

## Tested design principles now applied
| Research principle | Implementation changed or verified | Notes |
|---|---|---|
| Persistent quality-based storylets | Existing `src/game/rules.js`, `engine.js`, narrative content | Preserved two-chapter story and distinct character qualities |
| Narrative clarity over obscure navigation | Existing `getQuestGuide`, `CITY_ROUTES`, mobile map and route return tests | Objectives reference specific storylets and districts |
| Card hands should not contain accidental duplicates | `eligibleCards` now excludes cards already held | Affects local and mirrored Supabase engine; existing saved hands preserved |
| Server must not trust client claims about loadout | `equipItem` checks slot, item compatibility and inventory before applying | Still needs production API concurrency assessment |
| Save conflicts should use one authoritative revision | Draw, equipment and discard increment `revision` and `flags.__revision` together | Other systems require continuing revision audit |
| Probabilistic checks should handle roll types safely | Momentum conversion requires a finite die total | Broad/narrow checks cannot treat `null` as zero |
| Player option fidelity | Local and Supabase services now forward `useLesson` into `resolveChoice` | Existing lesson choice preserved |
| Saved-game returnability | Local travel messages use proper location names, and give errors on undiscovered destinations | Full independent player testing remains necessary |
| Reliable browser entry | `src/services/index.js` now imports an implemented Cloudflare service; explicit `?api=local` remains | Cloudflare Worker code and production infra are managed separately |
| Protect original creative work | Writing/art and mechanics remain original | No protected Fallen London code or story copy |

## Verified engineering tests
See `tests/engine-integrity-2026.test.mjs`, `tests/decks.test.mjs` and existing UI, backend, route and playthrough suites. GitHub's `NeathBound CI` and `Browser tests` workflows passed at commit `3414179026c1759e82cd8fcc4ced520ca6a989c0`. Later documentation or backend changes need fresh checks; a successful static test does **not** independently prove the hosted backend is available.

## Design differences deliberately retained
- **Unlimited actions**, no timers and no forced monetisation; this is not a defect to "fix".
- Original qualities Nerve, Insight, Poise and Shadow, rather than duplicating another game's four attributes.
- Different story cosmology and characters, not the Bazaar/Masters universe.
- Local offline play is intentionally available when hosting services stop working.

## Remaining areas to verify
Cross-account session protection, D1 transaction atomicity/replay IDs, all error transitions in the online handler, item-slot limits, save migration edge cases, content-scale reachability, accessibility under TalkBack/VoiceOver, first-session comprehension, and varied choices visibly acknowledged by later storylets.
