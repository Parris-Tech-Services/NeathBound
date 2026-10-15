#!/usr/bin/env node
/** Publish only reviewed CMS JSON. --check is a non-mutating CI gate. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath,pathToFileURL} from "node:url";
import {audit} from "./studio-core.js";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const pkg=JSON.parse(read("package.json"));
const game=pkg.name==="neathbound"?"neathbound":"undercity";
const sources=path.join(root,"content/storylets/cms");
const output=path.join(root,"content/cms-published.js");
const files=fs.existsSync(sources)?fs.readdirSync(sources).filter(f=>f.endsWith(".json")).sort():[];
const ledger=JSON.parse(read("tools/cms/ledger.json"));
async function getContext(){
 if(game==="neathbound"){
  const content=await import(pathToFileURL(path.join(root,"src/game/content.js")).href);
  return {game,stats:["nerve","insight","poise","shadow"],menaces:["dread","scandal","wounds","suspicion"],
   quirks:["austere","hedonist","daring","subtle","forceful","magnanimous","ruthless","steadfast","fickle","honest","devious"],
   items:Object.keys(content.items),locations:Object.keys(content.locations),knownIds:Object.keys(content.stories),
   forbidden:["Fallen London","Watchful","Shadowy","Dangerous","Persuasive"],secrets:ledger};
 }
 const c=vm.createContext({window:{},console});
 const modules=["content/ambitions.js","content/moth.generated.js","content/second-acts.generated.js","content/late-ambitions.js",
  "content/world.js","content/penalties.js","content/callings.js","content/systems.js"];
 for(const module of modules)vm.runInContext(read(module),c,{filename:module,timeout:5000});
 const html=read("index.html"),main=html.match(/<script>\s*([\s\S]*?)<\/script>/)?.[1];
 if(!main||main.indexOf("const EXT=")<0)throw Error("Undercity base content bootstrap moved.");
 vm.runInContext(main.slice(main.indexOf("const SAVE="),main.indexOf("const EXT=")),c,{timeout:5000});
 const base=vm.runInContext("({PLACES,STORIES,ITEMS})",c),ext=c.window.UndercityExpansions||{};
 return {game,stats:["observation","guile","persuasion","resolve"],menaces:["suspicion","notoriety","wounds","delirium"],
  quirks:["merciful","ruthless","honest","subtle","proud","generous","curious","cautious","steadfast"],
  items:[...new Set([...Object.keys(base.ITEMS),...Object.keys(ext.items||{})])],locations:Object.keys(base.PLACES),
  knownIds:[...base.STORIES.map(s=>s.id),...(ext.stories||[]).map(s=>s.id)],
  forbidden:["Fallen London","Watchful","Shadowy","Dangerous"],secrets:ledger};
}
const context=await getContext();
const storylets=files.map(file=>{
 const s=JSON.parse(fs.readFileSync(path.join(sources,file),"utf8"));
 if(!s||s.game!==game)throw Error(file+": wrong game; drafts may not cross into another game's world.");
 return s;
});
const ids=storylets.map(s=>s.id);
if(new Set(ids).size!==ids.length)throw Error("Duplicate CMS storylet IDs.");
context.draftIds=ids;
for(const s of storylets){
 const result=audit(s,context,{strict:true});
 if(!result.ok)throw Error(s.id+":\n"+result.errors.map(x=>x.path+": "+x.message).join("\n"));
 const stage=String(s.status);
 if(stage!=="approved")throw Error(s.id+" is unapproved.");
 if(s.progress!==null&&s.next_storylet&&!ids.includes(s.next_storylet)&&!context.knownIds.includes(s.next_storylet))
  throw Error(s.id+" has a missing next_storylet.");
}
function toNeathEffect(e){
 const type=e.type==="currency"?"obols":e.type==="quality"?"progress":e.type;
 const result={type};
 if(!["currency"].includes(e.type))result.id=e.id||undefined;
 if(!["flag","living-story"].includes(e.type))result.amount=Number(e.amount??1);
 if(e.type==="flag")result.value=true;
 if(e.type==="living-story"){result.delay_hours=Number(e.amount??1);result.title="A delayed letter";result.message="The city has remembered your decision.";}
 return result;
}
function neath(){
 const mapped={},locations={};
 for(const s of storylets){
  const result={title:s.title,kicker:s.kicker||"",text:s.description,once:s.once!==false,pattern:s.progress===null?"decoupled":"chain",
   requirements:s.requirements||[],action_cost:1,choices:s.choices.map(c=>{
    const challenge=c.mode==="narrow"?{quality:c.stat,difficulty:Number(c.difficulty),mode:"narrow",narrow:Number(c.difficulty)}:
     {quality:c.stat,difficulty:Number(c.difficulty),mode:c.mode||"broad"};
    const row={id:c.id,label:c.label,challenge,action_cost:Number(c.action_cost),
     requirements:c.requirements||[],success:c.success.text,failure:c.failure.text,
     successEffects:c.success.effects.map(toNeathEffect),failureEffects:c.failure.effects.map(toNeathEffect)};
    if(c.rare_success){row.rare_success=c.rare_success.text;row.rareSuccessEffects=c.rare_success.effects.map(toNeathEffect)}
    return row;
   })};
  if(s.progress!==null){
   result.ambition_id=s.ambition_id;
   result.requires_progress={id:s.ambition_id,value:s.progress};
   result.sets_progress={id:s.ambition_id,value:s.progress+1};
  }
  if(s.next_storylet)result.next_storylet=s.next_storylet;
  mapped[s.id]=result;(locations[s.location]??=[]).push(s.id);
 }
 return "// Generated by tools/cms/build.mjs from reviewed storylets. Do not hand-edit.\n"+
  "export const cmsPublishedStories = "+JSON.stringify(mapped,null,2)+";\n"+
  "export const cmsPublishedLocations = "+JSON.stringify(locations,null,2)+";\n";
}
function underEffect(e,into){
 const n=Number(e.amount??1);
 switch(e.type){
 case "currency":into.coin=(into.coin||0)+n;break;
 case "item":into.items??={};into.items[e.id]=(into.items[e.id]||0)+n;break;
 case "menace":{
  const dest=({wounds:"health",delirium:"sanity"})[e.id]||e.id;
  into[dest]=(into[dest]||0)+(dest==="health"||dest==="sanity"?-n:n);break;
 }
 case "quirk":into.quirks??={};into.quirks[e.id]=(into.quirks[e.id]||0)+n;break;
 case "ambition-progress":into.pathProgress=(into.pathProgress||0)+n;break;
 case "flag":
  if(into.flag&&into.flag!==e.id)throw Error("Undercity has one flag per outcome; split distinct flags into different scenes.");
  into.flag=e.id;break;
 case "quality":throw Error("Undercity core awards primary CP through challenges, not manual effects. Remove quality effect "+e.id);
 case "living-story":throw Error("Undercity timed effects require a scheduler adapter; use the native Living Stories module.");
 default:throw Error("Unsupported effect "+e.type);
 }
 return into;
}
function under(){
 const entries=storylets.map(s=>{
  const row={id:s.id,title:s.title,description:s.description,where:[s.location],category:"cms",once:s.once!==false,
   next_storylet:s.next_storylet||null,choices:s.choices.map(c=>{
    const branch={label:c.label,stat:c.stat,difficulty:Number(c.difficulty),cost:Number(c.action_cost),
     effects:c.success.effects.reduce((a,e)=>underEffect(e,a),{}),
     fail:c.failure.effects.reduce((a,e)=>underEffect(e,a),{}),
     success:c.success.text,failure:c.failure.text};
    if(c.mode==="narrow")branch.narrow=Number(c.difficulty);
    if(c.rare_success){branch.rare=c.rare_success.effects.reduce((a,e)=>underEffect(e,a),{});
     branch.rare_success=c.rare_success.text;}
    return branch;
   })};
  return {story:row,progress:s.progress,ambition:s.ambition_id,requirements:s.requirements,branchRequirements:s.choices.map(c=>c.requirements)};
 });
 return "// Generated by tools/cms/build.mjs from reviewed storylets. Do not hand-edit.\n"+
 '(function(){"use strict";\n'+
 'const e=window.UndercityExpansions ||= {stories:[],cards:[],items:{},professions:[],destinies:[]};\n'+
 "const entries="+JSON.stringify(entries)+";\n"+
 'const meets=(s,rs)=>rs.every(r=>{const v=r.type==="flag"?s.flags?.[r.id]:r.type==="item"?s.items?.[r.id]:r.type==="quirk"?s.quirks?.[r.id]:s.qualities?.[r.id]?.level??s.stats?.[r.id]??0;switch(r.op){case "==":return v==r.value;case "!=":return v!=r.value;case ">":return v>r.value;case ">=":return v>=r.value;case "<":return v<r.value;case "<=":return v<=r.value;default:return false}});\n'+
 'for(const x of entries){const st=x.story;st.when=s=>(x.progress===null||(s.path===x.ambition&&s.pathProgress===x.progress))&&meets(s,x.requirements);st.choices=st.choices.map((c,i)=>({...c,when:s=>meets(s,x.branchRequirements[i])}));e.stories.push(st)}\n'+
 '})();\n';
}
const generated=game==="neathbound"?neath():under();
if(process.argv.includes("--check")){
 const existing=fs.existsSync(output)?fs.readFileSync(output,"utf8"):"";
 if(existing!==generated){console.error("CMS bundle is stale. Run node tools/cms/build.mjs and commit its output.");process.exitCode=1;}
 else console.log("CMS VALID: "+storylets.length+" approved "+game+" storylets, output current.");
}else{fs.writeFileSync(output,generated);console.log("Built "+storylets.length+" approved storylets for "+game);}
