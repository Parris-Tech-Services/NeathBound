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

Actions are deliberately unlimited. There are no energy timers or payment gates.

Live: <https://parris-tech-services.github.io/NeathBound/>

## Backend

The architecture is modelled on Fallen London's, rebuilt on free services:
GitHub Pages for the front end, a Supabase Edge Function as the JSON game API,
Supabase Postgres for players and content, and GitHub as the writers' CMS.
Progress is saved to an anonymous account; if the backend is unreachable, the
same engine runs in the browser with a local save. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/DECISIONS.md`](docs/DECISIONS.md).

## Parallel agent lanes

The repository is split into modular lanes described in
[`docs/AGENT_LANES.md`](docs/AGENT_LANES.md): engine, backend, narrative, interface,
save/accessibility, and QA/tooling. Each lane has a narrow ownership boundary
so several agents can work concurrently on separate branches or worktrees.

## Engineering standard

Engineering principles: v5.1  
Assurance tier: 2  
Canonical repository: https://github.com/Parris-Tech-Services/NeathBound

## License

MIT. All game writing and code in this repository are original contributions.
