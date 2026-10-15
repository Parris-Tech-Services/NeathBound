#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
const source=new URL("../content/ambitions/gloomwing.v1.json",import.meta.url);
const target=new URL("../src/game/gloomwing-content.js",import.meta.url);
const data=JSON.parse(await readFile(source,"utf8"));
if(data.schema_version!==1||!data.id||Object.keys(data.stories??{}).length!==30)throw new Error("Invalid Gloomwing source schema or missing chapters");
const text=`// GENERATED FROM content/ambitions/gloomwing.v1.json. Edit JSON, then run npm run build:content.\nexport const gloomwingLocations = ${JSON.stringify(data.locations,null,2)};\nexport const gloomwingItems = ${JSON.stringify(data.items,null,2)};\nexport const gloomwingStories = ${JSON.stringify(data.stories,null,2)};\n`;
const tracker=new URL("../content/catalogue/gloomwing-tracker.csv",import.meta.url);
const csvEscape=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
const rows=[["type","id","title","chapter","location","ambition","branches","notes"]];
for(const [id,entry] of Object.entries(data.stories)){
  const location=Object.entries(data.locations).find(([,loc])=>loc.stories.includes(id))?.[0]??"lantern-quay";
  rows.push(["storylet",id,entry.title,entry.requires_progress.value+1,location,entry.ambition_id,entry.choices.length,entry.text.slice(0,100)]);
}
for(const [id,entry] of Object.entries(data.items))rows.push(["item",id,entry.name,"","","","",entry.description??""]);
for(const [id,entry] of Object.entries(data.locations))rows.push(["location",id,entry.name,"","","","",entry.subtitle??""]);
const csv=rows.map(row=>row.map(csvEscape).join(",")).join(String.fromCharCode(10))+String.fromCharCode(10);
if(process.argv.includes("--check")){if((await readFile(target,"utf8"))!==text)throw new Error("Generated Gloomwing module is stale. Run npm run build:content.");
if((await readFile(tracker,"utf8"))!==csv)throw new Error("Gloomwing tracker is stale. Run npm run build:content.");console.log("Gloomwing generated module is current.");}
else{await writeFile(target,text);await writeFile(tracker,csv);console.log("Rebuilt Gloomwing content and catalogue.");}
