#!/usr/bin/env node
// Storylet Foundry: original, offline-first Groq-assisted authoring.
// Node 20+. No API key is ever embedded in the browser or output.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath,pathToFileURL} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const GAME=JSON.parse(fs.readFileSync(path.join(ROOT,"package.json"),"utf8")).name==="neathbound"?"neathbound":"undercity";
const DIR=path.join(ROOT,"content/storylet-generator");
const STATS=GAME==="neathbound"?["nerve","insight","poise","shadow"]:["observation","guile","persuasion","resolve"];
const MENACES=GAME==="neathbound"?["suspicion","dread","wounds","scandal"]:["suspicion","notoriety"];
const RESOURCES=GAME==="neathbound"?["obols"]:["coin","clues","health","sanity"];
const isObj=x=>!!x&&typeof x==="object"&&!Array.isArray(x);
const words=x=>String(x||"").trim().split(/\s+/).filter(Boolean).length;
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const json=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const save=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
const checksum=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const die=m=>{throw Error(m)};
const cli=process.argv.slice(2),command=cli[0]||"help";
const flag=n=>cli.includes("--"+n);
const opt=(n,f="")=>{const i=cli.indexOf("--"+n);return i<0?f:(cli[i+1]??"");};
const idsFrom=t=>new Set([...t.matchAll(/(?:["']?id["']?\s*:\s*["']|["'])([a-z][a-z0-9_-]{3,})["']\s*:\s*\{\s*["']?title|(?:\bid\s*:\s*["'])([a-z][a-z0-9_-]{3,})["']|(?:"id"\s*:\s*")([a-z][a-z0-9_-]{3,})"/g)].map(m=>m[1]||m[2]||m[3]));
export function context(){
 const gameFiles=GAME==="neathbound"
 ?["src/game/content.js","src/game/expansion.js","src/game/gloomwing-content.js","src/game/qbn-expansion.js","content/ambitions/gloomwing.v1.json"]
 :["index.html","content/ambitions.js","content/world.js","content/late-ambitions.js","content/moth.generated.js","content/second-acts.generated.js","content/storylets/ambitions/moth.json"];
 const existing=new Set();
 for(const file of gameFiles)if(fs.existsSync(path.join(ROOT,file)))for(const id of idsFrom(read(file)))existing.add(id);
 let locations=[],items=[];
 if(GAME==="neathbound"){
  const s=read("src/game/content.js");
  const lo=s.split("export const locations = {")[1]?.split("\n};")[0]||"";
  const it=s.split("export const items = {")[1]?.split("\n};")[0]||"";
  locations=[...lo.matchAll(/^\s*"([a-z0-9-]+)":\s*\{/gm)].map(m=>m[1]);
  items=[...it.matchAll(/^\s*"([a-z0-9-]+)"\s*:/gm)].map(m=>m[1]);
 }else{
  const s=read("index.html");
  const lo=s.split("const PLACES={")[1]?.split("\n};")[0]||"";
  const it=s.split("const ITEMS={")[1]?.split("\n};")[0]||"";
  locations=[...lo.matchAll(/(?:^|\n)\s*([a-z][a-z0-9_]*):\{/g)].map(m=>m[1]);
  items=[...it.matchAll(/(?:^|\n)\s*([a-z][a-z0-9_]*):/g)].map(m=>m[1]);
 }
 return {game:GAME,stats:STATS,menaces:MENACES,resources:RESOURCES,locations:[...new Set(locations)],items:new Set(items),existing};
}
export function validate(s,ctx=context()){
 const errors=[],warnings=[],err=x=>errors.push(x),warn=x=>warnings.push(x);
 if(!isObj(s))return {ok:false,errors:["Storylet must be a JSON object"],warnings:[],score:0};
 const slug=/^[a-z][a-z0-9_-]{3,79}$/;
 if(!slug.test(s.id||""))err("Invalid storylet ID");
 if(ctx.existing.has(s.id))err("Existing content ID would be overwritten: "+s.id);
 if(!ctx.locations.includes(s.location))err("Unknown location: "+s.location);
 if(!["story","card"].includes(s.rarity))err("rarity must be story or card; ambition chains need dedicated integration");
 if(typeof s.title!=="string"||s.title.length<8||s.title.length>105)err("Title length must be 8–105 characters");
 if(words(s.description)<25||words(s.description)>165)err("Description must be 25–165 words");
 if(!Array.isArray(s.options)||s.options.length<2||s.options.length>4)err("Expected 2–4 distinct options");
 if(s.new_qualities?.length||s.new_items?.length)err("New definitions require separate registry approval");
 if(s.next_storylet)err("Linked storylet not supported by this standalone-content publisher");
 const seen=new Set(),outcomes=[];
 for(const [i,b] of (s.options||[]).entries()){
  const at="Option "+(i+1)+": ";
  if(!isObj(b)){err(at+"invalid object");continue}
  if(!slug.test(b.id||"")||seen.has(b.id))err(at+"invalid or duplicate ID");seen.add(b.id);
  if(words(b.text)<3||words(b.text)>18)err(at+"action label must be 3–18 words");
  if(b.action_cost!==undefined&&b.action_cost!==1)err(at+"only 1-cost actions supported; this engine cannot faithfully import free branches");
  if(b.challenge&&(!ctx.stats.includes(b.challenge.stat)||!Number.isFinite(b.challenge.difficulty)||b.challenge.difficulty<=0))err(at+"invalid challenge stat/difficulty: "+ctx.stats.join(", "));
  if(b.challenge&&!isObj(b.failure))err(at+"challenge must have a failure");
  for(const key of ["success",...(b.challenge?["failure"]:[])]){
   const result=b[key];
   if(!isObj(result)||words(result.text)<17||words(result.text)>125)err(at+key+" prose must be 17–125 words");
   else outcomes.push(result.text.trim().toLowerCase());
   if(!Array.isArray(result?.effects))err(at+key+" effects array missing");
   for(const e of result?.effects||[]){
    if(!isObj(e)||!["stat","menace","currency","item","flag"].includes(e.type)){err(at+key+" invalid effect");continue}
    if(e.type==="stat"&&!ctx.stats.includes(e.id))err(at+key+" unknown stat "+e.id);
    if(e.type==="menace"&&!ctx.menaces.includes(e.id))err(at+key+" unknown menace "+e.id);
    if(e.type==="currency"&&!ctx.resources.includes(e.id))err(at+key+" unknown resource "+e.id);
    if(e.type==="item"&&!ctx.items.has(e.id))err(at+key+" unknown item "+e.id);
    if(e.type==="flag"&&!/^generated:[a-z0-9_-]+$/.test(e.id||""))err(at+key+" flag must begin generated:");
    if(e.type==="flag"?![true,false].includes(e.set):!Number.isInteger(e.delta))err(at+key+" invalid effect delta/set");
    if(e.type==="item"&&e.delta<0)err(at+key+" consumes item without proven prerequisite");
    if(e.type==="currency"&&Math.abs(e.delta)>20)warn(at+key+" high resource reward");
    if(e.type==="stat"&&Math.abs(e.delta)>3)warn(at+key+" high stat reward");
   }
   if(ctx.game==="undercity"&&(result?.effects||[]).filter(e=>e.type==="flag").length>1)err(at+key+" Undercity supports one flag per outcome");
  }
  if(b.success?.text===b.failure?.text)err(at+"success and failure are identical");
 }
 if(new Set(outcomes).size!==outcomes.length)err("Duplicated outcome prose");
 if((s.options||[]).every(o=>!(o.success?.effects||[]).length))err("All paths lack mechanical consequences");
 if(!/\byou\b|\byour\b/i.test(s.description||""))warn("Second-person narrative voice is missing");
 if(words(s.description)<45)warn("Description may be too thin to establish specific stakes");
 if(/as an ai|fallen london|failbetter/i.test(JSON.stringify(s)))err("AI boilerplate or protected-world reference");
 if(/\ba tapestry of\b|\blittle did you know\b|\bthe air was thick with\b/i.test(JSON.stringify(s)))warn("Cliché detected");
 return {ok:errors.length===0,errors,warnings,score:Math.max(0,100-errors.length*20-warnings.length*6)};
}
function effects(list){
 if(GAME==="neathbound")return list.map(e=>
   e.type==="stat"?{type:"quality",id:e.id,amount:e.delta}:
   e.type==="menace"?{type:"menace",id:e.id,amount:e.delta}:
   e.type==="currency"?{type:"obols",amount:e.delta}:
   e.type==="item"?{type:"item",id:e.id,amount:e.delta}:
   {type:"flag",id:e.id,value:e.set});
 const result={};
 for(const e of list){
  if(e.type==="stat"){result.quality??={};result.quality[e.id]=(result.quality[e.id]||0)+e.delta}
  else if(e.type==="item"){result.items??={};result.items[e.id]=(result.items[e.id]||0)+e.delta}
  else if(e.type==="flag")result.flag=e.id;
  else result[e.id]=(result[e.id]||0)+e.delta;
 }
 return result;
}
export function adapt(s){
 if(GAME==="neathbound")return {id:s.id,location:s.location,rarity:s.rarity,story:{
  title:s.title,text:s.description,once:true,pattern:"decoupled",kicker:"A story in "+s.location,
  choices:s.options.map(b=>{
   const x={id:b.id,label:b.text,success:b.success.text,successEffects:effects(b.success.effects),failureEffects:effects(b.failure?.effects||[])};
   if(b.challenge){x.challenge={quality:b.challenge.stat,difficulty:b.challenge.difficulty,mode:"broad",scaler:0.6};x.failure=b.failure.text;}
   else x.challenge=false;
   return x;
  })
 }};
 return {id:s.id,location:s.location,rarity:s.rarity,story:{
  id:s.id,title:s.title,description:s.description,where:[s.location],once:true,category:"generated",
  choices:s.options.map(b=>{
   const x={label:b.text,success:b.success.text,effects:effects(b.success.effects)};
   if(b.challenge){x.stat=b.challenge.stat;x.difficulty=b.challenge.difficulty;x.failure=b.failure.text;x.fail=effects(b.failure.effects);}
   else x.cost=1;
   return x;
  })
 }};
}
async function groq(messages,model){
 const key=process.env.GROQ_API_KEY;if(!key)die("Missing GROQ_API_KEY; supply it via environment, never browser code");
 const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
  method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},
  body:JSON.stringify({model,temperature:0.55,max_tokens:3800,response_format:{type:"json_object"},messages}),
  signal:AbortSignal.timeout(90000)
 });
 if(!r.ok)die("Groq API returned HTTP "+r.status+"; verify model/key/rate limit (no key disclosed)");
 const data=await r.json();const raw=data.choices?.[0]?.message?.content;
 try{return JSON.parse(raw)}catch{die("Model did not return valid JSON")}
}
async function generate(){
 const id=opt("id"),location=opt("location"),brief=opt("brief"),kind=opt("kind","story");
 if(!id||!location||!brief)die("Usage: generate --id ID --location LOCATION --brief 'story beats' [--kind story|card]");
 const ctx=context(),sample={id,location,rarity:kind,description:"",options:[],title:""};
 const fatal=validate(sample,ctx).errors.filter(e=>/Existing content ID|Unknown location|Invalid storylet ID|rarity/.test(e));
 if(fatal.length)die(fatal.join("; "));
 const draftFile=path.join(DIR,"drafts",id+".json");
 if(fs.existsSync(draftFile))die("Draft already exists: "+id);
 const model=opt("model",process.env.GROQ_MODEL||"llama-3.3-70b-versatile");
 const rounds=Math.max(1,Math.min(3,Number(opt("rounds","2"))||2));
 const system=[
  "You write original dark, melancholy, wry, specific second-person narrative game scenes with clear concrete stakes, NPC motivations, meaningful choices and distinct consequences. Not a copy of another game. No generic filler.",
  "Produce ONLY a JSON object: {id,title,location,rarity,description,options:[{id,text,action_cost:1,challenge?:{stat,difficulty},success:{text,effects:[{type,id,delta} or {type:'flag',id,set:true}]},failure?:{text,effects:[]}}]}. No markdown.",
  "ID "+id+"; location "+location+"; rarity "+kind+". 2–4 branches. Description 45–165 words. Every outcome at least 17–125 words. Make branches mechanically and narratively different.",
  "Stats "+ctx.stats.join(",")+". Menaces "+ctx.menaces.join(",")+". Resources "+ctx.resources.join(",")+".",
  "Allowed effects: stat, menace, currency, flag. Never invent item IDs or quality types. Flags must start generated:"+id+"-. Only one flag per outcome.",
  "Challenge difficulty 2–15; success and failure are distinct. Default action_cost 1. No auto-publish, no existing ambition progression edits.",
  "Original-world context: "+(GAME==="neathbound"?"Lantern Quay, Hollow Archive, labour, memory and civic mysteries":"Lantern Court, Inkward, district politics, light and debts"),
  "REQUEST: "+brief
 ].join("\n");
 let s,review={},check,history=[];
 for(let n=0;n<rounds;n++){
  const prompt=n===0?"Create the complete storylet as JSON.":
   "Return a FULL REVISED storylet JSON. Fix these problems: "+JSON.stringify({issues:check.errors.concat(check.warnings),editor:review.issues||[],storylet:s});
  const obj=await groq([{role:"system",content:system},{role:"user",content:prompt}],model);
  s=obj.storylet||obj.story||obj;check=validate(s,ctx);
  review=check.ok?await groq([
   {role:"system",content:"Be a strict developmental editor. JSON only: {scores:{voice:0-10,originality:0-10,clarity:0-10,continuity:0-10,agency:0-10,consequences:0-10},issues:[specific problems],recommendation:'revise'|'review'}. Never automatically approve. Scrutinise repetitive prose, hollow choices and lore contradictions."},
   {role:"user",content:JSON.stringify({brief,storylet:s})}
  ],model):{issues:check.errors,recommendation:"revise"};
  history.push({round:n+1,mechanical:check,editor:review});
  const nums=Object.values(review.scores||{});
  if(check.ok&&nums.length===6&&nums.every(x=>Number.isFinite(x)&&x>=8)&&review.recommendation==="review")break;
 }
 save(draftFile,{storylet:s,report:{game:GAME,id,model,brief,createdAt:new Date().toISOString(),iterations:history}});
 console.log("Saved draft "+path.relative(ROOT,draftFile)+"; mechanical QA "+(check.ok?"PASS":"FAIL")+". Human review required.");
 if(!check.ok)process.exitCode=2;
}
function draftPath(){const id=opt("id");if(!/^[a-z][a-z0-9_-]{3,79}$/.test(id))die("Supply --id");return path.join(DIR,"drafts",id+".json")}
function validateCmd(){
 const p=opt("file")?path.resolve(ROOT,opt("file")):draftPath(),s=(json(p).storylet||json(p));
 const results=validate(s);console.log(JSON.stringify(results,null,2));if(!results.ok)process.exitCode=1;
}
function approve(){
 const draft=json(draftPath()),s=draft.storylet,result=validate(s);
 if(!result.ok)die("Mechanical checks failed: "+result.errors.join("; "));
 const scores=draft.report?.iterations?.at(-1)?.editor?.scores||{};
 const keys=["voice","originality","clarity","continuity","agency","consequences"];
 if(keys.some(x=>!Number.isFinite(scores[x])||scores[x]<0||scores[x]>10)||keys.reduce((n,k)=>n+scores[k],0)/6<8)die("AI review is incomplete or below 8/10; revise draft");
 const reviewer=opt("reviewer"),notes=opt("notes");
 if(!flag("confirm")||!reviewer||words(notes)<6)die("Human review required: --reviewer NAME --notes 'specific editorial inspection (6+ words)' --confirm");
 const dest=path.join(DIR,"approved",s.id+".json");if(fs.existsSync(dest))die("Already approved, will not overwrite");
 save(dest,{storylet:s,review:{reviewer,notes,approvedAt:new Date().toISOString(),checksum:checksum(s)}});
 console.log("Approved "+s.id+"; run publish to compile into game (then test & commit)");
}
function publish(){
 const dir=path.join(DIR,"approved"),files=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>x.endsWith(".json")).sort():[];
 const entries=[];
 for(const file of files){
  const x=json(path.join(dir,file));if(checksum(x.storylet)!==x.review?.checksum)die("Approval changed without re-review: "+file);
  const check=validate(x.storylet);if(!check.ok)die(file+": "+check.errors.join("; "));
  entries.push(adapt(x.storylet));
 }
 let target,code;
 const notice="// GENERATED FROM human-reviewed content/storylet-generator/approved/*.json. Do not edit.\n";
 if(GAME==="neathbound"){
  const stories=Object.fromEntries(entries.filter(x=>x.rarity==="story").map(x=>[x.id,x.story]));
  const cards=Object.fromEntries(entries.filter(x=>x.rarity==="card").map(x=>[x.id,{id:x.id,...x.story}]));
  const places=entries.filter(x=>x.rarity==="story").map(x=>({id:x.id,location:x.location}));
  code=notice+"export const approvedStories="+JSON.stringify(stories,null,2)+";\nexport const approvedCards="+JSON.stringify(cards,null,2)+";\nexport const approvedPlacements="+JSON.stringify(places,null,2)+";\n";
  target="src/game/approved-storylets.js";
 }else{
  code=notice+"(function(){\n\"use strict\";\nconst e=window.UndercityExpansions ||= {stories:[],cards:[],items:{},professions:[],destinies:[]};\nconst entries="+JSON.stringify(entries)+";\nfor(const x of entries)(x.rarity==='card'?e.cards:e.stories).push(x.story);\n})();\n";
  target="content/approved-storylets.generated.js";
 }
 const full=path.join(ROOT,target);
 if(flag("check")){if(!fs.existsSync(full)||fs.readFileSync(full,"utf8")!==code)die("Approved bundle stale: run publish");console.log("Bundle current ("+entries.length+" approved): "+target)}
 else{fs.writeFileSync(full,code);console.log("Compiled "+entries.length+" HUMAN-APPROVED storylets into "+target+"; run full tests before commit");}
}
function help(){console.log("Storylet Foundry for "+GAME+"\nGROQ_API_KEY=... node tools/storylet-generator.mjs generate --id original_id --location PLACE --brief 'story beats' [--kind story|card]\nnode tools/storylet-generator.mjs validate --id original_id\nnode tools/storylet-generator.mjs approve --id original_id --reviewer 'Editor' --notes 'I checked every choice and its consequences carefully.' --confirm\nnode tools/storylet-generator.mjs publish [--check]\nnode tools/storylet-generator.mjs locations\nKey never goes in repo or browser; nothing is published without human approval.");}
export async function main(){
 if(command==="generate")await generate();
 else if(command==="validate")validateCmd();
 else if(command==="approve")approve();
 else if(command==="publish")publish();
 else if(command==="locations")console.log(context().locations.join("\n"));
 else if(command==="help")help();
 else die("Unknown command");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)
 main().catch(e=>{console.error("Storylet Foundry: "+e.message);process.exitCode=1;});
