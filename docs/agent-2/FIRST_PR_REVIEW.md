# Agent 2 — first Gloomwing writing PR review packet

**Status:** Proposed narrative rewrite. **Not approved, merged, built into gameplay, or deployed.** 15 October 2026.

## Scene selection and player benefit

| Chapter (zero-based file stage) | Before | Proposed after |
|---|---|---|
| 7/30 (`06`) | Three choices share the same silver-wound revelation with generic tails | Investigation gets a Bureau proof-mark, endurance earns an uneasy audience, negotiation tests an old title; Old Marrow is explicitly recalled |
| 9/30 (`08`) | All success routes paraphrase the same bargain | Evidence, non-aggression and institutional accountability give distinct hooks; rare success finds physical secondary proof |
| 17/30 (`16`) | Letter identifies the founder but rarely changes the scene's human stakes | Messenger and clerk each have concrete safety interests; three choices handle proof, forged copy and protected witness |
| 26/30 (`25`) | Moral verdict produces generic success text | Guardian survives with documented shelter, is killed with responsibility acknowledged, or signs a risky covenant |
| 27/30 (`26`) | Records and evacuation produce one shared result | The Archivist, Old Marrow and a young Bureau messenger react differently to evidence, evacuation or rescue |
| 30/30 (`29`) | All trophies receive interchangeable completion prose | Sanctuary, execution and covenant enter distinct civic records, conditional on the established stage-25 flag |

## Mechanics and save audit

Compared the current Agent 2 branch against `main` by parsing both canonical JSON storypacks.

- **30 stories remain** with unchanged keys, chapter numbers and progress gates.
- Exactly **six storylets** changed; changed fields are only `text`, `choices[*].success`, `choices[*].failure`, and `gloomwing_hunt_08`'s existing rare outcome prose field `rare_success`.
- All challenges, success/failure/rare effects, items, route locations, action costs, requirement gates, branch IDs and flags are **unchanged**.
- Chapter 16 continues to require `living-story-fired:moth-king-letter`, and the preceding chapter's event remains **24 hours** for every successful branch.
- Stage 25 still records **saved / killed / truce** flags. Stage 29 checks those **exact flags** and gives the corresponding **scale / claw / treaty**. This is the verified state-dependent payoff, not invented dynamic prose interpolation.
- The new writing refers back to known NPCs (Old Marrow, Archivist, Bureau clerks) but **the prose is not dynamically templated by every earlier choice**. Future true branch-dependent callbacks require approved content variants/engine support.

## Testing evidence

- Six targeted Node tests were added in `tests/agent2-gloomwing-depth.test.mjs`: 30-stage/branch integrity, distinct revised prose and failure copy, rare outcome, timed letter, branch-conditioned treasure, recurring NPCs.
- **All six targeted tests PASS** in the [GitHub Actions CI run](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38723310843).
- Entire `npm test` job: **161 pass, 2 fail** (not a green release):
  1. `tests/backend.test.mjs`: browser/server gameplay module parity mismatch. **Agent 1 integration/packaging.**
  2. `tests/cms-studio.test.mjs`: unexpected token syntax error. **Agent 4 tooling.**
- Because full tests failed, `npm run release:check` did not reach every downstream check. Runtime `src/game/gloomwing-content.js` is generated and **not edited** here. Agent 1 must regenerate from canonical source after review and rerun build checks.

## Human editorial checklist — signatures deliberately empty

- [ ] Content QA: voice, pacing, originality and typo pass
- [ ] Design QA: three genuinely meaningful options and stakes
- [ ] Mechanical QA: genuine player journey on freshly built runtime (not just static tests)
- [ ] Continuity QA: compare with project bible, 40-entry proposals ledger, last 20 shipped Gloomwing stories
- [ ] Real human acceptance of this exact prose, with explicit reviewer identity
- [ ] Agent 1 regenerates approved content; reruns `npm run release:check`, browser flow, old saves, and all three endings
- [ ] Agent 1 alone merges and deploys after the above

**Outstanding risks:** newly invented nuances about the keeper's work and the Bureau's original duty need human canon approval; rare success prose is newly available; live backend/save parity unverified; this is not a verified production experience until runtime integration.
