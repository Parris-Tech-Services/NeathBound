# NeathBound: Fallen London-inspired systems parity roadmap

This document is a mechanics-and-UX reference only. NeathBound should reproduce useful system patterns and onboarding ideas while keeping all names, prose, art, characters, lore, story beats and distinctive presentation original.

## Design rule

Copy **system shape**, not copyrighted expression.

Safe to adapt:
- onboarding structure
- progressive UI unlocking
- storylet/branch mechanics
- four-stat progression tracks
- challenge probabilities and difficulty labels
- qualities/flags as story state
- menaces and consequence zones
- opportunity-card style random content
- inventory categories and equipment slots
- outfits/loadouts
- shops and item economy
- long-form character goals
- home-base/lodgings systems
- factions/renown/favours-style reputation
- professions
- social actions
- world-state qualities
- repeatable activities/carousels
- expeditions, investigations and project progress
- travel and region gating
- seasonal/event framework
- endgame prestige systems

Do not copy:
- Fallen London names
- story text or close paraphrases
- character identities
- locations
- item names
- distinctive lore
- art or iconography
- exact story sequences or narrative twists

## 0. First visit / public front page

Fallen London pattern:
- public atmospheric landing page before the game
- premise in one compact paragraph
- obvious Play/Create Account and Log In routes
- testimonials/feature framing below the fold
- user can reach the fiction before being overwhelmed by the game UI

NeathBound equivalent:
- branded landing page for logged-out/first-time visitors
- original premise: a buried city whose lamps remember people who pass beneath them
- **Enter the City** primary CTA
- **Continue** if a local or server save exists
- small feature strip: story-driven, browser-based, choices persist
- preserve current immediate loader after the CTA

Status: DONE

## 1. Opening tutorial location

Fallen London pattern:
- brand-new character begins in a constrained prison/tutorial area
- escape provides a focused immediate objective
- opening teaches storylets, branches, challenges and qualities
- modern tutorial progressively unlocks Possessions, Bazaar and travel instead of showing everything at once

NeathBound equivalent:
- opening location: **The Lair**
- premise: player wakes beneath a sealed municipal undercroft used to hold people the city has "misremembered"
- one objective: get out
- four escape approaches each preview one core quality:
  - Nerve
  - Insight
  - Poise
  - Shadow
- first failures still improve the tested quality
- introduce outcome panel, item gain, menace gain and journal entry one at a time
- tutorial unlock flags:
  - tutorial.story
  - tutorial.myself
  - tutorial.possessions
  - tutorial.travel
  - tutorial.market
  - tutorial.cards
- only show tabs once introduced

Status: DONE

## 2. Arrival / staged interface unlock

Pattern:
- after escape, player enters the wider city
- core interface systems are introduced gradually
- tutorial storylets explain each system in-context

NeathBound:
- arrive at Lantern Quay
- a short "First Night Beneath" tutorial chain unlocks:
  1. MYSELF
  2. POSSESSIONS
  3. travel
  4. Market
  5. Opportunity deck
  6. Plans
- each unlock is attached to an original story event, not a popup-only tutorial

Status: DONE

## 3. Four parallel early-game progression tracks

Pattern:
- four main attributes each have a guided early-game storyline
- tiered story progress is tracked separately from raw stat level
- completing milestones unlocks new areas and systems

NeathBound equivalents:
- Nerve track: **A Reputation Forged in Brass**
- Insight track: **A Name Written in Margins**
- Poise track: **A Voice Heard Through Velvet**
- Shadow track: **A Footstep Nobody Claims**

Each:
- has a dedicated progress quality
- contains 5-7 milestone stages
- mixes repeatable stat-building content with one-off key stories
- grants a signature keepsake
- unlocks a second-tier location/activity
- introduces a reusable mechanic such as investigation, influence, casing or preparation

Status: PARTIAL — raw qualities and story flags exist; structured track progress does not.

## 4. Challenge model

Pattern:
- branch checks against an attribute
- interface communicates difficulty / success chance
- failures often advance skill and still produce story
- some checks use secondary progress qualities
- later systems introduce advanced skills

NeathBound:
- keep existing quality-vs-difficulty checks
- add displayed percentage
- add "Second Chance" equivalent as original consumables, e.g. **Recalled Lessons**
- ensure failures can advance quality at lower levels
- add narrow checks against progress qualities for investigations/projects
- future advanced skills: Navigation, Glasscraft, Rhetoric, Anatomy, Machinery, etc., with original names and context

Status: DONE (basic challenge checks, progress pyramids, and Recalled Lessons all complete).

## 5. Storylets and branches

Pattern:
- location contains always-available storylets plus conditional storylets
- branches lock/unlock on qualities/items
- key progression stories are visually distinguished
- storylets can be repeatable, one-off, auto-firing, or redirect into sub-activities

NeathBound:
- retain current storylet engine
- add metadata:
  - importance: main / side / repeatable / ambition / tutorial
  - repeatability
  - autoFire
  - redirect activity
  - recommended quality
- visually distinguish priority/progression content

Status: PARTIAL

## 6. Opportunity deck

Pattern:
- random/replenishing cards create portable city-wide encounters
- hand size and deck can change with progression/equipment/subscription
- cards can be discarded, held and played later
- some are location-specific or quality-gated

NeathBound:
- **Whispers Deck**
- 3-card starting hand
- draw from eligible cards after actions or on timed refresh
- cards can be pinned, discarded, played
- location and quality requirements
- cards can start story chains, give resources or react to milestones
- home upgrades can increase hand size

Status: DONE (basic hand size 3, draw, discard, play).

## 7. Possessions / equipment / outfits

Pattern:
- extensive item inventory
- item categories
- equipment slots
- equipped items modify stats
- multiple saved outfits
- search/filter

NeathBound:
- existing Possessions page becomes:
  - Inventory
  - Equipment
  - Keepsakes
  - Documents
  - Curiosities
- equipment slots: Head, Coat, Tool, Gloves, Boots, Companion, Keepsake, Home, Affiliation, Vehicle
- item stat modifiers
- 3 free loadouts using current outfit concept
- search/filter/category side menu

Status: DONE (equipment slots, categories, effective stat bonuses, equip/unequip functionality).

## 8. Market / Bazaar equivalent

Pattern:
- dedicated shop tab
- many shops/categories
- buy/sell item economy
- progression can unlock specialist shops

NeathBound:
- **The Exchange**
- stalls/categories rather than copying Bazaar shops
- buy/sell common goods
- specialist sellers unlocked by locations/factions
- price/value metadata in item definitions
- search and category filters

Status: DONE (Currencies renamed to Obols; shops, buy/sell, resource classes, and exchange conversions implemented in Velvet Market).

## 9. Menaces and consequence locations

Pattern:
- several menace qualities rise through risky play
- thresholds send player into special consequence areas
- menace areas are playable rather than simple game-over states
- recovery becomes a story

NeathBound:
- existing Dread, Scandal, Wounds, Suspicion become fully systemic
- threshold 8 triggers a consequence location:
  - Dread -> **The Pale Rooms**
  - Scandal -> **The Whisper Court**
  - Wounds -> **The Stitchery**
  - Suspicion -> **The Holding Vaults**
- each location has its own escape/recovery storylets
- no permanent death/game over

Status: DATA EXISTS, CONSEQUENCE GAMEPLAY MISSING

## 10. Long-form Ambition equivalent

Pattern:
- one huge personal storyline chosen by the player
- provides a reason the character came to the setting
- spans early through endgame
- large callbacks elsewhere
- choices affect unique rewards

NeathBound:
- call these **Vows**
- choose after completing two early progression tracks
- four original premises, e.g.:
  - recover a name erased from every civic record
  - find the source of the false sunrise beneath the city
  - hunt the architect of a machine that predicts grief
  - win ownership of a door that opens into impossible places
- one active Vow at a time
- Vow state enables callbacks throughout unrelated stories
- multiple endings and unique equipment rewards

Status: NOT IMPLEMENTED

## 11. Home / lodgings equivalent

Pattern:
- own multiple lodgings
- one active home
- homes unlock content and affect opportunity hand size
- home becomes a hub for personal/social systems

NeathBound:
- **Refuges**
- first refuge awarded after tutorial
- acquire multiple addresses
- active refuge controls hand size and home actions
- refuge actions: rest, letters, plans, identity changes, contacts, trophies
- upgrade path

Status: DONE (ownership, active refuge, hand size constraints).

## 12. Plans

Pattern:
- save interesting locked branches for later
- surface requirements so player knows what to work toward

NeathBound:
- existing PLANS tab becomes real
- pin any locked branch
- show missing requirements
- jump back to relevant location/story if available
- auto-mark ready when requirements become satisfied

Status: NOT IMPLEMENTED

## 13. Journal / Messages

Pattern:
- record outcomes and communications
- persistent history helps players remember sprawling narrative

NeathBound:
- split current journal into:
  - Chronicle: important story outcomes
  - Messages: incoming timed/social/living-story events
- filter by story/location
- link milestones back to MYSELF

Status: PARTIAL

## 14. Timed/Living stories

Pattern:
- content can pause and resume after real time
- lets the world feel persistent

NeathBound:
- scheduled **Obols** / delayed replies
- story can set availableAt timestamps
- Messages tab announces arrival
- no monetised waiting required

Status: NOT IMPLEMENTED

## 15. Factions, favours and renown

Pattern:
- many factions
- repeatable favours
- long-term renown
- faction reputation unlocks options/rewards

NeathBound:
- **Circles**
- examples: Lamplighters, Archivists, Ferrymen, Velvet Houses, Brass Union, Roof Surveyors
- two-part relationship:
  - Obligations: short-term spendable favours
  - Standing: permanent reputation
- faction-specific branches and equipment

Status: NOT IMPLEMENTED

## 16. Professions

Pattern:
- choose a profession
- weekly payment/rewards
- tiered profession advancement
- profession-specific activities later

NeathBound:
- **Trades**
- entry trades unlocked from factions
- weekly stipend in goods/coin
- tier upgrades
- late-game profession activities

Status: NOT IMPLEMENTED

## 17. Investigations / projects / preparations

Pattern:
- many sub-games use a temporary progress quality
- build Investigation, Casing, Fascinating, Research, etc.
- cash progress out in a conclusion

NeathBound:
Generic Activity engine:
- progress meter
- secondary risk/complication meter
- eligible actions
- conclusion thresholds
- reusable templates:
  - Investigate
  - Prepare
  - Infiltrate
  - Research
  - Influence
  - Pursue

Status: NOT IMPLEMENTED AS GENERAL ENGINE

## 18. Repeatable carousels

Pattern:
- repeatable multi-action loops
- player builds progress and cashes out
- often optimized for resources

NeathBound:
- add repeatable city activities to each major location
- not narrative clones; original loops using generic Activity engine
- balance around optional optimization rather than mandatory grind

Status: NOT IMPLEMENTED

## 19. Travel / map

Pattern:
- many city districts
- unlockable routes
- later journeys use dedicated travel mechanics/decks

NeathBound:
- map view with discovered locations
- route qualities
- ordinary city travel free/cheap
- distant regions use journey deck
- vehicles unlock destination classes

Status: PARTIAL (dropdown travel only)

## 20. Advanced travel

Pattern:
- ship/rail/other journey systems become games themselves

NeathBound:
- **Undercurrent voyages** through drowned tunnels
- **Cableway expeditions** across the cavern roof
- **Deep tram** construction as a major late-game project
- travel deck, peril, progress, destination selection

Status: NOT IMPLEMENTED

## 21. Character identity/profile

Pattern:
- deep profile customisation
- portrait/cameo, descriptive identity, selected trophies and affiliations

NeathBound:
- expand MYSELF:
  - portrait/cameo choice
  - epithet
  - pronouns/title
  - active Refuge
  - active Trade
  - active Vow
  - displayed keepsake
  - profile header
- shareable read-only profile later

Status: PARTIAL

## 22. Social systems

Pattern:
- social actions and contacts can affect menaces/resources
- newer onboarding explicitly tutorialises social acts

NeathBound:
- optional Contacts
- send invitations / assistance / letters
- co-op aid never required for solo progress
- privacy-safe opt-in system

Status: NOT IMPLEMENTED

## 23. World qualities / living world

Pattern:
- server-wide values can change activities for everybody

NeathBound:
- **City Conditions**
- weekly server-wide modifiers such as flood level, lamp failures, market hunger, archive unrest
- alter branches/rewards
- visible from Story page

Status: NOT IMPLEMENTED

## 24. Seasonal events

Pattern:
- recurring annual festivals/events
- limited-time stories and rewards

NeathBound:
- event framework with start/end timestamps
- original recurring festivals tied to city calendar
- preserve old rewards through later catch-up paths

Status: NOT IMPLEMENTED

## 25. Midgame prestige threshold

Pattern:
- a major character-importance milestone opens midgame systems

NeathBound:
- **A Person the City Must Account For**
- requires several early progression tracks and suitable qualities
- unlocks professions tier 2, advanced projects, governance/social prestige, major routes

Status: NOT IMPLEMENTED

## 26. Endgame specialisations and advanced skills

Pattern:
- base stats can exceed old caps
- advanced skills matter in high-level content
- prestige achievements demonstrate mastery

NeathBound:
- quality caps progress by milestone
- advanced skills with small numeric scales
- four prestige specialisations
- final all-round prestige title

Status: NOT IMPLEMENTED

## 27. Search/filter/navigation quality of life

Pattern:
- search on Myself/Possessions/shop
- category side menus
- responsive layouts

NeathBound:
- search/filter on MYSELF, POSSESSIONS, Exchange
- category navigation
- mobile dropdown categories

Status: NOT IMPLEMENTED

## Recommended build order

### Phase A — onboarding parity
1. public landing page
2. first-time save detection
3. The Lair tutorial
4. progressive tab unlocking
5. First Night Beneath tutorial
6. four early progression tracks

### Phase B — core systems
7. Whispers opportunity deck
8. Exchange
9. equipment/loadouts
10. Plans
11. menace consequence areas
12. generic Activity engine

### Phase C — identity and long-term play
13. Refuges
14. Circles
15. Trades
16. Vows
17. expanded profile
18. timed stories/messages

### Phase D — world scale
19. full map
20. advanced travel
21. seasonal events
22. City Conditions
23. prestige/endgame systems
24. social features

## Immediate next implementation target

Build **Phase A1-A4** together:
- public front page
- Enter / Continue behaviour
- The Lair first-location state
- tutorial completion flag
- hidden/locked tabs until tutorial introduces them

This is the highest-value next change because it fixes the current problem where a brand-new player immediately sees a mature account-style interface with no guided context.
