# Fallen London mechanics and NeathBound lingo

Companion to [`FALLEN-LONDON-SYSTEMS-PARITY.md`](FALLEN-LONDON-SYSTEMS-PARITY.md),
which sets the design rule and build order. This file adds the two things that
roadmap leaves open:

1. a **glossary**: every Fallen London term mapped, by its *role in the game*,
   to NeathBound's own name (reusing the names the roadmap already chose);
2. the **exact mechanics and numbers**, from the Fallen London Wiki, so engine
   work can match them.

The same design rule applies: copy system shape, never names, prose, lore,
characters or story beats. Swapping names on Fallen London's text would still be
copying its writing, so every storylet stays original.

## 1. Glossary

### Places (mapped by role, not by story)

| Fallen London | Role in the game | NeathBound |
|---|---|---|
| Your Lodgings | home base; sets card hand size | your **Refuge** |
| Moloch Street | early city district reached via the starting storylines | **Buckland Street** (new early district) |
| Ladybones Road / Spite / Veilgarden / Watchmaker's Hill | starting districts where the four stat storylines begin | **Lantern Quay**, **The Velvet Market**, **The Hollow Archive**, **The Clockwork Gardens**, one per early track |
| Mrs Plenty's Carnival | amusement district with games of chance | **The Tallow Fair** (new) |
| The House of Chimes | exclusive high-society club, mid-game | **The Bellglass Salon** (new) |
| The University | Watchful-track academic district | **The Hollow Archive** (existing) |
| New Newgate Prison (Suspicion 8) | menace consequence area | **The Holding Vaults** |
| A state of some confusion (Nightmares 8) | menace consequence area | **The Pale Rooms** |
| The boat on the dark river (Wounds 8) | menace consequence area | **The Stitchery** |
| Tomb-Colonies exile (Scandal 8) | menace consequence area | **The Whisper Court** |
| The Unterzee (ships) | sea travel and expeditions | **Undercurrent voyages** |
| The Hinterlands railway | late-game construction project | **Deep tram** |
| The Roof / high places | aerial late-game exploration | **Cableway expeditions** |
| The Parabola (dream-world) | mirror/dream realm | **The Glass Observatory's far side**, working name **The Reflecting Shelf** |

### Character and progression

| Fallen London | Role | NeathBound |
|---|---|---|
| Watchful / Shadowy / Dangerous / Persuasive | the four main stats | **Insight / Shadow / Nerve / Poise** (existing) |
| Change Points (CP) | experience units that raise a quality | **Progress** (1 progress point = 1 CP) |
| Making Your Name (4 storylines) | guided early-game tracks, one per stat | **A Name Written in Margins** (Insight), **A Footstep Nobody Claims** (Shadow), **A Reputation Forged in Brass** (Nerve), **A Voice Heard Through Velvet** (Poise) |
| Second Chances (four kinds, one per stat) | consumables: retry a failed challenge | **Recalled Lessons**: *Steadied Hand* (Nerve), *Second Glance* (Insight), *Borrowed Composure* (Poise), *Quiet Exit* (Shadow) |
| Quirks | personality qualities | **Temperaments** |
| Accomplishments | permanent badges for milestones | **Marks** |
| Acquaintances | named contacts with a relationship level | **Acquaintances** (existing) |
| Ambitions | one long personal storyline chosen early | **Vows** |
| Professions (training, then tiered) | a job with weekly rewards | **Trades** |
| Factions, Favours, Renown, Connected | reputation systems | **Circles**: Favours = **Regard** (short-term, spendable), Renown = **Standing** (long-term) |
| Dreams | slow-changing inner-life qualities | **Undertows** |

### Economy, cards and the world

| Fallen London | Role | NeathBound |
|---|---|---|
| Obols | currency | **Obols** (existing; see note below) |
| Bazaar | shop to buy and sell | **The Exchange** |
| Opportunity cards / the deck | random, portable encounters | **Whispers Deck** (cards are **Whispers**) |
| Card borders: bronze / silver / gold | rarity | **tin / silver / gilt** |
| Carousel / grind | repeatable multi-action loop | **Rounds** |
| Airs of London | hidden 0–100 randomiser | **The City's Mood** |
| World Qualities | state shared by all players | **City Conditions** |
| Actions candle (limited actions) | action economy | **none**: NeathBound keeps unlimited actions (DECISIONS.md) |
| Fate (paid currency) | premium content | **none**: no payments (AGENTS.md) |

### Naming risks to fix

These current NeathBound names are identical to Fallen London's, not just similar:

- **Tab labels:** STORY, MESSAGES, MYSELF, POSSESSIONS, BAZAAR, FATE and PLANS are Fallen London's exact tab set. Suggested: **Tales, Letters, Self, Satchel, Exchange** (already the roadmap's name), **Plans**, and drop **Fate**, since there are no payments.
- **Obols** is Fallen London's currency name. It's a common word, but in this setting it reads as borrowed. Consider **Chimes** or **Tallies**.
- The four early-track titles are original, but *A Name Written in Margins* follows Fallen London's "A Name …" title pattern. The other three don't; keep new titles off that pattern.

## 2. Mechanics and numbers

### Leveling: the progress pyramid

- Reaching level *n* costs *n* progress points: level 1 = 1, level 2 = 2 more, level 3 = 3 more. The total to reach level *n* is the triangular number n(n+1)/2.
- Main stats: from level 70, each further level costs a flat 70. Menaces and similar qualities flatten at 50.
- Qualities can therefore rise by progress (partial) or jump by whole levels.

*NeathBound today:* effects add whole levels directly. **Add a `progress` effect type** that accumulates points and levels up via the pyramid.

### Challenges

**Broad challenges** (most stat checks):

```
chance = clamp(0.6 × statLevel / difficulty, 0, 1)
```

So you have a 60% chance when your stat equals the difficulty.

**Narrow challenges** (small-number progress qualities):

```
chance = clamp(0.5 + 0.1 × (level − difficulty), 0.1, 1.0)
```

That's 50% at the target level, ±10% per level either side, never below 10%.

**Luck challenges** use a fixed chance that no stat changes.

**Labels and progress rewards** (show the label and percentage before the player chooses):

| Label | Chance | Success | Failure |
|---|---|---|---|
| Straightforward | 91–100% | 1 | 1 |
| Low-risk | 81–90% | 2 | 1 |
| Very modest | 71–80% | 2 | 1 |
| Modest | 61–70% | 2 | 1 |
| Chancy | 51–60% | 3 | 1 |
| Very chancy | 41–50% | 3 | 1 |
| Tough | 31–40% | 4 | 2 |
| High-risk | 11–30% | 5 | 3 |
| Almost impossible | 1–10% | 6 | 4 |

Failure still grants progress, so failing is never wasted.

*NeathBound today:* a d10 roll plus the stat level against the difficulty, with no displayed percentage and no progress on failure. **Switch to the broad formula**, show the label and percentage on each branch, and award progress by band.

**Recalled Lessons** (second chances): when a challenge fails, a matching Lesson can be spent to retry once. Alternatively, five Lessons of one kind can be exchanged for a stat boost.

### Menaces

- Four menaces, each tied to a stat: Dread (Insight), Suspicion (Shadow), Wounds (Nerve), Scandal (Poise). They rise on the same progress pyramid.
- **Level 5:** a warning Whisper that can't be discarded appears.
- **Level 8:** the player is sent to the menace's consequence area (see places above). Each area is playable, with recovery storylets, not game over.
- Reduce menaces through location storylets, consumables, help from other players, and equipment that dampens gains.
- **Slow natural healing:** a weekly tick removes 2 progress from Wounds and 1 from each other menace.

### Whispers Deck (opportunity cards)

- **Hand size** is set by your Refuge: 2 at the start, up to 5 at the best Refuges (remote Refuges hold 3).
- Most Whispers can appear anywhere; some areas have their own deck that replaces the city deck while you're there, with a separate hand.
- **Rarity:** common (no border), tin, silver and gilt. Gilt is often once-only.
- Most Whispers can be discarded; some can't, and leave only when played or when their requirements stop being met.
- `src/game/decks.js` already does weighted, requirement-filtered draws. It needs hand, discard and refill rules, and the UI.

### Early tracks (Making Your Name equivalent)

- Four tracks, one per stat, each with **7 stages**. Finishing a stage raises the track's progress quality by 1.
- Each track starts in its own district and unlocks the next areas as it advances. This is the main way early stats rise.

### The City's Mood (randomiser)

- A hidden quality from 0 to 100, re-rolled by actions that depend on it.
- Storylets and branches require a range (e.g. 0–25, 33–67, 96–100), so the same place offers different options on different visits.

### Circles (factions)

- **Regard** (favours) is capped at **7** per Circle. It's gained by pleasing the Circle and spent to call in rewards; a Favour is worth roughly 4 Obols of value.
- **Standing** (renown) rises slowly, almost never falls, and unlocks options.
- A few special relationships use a separate **Connected**-style quality.

### Trades (professions)

- One Trade at a time; you can resign and change.
- **Starter Trades** (one per stat): a weekly grant of +250 progress to the matching stat until it reaches 70.
- **Advanced Trades:** 6 lines × 3 tiers.
  - Tier 1 costs 5 Regard with a Circle.
  - Tier 2 needs Tier 1 and a notability level of 2.
  - Tier 3 adds notability 5 and a very hard challenge.
  - Each tier gives an equipment item and a weekly reward, and Tier 3 unlocks special activities.

### Items and the economy

- Goods sit in categories (e.g. curiosities, rumours, maps, relics, glass) with **tiers 1–5**.
- Rounds and grinds make low-tier goods. Tiers 1–4 can be **upconverted** into the next tier, and tier 3 allows **cross-conversion** between categories.
- **Equipment slots:** hat, clothing, gloves, weapon, boots, companion, affiliation, transport, home comfort, treasure and tools of the trade. **Outfits** save a set of equipped items to switch between.

### Rounds (carousels)

A Round is a repeatable loop:
1. Build a temporary progress quality (e.g. an investigation, casing a target, preparing an event), with a complication meter alongside.
2. Cash it out at a threshold for rewards scaled by the progress built.
3. Repeat.

This is the roadmap's "generic Activity engine".

## Sources

Fallen London Wiki:
[Beginner's Guide](https://fallenlondon.wiki/wiki/Beginner's_Guide),
[Leveling (Guide)](https://fallenlondon.wiki/wiki/Leveling_(Guide)),
[Broad difficulty](https://fallenlondon.wiki/wiki/Broad_difficulty),
[Narrow difficulty](https://fallenlondon.wiki/wiki/Narrow_difficulty),
[Luck](https://fallenlondon.wiki/wiki/Luck),
[Menaces (Guide)](https://fallenlondon.wiki/wiki/Menaces_(Guide)),
[Cards](https://fallenlondon.wiki/wiki/Cards),
[Making Your Name (Guide)](https://fallenlondon.wiki/wiki/Making_Your_Name_(Guide)),
[The Airs of London](https://fallenlondon.wiki/wiki/The_Airs_of_London),
[Factions (Guide)](https://fallenlondon.wiki/wiki/Factions_(Guide)),
[Second Chances (Guide)](https://fallenlondon.wiki/wiki/Second_Chances_(Guide)),
[Professions (Guide)](https://fallenlondon.wiki/wiki/Professions_(Guide)),
[Items (Guide)](https://fallenlondon.wiki/wiki/Items_(Guide)),
[Item Grinding (Guide)](https://fallenlondon.wiki/wiki/Item_Grinding_(Guide)),
[Places](https://fallenlondon.wiki/wiki/Places),
[Category:Items](https://fallenlondon.wiki/wiki/Category:Items).
