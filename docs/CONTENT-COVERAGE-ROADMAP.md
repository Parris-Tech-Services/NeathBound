# NeathBound narrative content coverage and roadmap

*Repository-based audit, 15 October 2026. The attached Gloomwing brief was a design specification, not an accurate inventory of this moving codebase. This document distinguishes implemented features from planned work.*

## Actual content inventory

Run `npm run catalogue:build` to refresh [all-content.csv](../content/catalogue/all-content.csv). The inventory at this checkpoint contains **234 storylets, 22 cards, 61 items, 16 locations, and 17 explicitly enumerated quality IDs**, plus ambitions, destinies, festivals, and quirks (381 catalogue records total). A subset are short or procedural narratives; quantity is **not** a quality claim.

- **The Missing Name** has a 30-stage progression but needs substantive middle- and late-game editorial review.
- **The Hunt for the Gloomwing** adds 30 distinct original stages (`gloomwing_hunt_00`–`29`), 90 branches, three regional locations, a delivered letter, quirk-gated alternatives, and three permanent ending treasures. JSON source: [gloomwing.v1.json](../content/ambitions/gloomwing.v1.json).
- **The Last Light, River Debt, and Stolen Hour** currently have five stages each. Their treasure effects exist at stage five; they do **not** yet have 30–40-stage epic arcs.
- Existing destinations include **nine original-world regions plus expansion and menace locations**, with 16 indexed locations after the Gloomwing addition.
- Festival windows, named destinies, rare successes, partial quirks, action regeneration, basic living-story messages, and the existing cards deck have implementations.
- The supplied brief's assertion that there are 18 professions was **not supported** by the content sources inspected: these expose short `trades` records, not a complete 18-role profession ladder.

## Coverage by requested workstream

| Workstream | Current coverage | Remaining acceptance criteria |
|---|---|---|
| Gloomwing ambition | 30/30 chapters implemented, branching final reward, 24h letter | Real-browser playthrough, editorial continuity review, reward balance, prevention of misleading saved-progress UI |
| Other ambition epics | Missing Name 30, three other ambitions 5 each | Give each a genuinely differentiated second and third act, 30–40 stages, multiple conditional resolutions; relocate each final treasure to its real finale |
| Making Your Name | Several tutorial/onboarding routes exist, but not 4 × 7 × 3–5 authored encounters | Four full arcs with staged location lessons and earned +4 weapon-slot capstones |
| Professions | Early trade definitions, no verified 18-profession ladder | Tiered careers, server-authoritative Notability gates, unique profession items, 7-day income and an original Unsigned Message equivalent |
| Destinies | Festival gating and 5/+3 dual-stat examples exist | More authored destiny scenes, endgame Fate alternatives that do not pretend to implement payments; verify festival selection changes and save migration |
| Quirks | Pyramidal CP opposition, tier labels, and gated Gloomwing branches | Broader quirk-specific routes, clearer UI explanations, authored opposition balance audit |
| Exceptional stories | A small proof of concept rather than a verified 100+ story library | Commission original 5–10 chapter monthly adventures, continuity checks and rewards; **do not copy paid reference-game stories** |
| Seasonal festivals | Six seasonal windows and choice stories | Distinct two-week currencies, seasonal companions, confession-like mechanics, recurring event progression and calendar coverage |
| Living stories | General authored delay/message/on-arrival effects; visible Messages screen | Multi-stage schedules, deduplicated job handling, backend replay prevention, countdown in hours/days, accessibility audit |
| Authoring pipeline | Gloomwing v1 JSON, JSON schema, generated JS, repository validation and CSV catalogue | Extract legacy JS content into JSON packs, schema validator dependency with CI, source references and contradiction checks across all packs |

## Implementation rules for future contributors

1. **Author original content.** The PDF includes verbatim extracts from another game's wiki and lists mutually inconsistent versions of the same storyline. The Gloomwing adaptation takes high-level inspiration only. Do not paste reference-game prose, settings, character designs, or premium story content into NeathBound.
2. **Respect the save model.** Do not remove existing ambition IDs or alter numeric save meanings without a versioned migration. A failed skill check must never irreversibly mark an ambition chapter complete.
3. **Keep the online and offline engines in sync.** The source-of-truth rules, state, content, and engine are under `src/game/`; run `npm run sync:engine` before publishing the separately deployed Worker.
4. **Use progression and reward tests.** Every chapter should have at least two viable approaches, an exact progress gate, failure retry, durable outcome flags, and a fully documented final reward.
5. **Prefer authorable sources.** For new arcs create `content/ambitions/<name>.v1.json`, extend the generator rather than hand-editing generated modules, refresh the catalogue, and run `npm run release:check`.

## Suggested delivery sequence

**Release A — completion and confidence:** confirm GitHub Pages live version, run full Node and browser tests, check Cloudflare account save playthrough and the Gloomwing outcome texts. Fix deployment or progression regressions immediately.

**Release B — deeper existing arcs:** give The Last Light, River Debt and Stolen Hour individual 30-chapter plots and move their treasures from chapter 5 to the real final chapter. Rework Missing Name's current generated prose for stronger narrative consequences.

**Release C — systems:** professions/Notability/paydays, tutorial arcs with four +4 weapon capstones, seasonal currency economy and exception-story authoring templates.

**Ongoing releases:** original monthly self-contained stories, separately edited and playtested; add annual festival arcs and consistency tests, not a pretend mass release of 97 shallow placeholders.

## Verified limitations

Cloudflare accepted and deployed the new Worker module bundle, and a deterministic engine simulation completed all three Gloomwing endings. A full browser playthrough of the public Pages site and real anonymous-account save round-trip have **not** been verified here. The current client may remain on an older GitHub Pages build until its workflow succeeds.
