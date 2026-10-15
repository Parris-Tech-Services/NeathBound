# Fallen London comparison and next development priorities

Verified source snapshot: 16 October 2026. Agent 1 integration/playtest pass.

This is a comparison of public mechanics and our original games. It does not claim identical proprietary internals or reuse another game's writing, setting, code, artwork or UI assets.

## Content scale and playtime

| Inventory | NeathBound | The Undercity |
| --- | ---: | ---: |
| Runtime storylets | 234 | 352 |
| Storylet choice branches | 609 | 854 |
| Opportunity cards | 22 | 18 |
| Approximate narrative words | 29,869 | 48,732 |
| Estimated exhaustive reading/branch testing, waiting disabled | 6–12 hours | 10–20 hours |

Counts exclude unpublished drafts. Words count text, descriptions, titles, branch labels and success/failure/result fields in runtime storylets/cards. They exclude most interface text, item descriptions and prose embedded in functions; they are approximate rather than an exact literary manuscript count. Branch totals exclude card choices. Mutually exclusive ambitions/endings require separate runs or exported saves. Estimates include navigation and replay but are not measured full-completion times. Normal action regeneration, skill training, rare cards, timed letters and material gates can spread play across days or weeks. Repetition is not additional unique writing.

Failbetter's official game page currently advertises 4.5 million handcrafted words: https://www.failbettergames.com/games/fallen-london . Our text counts are roughly 0.7% and 1.1% of that scale; comparable menus do not establish comparable depth.

## Comparison

| Area | Present in both games | Remaining gap / priority |
| --- | --- | --- |
| Quality-based narrative | Story gates, item/quality requirements, branching outcomes and persistent progress | More decisions that change later NPC behaviour, available scenes and endings; fewer convergent/template branches |
| Story browsing | NeathBound has grouped previews; this pass adds compact, single-open-story previews to Undercity | Continue evaluating priority sorting, locked-choice explanations and long-running plot tracking |
| Free preview/back-out | Story opening/backing out do not resolve a choice or spend actions; explicit free back controls in this pass | Test keyboard focus and mobile reading position on every navigation path |
| Action receipt | Dedicated outcome view, visible gains/losses and return navigation | Persistent journal entries need clearer quality history and milestone explanations |
| Cards | Separate random opportunity hand, eligibility, weighted draws and card retention | Only 22/18 authored cards; wider character/location-specific pools and more meaningful return encounters |
| Abilities and equipment | Four core abilities, CP growth, difficulty checks, equipment bonuses | Tune useful early progression paths and ensure risk/reward feels distinct rather than only numerically different |
| Careers and major stories | Profession systems and multi-stage ambitions exist | Full playtesting and stronger authored divergence; chapter counts alone are not depth |
| Menaces | Recovery locations and consequences exist | Richer recovery encounters and recognisable recurring NPCs |
| Economy and cadence | Regenerating actions and material rewards | Starting cap is 10 with unlockable cap 20, not Fallen London's ordinary 20; no paid refills/subscriptions. This pass deliberately does not change resource balance |
| Social play and longevity | NeathBound has an online-save backend; Undercity saves locally | No demonstrated equivalent to a mature social-action system, years of recurring events, vast endgame or ongoing monthly editorial production |

## This release

- Undercity: native keyboard-accessible story previews with one scene open at a time, available-choice counts, a free return to previews, and reopening the source story after a result.
- NeathBound: explicit free return to previews; retain the open story during UI redraws; correct stale plus/minus indicators after another preview opens.
- Gameplay rules, save schemas, story prose and rewards are unchanged.

## Next ordered work

1. Reproduce success and failure on all first-hour progression gates in both games.
2. Expose quality requirements and exact missing resources consistently.
3. Make the first profession promotion and earned reward unmistakable.
4. Expand meaningful card eligibility and recurring-character callbacks.
5. Deepen one ambition's decisions and downstream consequences before adding more chapter volume.
6. Audit repeatable rewards against material sinks and recovery costs.
7. Add social mechanics only with a defined backend/privacy/save design.

## Reference sources

- Official overview and content scale: https://www.failbettergames.com/games/fallen-london
- Official game landing: https://www.fallenlondon.com/
- Public community explanation of free previews/backing out: https://community.failbettergames.com/t/advice-for-new-players/9516?page=12
- Historical developer timer explanation (not evidence of every current detail): https://community.failbettergames.com/t/actions-and-opportunity-cards-timer-update/14700

Validation: run the repository release/static build and browser journeys, including free back-out, retained actions/currency, single-open-story behaviour, result focus and save reload. Live manual verification is required after deployment; this document does not assert every branch has been played.
