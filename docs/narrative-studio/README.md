# NeathBound Narrative Studio — release process

This project adopts the useful StoryNexus-inspired **editorial process**, not the StoryNexus software or another studio's proprietary content. Current NeathBound mechanics and world lore are authoritative; a generic PDF prompt never overrides shipped contracts.

## Phase 0 — source of truth
- `bible.md` documents the actual game and known world rules.
- `secrets.md` is a **spoiler-heavy proposal ledger** with 40 depth-labelled subjects and a staged reveal schedule. Never treat unapproved hypotheses as canon; keep secrets out of live bundles.
- `style.md` controls voice, rhythm, second-person address and the three-pass editorial test.
- `agents.md` contains narrowly scoped pitch, skeleton, prose, QA, continuity, weekly review and economy prompts. Pass the latest versions to every run.

## Phase 1 — engine and CMS
Keep the current `src/game/` engine, `tools/cms/` browser editor and `content/schema/` format. Do **not** replace the playable UI with a React prompt. The **Studio Editor** at [QBN Studio](../../tools/cms/index.html) exports draft-review JSON; it cannot silently alter production game JS. Production requires a deliberate conversion into the existing storypack architecture and existing validators.

## Phase 2 — gated editorial loop
1. **Pitch:** <=200 words, location, beat, unique hook, budget, 2–5 distinct branches, secret depth, new qualities/items. Human: approve/reject.
2. **Midflight:** mechanically complete outline with placeholder prose; check save/migration effects and no dead-end progress; human approve/revise.
3. **Prose:** fill prose only; second person, 1–4 sentences; human judges originality and quality.
4. **Content QA:** copy/voice/novelty review. **Design QA:** progress, economy, menaces, CP and action costs. **Mechanical QA:** IDs, effects, gating, references and CI. **Continuity QA:** latest ledger + bible + last 20 shipped scenes. Distinct approvals.
5. **Final human sign-off:** set packet stage to `approved`, all four QA statuses to `pass`, `human_approved: true`, an actual `reviewer` name and `runtime_integration: verified`. The CI gate rejects fake completion metadata or missing sign-off, but does not pretend an AI QA pass guarantees literary quality.
6. **Integrate:** separately translate the reviewed packet to the canonical game content, run `npm run release:check`, inspect differences to the runtime and verify a fresh/legacy save. A reviewed packet **alone is not playable content**.

## Phase 3 — continuity and weekly audit
Keep the ledger current after every approved revelation, including liar/unreliable-narrator context. Once weekly: compare every recently changed storylet, report contradictions and tone drift, inspect plot locks and their critical paths. Reviewers must inspect evidence; a language model cannot prove the absence of contradictions.

## Phase 4 — controlled scale and monthly balance
Run individual-review loops at least **fifty times** before allowing ten-at-once generation. Every batch story still receives independent QA and human sign-off. Monthly: table item sources/sinks/net flows, menace costs, currency inflation and inaccessible items, followed by change proposals only. No invisible live-economy changes.

## Commands and gates
- `node tools/narrative-studio/validate.mjs` checks the editorial packets, 40 ledger IDs, stat whitelist, secret-depth references, required texts, branch counts and QA sign-off.
- `npm run validate:content` and `npm run release:check` run existing runtime and contract suites.
- `node tools/narrative-studio/validate.mjs report` summarizes packet progress and shows draft backlog.
- GitHub CI runs the studio gate alongside the existing game checks.

The first imported files are `content/narrative-studio/submissions/`; drafts stay out of the runtime until adapted. All generated text must be original. No API keys or unverified AI output is committed by default.
## Existing QBN Studio CMS and Groq Foundry
The [no-code QBN Studio editor](../../tools/cms/index.html) has dropdowns for branches, qualities, outcomes and effects; its exports use `format: qbn-studio-export` with `stories[]`. Copy exported JSON to `content/narrative-studio/submissions/` for the editorial gate; the validator accepts either native editorial packets or this CMS bundle. The [Storylet Foundry](../../tools/storylet-generator.mjs) offers optional Groq-assisted drafting with separate review/publishing commands. **Neither CMS export nor AI generation is automatic player-content publication.** A CMS draft with `approved` status also needs `runtime_integration: verified` and actual tests before the editorial gate calls it shipped. Use the full `npm run release:check` (NeathBound) or `npm test` plus `npm run studio:validate` (Undercity).
