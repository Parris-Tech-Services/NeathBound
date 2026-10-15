import {locations,stories,items} from "../../src/game/content.js";
export const project={
 game:"neathbound",name:"NeathBound Studio",
 stats:["nerve","insight","poise","shadow"],
 menaces:["dread","scandal","wounds","suspicion"],
 quirks:["austere","hedonist","daring","subtle","forceful","magnanimous","ruthless","steadfast","fickle","honest","devious"],
 locations:Object.keys(locations),items:Object.keys(items),knownIds:Object.keys(stories),
 forbidden:["Fallen London","Watchful","Shadowy","Dangerous","Persuasive"],
 sourceInfo:"The existing game's script-authored stories are references. New approved JSON compiles into content/cms-published.js.",
 published:Object.entries(stories).map(([id,s])=>({id,title:s.title||id,location:Object.keys(locations).find(k=>locations[k].stories.includes(id)),text:s.text||"",choices:s.choices||[]}))
};