/**
 * Schema-aware repair for QBN Studio (Undercity and NeathBound).
 * Never silently invent a lore fact, rewrite an unknown target or waive QA.
 */
import {audit,copy,EFFECTS,REQUIREMENTS,freshChoice,slug} from "./studio-core.js";
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const text=x=>typeof x==="string"?x.trim():"";
const integer=(x,otherwise=1)=>Number.isFinite(Number(x))&&x!==""&&x!=null?Number(x):otherwise;
const lists={quality:"stats",item:"items",menace:"menaces",quirk:"quirks"};
function cleanEffect(raw,ctx,changes,at){
 if(!isObject(raw)){changes.push(at+": removed empty effect placeholder");return null}
 const e=copy(raw);
 if(!e.type){
  if(e.quality||e.stat||e.skill){e.type="quality";e.id||=e.quality||e.stat||e.skill}
  else if(e.item){e.type="item";e.id||=e.item}
  else if(e.menace){e.type="menace";e.id||=e.menace}
  else if(e.flag){e.type="flag";e.id||=e.flag}
  else if(e.currency||e.pennies!=null||e.coin!=null){e.type="currency";e.amount??=e.pennies??e.coin??e.currency}
  else if(e.pathProgress!=null||e.progress!=null){e.type="ambition-progress";e.amount??=e.pathProgress??e.progress}
 }
 const aliases={stat:"quality",skill:"quality",money:"currency",coin:"currency",pennies:"currency",cp:"quality",inventory:"item",condition:"menace",reputation:"quirk",ambition_progress:"ambition-progress",progress:"ambition-progress",living_story:"living-story"};
 if(aliases[e.type]){e.type=aliases[e.type];changes.push(at+": corrected effect type")}
 if(!e.type&&!Object.values(e).some(x=>x!==""&&x!==null&&x!==undefined)){
  changes.push(at+": removed blank template effect");return null;
 }
 if(e.type==="currency"||e.type==="ambition-progress")e.id="";
 if(lists[e.type]&&!e.id){
  const target=e.target||e.name||e.quality||e.stat||e.skill||e.item||e.menace;
  if(typeof target==="string"&&(ctx[lists[e.type]]||[]).includes(target)){
   e.id=target;changes.push(at+": recovered effect target");
  }
 }
 if(e.type==="flag"&&!e.id&&text(e.name))e.id=e.name;
 if(e.type==="flag"){e.value=true;e.amount=1;}
 else if(e.type==="living-story"){e.amount=integer(e.amount,1)}
 else if(EFFECTS.includes(e.type)){const n=integer(e.amount??e.value??e.delta,1);if(e.amount!==n)changes.push(at+": fixed numeric amount");e.amount=n}
 return {type:e.type,id:e.id??"",amount:e.amount,value:e.value};
}
export function repairDraft(input,ctx,{ensureProgress=true}={}){
 const s=copy(input),changes=[];
 s.schema_version=1;s.game=ctx.game;
 if(!Array.isArray(s.choices))s.choices=[];
 while(s.choices.length<2){s.choices.push(freshChoice("approach-"+(s.choices.length+1),ctx.stats[s.choices.length%ctx.stats.length]));changes.push("Created missing choice");}
 if(s.choices.length>5){changes.push("Additional branches beyond five need manual review");}
 if(!s.location&&ctx.locations.length){s.location=ctx.locations[0];changes.push("Selected starting location");}
 if(!Array.isArray(s.tags))s.tags=[];
 if(!Array.isArray(s.secret_ids))s.secret_ids=[];
 if(!Array.isArray(s.requirements))s.requirements=[];
 const cleanRequirement=(r,at)=>{
  if(!isObject(r))return r;
  const out=copy(r);
  if(out.type==="stat")out.type="quality";
  if(out.type&&REQUIREMENTS.includes(out.type)&&!out.id&&out.target)out.id=out.target;
  if(!out.op)out.op=">=";
  if(out.value==null)out.value=1;
  if(Number.isFinite(Number(out.value)))out.value=Number(out.value);
  return {type:out.type,id:out.id??"",op:out.op,value:out.value};
 };
 s.requirements=s.requirements.map((r,i)=>cleanRequirement(r,"requirements["+i+"]"));
 const used=new Set();
 s.choices.forEach((c,i)=>{
  const at="choices["+i+"]";
  if(!isObject(c)){s.choices[i]=c=freshChoice("approach-"+(i+1),ctx.stats[i%ctx.stats.length]);changes.push(at+": restored missing choice")}
  if(!c.id||used.has(c.id)||!/^[a-z][a-z0-9-]+$/.test(c.id)){
   let id=slug(c.label||"approach-"+(i+1))||"approach-"+(i+1);
   if(!/^[a-z]/.test(id))id="approach-"+id;
   while(used.has(id))id=id+"-"+(i+1);
   c.id=id;changes.push(at+": fixed branch ID");
  }
  used.add(c.id);
  if(!c.stat&&ctx.stats.length){c.stat=ctx.stats[i%ctx.stats.length];changes.push(at+": selected primary stat")}
  if(!c.mode)c.mode="broad";
  if(!Number.isFinite(Number(c.difficulty))||Number(c.difficulty)<1){c.difficulty=5;changes.push(at+": set safe challenge difficulty")}
  else c.difficulty=Number(c.difficulty);
  if(!Number.isInteger(Number(c.action_cost))||Number(c.action_cost)<0||Number(c.action_cost)>3){c.action_cost=1;changes.push(at+": set single action cost")}
  else c.action_cost=Number(c.action_cost);
  if(!Array.isArray(c.requirements))c.requirements=[];
  c.requirements=c.requirements.map((r,j)=>cleanRequirement(r,at+".requirements["+j+"]"));
  for(const kind of ["success","failure","rare_success"]){
   if(kind==="rare_success"&&!c[kind])continue;
   if(!isObject(c[kind])){c[kind]={title:"",text:"",effects:[]};changes.push(at+"."+kind+": restored missing outcome")}
   const outcome=c[kind];
   if(!Array.isArray(outcome.effects))outcome.effects=[];
   outcome.effects=outcome.effects.map((e,j)=>cleanEffect(e,ctx,changes,at+"."+kind+".effects["+j+"]")).filter(Boolean);
   if(ensureProgress&&s.progress!==null&&kind!=="failure"&&!outcome.effects.some(e=>e.type==="ambition-progress"&&Number(e.amount)===1)){
    outcome.effects.push({type:"ambition-progress",id:"",amount:1});
    changes.push(at+"."+kind+": restored chain advancement");
   }
  }
 });
 // The workflow gate requires a pitch, although it used to be absent from QA.
 // Construct a grounded first draft from the user's existing scene and choices.
 // Do not fabricate a premise when the original contains no useful story content.
 if(!text(s.pitch)&&text(s.description).length>=40){
  const premise=text(s.description).replace(/\s+/g," ").slice(0,400);
  const approaches=s.choices.map(c=>text(c.label)).filter(Boolean).slice(0,3);
  const setbacks=s.choices.map(c=>text(c.failure?.text)).filter(Boolean).slice(0,2);
  s.pitch="Premise: "+premise+
   (approaches.length?" The player must decide whether to "+approaches.join(" or ").replace(/[.!?]+$/,"")+".":"")+
   (setbacks.length?" Stakes: "+setbacks.join(" Alternatively, ").slice(0,270):"");
  changes.push("pitch: built a usable outline from the existing scene, branches, and setbacks (ready for editorial revision)");
 }
 if(s.author==null)s.author="";
 if(s.reviewer==null)s.reviewer="";
 return {story:s,changes,report:audit(s,ctx)};
}
export function fullAutoMerge(current,proposal,ctx){
 // Keep author, reviewer, original story ID, reveal boundary and immutable schema.
 const source=isObject(proposal?.story)?proposal.story:proposal;
 if(!isObject(source))return repairDraft(current,ctx);
 const draft=copy(current);
 for(const field of ["title","pitch","kicker","description","location","tags","choices","requirements","ambition_id","progress","next_storylet"]){
  const value=source[field];
  if(value!==undefined&&value!==null){
   if(["title","pitch","kicker","description","location","ambition_id","next_storylet"].includes(field)
    ?typeof value==="string":Array.isArray(value)||typeof value==="number")draft[field]=copy(value);
  }
 }
 if(Number.isInteger(source.reveal_depth))draft.reveal_depth=Math.min(Number(current.reveal_depth)||1,source.reveal_depth);
 if(Array.isArray(source.secret_ids)&&source.secret_ids.every(id=>(ctx.secrets||[]).some(x=>x.id===id)))
  draft.secret_ids=copy(source.secret_ids);
 draft.id=current.id;draft.game=current.game;draft.schema_version=1;
 draft.author=current.author||"";draft.reviewer=current.reviewer||"";draft.history=copy(current.history||[]);
 draft.status=current.status==="approved"?"pitch":current.status;
 draft.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
 const r=repairDraft(draft,ctx);
 // No unnoticed fabrication of reviewer approval or change to the story identity.
 return r;
}
export const summarizeIssues=r=>r.errors.map(e=>({path:e.path,message:e.message}));
