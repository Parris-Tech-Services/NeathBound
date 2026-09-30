# Neathbound agent instructions

Neathbound is an original, open-source narrative adventure inspired only by
the broad genre of text-led browser RPGs. Do not copy Fallen London names,
writing, art, UI assets, lore, or other protected expression.

Before changing a module:

1. Read `README.md` and `docs/AGENT_LANES.md`.
2. Work only in the lane/module you own.
3. Preserve unrelated changes and keep commits small.
4. Run `npm test` and the static smoke check before handoff.
5. Do not add network calls, analytics, accounts, or action timers without an
   explicit design decision recorded in `docs/DECISIONS.md`.

The game intentionally has unlimited actions. Any future resource system must
not introduce real-money purchases, energy timers, or waiting requirements.
