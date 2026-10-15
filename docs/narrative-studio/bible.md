# NeathBound Project Bible — original world, living reference

**Authority:** These are the current playable world's established elements; proposed material in `secrets.md` is not canon until approved. Update this bible with each shipped revelation. Cross-check `src/game/content.js`, `src/game/qbn-expansion.js`, `src/game/gloomwing-content.js`, and `docs/NARRATIVE-CLARITY.md`.

## Premise
Beneath a stony sky, a crowded city relies on lamps, files and agreements. In Lantern Quay, neighbours bargain for passage and light while clerks insist the accounts are precise. No account is precise enough to explain the people who have gone missing from the registers.

You begin in the locked Lair with an official identity that does not belong to you. A bell-marked trail runs through the Hollow Archive, the Glass Observatory and the Registry of Hours. You can recover evidence, but doing so attracts institutions skilled in changing what a city remembers.

Beyond the opening mystery lie incompatible personal obligations: the Gloomwing hunt, a missing name, the last light, the river's debt and the stolen hour. None should be reduced to one villain or one correct choice. Every branch must preserve a consequence that matters later.

## Tone: ten constraints
1. Write in second person, present tense. 2. Gothic detail comes from everyday labour. 3. Give the player a concrete aim before the strange detail. 4. Dry wit, never a punchline.
5. No flattering the player. 6. A choice can succeed and still cost something. 7. Distinguish evidence from speculation. 8. Never remove player agency through a hidden retcon.
9. Let warmth emerge from choices, not sentimental claims. 10. End scenes with an altered relationship, question, resource or route.

## Primary stats
- **Nerve:** risk, endurance and confrontation.
- **Insight:** evidence, deduction and observation.
- **Poise:** diplomacy, trust and presenting a case.
- **Shadow:** stealth, concealment and misdirection.
All new challenge definitions must use these IDs, not stats from a different game.

## Menaces and consequence hubs
- **Dread:** The Pale Rooms.
- **Scandal:** The Whisper Court.
- **Wounds:** The Stitchery.
- **Suspicion:** The Holding Vaults (with a capped permanent criminal record).
Do not invent or overwrite penalty effects without an engine test.

## Dispositions
Use the existing quirk names and opposite pairs defined in `src/game/rules.js`: austere/hedonist, magnanimous/ruthless, steadfast/fickle, honest/devious and the documented three-way daring/subtle/forceful opposition. All are CP-based with cap 15. Do not silently reclassify a quality.

## Factions and institutions
- Lamplighters: practical custodians of public light.
- Archivists: collectors and custodians of dangerous records.
- Ferrymen: navigators of inaccessible waterways.
- Velvet Houses: patrons who turn gifts into obligations.
- Brass Union: enforcers and negotiators of civic contracts.
- Roof Surveyors: investigators of the stone roof and its risks.
Keep the six existing circles; the five-faction count in the generic template is not binding.

## Locations and continuity anchors
The Lair; Lantern Quay; Hollow Archive; Glass Observatory; Velvet Market; Clockwork Gardens; Ashrail Station; Cinder Ward; Registry of Hours; Duskwater; Black Spire; Bureau Hall. These are twelve established narrative anchors, **not** a promise that the game has only twelve locations or fixed adjacency. Read location IDs and routes directly from `src/game/content.js` before authoring movement.

## Central mystery
An official record can deny a living person's existence; the city seems to remember people through objects, bells and contradictory archives. The exact responsibility for the erasures remains something the game must investigate, not an answer this document invents.

## Vocabulary: twenty house terms
Unmoored (player epithet), Obols (currency), Lair (opening chamber), Lantern Quay (harbour), Hollow Archive (record house), Glass Observatory (sky watcher), Ashrail (rail corridor), Cinder Ward (work district), Registry of Hours (time office), Duskwater (foggy quarter), Black Spire (oath-bound tower), Bureau Hall (hunter's office), Gloomwing (contested quarry), Dread (menace), Poise (stat), Nerve (stat), Insight (stat), Shadow (stat), River Debt (ambition), Last Light (ambition).

## Forbidden imports
Do not borrow protected prose, characters, story situations, illustrations or distinctive references from Fallen London or StoryNexus. In new published prose disallow the proper names: **Mr Eaten, Unterzee, London, Stolen River, Echo Bazaar, Exceptional Friend, StoryNexus**. These names may appear in scholarly/research documentation, never player-facing drafts.

## Change control
Every accepted new fact gets a ledger ID, reveal depth, NPC keeper, counterevidence and revision date. Never let an AI invent secret canon based on its own earlier draft.