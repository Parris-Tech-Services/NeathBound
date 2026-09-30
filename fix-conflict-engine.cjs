const fs = require("fs");
let content = fs.readFileSync("src/game/engine.js", "utf8");
content = content.replace(/<<<<<<< HEAD.*?=======.*?>>>>>>>.*?parity\)/s, 
`import { locations, menaceAreas, stories, decks, cards } from "./content.js?v=20260930-20";
import { drawCardToHand, discardCard as removeCardFromHand } from "./decks.js?v=20260930-20";
import { cloneState, initialState } from "./state.js?v=20260930-20";
import { applyEffects, awardProgress, describeChallenge, requirementsMet, resolveChallenge } from "./rules.js?v=20260930-20";`);
fs.writeFileSync("src/game/engine.js", content);
