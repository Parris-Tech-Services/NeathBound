# Agent 3: next 20 NeathBound systems tasks

Owner: **Agent 3 (NeathBound systems)**. Coordinator/integrator: **Agent 1**.
Scope: new isolated profession/economy modules and deterministic tests. This is a backlog and integration proposal, **not a claim that any task is live**. No direct main pushes, release, narrative prose, global UI or CMS edits. Keep one PR in flight.

The existing Guild Hall in `src/game/content.js` contains `claim-stipend` and `adopt-ink-smuggler`. Its seven-day `last-stipend-claim` flag and `trade-tier` quality must be reconciled before integration; do not deploy two separate wage paths.

| # | Task | Player benefit / concrete acceptance | Integration boundary |
|---|---|---|---|
| 01 | Audit three current trades and Guild Hall stipend | Identify income, unlocks and double-claim paths | Agent 3 research |
| 02 | Specify profession progression with distinct qualifications | Each role has a visible eligibility condition | Agent 3 module |
| 03 | Create standalone profession catalogue | Deterministic trade IDs, wage rates and tiers | Agent 3 module |
| 04 | Define backward-compatible `professionCareer` state | Legacy version-3 saves retain qualities, rank and timestamps | Agent 3 module; Agent 1 approves |
| 05 | Add earned appointment | No salary advance; one career, standing required | Agent 3 module |
| 06 | Add one-action daily paid shifts | Earn Obols, daily cooldown prevents grinding | Agent 3 module |
| 07 | Add a three-shift promotion | Guild tier 2 unlocks with a tangible one-time item reward | Agent 3 module |
| 08 | Increase qualified weekly income | Rank matters; player can see difference | Agent 3 module |
| 09 | Add a rolling seven-day pay claim | First claim after seven days; never twice within a week | Agent 3 module |
| 10 | Cover malicious/repeated/stale claims with tests | Clock rollback, repeat claim, no actions and stale revisions fail | Agent 3 tests |
| 11 | Bridge legacy Guild Hall timestamps | Existing `last-stipend-claim` prevents new-path duplicates | Agent 3 module; Agent 1 live migration |
| 12 | Retire/delegate old Guild Hall choices | Only one wage authority remains in live game | **Agent 1**, shared engine/content |
| 13 | Make D1 payment atomic | Concurrent identical revisions cannot create a second wage | **Agent 1**, Cloudflare backend |
| 14 | Show guild rank, requirements and next payday | Mobile and keyboard users know when/why an option is available | **Agent 7**, UI |
| 15 | Provide original profession-specific narrative callbacks | Stories remember which trade was chosen | **Agent 2**, prose approval |
| 16 | Add role-specific gameplay perks | Trades differ mechanically beyond their income | Agent 3 proposal, Agent 1 engine integration |
| 17 | Analyse fourteen-day income balance | Reward is satisfying without dominating quest rewards | Agent 3 simulation |
| 18 | Test prisons, zero actions, offline time and new saves | No bypass of menace/action rules or progression lock | Agent 3 tests; Agent 1 journey |
| 19 | Verify local/Cloudflare parity and exports | Same guild state after reload on both supported save paths | **Agent 1**, release QA |
| 20 | Publish reviewed handoff and release/rollback evidence | CI green, manual playthrough documented, risks transparent | Agent 3 PR; Agent 1 merge |

## Agent 3 first PR: isolated vertical slice

Proposed API (`src/game/professions.js`): `CAREERS`, `careerView(state,now)`, `joinCareer(state,id,now,options)`, `workShift(state,now,options)`, `promoteCareer(state,now,options)`, `claimWages(state,now,options)`. All take injected Unix-millisecond time, return a cloned state on success and do not mutate caller state on rejection.

Gameplay: earn standing → join a role → take up to one one-action shift per 24 hours → qualify after three shifts → get Radiant Crystals and increased seven-day wages. Wages pay Obols plus Glimmering Shards, using existing item IDs. Messages and journal entries contain explicit rewards.

Compatibility: optional new `professionCareer` field, existing revision and `last-stipend-claim` mirrored. No new save version. Existing rank and stipend values must migrate without an immediate windfall. `expectedRevision` checking in the pure module is **not** a replacement for an atomic D1 compare-and-swap.

Acceptance: `node --test tests/professions.test.mjs`, `npm run release:check`; manual scenario at T, T+24h, T+48h, T+7d and a repeated T+7d attempt. Verify all denied operations are side-effect-free. Do not claim server/local parity until Agent 1 has wired it in.

**What is not yet verified:** live storylet hooks, in-browser availability, D1 concurrency, production saves, UX quality or deployment. Agent 1 must review shared engine/content/state integration, migrate/reconcile the old Guild Hall path, and perform the final production test.

Both repositories carry this coordination note for the seven-agent team, but **Agent 3 does not implement Undercity mechanics**; Agent 6 owns those.
