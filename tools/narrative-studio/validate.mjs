#!/usr/bin/env node
// Studio packet gate. Intentionally separate from the live engine validator.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const base=path.join(root,"content/narrative-studio");
const schema=JSON.parse(fs.readFileSync(path.join(base,"schema.v1.json"),"utf8"));
const docs=path.join(root,"docs/narrative-studio");
const errors=[];
for(const n of ["README.md","bible.md","secrets.md","style.md","agents.md"]){
 const p=path.join(docs,n);if(!fs.existsSync(p)||fs.readFileSync(p,"utf8").trim().length<500)errors.push("Missing or empty studio document: "+n);
}
const ledger=fs.readFileSync(path.join(docs,"secrets.md"),"utf8");
const ids=new Set([...ledger.matchAll(/^\| (NB-S\d{2}) \|/gm)].map(x=>x[1]));
if(ids.size!==40)errors.push("Expected 40 unique NeathBound ledger entries; found "+ids.size);
const subdir=path.join(base,"submissions");
if(!fs.existsSync(subdir))fs.mkdirSync(subdir,{recursive:true});
const records=[];
for(const file of fs.readdirSync(subdir).filter(x=>x.endsWith(".json"))){
 const at="submissions/"+file;let r;
 try{r=JSON.parse(fs.readFileSync(path.join(subdir,file),"utf8"))}catch(e){errors.push(at+": invalid JSON "+e.message);continue}
 records.push(r);
 const fail=message=>errors.push(at+": "+message);
 if(r.schema_version!==1||r.game!=="NeathBound")fail("wrong schema/game");
 if(!/^[a-z0-9][a-z0-9_-]+$/.test(r.id??""))fail("invalid story ID");
 if(!schema.stages.includes(r.stage))fail("invalid stage");
 if(!r.title?.trim()||!r.location?.trim())fail("missing title/location");
 if(!r.pitch?.trim())fail("missing pitch; no content starts without approval");
 if(!Number.isInteger(r.reveal_depth)||r.reveal_depth<1||r.reveal_depth>5)fail("invalid reveal depth");
 for(const id of r.secret_ids??[]){
  if(!ids.has(id))fail("undeclared secret "+id);
  else {const line=ledger.split("\n").find(x=>x.startsWith("| "+id+" |"));const d=Number(line?.split("|")[2]?.trim());if(d>r.reveal_depth)fail("secret "+id+" exceeds approved depth");}
 }
 if(!["pitch"].includes(r.stage)){
  if(!Array.isArray(r.branches)||r.branches.length<2||r.branches.length>5)fail("skeleton needs 2-5 branches");
 }
 const names=new Set();
 for(const [i,b] of (r.branches??[]).entries()){
  if(!b.id||names.has(b.id))fail("duplicate/missing branch ID "+i);names.add(b.id);
  if(!schema.primary_stats.includes(b.challenge?.stat))fail("invalid challenge.stat "+i);
  if(!Number.isFinite(b.challenge?.difficulty)||b.challenge.difficulty<1)fail("invalid challenge.difficulty "+i);
  if(![0,1].includes(b.action_cost))fail("action_cost must be 0 or 1 at "+i);
  for(const outcome of ["success","failure"]){
   if(!b[outcome]||typeof b[outcome].text!=="string")fail("missing "+outcome+".text "+i);
   if(["prose","qa","approved"].includes(r.stage)&&(!b[outcome]?.text.trim()||b[outcome].text.includes("[PROSE PENDING]")))fail("unfinished "+outcome+" prose "+i);
  }
 }
 if(["prose","qa","approved"].includes(r.stage)&&(!r.description?.trim()||r.description.includes("[PROSE PENDING]")))fail("unfinished story prose");
 if(r.stage==="approved"){
  if(!r.human_approved||!r.reviewer?.trim())fail("missing genuine human sign-off");
  for(const role of schema.qa_types)if(r.qa?.[role]!=="pass")fail("QA "+role+" not passed");
  if(r.runtime_integration!=="verified")fail("runtime adapter and game tests must be verified before sign-off");
 }
}
const counts=Object.fromEntries(schema.stages.map(s=>[s,records.filter(x=>x.stage===s).length]));
if(process.argv.includes("report"))console.log("Narrative Studio packets: "+JSON.stringify(counts));
if(errors.length){for(const e of errors)console.error("✗ "+e);process.exitCode=1;}
else console.log("Narrative Studio: "+ids.size+" ledger topics, "+records.length+" packets, schema and editorial gates valid.");
