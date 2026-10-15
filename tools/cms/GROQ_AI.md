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
