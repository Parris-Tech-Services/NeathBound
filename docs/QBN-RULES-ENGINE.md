# NeathBound QBN rules engine (15 October 2026)

The canonical implementation is [`src/game/rules.js`](../src/game/rules.js), used by [`engine.js`](../src/game/engine.js). This is an original implementation inspired by publicly described quality-based narrative mechanics; it is **not** a copy of private Failbetter source code or a claim that every internal rule has been verified.

## Implemented in the canonical rules module

- Typed pyramidal and additive qualities, including binary-marker type, plus structured CP effects with quirk opposites.
- CP to level 70: `n(n+1)/2` total; beyond 70, 70 CP per level.
- Broad checks: `floor(100 * scaler * effectiveStat / difficulty)`, clamped to 10–100%, with default scaler 0.60. **Equal stat and difficulty is 60%, not 100%.**
- Narrow/luck checks are fixed probabilities, with an optional legacy `classic` d10 mode for previously authored encounters.
- Rare success is a single second roll after a normal success, default 4%. It **replaces** normal effects if special rare effects exist; otherwise ordinary success effects remain.
- CP awards: failure 1; success below 80% chance 2; success at or above 80% chance 1.
- Flat equipped item bonuses, mapped NeathBound menace destinations, penalty-related criminal-record effect, and optional 10-minute action regeneration helpers.

## Currently wired into gameplay

Ordinary challenges now default to Broad, and story branches use `check.cpAwarded` rather than the older variable difficulty-band rewards. Rare-result information flows into the story, journal, and event outcome. Existing named equipment bonuses and menace-area transitions still work in the old numeric-state representation. Source modules and historical Supabase mirror are synchronised.

## Important remaining migration boundaries

1. Legacy authoring uses numeric `state.qualities`, `state.menaces`, `state.quirks`, and `state.progress`. Some typed `quality` and `menace` story effects still add **levels**, not CP; these need a deliberate save-compatible migration before all state changes use pyramidal CP.
2. Existing storylet difficulties were originally authored against a d10 default. With Broad now default, all encounters need a **balance audit** and possible per-branch scaler/difficulty revisions.
3. Action regeneration is currently **active** in NeathBound: the game starts with a 10-action pool and grants one action every ten minutes. No payment gate is implemented.
4. The Cloudflare Worker + D1 online backend is deployed at 100% on version `2bf2fe32-74d9-496e-ac50-5cd11004e20e` (deployment `05a3ddba-a510-4e0c-9516-32f687b8e86c`, 15 October 2026). The module bundle compiled and the deployment was verified. A full real-browser playthrough and anonymous-account save round-trip remain unverified.
5. The legacy Supabase mirror is source-synchronised but its Supabase deployment is inactive. Do not treat this as proof the live Cloudflare backend has changed.

## Checks

Run `npm run release:check` and `npm run test:e2e`; new focused rules tests are in [`tests/qbn-math.test.mjs`](../tests/qbn-math.test.mjs). Confirm the GitHub Pages workflow passes, then test `?api=local` and separately check online mode.
