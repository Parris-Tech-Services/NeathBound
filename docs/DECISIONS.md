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
