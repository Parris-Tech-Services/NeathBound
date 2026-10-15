# QBN Studio — writing and publishing workflow

QBN Studio is the original authoring system for **NeathBound** and **The Undercity**. It borrows the useful *workflow ideas* of no-code quality-based narrative authoring, but does not copy StoryNexus source code, text, protected game characters or setting.

## Start the editor

- **NeathBound:** `https://parris-tech-services.github.io/NeathBound/tools/cms/`
- **The Undercity:** `https://the-undercity.vercel.app/tools/cms/`

You can also run each repository locally with its usual web server and visit `/tools/cms/`. The editor is a browser app. **Drafts are saved in localStorage on that device only**, not GitHub or a shared server. Export frequently.

## Phase 0: Authoring foundation

Every project keeps independent copies of `bible.md`, `secrets.md`, `ledger.json`, and `style.md`. The Bible preserves existing game canon, the ledger organises possible surface/mid/deep reveals, and the Style Guide governs prose. Both ledgers currently contain 40 **proposed** entries each. Conflicting accounts in the first six entries are labelled as competing rumours, not two simultaneous confirmed truths.

**Security note:** These are public repository files and cannot hold unrevealed canonical secrets, credentials or sensitive private information. Move genuine spoilers into a private editorial system before using this pipeline for confidential endgame material.

## The nine tracked steps

1. **Pitch:** A short description of the beat, scope, locations, relevant stat tests, secrets and expected consequences. Human approves the idea before mechanical or prose investment.
2. **Midflight / structure:** Use the editor to create the whole skeleton. Each choice has a stable ID, constraints, challenge, action cost, separate success/failure and optional rare-success result.
3. **Prose:** Write 1–4 sentences for scene and each outcome. AI briefs must not alter the approved skeleton's mechanics.
4. **Content QA:** Proofreading, tense, character voice, clarity, idiom, repetition, player agency and tone.
5. **Design QA:** Validate challenge odds, earned CP, cost of Menaces, inventory rewards, action costs and profession/ambition balance. Numbers come from the running game's rules engine, not a prompt's memory.
6. **Mechanical QA:** Run the browser validator plus the repository's command-line checks. Reject bad IDs, wrong stats, unknown items, missing progress gates and malformed outcomes.
7. **Continuity QA:** Compare the relevant secret IDs and approved reveal depth, plus the Bible and other shipped stories. Deliberate conflicting rumours must carry clear attribution. Re-run this check every week over the previous week's releases.
8. **Peer review:** A **different human** reads the complete story and signs the peer check. Five tick boxes in the CMS record declarations, not server-verified signatures. An AI agent cannot self-certify completion.
9. **Approved:** Only content that passes all checks and has a named independent reviewer enters the release directory.

There are nine UI statuses because QA and final peer sign-off are tracked separately; the underlying studio process still has pitch, midflight, writing and three independent forms of QA.

## AI-assisted one-person writing

The **Copy agent brief** button assembles the current stage's instruction, the current storylet JSON, and the game-specific Bible, Secrets Ledger and Style Guide. Use it with an AI model, check its response carefully, then manually enter changes into the editor. There is deliberately **no browser API-key field**: sending a Groq or other provider key from this public static site would expose it. Autonomous server-side AI generation and agent orchestration require authenticated backend work.

Dedicated roles: Pitch Agent → Structure Agent → Prose Agent → Content QA Agent → Design QA Agent → Mechanical QA Agent → Continuity Agent → Independent Reviewer. The weekly Contradiction Hunter audits characters, location depictions, chronology and tone drift. An Economy Balancer should sample full playthroughs, inspect payouts/action usage and propose changes without automatically committing them.

**Do not begin ten-storylet batch generation until at least twenty individually reviewed storylets have traversed the whole pipeline**. Batch generation increases throughput and propagates undetected errors.

## Getting an approved storylet into the game

1. In the CMS, press **Approved file ↓** once the independent review and all QA checks are signed off. That downloads one raw `storylet-id.json` file ready for publication. **Export JSON** remains available for draft backup and produces a portable `qbn-studio-export` wrapper.
2. Add the approved raw file to `content/storylets/cms/<storylet-id>.json` on a feature branch and request a GitHub review. Do not submit a backup wrapper as a publishable storylet.
3. Run `npm run cms:build` from the repository root. This generates **NeathBound** `src/game/cms-published.js` or **Undercity** `content/cms-published.js`, using only approved JSON.
4. Run `npm run cms:check` and the repository's full test suite; for NeathBound use `npm run release:check`, for Undercity use `node scripts/validate-content.mjs && node scripts/content-tracker.mjs --check && npm test`. Rebuild the Undercity content tracker after adding playable scenes.
5. Review the diff and approve the pull request. Both games load their generated CMS output without replacing existing hand-authored stories or existing saves.

**Release gate:** The compiler rejects unsupported item IDs, unpublished linked IDs, incomplete prose, mismatched game IDs, missing independent review and incompatible effect types. This is a safety net, not a literary judgement. If the user's browser has not exported the draft, there is nothing for CI to publish.

## Engine differences

| Detail | NeathBound | The Undercity |
|---|---|---|
| Primary stats | Nerve, Insight, Poise, Shadow | Observation, Guile, Persuasion, Resolve |
| Money | Obols | Pennies |
| Menaces | Dread, Scandal, Wounds, Suspicion | Suspicion, Notoriety, Wounds, Delirium |
| Native stories | `stories` object with `choices` | `window.UndercityExpansions.stories` array |
| Progress | `ambition-progress` with an ambition ID | `pathProgress` for selected path |
| Published bundle | `src/game/cms-published.js` | `content/cms-published.js` |
| Cross-project transfer | **Not supported**; port the idea, rewrite the mechanics and story | **Not supported**; port the idea, rewrite the mechanics and story |

The Undercity's engine awards primary stat CP on tested choices; manually applying a `quality` effect is not supported by its studio compiler. NeathBound compiles manual `quality` effects to CP progression. Timed `living-story` effects currently compile only for NeathBound; the Undercity uses its pre-existing scheduler and needs a dedicated adapter.

## Still to build

- Authenticated, shared, role-based, real-time collaboration with genuine review signatures and version conflict resolution.
- Browser-only import/export is functional, but no one-click secure publication to GitHub exists.
- Rich node-link story graph, visual branching test simulator and full old-content migration into editable canonical JSON.
- A private secrets service for spoiler-sensitive, confidential endgame plans.
- Safe, server-side optional LLM prompting with provider secrets kept off the browser.
- Longitudinal economy simulation and human accessibility/usability review of the editor.

**Do not say the whole StoryNexus-scale CMS is complete until these remaining systems are implemented and tested.**
