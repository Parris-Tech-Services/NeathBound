# Architecture decisions

## Unlimited actions

Actions are always available. The game may track choices and consequences, but
it never blocks play behind a timer, energy refill, payment, or account.

## Local-first persistence

The first release stores one save in `localStorage`. There are no accounts,
analytics, external APIs, or server-side player data.

This remains the Phase 0 implementation, but it is no longer the long-term
architecture. NeathBound may add an optional server-backed mode provided that
offline/local development remains possible and the game does not require paid
hosting, energy timers, analytics, or monetisation.

## Server architecture target

The target online architecture is a static browser client plus a separate JSON
API, a server-authoritative quality-based narrative rules engine, and relational
persistence.

For a genuinely free deployment, prefer Cloudflare Pages/Workers with D1 over a
literal ASP.NET/IIS clone. The important compatibility target is architectural:
data-driven storylets, qualities, requirements, effects, a relational
repository layer, and server-side choice resolution.

See `docs/FREE_QBN_BACKEND.md`.

## Original setting

Neathbound uses its own setting, names, prose, and visual identity. It is not a
port, fan recreation, or asset replacement for another commercial game.
