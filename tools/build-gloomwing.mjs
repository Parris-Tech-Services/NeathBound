#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
const source=new URL("../content/ambitions/gloomwing.v1.json",import.meta.url);
const target=new URL("../src/game/gloomwing-content.js",import.meta.url);
const data=JSON.parse(await readFile(source,"utf8"));
if(data.schema_version!==1||!data.id||Object.keys(data.stories??{}).length!==30)throw new Error("Invalid Gloomwing source schema or missing chapters");
const text=`// GENERATED FROM content/ambitions/gloomwing.v1.json. Edit JSON, then run npm run build:content.\nexport const gloomwingLocations = ${JSON.stringify(data.locations,null,2)};\nexport const gloomwingItems = ${JSON.stringify(data.items,null,2)};\nexport const gloomwingStories = ${JSON.stringify(data.stories,null,2)};\n`;
if(process.argv.includes("--check")){if((await readFile(target,"utf8"))!==text)throw new Error("Generated Gloomwing module is stale. Run npm run build:content.");console.log("Gloomwing generated module is current.");}
else{await writeFile(target,text);console.log("Rebuilt Gloomwing content module.");}
