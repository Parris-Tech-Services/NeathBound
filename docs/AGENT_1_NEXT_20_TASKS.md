# Agent 1 — next 20 QA, integration and release tasks

**Status:** planned; every checkbox intentionally unchecked. **Prepared:** 15 October 2026.  
**Role:** Agent 1, release coordinator for [NeathBound](https://github.com/Parris-Tech-Services/NeathBound) and [The Undercity](https://github.com/joshualparris/theUndercity).  
**Parent task:** [NeathBound issue #40](https://github.com/Parris-Tech-Services/NeathBound/issues/40).  
**Coordination:** [Seven-agent production plan](SEVEN_AGENT_PRODUCTION.md). Both repositories hold the same task register so agents can cross-reference it.

> This is a prioritised **plan, not an implementation or completed smoke test**. Re-inspect the current `main` SHA and deployment before acting; other agents may be changing the games. Avoid touching their narrative, CMS, economy or UI ownership without an agreed interface. Work exclusively on `agent/1-<task>` branches; open **one Agent 1 implementation PR at a time**. Only Agent 1 promotes reviewed code to production. Any listed outcome must be supported by a real test or marked unverified.

## Work queue: next 20 tasks, in recommended execution order

### 01. [ ] Freeze a verifiable release baseline — A1-01 · BOTH

**Player value:** Prevent stale or conflicting agent work from being mistaken for a deployed change.

**Work:** Record latest main SHA, active branch, deployed build/version/URL, open PRs, current workflows, and known blockers for each game; compare client code to production artifacts without touching player data.

**Definition of done:** A dated matrix contains immutable SHA/URL/Worker-or-Vercel deployment IDs, captured command/API evidence, reproducible observations, and explicit unknowns.

**Evidence/tests:** Read-only repository + deployment inspection; no mutation.

**Safety/ownership:** None to saves; do not expose tokens, anonymous player IDs, or private data.

### 02. [ ] Prove the live entrypoints load real game assets — A1-02 · BOTH

**Player value:** A successful GitHub commit is not proof the public game updated.

**Work:** Check NeathBound GitHub Pages (normal + ?api=local), its Cloudflare health endpoint if available, and The Undercity on Vercel. Verify HTML, referenced JS/CSS, HTTP errors, boot messages and deployment identity.

**Definition of done:** Screenshots/HTTP status/console failures + live build reference for both; each internal asset exists; failures classified by origin and reproduced before changing code.

**Evidence/tests:** Headless browser network/console and HTTP health checks from a clean profile.

**Safety/ownership:** Read-only, no destructive actions or log leakage.

### 03. [ ] Establish red/green CI baseline — A1-03 · BOTH

**Player value:** Seven agents need trustworthy merge signals.

**Work:** Run documented Node unit, content validation, generator parity, smoke and browser tests at a recorded SHA. Distinguish failing tests from environment/tooling gaps and document setup prerequisites.

**Definition of done:** A per-command table records attempted, passed, failed, skipped, exact error, SHA, and artifact link. Never label unexecuted checks passing.

**Evidence/tests:** NeathBound npm run release:check + npm run test:e2e where supported; Undercity npm test + documented build-content/validation/tracker checks.

**Safety/ownership:** Test against nonproduction fixtures and isolated test saves.

### 04. [ ] Make pull-request release gates dependable — A1-04 · BOTH

**Player value:** No broken branch should silently deploy.

**Work:** Inspect CI triggers, Node versions, branch protections available, generated bundle consistency and deployment status checks. Add or fix only owned workflow/test wiring; coordinate generator changes with Agent 4.

**Definition of done:** Deliberately broken content/test fixture fails the PR check, a clean control passes, and deployment does not imply successful e2e when it is unverified.

**Evidence/tests:** Workflow dry-run/PR checks with green and failing control cases; exact Actions links.

**Safety/ownership:** Workflow changes restricted to feature branch; avoid blocking all legitimate PRs with flaky tests.

### 05. [ ] Play through the fresh first-session path — A1-05 · NEATHBOUND

**Player value:** Players must know what to do within the first minute.

**Work:** From a clean local playtest profile, leave The Lair, reach Lantern Quay, inspect current lead, choose an ambition, make the first successful and first failed choices, then reload.

**Definition of done:** No silent errors, inaccessible next scene, misleading route or lost state; capture each click, expected/actual and time to first meaningful decision.

**Evidence/tests:** Browser Chromium + manual mobile reproduction; seed state remains isolated.

**Safety/ownership:** Avoid an existing online character; use private/incognito local mode.

### 06. [ ] Play through the fresh Bell-Cage onboarding — A1-06 · UNDERCITY

**Player value:** Four origins and escape approaches must form understandable first experiences.

**Work:** With fresh sandbox saves, choose each origin/escape route, verify faction intro, first district, map links, leads and Paths & Callings; test at least one deliberately failed check.

**Definition of done:** All four escape routes can continue without softlock; the next objective and outcome of a failure are visible; log origin/route matrix and screenshots.

**Evidence/tests:** Browser route matrix; reload mid-introduction and repeat one alternate origin.

**Safety/ownership:** Test profiles only; do not modify production saves.

### 07. [ ] Verify challenge failure, rare success and retry contracts — A1-07 · NEATHBOUND

**Player value:** A story must not disappear forever after a failed check.

**Work:** Write or run deterministic cases for skill odds, 1/2 CP gain, rare outcome effects and once-only story consumption. Check menace and limited-action costs remain consistent after failure.

**Definition of done:** A failed repeatable chapter remains playable; rare rewards cannot duplicate; old completed chapters stay completed; no challenge applies success reward twice.

**Evidence/tests:** Seeded unit + browser retry; compare local and Cloudflare API for a test account.

**Safety/ownership:** Save effects are high-risk: add regression fixtures before any fix.

### 08. [ ] Verify challenge calculations and permanent branch effects — A1-08 · UNDERCITY

**Player value:** Incorrect odds and branch gating make later narrative choices hollow.

**Work:** Exercise Broad/Narrow checks, rare outcomes, CP pyramid, character-gated choices, once-only rewards, and failure recovery. Compare displayed odds to applied engine outcomes.

**Definition of done:** Seeded expected-results table matches UI effects; failures and rerolls cannot collect unique reward twice; legacy rules bundle is exactly generated from canonical source.

**Evidence/tests:** Rules tests + at least three branch cases in live preview.

**Safety/ownership:** Coordinate any engine change with Agent 6; Agent 1 owns integration not broad rebalance.

### 09. [ ] Walk all 30 Gloomwing chapters and three endings — A1-09 · NEATHBOUND

**Player value:** A completed count of 30 storylets does not establish a completable campaign.

**Work:** Run chapter-by-chapter with deterministic fixtures for all ending flags, treasure equip and action regeneration; test stage-16 letter wait and a lower-stat failure path. Include legacy local-save opening.

**Definition of done:** Stages 0–29 reachable exactly once when successful; waits persist; guardian/claw/treaty treasure is unique; no wrong finale appears; actual browser-path evidence attached.

**Evidence/tests:** Automated fast-forward tests plus one manual browser pass; no 24-hour real wait needed if clock injection is safe.

**Safety/ownership:** No forced rewrite of existing saves; coordinate writing issues with Agent 2.

### 10. [ ] Regression-test all four 32-stage ambitions — A1-10 · UNDERCITY

**Player value:** Later-stage narrative branches must not strand players or bypass prior choices.

**Work:** Exercise Moth, Tide, Mirror and Ember start-to-end chains with seeded fixtures; cross-check next_storylet, location gates, finale item/state, failure retries and NPC-dependent endings.

**Definition of done:** Every chapter has a reachable completion path and at least one failure path; the documented four finales persist through reload; find-and-file shallow or contradictory branches for Agent 5.

**Evidence/tests:** Critical-path automated traversal + browser sampling of each finale.

**Safety/ownership:** Only Agent 5 edits narrative source; Agent 1 adds integration regression coverage.

### 11. [ ] Verify online anonymous-account and Cloudflare/D1 save round-trip — A1-11 · NEATHBOUND

**Player value:** Online mode must not silently lose or cross-contaminate player choices.

**Work:** Use a newly generated test identity to create/read/save/reload, execute a choice, reject duplicate/stale revision, test malformed input and inspect D1 persistence/response boundaries.

**Definition of done:** Identity isolated, server-authoritative state survives reload, conflict yields controlled error, unauthorized calls cannot mutate another player, and no identifier/secrets are logged to the report.

**Evidence/tests:** Safe API smoke suite using dedicated test account; compare before/after and rollback plan.

**Safety/ownership:** High: live backend writes ONLY to clearly identified test character, never real user saves.

### 12. [ ] Test local mode, backend fallback and divergent saves — A1-12 · NEATHBOUND

**Player value:** Automatic fallback can look like data loss or a reset.

**Work:** Verify ?api=local, normal Cloudflare mode and simulated unreachable API paths. Switch modes with intentionally different sandbox saves, refresh, clear one isolated profile and verify messaging.

**Definition of done:** No overwrite or false sync claim; provenance of each save is visible or accurately communicated; fallback never erases a previously populated state.

**Evidence/tests:** Offline/network interception browser suite and reset/reload matrix.

**Safety/ownership:** Never clear real browser storage; use isolated profiles.

### 13. [ ] Verify export/import fidelity and invalid-save handling — A1-13 · UNDERCITY

**Player value:** The Undercity uses browser-local saves and export is its recovery path.

**Work:** Export known test progression, move JSON to fresh profile, import, re-export and compare key game state. Test tampered/old/incomplete JSON, wrong types and invalid file without data loss.

**Definition of done:** Equivalent story, inventory, flags, positions and timers survive export/import; rejected input leaves original save untouched; provide fixture and JSON diff without personally identifying values.

**Evidence/tests:** Automated file fixture + manual Settings export/import in browser.

**Safety/ownership:** Avoid real user saves and personal filenames in logs.

### 14. [ ] Protect old-save migrations with golden fixtures — A1-14 · BOTH

**Player value:** Schema changes and new content must not reset returning players.

**Work:** Inventory actual supported save versions in each game, create anonymized legacy fixtures representing low-progress, mid-ambition, menace hub and equipment edge cases, then replay migrations.

**Definition of done:** Every supported fixture loads idempotently; quality CP/items/flags remain internally valid; no repeated rewards; unsupported saves report a recoverable error.

**Evidence/tests:** Migration unit tests + one browser import/reload sample per game.

**Safety/ownership:** No edits to live character data; coordinate schema changes with Agents 3 and 6.

### 15. [ ] Test timers, action regeneration and delayed messages — A1-15 · BOTH

**Player value:** Time-dependent bugs often appear only after closing the browser.

**Work:** Simulate zero/negative/past/future timestamps, closing/reopening, clock changes, waiting for letters, action/card refills, and edge-of-hand capacity; check correct cap and monotonic payout rules.

**Definition of done:** No duplicate letters, early awards, infinite refill or lost messages; NeathBound local/cloud parity checked; Undercity import preserves timers.

**Evidence/tests:** Injectable clock unit suite plus browser reload with deterministic test clock.

**Safety/ownership:** No production clock edits; do not introduce monetization or timers without review.

### 16. [ ] Check equipment, economy, and menace recovery loops — A1-16 · BOTH

**Player value:** Rewarding progress requires an economy that neither traps nor inflates.

**Work:** Test equipping unique endgame and standard gear, duplicate-item grants, buy/sell, stats on sold gear, profession payouts in the test harness, and four menace recovery hubs.

**Definition of done:** No negative inventory/currency, infinite payout, stale equipment bonus or locked travel after valid recovery; issues for Agents 3/6 if balance/design work is needed.

**Evidence/tests:** Seeded state invariants, transaction tests and one end-to-end recovery detour per title.

**Safety/ownership:** Report tuning suggestions separately; Agent 1 should not silently rebalance the games.

### 17. [ ] Perform real mobile, keyboard and accessibility acceptance tests — A1-17 · BOTH

**Player value:** These are text-heavy games; readability is essential.

**Work:** Check Android-sized touch targets, viewport overflow, contrast, readable font resizing, focus order, reduced motion, keyboard-only dialogs/map, ARIA announcements and screen-reader semantics.

**Definition of done:** Record devices or emulation used, axe-core results and manual findings. Stop-release issues have reproduction and screenshot; Agent 7 receives UI fixes via separate PR.

**Evidence/tests:** Playwright viewport matrix + axe-core + hands-on keyboard/screen-reader checks if available.

**Safety/ownership:** Agent 7 owns UI; automated scans do not count as manual screen-reader testing.

### 18. [ ] Keep content pipeline and live code in sync — A1-18 · BOTH

**Player value:** Editable drafts and generated content can diverge from what players actually receive.

**Work:** Check referenced story/item/quality IDs, unreachable location chains, invalid next IDs, generator parity, CSV/catalogue drift, approval metadata and versioned imports. Confirm editorial drafts are not accidentally bundled.

**Definition of done:** Invalid fixture reliably fails; approved current content passes; exact compiler output matches checked-in served modules; no false human approval claims.

**Evidence/tests:** Release content checks, negative fixtures, rendered story-ID lookup; coordinate validator work with Agent 4.

**Safety/ownership:** No changes to narrative canon or human approval markers by Agent 1.

### 19. [ ] Integrate one reviewed agent PR at a time — A1-19 · BOTH

**Player value:** Parallel agents can overwrite a shared module without noticing.

**Work:** Apply branch ownership checks, inspect each PR's diff, compare with current main, run affected tests plus cross-game invariants when a shared tool changes; resolve conflicts with source owner rather than discarding commits.

**Definition of done:** A PR checklist shows player benefit, build SHA, tests (passed/failed/not run), save risks, originality/human sign-off where applicable and a reproducible acceptance journey; only then merge.

**Evidence/tests:** PR CI + targeted old-save/gameplay smoke, with evidence before/after merge.

**Safety/ownership:** No direct main push from other agents; rollbackable merge and one PR in flight per Agent 1 workflow.

### 20. [ ] Promote, smoke-test, monitor and document rollback — A1-20 · BOTH

**Player value:** Merged code is not a successful release until public clients and backend agree.

**Work:** Create preview baseline, confirm production deploy matches reviewed SHA, check both live sites and NeathBound Cloudflare version/D1 binding, run short post-release smoke and monitor error evidence. Preserve last known-good rollback identifiers.

**Definition of done:** Release notes contain old/new SHA, deploy URL/ID, exact test pass/fail status, any player-save migration, postdeploy screenshots and tested rollback procedure (dry-run unless necessary).

**Evidence/tests:** Postdeploy GET/asset/API health plus first-action/reload and one failure path per game.

**Safety/ownership:** Only Agent 1 approves production deployment; never roll back or mutate live saves merely to demonstrate a procedure.

## Release handoff template (mandatory on each task PR)

```text
Task ID / game:
Starting main SHA and preview build:
Player impact and exact changed files:
Environment / isolated test save used:
Steps to reproduce before and verify after:
Tests PASSED:
Tests FAILED:
Tests NOT RUN and why:
Save / schema / data-loss risk:
Pre-release and post-release URLs / version IDs:
Rollback SHA / deployment ID and method:
Agent-owner review and narrative approval (if relevant):
Open issues / unknowns:
```

## Prioritisation and boundaries

- **Stop the line** for corrupt saves, critical-path softlocks, wrong-player data, public API exposure or failed production loading. Fix and verify these before cosmetic work.
- **No artificial progress:** opening a task, writing a fixture or deploying does not mean the user journey passed. Capture both success and failure paths.
- **No fictional sign-off:** Narrative Studio human approval is a separate process owned by the user/editor and not automatic AI output. Follow the game-specific `AGENTS.md` and source-of-truth lore.
- **Do not turn this into 20 parallel PRs.** Complete tasks in dependency order, batching compatible tests into a single narrow, reviewable PR when justified; keep one Agent 1 implementation PR under review at a time.
- **Suggested reporting rhythm:** after each merged, deployed slice, update issue #40 with the verified SHA, deployment and test evidence, mark only proven tasks complete, and post remaining high-risk failures as separate issues for their code owner.

## Current known working architecture to verify, not assume

- NeathBound: static GitHub Pages client, Cloudflare Worker/D1 online mode plus isolated `?api=local`; a starting 10-action regeneration pool; Gloomwing and other original ambitions. Some documentation or legacy mirrors may be stale.
- The Undercity: Vercel static browser game, local saved state and Settings export/import; original four 32-chapter ambitions and authored content registry. Generated bundles and narrative drafts are distinct from runtime content.

**The checkpoint for each claim is observed code, recorded test output and live deployment, not a prior assistant assertion.**
