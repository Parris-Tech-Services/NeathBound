# Local art hotlink repair — 15 October 2026

**Issue:** [#47](https://github.com/Parris-Tech-Services/NeathBound/issues/47), found during [Agent 1's Task A1-02](LIVE-ASSETS-2026-10-15.md).

## Confirmed failure

GitHub Actions [live-site check #38724637370](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724637370) reported three Wikimedia image requests failing as `net::ERR_BLOCKED_BY_ORB`, despite its nine game E2E checks succeeding. A candidate build [#38724412416](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724412416) also saw a blocked teacup image. Players could see missing image backgrounds/illustrations; the tests had intentionally reported the external failures rather than failing the build.

## Implemented repair in this branch

- Replaced **all 10** stylesheet references to six remote Wikimedia URLs, not merely the three in the latest live log, with original **local, already-present** WebP artwork under `assets/art/`.
- The site now uses `neath-hero.webp` for cavern scenery, `archive.webp` for parchment/library imagery, `market.webp` for maps and related story art, and `waterway.webp` for water/tea scenes. No images were fetched from third-party websites or added as binary dependencies.
- Bumped `index.html` CSS cache-busting version from `20261015-02` to `20261015-11` so browsers fetch the repaired stylesheet.
- Updated `ATTRIBUTION.md` to describe active original art and retain historical third-party source provenance in `assets/open-assets.json` without saying those remote images are still required.
- Added `tests/local-media.test.mjs` to reject third-party CSS image URLs, Wikimedia UI references, stale stylesheet cache version, or non-existent/empty local assets.

## Verification requirements

**Static tests:** `node --test tests/local-media.test.mjs`, plus `npm run release:check` and `npm run test:e2e` in the GitHub PR workflow.

**Live proof before closing issue #47:** merge after review; confirm GitHub Pages deploy success on the exact commit; run [Live site check](https://github.com/Parris-Tech-Services/NeathBound/actions/workflows/live-check.yml) for that deployment and inspect the *third-party assets* section of the E2E report. It should no longer list the replaced Wikimedia files. Check the normal and `?api=local&autoplay=1` pages visually.

**Important:** Replacing asset URLs in a PR is a genuine code repair, but it is **not** independently proof of production rollout, browser-image painting quality or that third-party websites will never fail. Leave these follow-up checks explicit until observed.
