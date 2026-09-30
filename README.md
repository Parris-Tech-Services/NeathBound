# Neathbound

Neathbound is an original, open-source browser RPG about a city beneath the
world, built around strange stories, branching choices, and consequence-rich
exploration. It takes inspiration from the *shape* of text-led browser RPGs,
not from any protected setting, names, writing, art, or code.

## Play

```bash
npm test
npm run dev
```

Then open <http://localhost:4173>.

Actions are deliberately unlimited. There are no energy timers or payment
gates. The current Phase 0 build stores progress locally in the browser.

## Backend direction

NeathBound is moving toward a free-to-host, server-authoritative
quality-based-narrative architecture: static browser client, JSON API,
relational persistence, predicate-driven storylets, and server-side choice
resolution.

The implementation plan and free hosting target are documented in
[`docs/FREE_QBN_BACKEND.md`](docs/FREE_QBN_BACKEND.md). The existing static
game remains the working baseline while the migration is staged.

## Five parallel agent lanes

The repository is split into five modular lanes described in
[`docs/AGENT_LANES.md`](docs/AGENT_LANES.md): engine, narrative, interface,
save/accessibility, and QA/tooling. Each lane has a narrow ownership boundary
so up to five agents can work concurrently on separate branches or worktrees.

## License

MIT. All game writing and code in this repository are original contributions.
