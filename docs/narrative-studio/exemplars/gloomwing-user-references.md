# User-supplied Gloomwing references

Source: Josh's message, 16 October 2026. Status: candidate voice references and proposed scenes, not canon, curated "perfect" exemplars, approved skeletons or playable content. Preserve this source for the separate critic. Shorthand effects and difficulties below are the supplied proposals, not validated runtime JSON.

## 1. The Claims Desk — comic

Proposed location: Bureau of Threat Abatement, Gloomwing stage 0. Proposed NPC: Mr Pell, whose motif is raising and lowering his stamp before each sentence.

The Bureau keeps one desk for Gloomwing claimants. The sign above it reads *CLAIMANTS MUST PRESENT A GLOOMWING*. Mr Pell stamps a form without looking at it. “Four million Lumens,” he says, “and not one paid. I mention this so you can't say you weren't told.”

- Insight (6): Read the rejected-claims ledger upside down.
  - Success: Every rejection cites the wrong *date*, never the wrong beast. Someone is being fed a calendar. (+1 progress; `ledger_dates_wrong`.)
  - Failure: Pell turns the ledger face-down. “Reading is a separate form.” (+1 Suspicion.)
- Poise (5): Request the claim form, in triplicate, politely.
  - Success: Pell lowers the stamp and, for the first time, looks at you. “Don't trust the Spire entry date. Nobody who filed it has come back to correct it.” (+1 progress; `pell_wary_ally`.)
  - Failure: You are directed to the back of a queue that has been the same length since before you arrived. (Lose 1 action.)
- Shadow (7): Press his stamp into your sleeve while he reaches for ink.
  - Success: The mark is a little blurred, but it will pass at a quick glance. (Item `bureau_stamp_forged`.)
  - Failure: “That,” says Pell, “was a stamp.” (+1 Scandal.)
- Leave without a form. Free. Sets `bureau_unsure`.

Supplied seeds: wrong dates, Pell's confidence and a forged stamp paying off in scene 3.

## 2. Salt and Wick — silent

Proposed location: Duskwater. No character on screen; an absent name, Odile Vane, lamp-trimmer.

The cottage door hangs open on a table laid for two. One bowl is empty, and the other still steams. A lamp-trimmer's knife lies across the saucer, and the wick-ledger on the sill stops mid-line. Along the lintel, four long scratches run well above any door a person could use.

- Insight (6): Read the ledger and the scratches.
  - Success: The last entry is dated a week from now. (+1 progress; `vane_ledger_future`; +1 Dread.)
  - Failure: The ink swims, and you leave with a headache and no answer.
- Nerve (6): Sit at the second place and eat.
  - Success: The soup is still warm and perfectly good. Your hands stop shaking. (+1 progress; `ate_vanes_supper`.)
  - Failure: It tastes of lamp-oil and iron, and you finish it out of stubbornness. (+1 Dread.)
- Shadow (7): Take the knife and the key beside the lamp.
  - Success: Item `vane_trimmers_key`.
  - Failure: The door swings shut behind you, and you hear the latch drop. (+1 Suspicion.)
- Close the door and go. Sets `vane_cottage_seen`.

Supplied seeds: Odile Vane, the future date and a key opening something at the Spire. No actual consumer has been implemented.

## 3. The Price of a Claim — cruel dilemma

Proposed location: Lantern Quay infirmary. Proposed NPC: Hesper Quill, a dying Bureau tracker; her motif is counting on her fingers, always one finger short.

Hesper has one claim-token left, and it is the only pass the Spire's gate-warden still honours. She counts her breaths on three fingers and loses track. “My daughter's on the Quay. Take it to her. Or take it up the Spire, and spend it on the thing that's killing me. I'd rather you did one of them *honestly*.”

- Nerve (5): Carry it to the daughter.
  - Success: The girl takes it with both hands. She says nothing. She will remember who carried it. (`quill_debt_repaid`; the Spire door stays shut for now; +1 Scandal avoided later.)
  - Failure: The daughter isn't at the Quay. You've lost two actions finding her.
- Keep it and go up the Spire.
  - Success path: You hold the pass. (+2 progress; `quill_claim_token`; `hesper_betrayed`.) The daughter will learn it later. (Seed: +1 Scandal in four storylets.)
- Poise (8): Ask her to sign a copy.
  - Success: Hesper laughs until it hurts. “Both, then. Greedy.” (+1 progress; both outcomes; copy-token valid for one door only.)
  - Failure: Her hand closes over yours. “No.” (+1 Suspicion.)
- Shadow (6), requiring `bureau_stamp_forged`: Swap in a forgery.
  - Success: The daughter gets a good-enough token, and you get the real one. Neither of them knows. (+2 progress; `forged_the_dying`; +1 Dread.)
  - Failure: The warden's seal doesn't match. (+1 Scandal.)

Supplied seeds: the daughter's name (not yet supplied), Spire pass and deferred Scandal. The supplied text does not define all exit/retry consumers, exact costs, progression integration or declarations; the pitch packets keep those questions open.
