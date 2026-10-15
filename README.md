# Neathbound

Neathbound is an original, open-source browser RPG about a city beneath the
world, built around strange stories, branching choices, and consequence-rich
exploration. It takes inspiration from the shape of text-led browser RPGs,
not from any protected setting, names, writing, art, or code.

## Narrative production workflow

**[Open the QBN Studio CMS](tools/cms/index.html)**\n\n**[Groq AI writing assistant — setup and safety](tools/cms/GROQ_AI.md)**: 14 creative and editorial workflows, private server-side Groq gateway, proposal review, and AI-ready handoff exports for both games. Groq generation requires two private Cloudflare Worker secret bindings; no credentials are stored in this repository. to draft branching stories, export them as JSON, and review secret-depth and QA requirements. The separate [Studio workflow](docs/narrative-studio/README.md) is our release standard.

See **[Narrative Studio](docs/narrative-studio/README.md)** for the pitch → midflight skeleton → prose → content/design/mechanical/continuity QA → human sign-off pipeline, forty-topic spoiler-aware ledger and automated approval checks. Run `npm run studio:validate` before committing content. Draft packets are not playable until integrated and tested.

## Play

**Playtest the game:** https://parris-tech-services.github.io/NeathBound/?api=local

**New ambition:** Once you leave the opening chamber, visit Lantern Quay and choose **The Hunt for the Gloomwing**. The 30-chapter arc moves through Duskwater, the Black Spire and the Bureau. It branches into three permanent Treasure-slot endings. The 24-hour Paper Court letter is delivered through the Messages screen.

The link above intentionally uses a browser-only local save, useful for private
playtesting even when an online backend is unavailable. Normal site entry
(without `?api=local`) now attempts the Cloudflare Workers + D1 backend,
falling back to local storage if its first connection fails. Saves in the two
modes are distinct; don't assume device-to-device synchronisation or silently
replace an established save. The legacy Supabase project remains inactive.


```bash
npm test
npm run dev
```

Then open <http://localhost:4173>.

Actions use a 10-action starting pool and regenerate at one action per ten minutes. There are no payments or purchase gates. Progress is saved to an anonymous online account, or locally in
the browser when the backend is unreachable (or with `?api=local`).

## Backend

NeathBound uses an independent quality-based narrative architecture inspired by public design discussions
(see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)):

| Publicly known quality-based narrative principles | NeathBound implementation |
|---|---|
| Browser storylets and map | Static original client, hosted on GitHub Pages |
| Server-authoritative state transitions as a design requirement | Cloudflare Worker API backed by D1 for online mode |
| Persistent story qualities and journal | LocalStorage in offline mode, D1 in online mode |
| Player identity | Anonymous 256-bit local session token for Cloudflare mode |
| Story authoring and testing | Original `src/game/` engine, automated content and browser tests |

Cloudflare's online backend is a **separate implementation from Failbetter's
private code**. The browser can choose `?api=local` for isolated offline saves
or `?api=supabase` for the legacy inactive Supabase experiment. The original
Supabase function mirror remains under `supabase/`, but Supabase deployment is
not the default path. `server/` contains optional legacy local API code.

See [application of the Fallen London engineering research](docs/QBN-RESEARCH-APPLICATION.md)
for which mechanics have been strengthened and which remain incomplete.


## Story and exploration

The Missing Name is the guided opening mystery. Follow the **Current lead** panel to investigate the bell, trace your record through the Hollow Archive, and pursue its skyward reference. The City Map shows both visited destinations and clues for opening new routes; on mobile, it appears in the main story column rather than the hidden sidebar. Choices still allow detours, and failed checks never strand a character in the opening investigation.

See [Narrative clarity and continuity](docs/NARRATIVE-CLARITY.md) for the authored chapter route, alternative choices, and outstanding narrative work.

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

## Explore the expanded Undercity

There are nine ordinary map locations, including **Ashrail Station**, **Cinder Ward**, and the **Registry of Hours**. From Lantern Quay, the story **Three Roads Out of Lantern Quay** leads to the new districts; their routes remain on your map afterwards. Follow the on-screen **Your Journey** guide for the main mystery across Chapters One and Two, or explore independent encounters in any order. The new prologue supports all four attributes: Nerve, Insight, Poise, and Shadow. The Chapter Two finale has two distinct permanent outcomes in each saved life.

The game currently starts with 10 actions, regenerating one every ten minutes; actions can be raised to a cap of 20. No paid action refills are offered. Local saves are separate from any previous online account.


## Narrative CMS · QBN Studio

Write new NeathBound storylets without hand-editing JavaScript at [QBN Studio](https://parris-tech-services.github.io/NeathBound/tools/cms/). The editor saves browser-local drafts, offers drop-downs for native Nerve/Insight/Poise/Shadow challenges, supports separate outcomes and effects, and follows pitch → structure → prose → content/design/mechanical/continuity QA → independent peer review → approval.

Read the [full studio workflow](tools/cms/WORKFLOW.md), [world bible](tools/cms/bible.md), [forty-entry proposed secrets ledger](tools/cms/secrets.md) and [style guide](tools/cms/style.md). Final approved raw JSON goes into `content/storylets/cms/<story-id>.json`; run `npm run cms:build && npm run release:check`. The browser editor never publishes directly to GitHub or stores provider API secrets, and the proposed secrets are in a **public** repository.
