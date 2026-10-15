# Agent 1 — Task A1-02: public entrypoints and live asset verification

**Checkpoint:** Thursday 15 October 2026, approximately 10:59–11:08 UTC (Australia/Sydney 21:59–22:08). **Status:** Test evidence recorded; entrypoint and first-party asset checks pass within stated scope; follow-up bugs/integration risks remain.  
**Task definition:** [Agent 1's next 20 tasks](../AGENT_1_NEXT_20_TASKS.md), A1-02. **Parent:** [Agent 1 tracker #40](https://github.com/Parris-Tech-Services/NeathBound/issues/40).

This was a **read-only smoke/asset investigation**, not a complete story playthrough, authenticated account save test, or release. Hosting providers' remote HTTP fetch/browser service and actual GitHub Actions logs were used because the task runtime's `curl` could not resolve the four public hostnames, and the ordinary web reader returned cache misses. Production was **not changed**. Multiple agents pushed changes during this test; every SHA below describes a moment, not a promise about the next minute.

## Executive findings

| Surface | Result | Evidence and limits |
|---|---|---|
| NeathBound normal GitHub Pages landing: [live](https://parris-tech-services.github.io/NeathBound/) | **HTTP 200**, correct title `NeathBound \| A City Beneath`, `#landing-screen` present, main module `./src/main.js?v=20261015-10` referenced | Rendered HTML retrieved using Cloudflare Browser Rendering. `#app[aria-busy=true]` is expected on the **pre-entry landing**; not a crashed game. |
| NeathBound forced local game: [live](https://parris-tech-services.github.io/NeathBound/?api=local&autoplay=1) | **HTTP 200**, actual booted game with `#app[aria-busy=false]`, story markup, `The Lair` and `Lantern Quay`; HTML increased to ~35,550 characters | Cloudflare Browser Rendering with `waitUntil=load` + short render wait. No manual challenge clicked. Supports JavaScript/module execution rather than merely static landing HTML. |
| NeathBound local landing: [live](https://parris-tech-services.github.io/NeathBound/?api=local) | **HTTP 200**, expected title, landing, main region | Remote Chromium HTML content returned; no save mutation. |
| NeathBound Cloudflare API: [health](https://neathbound-api.parris-neathaustralia.workers.dev/health) | **Healthy JSON content:** `{"ok":true,"service":"neathbound-cloudflare","storage":"D1"}` | Browser-rendering service navigated to `/health`, rendering HTTP 200 HTML `<pre>` containing that exact JSON. No authenticated save requests or data mutation. |
| Undercity Vercel: [production](https://the-undercity.vercel.app/) | **HTTP 200**, proper title `The Undercity · A city that remembers`, full ~90 KB HTML game shell | Vercel's authenticated HTTP fetch; no browser actions or save changes. |
| Undercity game script URLs | **11/11 HTTP 200**, non-HTML JavaScript bodies; none returned an index/404 fallback | Vercel HTTP fetch for each **exact path** in game HTML (without irrelevant cache-busting query values; files resolve independent of the query string). Full list below. |
| Undercity versioned narrative JSON | **HTTP 200**, `content/storylets/ambitions/late-main.v1.json` ~213,573 characters, contains `ambition-main-collection` | Versioned story content exists on public host. |
| Undercity Narrative CMS: [studio](https://the-undercity.vercel.app/tools/cms/) | **HTTP 200**: studio HTML, `/tools/cms/app.js` and `/tools/cms/studio-core.js`; proper `QBN Studio` title and non-HTML JS modules | Provider HTTP; this does **not** count as running editor interactions. |
| Undercity alternate Cloudflare Worker: [live](https://undercity-playtest.parris-neathaustralia.workers.dev/) | **HTTP 200** in Browser Rendering, title matches, HTML includes `Bell-Cage`, `Paths & callings`, `UndercityExpansions` and `UndercityRules` | An alternate reachable playtest site, but Git SHA/content parity and full browser playthrough remain unverified. |

## Complete Undercity first-party game script check

These eleven `<script src>` references were parsed from **deployed production HTML** and each was fetched from `https://the-undercity.vercel.app/`. All reported HTTP 200 with substantive JavaScript (not HTML error/fallback content).

| Live script | HTTP | Returned text length |
|---|---:|---:|
| `content/ambitions.js` | 200 | 21,740 |
| `content/moth.generated.js` | 200 | 50,148 |
| `content/second-acts.generated.js` | 200 | 105,894 |
| `content/late-ambitions.js` | 200 | 144,721 |
| `content/cms-published.js` | 200 | 869 |
| `content/world.js` | 200 | 18,595 |
| `content/penalties.js` | 200 | 4,940 |
| `content/callings.js` | 200 | 12,892 |
| `content/systems.js` | 200 | 5,584 |
| `content/approved-storylets.generated.js` | 200 | 316 |
| `src/game/rules.global.js` | 200 | 7,116 |

Additional positive HTTP evidence: `src/game/rules.js` (~7,132 characters), `tools/cms/` (~9,039), `tools/cms/app.js` (~19,559), `tools/cms/studio-core.js` (~9,110). Also tested `scripts/build-static.mjs` (HTTP 200) for investigation only; it is not a required browser runtime asset.

**Limit:** HTTP 200 and recognizable JavaScript prove the file is served, not that every choice, save path, browser console event or dynamic fetch is functional. Undercity's `index.html` uses inline CSS, so there were no external `<link href>` stylesheets in the deployed response.

## NeathBound deployed-site Chromium evidence and media failures

1. [Pages deployment run #38724412416](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724412416) **success** for immutable commit `179b0dfe1eb027f18e9d59c00b89999990422480`, with successful `npm run release:check`, a candidate Chromium test and deployment. Its log records local entry-point asset resolution passing and **9/9 Chromium E2E cases passing**, but **four third-party Wikimedia requests failed** under `net::ERR_BLOCKED_BY_ORB`.
2. [Live-site browser run #38724637370](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724637370) **success** on the deployed-site check (not just candidate build): `the game loads with no errors and every asset and module resolves` passed; **9/9 browser cases passed, 0 failed**. It nevertheless logged **three external media failures** (`net::ERR_BLOCKED_BY_ORB`):
   - `https://upload.wikimedia.org/wikipedia/commons/8/83/%D0%A2%D0%B5%D0%BA%D1%81%D1%82%D1%83%D1%80%D0%B0_%D0%B1%D1%83%D0%BC%D0%B0%D0%B3%D0%B8.jpg` (paper texture)
   - `https://upload.wikimedia.org/wikipedia/commons/6/61/Cromer_pier_at_night.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original` (Cromer pier)
   - `https://upload.wikimedia.org/wikipedia/commons/c/c1/Old_Books_in_the_library.jpg` (library image)
   The candidate-build log also reported `https://upload.wikimedia.org/wikipedia/commons/e/e7/Teacup.png`.
3. **Root-cause classification:** the error affects **external Wikimedia media**, not a missing NeathBound JS module. The current repository's `src/styles.css` contains the paper/teacup/books remote URLs; `src/ui/render.js` includes the pier/library/books/teacup remote references. The remote server ORB/blocking behavior cannot be fixed by declaring CI green. **Player-visible consequence:** some background/illustrative images may display blank.
4. **Triage issue opened:** [NeathBound #47: Agent 7 replace failing Wikimedia artwork hotlinks](https://github.com/Parris-Tech-Services/NeathBound/issues/47). Agent 7/UI-art owner to replace with original or licensed locally served assets and ensure a dependable fallback. This issue remains open; **Agent 1 did not change game art or CSS**.

### CI/deployment caveats discovered during this task

- At an 11:04 UTC inspection, NeathBound Pages run [#38724757798](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724757798) **failed its verification stage** for commit `342cc8745d4c111ad9438af1401ff6ed29b389a2`. Logs showed **163/164** Node tests passing, with failing test `shared AI helper is a valid ES module with a protected gateway`; deploy job was skipped. A later [Pages run #38725008828](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38725008828) **successfully deployed** commit `4e1965e02fa3ff8c7c5437ec2ecf40f312caec36` and [live site check #38725155039](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38725155039) was **success**. Do **not** characterize the earlier failed build as necessarily still blocking all Pages releases.
- During that later checkpoint `main` advanced to `b13dc76f1474c06b377a89a27ac7445366fa2c17` while [run #38725314127](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38725314127) was queued. **No claim** that the newest source had deployed; rapid pushes caused some earlier Pages jobs to be cancelled.
- The last observed **Vercel production** alias pointed at READY deployment [`dpl_BgpdAxRACREnfbZ22RLPrnuN3qfB`](https://vercel.com/joshualparris-projects/the-undercity/BgpdAxRACREnfbZ22RLPrnuN3qfB), GitHub source commit `8127177d0c8b0ac3d664d9190c768d66d0e8c11f`. GitHub `main` had subsequently advanced to `87d78ddf2e48f5668f7a51c3cdfe9ab3b1f85ae3` at the last comparison. **Key files are publicly served, but source-to-production parity is not established.** Deployment lag is a Task A1-04/A1-20 issue, not proof that current assets 404.
- NeathBound `live-check.yml` still queries the **legacy Supabase API**, printing `CORS preflight: 000, unauthenticated GET: 000` in the successful [#38724637370](https://github.com/Parris-Tech-Services/NeathBound/actions/runs/38724637370) check and warning that online API is unavailable. **This status is about an obsolete Supabase endpoint**; independently fetched **current Cloudflare Worker `/health` returned healthy D1 JSON**. The workflow must be corrected under A1-04; do not treat that legacy warning as proof of Cloudflare downtime.
- The older NeathBound Supabase deployment continues to be deprecated and had earlier failed HTTP 401; see [Task A1-01 baseline](BASELINE-2026-10-15.md). That is separate from NeathBound's active Cloudflare API and this asset smoke.

## Verification / safety boundaries

**What was actually run:** read-only provider HTTP requests for both sites (including 11 live Undercity JS modules); Cloudflare browser-rendered normal and local NeathBound startup; Cloudflare Worker health read; alternative Undercity Worker landing render; GitHub Actions live E2E/asset-failure logs and source file refs; version/deployment metadata via Vercel and GitHub.

**What was not run:** a manual/touch/mobile/screen-reader playthrough, full browser console export, authenticated cloud save mutation, old-save import/export, screenshot artifact collection, error-free loading of all outside-company media, live production backend version-to-Git SHA attestation, Render service inspection, or production upload. Those remain for A1-03 through A1-20. **A Cloudflare rendering HTTP 200 is a status of the rendering service and rendered response; the exact origin HTTP status for /health was not independently read from its network response**; the health body itself explicitly says `ok: true`.

**A1-02 conclusion:** Both public games' principal entrypoints **load** and known required first-party Undercity scripts resolve, with the NeathBound boot verified to render. Recorded **visual image failures** and **release-version alignment risks** have owner/follow-up paths. This meets the asset-availability verification milestone without claiming a perfect game, a clean third-party image audit or complete live-save/browser QA. No player save or deployment was changed.
