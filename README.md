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

Actions are deliberately unlimited. There are no energy timers, payment gates,
accounts, or network services. Progress is saved locally in the browser.

## Five parallel agent lanes

The repository is split into five modular lanes described in
[`docs/AGENT_LANES.md`](docs/AGENT_LANES.md): engine, narrative, interface,
save/accessibility, and QA/tooling. Each lane has a narrow ownership boundary
so up to five agents can work concurrently on separate branches or worktrees.

## License

MIT. All game writing and code in this repository are original contributions.
