/** Shared, dependency-free QBN Studio authoring contract. */
export const PHASES=["pitch","midflight","prose","content-qa","design-qa","mechanical-qa","continuity","review","approved"];
export const STAGE_NAMES=["01 · Pitch","02 · Structure","03 · Prose","04 · Content QA","05 · Design QA","06 · Mechanical QA","07 · Continuity","08 · Peer review","09 · Approved"];
export const EFFECTS=["currency","item","menace","flag","quality","quirk","ambition-progress","living-story"];
export const REQUIREMENTS=["quality","item","menace","flag","quirk"];
export const OPERATORS=[">=","==","!=",">","<","<="];
export const slug=s=>String(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export const copy=o=>JSON.parse(JSON.stringify(o));
export function freshChoice(id="approach",stat=""){
 return {id,label:"",stat,difficulty:5,mode:"broad",action_cost:1,requirements:[],
 success:{title:"",text:"",effects:[]},failure:{title:"",text:"",effects:[]},rare_success:null};
}
export function freshStory(ctx){
 return {schema_version:1,game:ctx.game,id:"draft-"+Date.now().toString(36),title:"",location:ctx.locations[0],
  description:"",kicker:"",once:true,author:"",reviewer:"",status:"pitch",pitch:"",review_notes:"",
  secret_ids:[],reveal_depth:1,tags:[],ambition_id:"",progress:null,next_storylet:null,
  requirements:[],choices:[freshChoice("approach-one",ctx.stats[0]),freshChoice("approach-two",ctx.stats[1])],
  qa:{content:false,design:false,mechanical:false,continuity:false,peer:false},history:[]};
}
export const freshEffect=(type="currency",id="",amount=1)=>({type,id,amount});
export const freshRequirement=(type="quality",id="",op=">=",value=1)=>({type,id,op,value});
const filled=x=>typeof x==="string"&&x.trim().length>0;
export function audit(s,ctx,{strict=false,allowExisting=false}={}){
 const errors=[],warnings=[],fail=(path,message)=>errors.push({path,message}),warn=(path,message)=>warnings.push({path,message});
 if(s.schema_version!==1)fail("schema_version","Unsupported schema version.");
 if(s.game!==ctx.game)fail("game","Story belongs to the other game.");
 if(!/^[a-z][a-z0-9-]{2,80}$/.test(s.id||""))fail("id","Use a unique kebab-case ID.");
 if(!allowExisting&&(ctx.knownIds||[]).includes(s.id))fail("id","ID exists in the game; clone as a new storylet.");
 if(!filled(s.title))fail("title","Write a title.");
 if(!filled(s.pitch))fail("pitch","Missing story pitch. Use Autofill & Fix All to create it before advancing.");
 if(!(ctx.locations||[]).includes(s.location))fail("location","Select an existing district.");
 if(!filled(s.description)||s.description.length<40)fail("description","Write at least 40 characters of original scene prose.");
 if(!Array.isArray(s.choices)||s.choices.length<2||s.choices.length>5)fail("choices","Require 2–5 choices.");
 if(s.author&&s.reviewer&&s.author.trim().toLowerCase()===s.reviewer.trim().toLowerCase())fail("reviewer","Author and peer reviewer must differ.");
 if(!filled(s.author))warn("author","Identify the writer for accountability.");
 if(s.progress!==null&&(!Number.isInteger(s.progress)||s.progress<0||!filled(s.ambition_id)))
  fail("progress","Chain needs an ambition ID and non-negative integer progress.");
 if(s.next_storylet&&!(ctx.knownIds||[]).includes(s.next_storylet)&&!(ctx.draftIds||[]).includes(s.next_storylet))
  fail("next_storylet","Linked storylet does not exist.");
 const validateRequirement=(r,path)=>{
  if(!REQUIREMENTS.includes(r.type)||!filled(r.id)||!OPERATORS.includes(r.op))fail(path,"Invalid requirement or comparison.");
  if(r.type==="quality"&&!ctx.stats.includes(r.id))fail(path+".id","Unknown stat.");
  if(r.type==="item"&&!ctx.items.includes(r.id))fail(path+".id","Unknown item.");
  if(r.type==="menace"&&!ctx.menaces.includes(r.id))fail(path+".id","Unknown menace.");
  if(r.type==="quirk"&&!ctx.quirks.includes(r.id))fail(path+".id","Unknown disposition.");
 };
 (s.requirements||[]).forEach((r,i)=>validateRequirement(r,"requirements["+i+"]"));
 const branchIds=new Set();
 (s.choices||[]).forEach((c,i)=>{
  const path="choices["+i+"]";
  if(!/^[a-z][a-z0-9-]+$/.test(c.id||"")||branchIds.has(c.id))fail(path+".id","Invalid or repeated branch ID.");
  branchIds.add(c.id);
  if(!filled(c.label))fail(path+".label","Missing player-facing choice.");
  if(!ctx.stats.includes(c.stat))fail(path+".stat","Unknown primary stat.");
  if(!Number.isFinite(Number(c.difficulty))||Number(c.difficulty)<1)fail(path+".difficulty","Difficulty must be positive.");
  if(!["broad","narrow","classic"].includes(c.mode))fail(path+".mode","Invalid challenge mode.");
  if(!Number.isInteger(Number(c.action_cost))||Number(c.action_cost)<0||Number(c.action_cost)>3)fail(path+".action_cost","Action cost must be 0–3.");
  (c.requirements||[]).forEach((r,j)=>validateRequirement(r,path+".requirements["+j+"]"));
  ["success","failure","rare_success"].forEach(name=>{
   const o=c[name],at=path+"."+name;
   if(!o){if(name!=="rare_success")fail(at,"Missing outcome.");return;}
   if(!filled(o.title))fail(at+".title","Outcome needs a title.");
   if(!filled(o.text)||o.text.length<12||o.text.includes("[PROSE PENDING]"))fail(at+".text","Outcome needs finished prose (12+ characters).");
   (o.effects||[]).forEach((e,j)=>{
    const p=at+".effects["+j+"]";
    if(!EFFECTS.includes(e.type))fail(p,"Unknown effect type.");
    if(!["currency","ambition-progress"].includes(e.type)&&!filled(e.id))fail(p+".id","Missing effect target.");
    if(e.type==="quality"&&!ctx.stats.includes(e.id))fail(p+".id","Unknown stat.");
    if(e.type==="item"&&!ctx.items.includes(e.id))fail(p+".id","Unknown item.");
    if(e.type==="menace"&&!ctx.menaces.includes(e.id))fail(p+".id","Unknown menace.");
    if(e.type==="quirk"&&!ctx.quirks.includes(e.id))fail(p+".id","Unknown disposition.");
    if(e.type==="living-story"&&s.game!=="neathbound")fail(p,"Timed outcomes need an Undercity scheduler adapter.");
    if(e.type==="ambition-progress"&&(!s.ambition_id||Number(e.amount)!==1))fail(p,"Chains must advance by exactly one.");
    if(e.type==="flag"&&e.value!==undefined&&e.value!==true)fail(p,"Only true-valued flags supported.");
    if(!["flag","living-story"].includes(e.type)&&!Number.isFinite(Number(e.amount)))fail(p+".amount","Effect amount is not numeric.");
   });
  });
  if(s.progress!==null&&!c.success?.effects?.some(e=>e.type==="ambition-progress"&&Number(e.amount)===1))
   fail(path+".success.effects","Success needs exactly one chain advancement.");
  if(s.progress!==null&&c.rare_success&&!c.rare_success.effects?.some(e=>e.type==="ambition-progress"&&Number(e.amount)===1))
   fail(path+".rare_success.effects","Rare success needs chain advancement.");
  if(Number(c.difficulty)>18)warn(path+".difficulty","High difficulty: check playtest balance.");
  if(Number(c.action_cost)>1)warn(path+".action_cost","Unusual action cost: review economy.");
 });
 for(const key of s.secret_ids||[]){
  const secret=(ctx.secrets||[]).find(x=>x.id===key);
  if(!secret)fail("secret_ids","Unknown secret: "+key);
  else if(secret.depth>s.reveal_depth)fail("reveal_depth","Reveal exceeds authorised depth for "+key);
 }
 const prose=[s.title,s.description,...(s.choices||[]).flatMap(c=>[c.label,c.success?.text,c.failure?.text,c.rare_success?.text])].join(" ").toLowerCase();
 for(const term of ctx.forbidden||[])if(term&&prose.includes(term.toLowerCase()))fail("prose","Forbidden phrase: "+term);
 if(strict){
  const solo=s.review_mode==="solo-creator"&&s.creator_approval?.method==="creator-confirmed"&&
   filled(s.creator_approval.confirmed_at)&&s.creator_approval.schema_qa_passed===true;
  if(s.review_mode==="solo-creator"&&!solo)fail("creator_approval","Solo approval needs the creator's explicit confirmation and a passing schema audit.");
  if(!solo){
   for(const key of ["content","design","mechanical","continuity","peer"])if(!s.qa?.[key])fail("qa."+key,"QA sign-off missing.");
   if(!filled(s.reviewer))fail("reviewer","Assign another human as reviewer.");
  }
  if(s.status!=="approved")fail("status","Only approved content can publish.");
 }
 return {ok:!errors.length,errors,warnings};
}
export function advance(s,target,ctx){
 const from=PHASES.indexOf(s.status),to=PHASES.indexOf(target);
 if(to!==from+1)return {ok:false,reason:"Advance one stage at a time."};
 if(to>=1&&!filled(s.pitch))return {ok:false,reason:"Your story pitch is empty. Use Autofill & Fix All, or enter a pitch, before advancing."};
 if(to>=2&&s.choices.length<2)return {ok:false,reason:"Complete the structure first."};
 if(to>=3&&(!filled(s.description)||s.choices.some(c=>!filled(c.success.text)||!filled(c.failure.text))))
  return {ok:false,reason:"Finish the prose before QA."};
 const gates={4:"content",5:"design",6:"mechanical",7:"continuity",8:"peer"};
 if(gates[to]&&!s.qa[gates[to]])return {ok:false,reason:"Previous stage needs sign-off: "+gates[to]};
 if(to===8){
  const check=audit({...s,status:"approved"},ctx,{strict:true});
  if(!check.ok)return {ok:false,reason:check.errors[0].path+": "+check.errors[0].message};
 }
 return {ok:true};
}
/**
 * Optional single-author pathway.  The user explicitly clicks to approve their
 * own schema-valid work.  This is NEVER described as independent peer review.
 * The normal five-check human editorial pathway remains unchanged.
 */
export function creatorApprove(input,ctx,{creatorConfirmed=false,aiReview=null}={}){
 if(!creatorConfirmed)return {ok:false,reason:"Creator approval requires your explicit confirmation."};
 const before=audit(input,ctx);
 if(!before.ok)return {ok:false,reason:before.errors[0].path+": "+before.errors[0].message,errors:before.errors};
 const s=copy(input),now=new Date().toISOString();
 s.review_mode="solo-creator";
 s.creator_approval={
  method:"creator-confirmed",confirmed_at:now,schema_qa_passed:true,
  independent_human_review:false,
  ai_assistance:aiReview?.kind==="groq"?"groq":"none",
  ai_claimed_approval:false
 };
 // Human review fields retain their true values; never forge a peer reviewer.
 s.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
 s.history=Array.isArray(s.history)?s.history:[];
 s.history.push({from:s.status,to:"approved",at:now,reviewer:null,
  pathway:"solo-creator",note:"Creator approved validated content; no independent human peer review."});
 s.status="approved";
 const verified=audit(s,ctx,{strict:true});
 if(!verified.ok)return {ok:false,reason:verified.errors[0].path+": "+verified.errors[0].message,errors:verified.errors};
 return {ok:true,story:s};
}
export function exportBundle(stories,game){return {format:"qbn-studio-export",schema_version:1,game,exported_at:new Date().toISOString(),stories:copy(stories)};}
export function importBundle(value,game){
 if(!value||value.format!=="qbn-studio-export"||value.schema_version!==1||value.game!==game||!Array.isArray(value.stories))throw Error("Invalid studio export for "+game);
 if(value.stories.some(s=>s.game!==game||!Array.isArray(s.choices)||!s.id))throw Error("Malformed storylet in export.");
 return copy(value.stories);
}
