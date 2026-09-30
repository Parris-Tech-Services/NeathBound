# Architecture decisions

## Unlimited actions

Actions are always available. The game may track choices and consequences, but
it never blocks play behind a timer, energy refill, payment, or account.

## Local-first persistence

The first release stores one save in `localStorage`. There are no accounts,
analytics, external APIs, or server-side player data.

## Original setting

Neathbound uses its own setting, names, prose, and visual identity. It is not a
port, fan recreation, or asset replacement for another commercial game.

## Backend modelled on Fallen London (2026-09-30)

Supersedes "Local-first persistence" as the default. Requested by the owner:
the backend should match Fallen London's architecture as closely as possible
while staying free and easy to vibe-code.

| Fallen London | Neathbound |
|---|---|
| React SPA on Amazon S3 + CloudFront | Static site on GitHub Pages |
| `api.fallenlondon.com`: C#/ASP.NET REST JSON API on IIS/EC2 | Supabase Edge Function `api` (TypeScript/Deno), same begin → choosebranch → goback flow |
| Microsoft SQL Server via NHibernate | Supabase Postgres, relational tables mirroring the QBN model |
| Player accounts | Supabase Auth, anonymous sign-in (an account without a sign-up form) |
| StoryNexus QBN engine: qualities, storylets, branches, requirements, effects | `src/game/engine.js`, one pure engine run by the server (authoritative) and the browser (offline) |
| Internal CMS (forms, no code) | GitHub as the CMS: `content/*.json`, validated in CI and synced to the database |

Why Supabase rather than Vercel: it bundles the relational database, the API
runtime and accounts in one free project, and it is directly scriptable. Vercel
would need a separate database and auth provider.

Consequences:

- The server is authoritative. Players can read only their own rows; all
  writes go through the `api` function (service role), like Fallen London.
- Offline play remains: if the API is unreachable, or anonymous sign-in is off,
  the game runs the same engine in the browser with a local save.
- Accounts are anonymous by default; no personal data is collected.
- Unlimited actions still apply: there is no action or energy resource, and
  quality spending (for example Echoes) is story content, not a timer or payment.
- Free-tier limits: Supabase pauses a free project after 7 days without
  traffic; the offline fallback keeps the game playable meanwhile.
