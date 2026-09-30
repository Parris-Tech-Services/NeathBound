# Neathbound

Neathbound is an original, open-source browser RPG about a city beneath the
world, built around strange stories, branching choices, and consequence-rich
exploration. It takes inspiration from the shape of text-led browser RPGs,
not from any protected setting, names, writing, art, or code.

## Play

```bash
npm test
npm run dev
```

Then open <http://localhost:4173>.

Actions are deliberately unlimited. There are no energy timers, payment gates,
or payments. Progress is saved to an anonymous online account, or locally in
the browser when the backend is unreachable (or with `?api=local`).

## Backend

NeathBound follows Fallen London's architecture on free services
(see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)):

| Fallen London | NeathBound |
|---|---|
| React SPA on S3 + CloudFront | Static site on GitHub Pages |
| `api.fallenlondon.com` (C#/ASP.NET JSON API) | Supabase Edge Function `api` |
| SQL Server via NHibernate | Supabase Postgres (relational player tables) |
| Accounts | Supabase Auth, anonymous sign-in |
| StoryNexus QBN engine | `src/game/` rules engine, run on the server |

The server is authoritative: players can read only their own rows and every
change goes through the API. The same engine also runs in the browser for
offline play. Editing `src/game/` and merging to `main` redeploys the API
(`.github/workflows/backend.yml`).

`server/` is an optional local Node + SQLite API from the earlier migration
plan. The game does not use it; the Supabase function is the online backend.

## Testing

```bash
npm test          # rules, backend API, content and module-integrity checks (no browser)
npm run smoke     # static smoke check
npm run test:e2e  # plays the site in Chromium; needs: npm i --no-save playwright axe-core && npx playwright install chromium
```

`npm test` includes a module-integrity check: every import reachable from
`index.html` must exist, and each module must use a single `?v=` version
(two versions make the browser run the module twice).

CI runs the browser test on every push and PR (`e2e.yml`) and, after each
GitHub Pages deploy, against the live site (`live-check.yml`), including an
API health check. Both publish a report with an axe-core accessibility audit
and any third-party assets that failed to load. These two are reported, not
enforced; failures of the game's own files fail the run.

## Five parallel agent lanes

The repository is split into five modular lanes described in
[`docs/AGENT_LANES.md`](docs/AGENT_LANES.md): engine, narrative, interface,
save/accessibility, and QA/tooling. Each lane has a narrow ownership boundary
so up to five agents can work concurrently on separate branches or worktrees.

## Engineering standard

Engineering principles: v5.1  
Assurance tier: 2  
Canonical repository: https://github.com/Parris-Tech-Services/NeathBound

## License

MIT. All game writing and code in this repository are original contributions.
