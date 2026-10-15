# Storylet Foundry — Groq-assisted content authoring

**Created 15 October 2026.** A working Node.js 22+ CLI, not a prompt-only document. It integrates with **NeathBound** and **The Undercity** using separate, validated adapters to their real storylet schemas. Source: tools/storylet-generator.mjs.

## What the program does

1. Takes a user brief, story ID, category and existing location ID.
2. Calls Groq's OpenAI-compatible Chat Completions API. Its API key is read only from the GROQ_API_KEY environment variable on the **developer machine**, not the browser.
3. Requests 2–4 original second-person branches with distinct successes/failures, precise challenges, specific NPC stakes and explicit narrative consequences.
4. Performs deterministic structural checks for genuine game stat IDs, location IDs, effect types, unique IDs, existing-content collisions, outcome word counts, challenge failures, reward sanity and repetitive prose.
5. Sends a mechanically valid draft for separate AI developmental editing, scored for voice, originality, clarity, continuity, meaningful player agency and consequences (six scores out of ten).
6. Revises up to three times when checks or editorial critique reveal problems. Saves every attempt and report in content/storylet-generator/drafts/ID.json.
7. **Never publishes automatically**. A human editor must read the entire draft and consequences, write specific review notes and explicitly approve.
8. Compiles only approved, checksum-protected sources into the real game's content registration file, then GitHub CI can validate the build.

An AI self-rating is NOT evidence that prose is excellent or lore-consistent. This pipeline still requires a human editor and actual playtest before mass publication.

## Set up Groq

Use a Groq API key issued to you (none was available during initial implementation). Do not paste it into the GitHub repository, client-side JavaScript, a public chat, or a screenshot.

In PowerShell, set the environment variable in your own terminal:

    $env:GROQ_API_KEY = Read-Host "Groq API key"

You may optionally set GROQ_MODEL or pass --model. Default: llama-3.3-70b-versatile, subject to Groq availability. Groq usage can incur charges and rate limits; check your account before running many drafts.

## Generate → review → approve → build

From this repository's root directory:

    node tools/storylet-generator.mjs locations

Select an existing place ID. Then:

    node tools/storylet-generator.mjs generate --id archive_witness_01 --location PLACE_ID --kind story --brief "A civic clerk begs you to protect a witness. Choices: examine falsified records, negotiate with the clerk, or help the witness escape. Make each choice morally and mechanically different."

The draft appears in content/storylet-generator/drafts/archive_witness_01.json with the machine validation and AI review report. The generated content is NOT in the game yet.

    node tools/storylet-generator.mjs validate --id archive_witness_01

Read, revise (by editing the draft or regenerating after archiving/removing an unsatisfactory draft), and check every NPC, fact, stat, failure, cost and choice. The editor then approves:

    node tools/storylet-generator.mjs approve --id archive_witness_01 --reviewer "Human editor" --notes "I checked the prose, all choice effects, available location and continuity." --confirm
    node tools/storylet-generator.mjs publish
    npm test

Commit approved JSON and generated game files together, preferably in a pull request. GitHub CI runs the strict stale-generated-bundle check.

Other commands:

    node tools/storylet-generator.mjs publish --check
    node tools/storylet-generator.mjs help

### Supported categories at this stage

- **story**: self-contained once-only original location encounters with 2–4 player branches
- **card**: original opportunity cards using location-aware eligibility; added to the existing deck

Both games already have elaborate personal ambitions and chapter flags. **Do not automatically splice an AI-generated chapter into an existing ambition**. That needs a separate chain-specific generator with verified gates, branch convergence, save migrations and full playthrough tests.

The example Gloomwing request in the supplied master prompt is useful as a narrative specification. But NeathBound ALREADY contains an authored 30-chapter Gloomwing quest with existing progress and storylet IDs. The generator explicitly protects existing IDs and currently prevents unsafe automatic ambition-chain rewrites.

### Different games, different live mechanics

**NeathBound** currently uses Nerve, Insight, Poise and Shadow, Obols and the menaces Suspicion, Dread, Wounds and Scandal. Its native storylets use title/text, choices, challenge.quality, successEffects/failureEffects arrays and fixed location story lists. Published approved material is compiled into src/game/approved-storylets.js, connected to the location registry and relevant opportunity deck, then mirrored for the legacy Supabase function.

**The Undercity** uses Observation, Guile, Persuasion and Resolve, Coin, Clues, Health and Sanity, and its own suspicion/notoriety penalties. Its native storylets use id, where, choices, stat/difficulty, effects/fail objects and victory/failure prose. Approved entries are compiled into content/approved-storylets.generated.js and loaded before the main game boots.

The supplied master prompt uses a third, proposed JSON schema. Our program deliberately translates a common authoring structure into **the existing code in each repo** instead of pretending the source prompt can be dropped straight in. The existing rules engine, not model-written formulas, decides challenge rolls, automatic experience, and penalties.

### Accepted draft structure

A draft JSON document has two top-level keys: storylet and report. A storylet contains:

- id, title, location, rarity ("story" or "card"), description
- options: 2–4 entries with id, text, optional action_cost:1 and optional challenge: {stat,difficulty}
- success: {text,effects:[]}; failure: {text,effects:[]} mandatory for skill checks
- effects: {type:"stat"|"menace"|"currency"|"item", id, delta: integer}, or {type:"flag", id:"generated:...", set:true}
- optional editorial notes

The game validates all referenced items against its known item registry. It will not invent new qualities/items or accept references to unimplemented storylets. No arbitrary JS expressions are accepted in AI output.

### Quality standards and limitations

Before approving, the human reviewer must verify:
- Is there a real character with a concrete want and meaningful stakes?
- Does the writing sound like this game's own distinct world, not copied prose from Fallen London?
- Are the option verbs, failure results, rewards and moral consequences substantially different?
- Is each branch genuinely available to the intended player, with no dead end?
- Does this scene contradict an existing clue, NPC, ambition, item or historical fact?
- Could the player understand where to go next without sacrificing narrative mystery?
- Are the writing, content warnings and image requirements appropriate?

Automatic checks reject unknown stats, places and item references, duplicated outcomes and duplicate IDs. They **cannot prove** the story is artistically excellent, or that every possible state stays reachable.

**Not included yet:** a web-based secret-entry UI, shared team workflow, actual Groq-call verification with a paid key, automatic premise/lore retrieval, automatic full ambition chains, new item definitions, automated continuous background generation, and full simulator QA for every generated branch. The CLI is an executable first version, and human editorial approval is a safety requirement, not an inconvenience.

## Production safety

The generator is local/CI development tooling only. Never add a client-side Groq key to the game. Never publish drafts automatically from an incoming API response. Don't run large unreviewed batches or silently alter existing quests/saves. The game and its content remain original creations.
