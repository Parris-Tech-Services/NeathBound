# Exemplar-led writing, one to five scenes at a time

This is the default for new narrative batches. It adopts Josh's later, lean prompt rather than the earlier 20-at-once / 200-secret Content Genesis targets. The large phase counts remain backlog ideas, not authorisation to invent canon or publish bulk text.

1. Select two or three exemplars with different moods. Record source, revision and whether Josh has actually curated them. User-supplied reference prose is usable as a voice candidate; it is not automatically approved world canon.
2. Build a brief from the relevant bible sections, ledger rows, actual registry and schema. Keep context small. Do not generate a 30-character/200-secret replacement bible. Retain established canon and mark proposed additions NEW.
3. Pitch no more than five scenes. Log hook, cast, dilemma, depth, seed, payoff and unresolved mechanics. Stop for explicit pitch approval.
4. After approval, build a real-schema skeleton and resolve costs, requirements, failures, material balance and callback consumers. Obtain structure approval before prose generation. Already supplied prose may be archived as a reference without claiming an approved skeleton.
5. Draft, run the separate-context critic, and record concrete author revisions with the reason. The critic does not rewrite or approve publication.
6. Run the existing validators. `node scripts/validate.mjs`, `npm run cms:check`, and the editorial packet validator have different scopes; a valid envelope does not prove references, branch reachability, balanced rewards or literary quality. Run the repository's release checks before integration.
7. Preserve independent content/design/mechanical/continuity findings. Josh retains the final decision. The existing explicit solo-creator approval flow remains available, with honest AI provenance; do not fabricate peer reviews or mark QA pass merely because a draft exists.
8. Only after approval and deliberate runtime integration: update the relevant canon, seeds, callback consumers and change log; test fresh and legacy saves, success/failure routes and deployment.

## Practical craft targets

Every scene should touch an existing thread and plant a traceable seed. Choices must offer a real tradeoff. Persist consequences and identify where they become visible. Quiet/no-dialogue scenes and true endings are legitimate; a mechanical rule demanding two new scenes from every ending would create fake branching. Track ambiguity and silent-scene percentages over reviewed batches as design goals, not automatic literary certification.

## Contradiction and evidence rules

The CMS and editorial secrets ledgers currently use different ID namespaces. Never map them by row number or mistake all proposed deep versions for facts. A contradiction is useful only when it is attributed to identifiable testimony; it is not a licence for authorial inconsistency.

Source counts and old engine claims in the attached PDFs are historical proposals. Current repository behaviour and verified native schemas govern implementation. New slots, timers, currencies and secret revelations need explicit design decisions.

## Context and persistence

Each fresh session reloads the selected source files and revision. Chat memory is not a durable canon store. Commit accepted edits and reasons to the repo. No model can guarantee a reader will remember a line a week later, and no word-volume target substitutes for editorial review.

## Entry points

- [Writer](writer-prompt.md)
- [Independent critic](critic-prompt.md)
- [Current Studio release process](README.md)
- [Exemplar provenance](exemplars/README.md)
