const fs = require("fs");
let content = fs.readFileSync("src/services/local-game-service.js", "utf8");
content = content.replace(/<<<<<<< HEAD.*?=======.*?>>>>>>>.*?parity\)/s, 
`import { resolveChoice, resetState, travelBlockedReason, drawCard, discard } from "../game/engine.js?v=20260930-20";
import { loadState, saveState } from "../game/state.js?v=20260930-20";`);
fs.writeFileSync("src/services/local-game-service.js", content);
