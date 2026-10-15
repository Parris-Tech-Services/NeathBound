# QBN Studio — Groq-assisted authoring

## Status and security

The Groq AI writing partner is installed in **NeathBound** alongside the original manual editor. The shared Cloudflare gateway is at `https://qbn-studio-ai.parris-neathaustralia.workers.dev/v1/assist`.

**AI requests will not work until two Cloudflare secret bindings are configured.** Automated credential upload was blocked by the tool environment; the credentials are deliberately not in either repository. Do not add the keys to `index.html`, `app.js`, GitHub commits, screenshots, downloadable JSON or browser localStorage.

### One-time setup in Cloudflare

Open the **Cloudflare dashboard** for the account `Joshualparris@gmail.com's Account`, select **Workers & Pages**, and open the existing Worker **`qbn-studio-ai`**. Go to **Settings → Variables and Secrets** (the wording may vary). Add these as **Secret** variables:

| Secret variable | Private value |
| --- | --- |
| `GROQ_KEYS` | A JSON array containing all 12 Groq API keys previously supplied, in the form `["first-key","second-key",...]`. Paste your actual values into Cloudflare's secret form, not code. |
| `CMS_ACCESS_TOKEN` | A newly chosen long random access code (ideally 32+ characters), known to you. This is a separate access code, **not** a Groq API key. |

Save the variables and allow Cloudflare to deploy the new Worker version. Enter your `CMS_ACCESS_TOKEN` in the **Studio access code** field inside either game’s CMS. The code is kept only in that browser tab session and is not included in JSON exports.

Health endpoint: `https://qbn-studio-ai.parris-neathaustralia.workers.dev/health`. A healthy response shows the Worker is deployed; it **does not** guarantee the Groq secrets are configured. The first authorised Generate request tests that connection.

### Editor URLs

- [The Undercity Studio](https://undercity-playtest.parris-neathaustralia.workers.dev/tools/cms/)
- [NeathBound Studio](https://parris-tech-services.github.io/NeathBound/tools/cms/)

The two editors use the same Groq gateway, but different game canon, stats, locations, factions and items.

## Tasks supported

The **AI task** selector offers original story ideas; pitches; branching structure; scene and outcome prose; NPC dialogue and continuity callbacks; mechanical checks; rare outcomes; living-story schedules; continuity and canon reviews; economy/profession balancing; accessibility review; independent QA; integration/export planning; and a short multi-story arc outline.

Choose **Deep writer (120B)** for richer responses or **Fast assistant (20B)** for quick iterations. Add a specific creative direction, choose whether to include the game bible/style/spoiler ledger in the prompt, and click **Generate proposal**.

The assistant receives the active draft, game-specific references and, when checked, limited excerpts from the world documents. These are sent to Groq for inference. The browser does **not** send your Groq API keys; the Worker authenticates to Groq using private server-side bindings.

## Why Advance can be blocked at Pitch

The editor requires a narrative **Pitch (beat, mechanics, scope and stakes)** before advancing from **01 · Pitch** to **02 · Structure**. Earlier versions omitted the pitch from QA, so Autofill could report zero errors while the stage advance remained blocked.

The pitch is now a regular, visible QA issue. **Autofill & Fix All** or **Fix schema issues offline** can derive a grounded first pitch from an already-authored scene, choices and setbacks. Groq can further polish this pitch when connected. If the story has no meaningful scene content yet, the editor preserves the empty field and reports it rather than inventing a premise.

The **Advance stage** button also builds the missing first-draft pitch from a sufficiently complete existing scene when clicked, and advances to Structure in the same step. If the draft has no meaningful source scene yet, it explains what field is missing instead. Pitch advancement is not AI peer review or a human sign-off for publishing.

## One-click autofill and repair

The largest button in the editor is **✦ Autofill & Fix All**. It automatically:

1. Audits the current draft, repairs recognizable invalid effect objects, numeric strings, blank effect placeholders, missing branch IDs, missing action costs and ambition-step increments.
2. Supplies the complete draft and exact remaining QA error paths to Groq using the private gateway and the selected model. Groq fills unwritten copy, scene and outcome prose, missing branch content and valid typed effects.
3. Re-runs the real game's schema QA after every proposal and performs up to **three** iterations without accepting a proposal that increases the number of blocking errors.
4. Saves a pre-edit backup (up to five in browser-local storage) and **applies the safe edits automatically**, so you do not have to review and click Apply after each generation.
5. Shows the remaining issue count. If the result cannot be validated, the unresolved issues remain visible rather than pretending they were fixed.
6. Clears the content/design/mechanical/continuity/peer approvals. Humans must still perform real sign-offs; Groq never approves its own writing.

The **Quality gates → ✦ Fix all QA issues with Groq** shortcut calls the same function directly from the error panel. **Fix schema issues offline** repairs safe structural mistakes without calling Groq. **Undo autofix** restores your previous draft if the resulting writing isn't what you want.

The first Groq call needs a Studio access code. The gateway will not make paid calls without it. If you have not entered the access code, the button can still fix the safe local errors; it cannot invent finished prose offline.

A zero-error report means **mechanical/structural validation succeeded**, not that writing quality, canon continuity or editorial approval have been independently established.

## Safe editorial workflow

1. Open or create a draft in Narrative Studio.
2. Generate a proposal or select **Assist current stage** to choose an appropriate prompt for the current editorial phase.
3. Inspect the AI summary, issues and raw structured JSON.
4. Explicitly click **Apply proposal to this draft**, or create a separate new draft. Existing published/reference stories are read-only.
5. Re-run content, design, mechanical, continuity and peer review. Applying AI changes clears the draft's QA sign-offs; AI cannot sign off or publish its own content.
6. Export the approved JSON and integrate via the repository's native content compiler, validators and reviewed PR workflow.

For QA/continuity/accessibility tasks, AI returns advisory findings, not a blanket approval. Neither tool may automatically publish to either game.

## AI-ready exports and integration in both games

**Export AI-ready handoff** saves a versioned JSON package that includes the source game, target game options (`undercity` and `neathbound`), story draft, mechanics contract, allowed stat and item IDs, relevant world documents, existing human review state and integration checklist.

**Download AI proposal JSON** saves the generated suggestion separately. **Export drafts** retains the Native QBN Studio schema and supports reviewed content import.

Cross-game integration still requires an explicit mapping of differing stats, qualities, menaces, routes, items, narrative canon and engine adapters. An AI handoff is designed for that work; it is not a safe automatic cross-game import.

## Rate limits, failures and privacy

The shared Worker restricts requests to recognised CMS origins, requires a private access code, enforces a request-size limit, and applies a per-client short-term usage cap. Groq may also impose organisation-wide limits, so twelve keys do not imply twelve independent quotas. The gateway does not deliberately log prompts or keys, and provider errors are returned without raw secret-bearing responses.

Any exposed world bible, spoiler ledger or drafts are intentionally shared with the chosen Groq model when you generate. Untick the lore checkbox to omit these references when desired.

Server code: `tools/cms/groq-worker.js`; browser UI: `tools/cms/ai-assistant.js`; content contract: `tools/cms/studio-core.js`.
