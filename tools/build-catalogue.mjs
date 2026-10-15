#!/usr/bin/env node
// Inventory the complete authored world. Never edit the CSV by hand.
import {readFile,writeFile} from "node:fs/promises";
import { stories, cards, items, locations, decks, ambitions, destinies, festivals } from "../src/game/content.js";
import { QUIRK_OPPOSITES } from "../src/game/rules.js";
const destination=new URL("../content/catalogue/all-content.csv",import.meta.url);
const q=value=>'"'+String(value??"").replace(/"/g,'""')+'"';
const rows=[["type","id","title","location_or_deck","ambition","requirements","branches","notes"]];
const where=new Map();
for(const [loc,def] of Object.entries(locations))
 for(const id of def.stories??[])where.set(id,[...(where.get(id)??[]),loc]);
for(const [deck,def] of Object.entries(decks))
 for(const id of def.cardIds??[])where.set(id,[...(where.get(id)??[]),"deck:"+deck]);
const locs=id=>(where.get(id)??[]).join(";");
const reqs=e=>JSON.stringify(e.requirements??[]);
for(const [id,def] of Object.entries(stories))rows.push(["storylet",id,def.title,locs(id),def.ambition_id??"",reqs(def),def.choices?.length??0,def.kicker??""]);
for(const [id,def] of Object.entries(cards))rows.push(["card",id,def.title,locs(id),"",reqs(def),def.choices?.length??0,def.frequency??""]);
for(const [id,def] of Object.entries(items))rows.push(["item",id,def.name,def.slot??"", "", "", "", def.category??""]);
for(const [id,def] of Object.entries(locations))rows.push(["location",id,def.name,def.region??"", "", "", (def.stories??[]).length,def.subtitle??""]);
for(const [id,def] of Object.entries(ambitions))rows.push(["ambition",id,def.name,"", "", "", def.total??0,def.description??""]);
for(const [id,def] of Object.entries(destinies))rows.push(["destiny",id,def.name,"", "", "", "", JSON.stringify(def.stat_bonus??{})]);
for(const [id,def] of Object.entries(festivals))rows.push(["festival",id,def.name,"", "", "", "", JSON.stringify({start:def.start,end:def.end})]);
const qualityIds=new Set(["nerve","insight","poise","shadow","dread","wounds","suspicion","scandal","gloomwing_hunt_progress"]);
for(const story of [...Object.values(stories),...Object.values(cards)]){
  for(const req of story.requirements??[])if(req.type==="quality"||req.type==="menace")qualityIds.add(req.id);
  for(const c of story.choices??[]){
    for(const req of c.requirements??[])if(req.type==="quality"||req.type==="menace")qualityIds.add(req.id);
    for(const e of [...(c.successEffects??[]),...(c.failureEffects??[]),...(c.rareSuccessEffects??[])])
      if(e.type==="quality"||e.type==="set-quality"||e.type==="menace")qualityIds.add(e.id);
  }
}
for(const id of [...qualityIds].sort())rows.push(["quality",id,id,"", "", "", "", ["nerve","insight","poise","shadow"].includes(id)?"primary":(["dread","wounds","suspicion","scandal"].includes(id)?"menace":"story")]);
for(const id of Object.keys(QUIRK_OPPOSITES).sort())rows.push(["quirk",id,id,"", "", "", "", (QUIRK_OPPOSITES[id]??[]).join(";")]);
const csv=rows.map(a=>a.map(q).join(",")).join(String.fromCharCode(10))+String.fromCharCode(10);
if(process.argv.includes("--check")){
  if(await readFile(destination,"utf8")!==csv)throw new Error("Content inventory stale. Run npm run catalogue:build.");
  console.log("All-content inventory current: "+(rows.length-1)+" records.");
}else{await writeFile(destination,csv);console.log("Wrote "+(rows.length-1)+" records.");}
