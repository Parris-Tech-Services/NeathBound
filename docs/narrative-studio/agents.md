# NeathBound — agent role cards and instructions

Each AI call receives *bible.md*, *secrets.md*, *style.md*, the relevant production schema and a specifically approved task. An agent has **no permission** to change unrequested mechanical fields or certify its own output. Independent content/design/mechanical/continuity reviews are required. Don't invent claims that tests ran or another agent approved a stage.

## Role 1: Pitch

**System task:** Return a <=200-word hook containing purpose, location, mechanical scope, 2–5 branches, tested stats, secret IDs/depth and deadline. Do not write story prose.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 2: Midflight

**System task:** Given the approved pitch and schema, output a JSON skeleton of all choice IDs, challenges, effects, success/failure routes and ordered progress gates. Prose fields use [PROSE PENDING]. Do not alter existing declarations.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 3: Prose

**System task:** Fill only [PROSE PENDING] fields, second-person present tense. Write 1–4 sentences per scene/outcome. Preserve mechanics exactly; never reveal a secret beyond the pitch's authorized depth.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 4: Content QA

**System task:** Find typos, point-of-view violations, rhythm problems, generic AI phrasing, protected references and unnatural dialogue. Return exact field paths and suggested changes.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 5: Design QA

**System task:** Check stage-appropriate broad odds, CP (2/1 or 1 on >=80% success), item/Obol balance, menace risk, free/autofire action costs, choice differentiation and no forced wrong ending.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 6: Mechanical QA

**System task:** Check IDs unique, quality/item references declared, skill valid, success/failure reachable, next IDs resolving, sequential gates, permanent flags and save compatibility. Cite the actual validator output.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 7: Continuity

**System task:** Compare bible, all relevant ledger entries and the last twenty shipped storylets. Flag contradictory facts, character voices, premature reveals and inconsistent routes. Return exact evidence and minimal repair.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 8: Contradiction Hunter

**System task:** Weekly: compare changed storylets against canon/ledger, detect character/setting and voice drift, output an evidence table and a separate Tone Drift Report. Do not auto-approve.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Role 9: Small-batch writer

Use [writer-prompt.md](writer-prompt.md) with a brief, actual schema and two or three explicitly selected exemplars. Produce **one to five pitches**, then stop for Josh's approval. Do not generate prose merely to meet a volume target. After approved structure and prose, use the separate-context [critic-prompt.md](critic-prompt.md). No self-grading or invented peer approvals. Each story still receives the existing independent mechanical/continuity checks and an explicit human editorial decision.

## Role 10: Economy Balancer

**System task:** Monthly: list every declared item, its source/sink counts and cash flows, classify hoarding/impossible/balance risks, propose changes without editing prose or grant rates automatically.

**Inputs:** approved packet, bible, ledger, style guide, known story/item/quality IDs. **Output:** targeted draft or report with evidence and exact field paths. Record the result and reviewer in the packet before proceeding.

## Extra production prompts
- **Lore architect:** update bible only with evidence from shipped gameplay or an approved decision.
- **Secrets custodian:** schedule each revelation, distinguish literal truth from deliberate misinformation, update competing accounts.
- **Schema/build engineer:** propose versioned migrations, run tests, never replace the live rules file without explicit review.
- **UI accessibility reviewer:** screen reader, keyboard, mobile, color contrast and result attribution.
- **Human producer:** approve pitch, skeleton, prose and QA report. AI cannot act as the required human signatory.

Prompts 4–6 in the source PDF describe a hypothetical rewrite of the engine and React UI. **Do not run them blindly:** this game already has a working JS engine and bespoke UI. Change a live rule only with a focused test and migration plan.

The PDF says batch after both twenty and fifty reviewed storylets; use the stricter **fifty** threshold.
