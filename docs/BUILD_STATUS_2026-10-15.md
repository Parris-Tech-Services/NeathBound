# NeathBound playable milestone and PDF specification coverage (15 October 2026)

This is a **playable milestone**, not a claim that every component in the uploaded 64-page narrative-RPG blueprint has been completed. The PDFs set out a multi-session programme (13 sessions), including far more content than an initial release.

## Implemented and available to play

- Existing original, local-first quality-based story engine, stat challenges, progress and consequences, cards, possessions, menaces, browser save, UI and navigation.
- **The Missing Name** main story (Chapter One): Lair → Lantern Quay → Hollow Archive → Glass Observatory, with a quest guide that gives specific next steps.
- Four original Lair escape methods, one for each game stat (Nerve, Insight, Poise, Shadow), with different rewards for the two new routes.
- Three additional districts: **Ashrail Station**, **Cinder Ward**, **Registry of Hours**.
- Eleven additional original storylets: travelling routes from Lantern Quay, independent station/ward encounters, Registry investigation, a mutually exclusive permanent Chapter Two verdict, and an epilogue.
- Map now gives explicit discovery instructions, and ordinary story-led destinations are retained in the return-travel list. Older saves recover route history where possible.
- Full server content mirror prepared; corresponding backend deployment is blocked (see below).
- Added regression tests for saved routes, the new districts, Chapter Two, and all four escape choices.

## Current playtest

https://parris-tech-services.github.io/NeathBound/?api=local

The `api=local` option intentionally uses browser-only storage. No online save, account or shared-device synchronisation is promised.

## Known deployment blocker

The existing Supabase **NeathBound** project (`ynrfskgfrgqxwjswtnka`) is **INACTIVE**. GitHub's stored Supabase token was rejected by the deployment API (401 Invalid access token). The connected Supabase integration also refused to restore this project because the account already has its maximum two active free projects. We did **not** pause or delete another project to bypass this. GitHub Pages serves the static game; it does not depend on Supabase for local-only play.

## Major unfinished areas from the uploaded specification

- A full multi-step 2–3-stage character creation and alignment flow.
- A production-ready authoring CMS, schema migration policy and content tracking pipeline for large-scale story generation.
- Four distinct full personal ambitions and four complete early-career progression storylines.
- All requested profession tiers, destinies, quirks and their branch consequences.
- Exceptional stories, seasonal event cycles, and the requested large volume of additional location-specific fiction.
- The PDFs' proposed fixed action regeneration and card timing mechanics are **not** implemented: NeathBound's pre-existing architecture decision is to keep actions unlimited and avoid waiting/payment gates. This is an intentional design difference, not an accidental omission.
- Full independent review of branching continuity, content balance, accessibility and production-wide save migration at the eventual scale.

## Suggested next build milestone

1. Keep a dependable online playtest using local storage while the backend subscription/slot issue remains unresolved.
2. Complete character creation with explicit player backgrounds, first faction contact and a saved escape history, keeping existing saves compatible.
3. Expand the authored main investigation with parallel paths that actually change dialogue; add a route index showing where each district can be found.
4. Turn the PDF deliverable list into a content tracker with acceptance tests for each system.
5. Introduce additional ambitions/professions only when they can be validated against the same game engine and save schema.

All setting names, prose and rendered story art here are original to NeathBound, not copied from another game's IP.
