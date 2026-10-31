# NeathBound public analytics integration

This public game sends anonymous, opt-in aggregate page-view/session counts through the [Parris Analytics](https://github.com/Parris-Tech-Services/analytics) Cloudflare Worker.

The source tracker is loaded from `https://parris-analytics.parris-neathaustralia.workers.dev/tracker.js?v=2`, pinned with a cache-busting version because older consent UI blocked the Onwards action in the browser release test on 31 October 2026.

The consent prompt must never intercept game control clicks. Before publishing a new tracker version, run `npm run release:check` and `npm run test:e2e` in the GitHub Pages workflow. No visitor IDs, form inputs or URL query strings are persisted by analytics.

Do not record real visitor events as test data. Synthetic probes use the separate `test` diagnostic event in the central D1 database.
