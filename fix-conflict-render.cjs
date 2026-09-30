const fs = require("fs");
let content = fs.readFileSync("src/ui/render.js", "utf8");
content = content.replace(/<<<<<<< HEAD.*?=======.*?>>>>>>>.*?parity\)/s, 
`import { availableChoices, availableStories, currentLocation, effectiveChallenge, describeChallenge } from "../game/engine.js?v=20260930-20";
import { locations, cards, decks } from "../game/content.js?v=20260930-20";
import { loadPreferences } from "./preferences.js?v=20260930-20";`);
fs.writeFileSync("src/ui/render.js", content);
