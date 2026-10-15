# NeathBound — implementation audit against the supplied RPG specifications
Updated 15 October 2026. Audited against the supplied rules-engine PDF, comparative gap analyses, and the long-form narrative blueprint. This is a working-game audit, **not a declaration of 100% feature parity** with any proprietary commercial game.

## Verified source-level implementation

| System | State | Evidence in this repository |
| --- | --- | --- |
| Four primary skills & QBN resolution | Implemented | `src/game/rules.js` handles Broad, Narrow, rare-success checks, capped CP pyramid and equipment; `src/game/engine.js` applies branch outcomes |
| Pyramidal quirks & opposed traits | Implemented, migration ongoing | `quirk_cp` preserves CP; narrative quirk effects reduce opposite CP; tests in `tests/qbn.test.mjs` |
| Four Menaces and recovery locations | Implemented baseline | Dread, Scandal, Wounds and Suspicion; four recovery areas, thresholds and story choices |
| Opportunity deck | Implemented | Hand limit, high urgency bypass, frequency/unlock weights; `src/game/decks.js` |
| Personal ambitions | Chapter target met | The Missing Name, The Last Light, The River Debt, The Stolen Hour have 30 stages each; added late chapters are original; the separate 30-stage Gloomwing Hunt is also authored |
| Opportunity cards & local travel | Implemented baseline | Card exclusions, unlock checks, discovered route history and map |
| Action economy | Implemented, design changed | Actions now regenerate one per 10 minutes; historical documentation describing unlimited actions is out of date. No paid action refills are claimed |
| Equipment & trade | Implemented baseline | Slot bonuses, possessions, buy/sell, recurring profession stipend |
| Destiny/festival windows | Implemented baseline | Seasonal windows and single-destiny gates, with original titles |
| Living Stories | Implemented baseline | Persisted delayed events, countdowns, messages and on-arrival effects |
| Authoring content validation | Implemented baseline | `tools/validate-content.mjs`, content-contract tests, generated Gloomwing JSON pack |
| Local save and backend | Local verified in tests; online unverified | Local state persistence and `?api=local` mode work; current Cloudflare D1 live API needs separate verification. Legacy Supabase project remains inactive |
| Accessibility | Partial | Semantic controls and responsive UI implemented, but real mobile/assistive-tech audit outstanding |

## Significant unfinished specification areas

1. The reference blueprint calls for far deeper, sometimes thousands-long narrative content. Reaching 30 chapters does **not** establish equivalent narrative depth, especially for the three newly expanded Vows. Their supporting NPCs, alternative acts, relationships and far-reaching consequences require further original writing and human playtesting.
2. Four seven-stage **Making Your Name** tracks need complete 3–5-scene mini-arcs, diverse beginner rewards and independent completion coverage. A count of stage markers alone is insufficient.
3. Higher profession tiers require more distinctive promotion stories, workplaces, economic item variants and balance audits across a multiweek character.
4. Seasonal events have windows and story choices, but not a complete year of multiweek activity loops, currencies and long-term effects. Exceptional Stories do not approach a reference corpus of 100+ independent releases.
5. The full unified fourteen-type Quality registry is present as an engine concept, but many older story effects are still expressed through compatibility fields, so the migration and automated save matrix remain unfinished.
6. Advanced authoring tools (versioned migrations, graphical editing, content review workflow, conflict management), long-term backend persistence, multiuser social interactions and cross-device accounts are not end-to-end proven.
7. Screen-reader, mobile keyboard/touch, content accessibility, long-term game balance and complete branch-level acceptance tests remain mandatory before claiming production completion.

## Deployment distinction

- **Browser-local game:** https://parris-tech-services.github.io/NeathBound/?api=local
- **GitHub source:** https://github.com/Parris-Tech-Services/NeathBound
- **Supabase legacy deployment:** blocked by an inactive project and rejected legacy access token (401). A green source test does not unblock deployment.
- **Cloudflare backend:** separate from Supabase; verify current D1 deployment and actual API persistence, not merely the presence of configuration files.

## Acceptance criteria for a claim of complete implementation

Every named requirement must have both a functioning play path and an automated or manually recorded acceptance test; all source and browser workflows must pass; a saved game must traverse all four core Vows and all distinct end rewards; legacy saves must round-trip; live backend must persist across reload and devices; and accessibility must be tested with assistive technologies. Until then: **substantial playable prototype, not the entire specification implemented.**
