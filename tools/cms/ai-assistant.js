import {audit} from "./studio-core.js";
import {repairDraft,fullAutoMerge,summarizeIssues} from "./auto-repair.js";
/** Groq writing partner for both games' QBN Studio.
 * AI drafts are optional suggestions: no publication, no QA self-approval.
 * The CMS access code remains only in sessionStorage and never enters an export.
 */
const GATEWAY="https://qbn-studio-ai.parris-neathaustralia.workers.dev/v1/assist";
const MODES={
 ideas:"Original story idea",pitch:"Narrative pitch",branches:"Branch design",prose:"Scene and outcome prose",
 character:"NPC dialogue and callbacks",mechanics:"Qualities, challenges and rewards",
 rare:"Rare successes and setbacks",living:"Living stories and timed letters",
 continuity:"Lore and continuity",economy:"Economy and profession balance",
 accessibility:"Accessible storytelling",qa:"Full independent QA",
 export:"Implementation / integration plan",batch:"Multi-story arc outline"
};
const esc=x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const clone=x=>JSON.parse(JSON.stringify(x));
const tokenKey="qbn.ai.access.v1";
const allowedFields=["title","pitch","kicker","description","location","tags","requirements","choices","secret_ids","reveal_depth","ambition_id","progress","next_storylet"];
const proseFields=["title","pitch","kicker","description"];
const numberFields=["difficulty","action_cost"];
function normalizeProposal(raw){if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 // A model may wrap an object in a 'story' member. Reject other object layouts.
 if(raw.story&&typeof raw.story==="object")return raw.story;
 return raw;
}
function merge(old,proposal,mode){
 const next=clone(old),p=normalizeProposal(proposal);
 if(!p)return null;
 if(mode==="prose"||mode==="character"){
  for(const k of proseFields)if(typeof p[k]==="string")next[k]=p[k];
  if(Array.isArray(p.choices)){
   for(let i=0;i<next.choices.length;i++){
    const c=p.choices[i];if(!c)continue;
    if(typeof c.label==="string"&&c.label.trim())next.choices[i].label=c.label;
    for(const key of ["success","failure","rare_success"]){
     if(!next.choices[i][key]||!c[key])continue;
     for(const field of ["title","text"])if(typeof c[key][field]==="string")
      next.choices[i][key][field]=c[key][field];
    }
   }
  }
 }else{
  for(const k of allowedFields)if(Object.hasOwn(p,k)&&(
   ["title","pitch","kicker","description","location","ambition_id","next_storylet"].includes(k)?typeof p[k]==="string"||p[k]===null:
   Array.isArray(p[k])||typeof p[k]==="number"||p[k]===null))next[k]=clone(p[k]);
 }
 // Invariants: AI cannot rename the save key, forge reviews, approve, alter provenance,
 // overwrite the writer/reviewer, or increase its spoiler depth without review.
 for(const key of ["id","game","schema_version","status","qa","history","author","reviewer","review_notes"])
  next[key]=clone(old[key]);
 next.reveal_depth=Math.min(Number(old.reveal_depth)||1,Number(next.reveal_depth)||1);
 if(!Array.isArray(next.choices)||next.choices.length<2||next.choices.length>5)next.choices=clone(old.choices);
 if(!Array.isArray(next.requirements))next.requirements=clone(old.requirements||[]);
 if(!Array.isArray(next.tags))next.tags=clone(old.tags||[]);
 if(!Array.isArray(next.secret_ids))next.secret_ids=clone(old.secret_ids||[]);
 if(["pitch","ideas","branches","rare","mechanics","living","economy","export","batch"].includes(mode)&&old.status!=="pitch")
  next.status="pitch"; // no bypass of later human editorial stages after mechanics change
 next.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
 return next;
}
function saveBlob(name,value){
 const blob=new Blob([JSON.stringify(value,null,2)+"\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function aiExport(game,story,docs,ctx){
 return {format:"qbn-ai-handoff",schema_version:1,source_game:game,
  integration_targets:["undercity","neathbound"],
  editorial_status:story.status,editorial_approvals:clone(story.qa||{}),
  instructions:[
   "Treat this as a proposal, not automatically approved game content.",
   "Apply to its native game first; map story stats, items, locations, menaces and CP formulas when adapting to the other game.",
   "Do not copy existing copyrighted media or canon from another game.",
   "Preserve player save migration, branch outcomes and the accurate declared review mode; independent peer review is optional for explicitly creator-approved solo drafts.",
   "Validate both games using their repository-native narrative studio and CI validators before PR."
  ],
  game_contract:{game,stats:ctx.stats,menaces:ctx.menaces,items:ctx.items,locations:ctx.locations,
   schema:"tools/cms/studio-core.js",engine_adapter:game==="undercity"?"content/cms-published.js":"src/game/cms-published.js"},
  story:clone(story),
  reference_documents:{bible:(docs.bible||"").slice(0,15000),
   style:(docs.style||"").slice(0,8000),secrets:(docs.secrets||"").slice(0,6000)},
  review_required:story.review_mode==="solo-creator"?["creator-confirmed","schema-validated"]:["content","design","mechanical","continuity","peer"],
  integration_tests:["node scripts/validate-content.mjs (Undercity)","npm test (both repos)"]
 };
}
export function mountGroqAssistant({project,getStory,isReference,createStory,updateStory,getDocs,getContext,approveCreator,notify}){
 const editor=document.querySelector("#editor");
 if(!editor)return;
 const ui=document.createElement("section");
 ui.id="groq-studio";ui.className="panel";ui.setAttribute("aria-label","Groq AI narrative assistant");
 ui.innerHTML='<h3>✦ Groq AI writing partner</h3>'+
  '<p class="muted">For pitches, branching, prose, NPCs, economy, timed stories, continuity, QA and cross-game handoffs. Individual AI suggestions are previewed before applying. For solo creators, the one-tap option can complete a validated draft and request explicit creator approval without claiming independent human review. Keys remain on the server. <a href="./GROQ_AI.md" target="_blank" rel="noreferrer">Groq configuration and safety guide</a>.</p>'+
  '<div class="grid"><div><label for="groq-mode">AI task</label><select id="groq-mode">'+
  Object.entries(MODES).map(([k,v])=>'<option value="'+esc(k)+'">'+esc(v)+'</option>').join("")+
  '</select></div><div><label for="groq-model">Model</label><select id="groq-model">'+
  '<option value="openai/gpt-oss-120b">Deep writer (120B)</option>'+
  '<option value="openai/gpt-oss-20b">Fast assistant (20B)</option></select></div></div>'+
  '<label for="groq-access">Studio access code (only stored in this browser session)</label>'+
  '<input id="groq-access" type="password" autocomplete="off" placeholder="Paste your private Studio access code">'+
  '<label for="groq-focus">Your creative direction</label><textarea id="groq-focus" rows="3" placeholder="Example: Invent a witness with a morally costly choice and a later NPC callback. Keep the established lore."></textarea>'+
  '<label class="check"><input id="groq-context" type="checkbox" checked> Include world bible, style guide and spoiler ledger in the request</label>'+
  '<div class="panel"><div class="row"><button id="groq-fixall" class="primary">✦ Autofill & Fix All</button>'+ 
  '<button id="groq-localfix">Fix schema issues offline</button><button id="groq-fasttrack">Autofill & advance all stages (solo)</button><button id="groq-undo" disabled>Undo autofix</button></div>'+ 
  '<p class="muted">One tap repairs invalid effects and missing story fields, asks Groq to finish the rest, runs QA again, and keeps an undo backup. No AI-generated human approvals.</p></div>'+ 
  '<div class="row"><button id="groq-generate" class="primary">Generate proposal</button>'+
  '<button id="groq-stage">Assist current stage</button><button id="groq-handoff">Export AI-ready handoff</button></div>'+
  '<div id="groq-feedback" role="status" aria-live="polite"></div>'+
  '<section id="groq-review" hidden><h3>AI proposal · review before applying</h3>'+
  '<p id="groq-summary"></p><div id="groq-issues"></div>'+
  '<details><summary>Inspect structured AI JSON</summary><pre id="groq-json"></pre></details>'+
  '<div class="row"><button id="groq-apply" class="primary" disabled>Apply proposal to this draft</button>'+
  '<button id="groq-new" disabled>Start separate draft from proposal</button>'+
  '<button id="groq-export" disabled>Download AI proposal JSON</button></div></section>';
 const toolbar=editor.querySelector(".toolbar");
 if(toolbar)toolbar.insertAdjacentElement("afterend",ui);else editor.append(ui);
 const $=x=>ui.querySelector("#"+x);
 const sideQA=document.querySelector("#run-qa");
 if(sideQA&&!document.querySelector("#groq-qa-fix")){
  const shortcut=document.createElement("button");
  shortcut.id="groq-qa-fix";shortcut.className="primary";shortcut.type="button";
  shortcut.textContent="✦ Fix all QA issues with Groq";
  sideQA.insertAdjacentElement("afterend",shortcut);
  shortcut.addEventListener("click",()=>{
   const selected=getStory();
   if(!selected||isReference()){notify("Duplicate a published reference or open an editable draft first.");return}
   document.querySelector("#groq-studio")?.scrollIntoView?.({behavior:"smooth",block:"start"});
   $("groq-fixall").click();
  });
 }
 let last=null,busy=false,fastTrackRequested=false;
 try{$("groq-access").value=sessionStorage.getItem(tokenKey)||""}catch{}
 const feedback=(text,error=false)=>{$("groq-feedback").textContent=text;$("groq-feedback").style.color=error?"#ffb0a0":""};
 $("groq-mode").value="pitch";
 $("groq-stage").addEventListener("click",()=>{
  const story=getStory();
  const m=story?.status;
  $("groq-mode").value=({pitch:"pitch",midflight:"branches",prose:"prose",
   "content-qa":"qa","design-qa":"qa","mechanical-qa":"qa",continuity:"continuity",
   review:"qa",approved:"export"})[m]||"ideas";
  $("groq-generate").click();
 });
 $("groq-handoff").addEventListener("click",()=>{
  const story=getStory();if(!story){feedback("Create a storylet first.",true);return}
  saveBlob(project.game+"-"+story.id+".ai-handoff.json",aiExport(project.game,story,getDocs(),getContext()));
  feedback("Downloaded a full AI-integration handoff for both games. No access code or Groq keys included.");
 });
 $("groq-generate").addEventListener("click",async()=>{
  const story=getStory();
  if(!story||isReference()){feedback("Open an editable draft first.",true);return}
  if(busy)return;
  const access=$("groq-access").value.trim(),mode=$("groq-mode").value;
  if(!access){feedback("Enter your Studio access code.",true);return}
  try{sessionStorage.setItem(tokenKey,access)}catch{}
  const docs=$("groq-context").checked?getDocs():{};
  const ctx=getContext();
  const context={
   active_story:clone(story),
   schema_fields:{required:["schema_version","game","id","title","description","location","choices"],
    choice:["id","label","stat","difficulty","mode","action_cost","requirements","success","failure","rare_success"]},
   game:{id:project.game,stats:project.stats,menaces:project.menaces,locations:project.locations,
    known_items:project.items.slice(0,130),known_story_ids:project.knownIds.slice(0,170),
    world_summary:project.sourceInfo,forbidden_terms:project.forbidden},
   rules:{max_choices:5,max_new_stories_in_batch:10,editorial_stages:["pitch","midflight","prose","content-qa","design-qa","mechanical-qa","continuity","review","approved"]},
   reference_docs:{bible:(docs.bible||"").slice(0,9000),
    style:(docs.style||"").slice(0,5000),secrets:(docs.secrets||"").slice(0,5000)},
   known_secrets:(ctx.secrets||[]).slice(0,10).map(x=>({id:x.id,depth:x.depth,subject:x.subject}))
  };
  busy=true;$("groq-generate").disabled=true;$("groq-review").hidden=true;
  feedback("Asking Groq to draft a "+MODES[mode].toLowerCase()+" proposal…");
  try{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),42000);
   let res;
   try{res=await fetch(GATEWAY,{method:"POST",headers:{"Content-Type":"application/json","X-Studio-Access":access},
     body:JSON.stringify({game:project.game,mode,model:$("groq-model").value,
      instruction:$("groq-focus").value,context}),signal:controller.signal})}finally{clearTimeout(timeout)}
   const result=await res.json().catch(()=>({error:"Could not read gateway response"}));
   if(!res.ok)throw Error(result.error||"Groq request failed");
   last={mode,storyId:story.id,result};
   $("groq-summary").textContent=result.summary||"Proposal received";
   $("groq-json").textContent=JSON.stringify(result,null,2);
   $("groq-issues").replaceChildren();
   for(const issue of result.issues||[]){
    const p=document.createElement("p");p.className="qa-warning";
    p.textContent=(issue.severity||"Issue")+": "+(issue.path||"general")+" — "+(issue.problem||"")+" "+(issue.recommendation||"");
    $("groq-issues").append(p);
   }
   $("groq-review").hidden=false;
   const advisory=["qa","continuity","accessibility"].includes(mode);
   $("groq-apply").disabled=advisory||!result.proposal;
   $("groq-new").disabled=!result.proposal;
   $("groq-export").disabled=false;
   feedback("Groq proposal ready ("+result.model+"). Review it below. No draft has been changed.");
  }catch(error){feedback("Could not generate: "+error.message,true)}
  finally{busy=false;$("groq-generate").disabled=false}
 });
 $("groq-apply").addEventListener("click",()=>{
  const story=getStory();if(!last||!story||isReference()||story.id!==last.storyId){feedback("Reopen the original draft to apply.",true);return}
  if(!last.result.proposal){feedback("This review contains advice only, not a replacement story.",true);return}
  const result=merge(story,last.result.proposal,last.mode);
  if(!result){feedback("The model did not return a usable story proposal.",true);return}
  if(!confirm("Replace allowed draft fields with the AI proposal? All QA sign-offs will be cleared. Export the draft first if you want a backup."))return;
  const normalized=repairDraft(result,getContext()).story;
  updateStory(story,normalized);
  feedback("Applied to draft. All QA sign-offs cleared. Review every mechanic and complete the editorial process before publishing.");
 });
 $("groq-new").addEventListener("click",()=>{
  if(!last?.result?.proposal)return;
  const seed=createStory(),combined=merge(seed,last.result.proposal,last.mode);
  if(!combined)return;
  combined.id="draft-ai-"+Date.now().toString(36);combined.status="pitch";
  combined.author="";combined.reviewer="";combined.history=[];combined.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
  updateStory(seed,combined);
  feedback("Created a separate unapproved AI-assisted draft. Review its quality and mechanics.");
 });
 $("groq-export").addEventListener("click",()=>{if(last)saveBlob(project.game+"-groq-"+last.mode+".json",
  {format:"qbn-ai-proposal",schema_version:1,game:project.game,mode:last.mode,results:last.result,
   warning:"AI-generated proposal only; never interpret as an approved or deployed storylet."})});

 const backupsKey="qbn.studio.autofix-backups."+project.game+".v1";
 let undoStory=null;
 function saveBackup(s){
  undoStory=clone(s);
  try{const old=JSON.parse(localStorage.getItem(backupsKey)||"[]");
   const history=Array.isArray(old)?old:[];
   history.unshift({saved_at:new Date().toISOString(),id:s.id,story:clone(s)});
   localStorage.setItem(backupsKey,JSON.stringify(history.slice(0,5)));
  }catch{/* Browser storage may be disabled; in-memory undo still works. */}
  $("groq-undo").disabled=false;
 }
 $("groq-undo").addEventListener("click",()=>{
  const current=getStory();
  if(!undoStory||!current||current.id!==undoStory.id||isReference()){feedback("No undo for this draft.",true);return}
  const restored=clone(undoStory);undoStory=null;
  updateStory(current,restored);$("groq-undo").disabled=true;
  feedback("Restored the version before automatic repairs.");
 });
 $("groq-localfix").addEventListener("click",()=>{
  const s=getStory();if(!s||isReference()){feedback("Open a draft first.",true);return}
  const ctx=getContext(),before=audit(s,ctx),out=repairDraft(s,ctx);
  if(JSON.stringify(out.story)===JSON.stringify(s)){feedback("No safe structural changes found. "+before.errors.length+" issue(s) remain.");return}
  saveBackup(s);out.story.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
  updateStory(s,out.story);
  feedback("Fixed "+out.changes.length+" structurally invalid fields. QA: "+before.errors.length+" → "+out.report.errors.length+" issue(s). "+(out.report.errors.length?"Groq can fill the remaining prose and references.":"Ready for human editorial review."));
 });
 $("groq-fasttrack").addEventListener("click",()=>{
  const story=getStory();
  if(!story||isReference()){feedback("Open an editable storylet first.",true);return}
  if(busy){feedback("An AI repair is still running. Wait for it to finish.",true);return}
  fastTrackRequested=true;
  $("groq-fixall").click();
 });
 $("groq-fixall").addEventListener("click",async()=>{
  const source=getStory();if(!source||isReference()){feedback("Open your editable storylet draft first.",true);return}
  if(busy)return;
  const original=clone(source),ctx=getContext();
  const initial=audit(source,ctx),first=repairDraft(source,ctx);
  let working=first.story,report=first.report,passes=0,warning="";
  const access=$("groq-access").value.trim();
  const changes=[...first.changes];
  let groqApplied=false;
  busy=true;$("groq-fixall").disabled=true;$("groq-generate").disabled=true;
  const beforeFingerprint=JSON.stringify(source);
  const docs=$("groq-context").checked?getDocs():{};
  feedback("Checking "+initial.errors.length+" issues and repairing the local schema…");
  try{
   if(access){
    try{sessionStorage.setItem(tokenKey,access)}catch{}
    const maxPasses=3;
    for(let pass=0;pass<maxPasses;pass++){
     // Don't send requests if the whole proposal is already valid and written.
     if(pass>0&&!report.errors.length)break;
     passes++;
     feedback("Groq pass "+passes+"/"+maxPasses+" · "+report.errors.length+" blocking issue(s) …");
     const context={
      active_story:working,
      qa_errors:summarizeIssues(report),
      exact_schema:{
       root:["schema_version","game","id","title","description","location","pitch","kicker","choices","author","reviewer","qa","status","requirements","ambition_id","progress","next_storylet","reveal_depth"],
       choice:{id:"unique-kebab-case",label:"player facing action",stat:"existing primary stat",difficulty:5,mode:"broad",action_cost:1,
         requirements:[],success:{title:"outcome title",text:"at least twelve original characters",effects:[]},
         failure:{title:"failure title",text:"at least twelve original characters",effects:[]},rare_success:null},
       effect:{type:"currency | item | menace | flag | quality | quirk | ambition-progress | living-story",id:"a valid existing target (empty string ONLY for currency or ambition-progress)",amount:1},
       requirement:{type:"quality | item | menace | flag | quirk",id:"existing item or quality ID",op:">=",value:1}
      },
      allowed_ids:{stats:ctx.stats,menaces:ctx.menaces,quirks:ctx.quirks,items:ctx.items.slice(0,170),
        locations:ctx.locations,known_story_ids:ctx.knownIds.slice(0,170)},
      game:project.game,
      reference_docs:{bible:(docs.bible||"").slice(0,7500),style:(docs.style||"").slice(0,3500),
        secrets:(docs.secrets||"").slice(0,3500)},
      review_policy:"Keep original story id, writer, reviewer, QA, status and secret depth; never claim human sign-off."
     };
     const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),42000);
     let response;
     try{response=await fetch(GATEWAY,{method:"POST",headers:{"Content-Type":"application/json","X-Studio-Access":access},
       body:JSON.stringify({game:project.game,mode:"repair",model:$("groq-model").value,
       instruction:"Complete all unfinished fields and address EVERY QA error. "+$("groq-focus").value+
       "\nReturn ONE full canonical storylet object in proposal, not a list of suggestions. All branch effect entries MUST use the exact type/id/amount format. No placeholder or unknown effects. Make each outcome unique, rich and fun. Preserve established facts. Do not invent humans' names or approvals.",context}),
       signal:abort.signal});}finally{clearTimeout(timer)}
     const result=await response.json().catch(()=>({error:"No readable response"}));
     if(!response.ok)throw Error(result.error||"Groq request failed");
     if(!result.proposal){warning="Groq returned advice without a complete story draft.";break}
     const candidate=fullAutoMerge(working,result.proposal,ctx);
     const newScore=candidate.report.errors.length,previous=report.errors.length;
     const currentJSON=JSON.stringify(working),nextJSON=JSON.stringify(candidate.story);
     if(newScore>previous){warning="Groq suggested changes that made validation worse; those changes were rejected.";break}
     if(currentJSON===nextJSON){warning="Groq returned no additional actionable edits.";break}
     working=candidate.story;report=candidate.report;groqApplied=true;
     changes.push(...candidate.changes);
     if(newScore===0)break;
     if(pass===maxPasses-1)warning="Some fields still need attention after the AI passes.";
    }
   }else warning="No Studio access code supplied; structural fixes ran locally, but creative autofill needs Groq.";
   const latest=getStory();
   if(!latest||latest.id!==original.id||JSON.stringify(latest)!==beforeFingerprint){
    feedback("The draft changed while Groq was working. Nothing was overwritten. Reopen the draft and retry.",true);return;
   }
   if(JSON.stringify(working)!==JSON.stringify(original)){
    working.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
    if(original.status==="approved")working.status="pitch";
    saveBackup(original);updateStory(latest,working);
   }
   const message="Autofill & Fix completed: "+initial.errors.length+" → "+report.errors.length+
    " blocking issue(s); "+passes+" AI pass(es), "+changes.length+
    " structural adjustment(s). "+(warning||"")+
    (report.errors.length?" Remaining: "+report.errors.slice(0,3).map(e=>e.path+" — "+e.message).join("; "):
    " No structural blockers. Human editorial approval is still required.");
   feedback(message,report.errors.length>0);
   if(fastTrackRequested){
    fastTrackRequested=false;
    if(report.errors.length){feedback(message+" Cannot approve while errors remain.",true)}
    else if(typeof approveCreator==="function"){
     const success=approveCreator({aiReview:groqApplied?"groq":"none"});
     feedback(success?"Validated draft approved as SOLO CREATOR; no independent reviewer was claimed.":
      "Solo approval was cancelled or blocked. Your repaired draft is still saved.",!success);
    }
   }
  }catch(err){
   // Preserve the safe deterministic repairs even when network/API fails.
   if(JSON.stringify(working)!==JSON.stringify(original)&&
       getStory()?.id===original.id&&JSON.stringify(getStory())===beforeFingerprint){
    working.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
    if(original.status==="approved")working.status="pitch";
    saveBackup(original);updateStory(source,working);
   }
   feedback("Groq could not finish: "+err.message+". Local fixes were saved where safe; use Undo or retry.",true);
   // A failed service call must not automatically become a purported AI review.
   if(fastTrackRequested){
    fastTrackRequested=false;
    const remaining=getStory()&&!isReference()?audit(getStory(),getContext()).errors:[{path:"story"}];
    if(!remaining.length&&typeof approveCreator==="function"){
     const success=approveCreator({aiReview:"none"});
     feedback(success?"Saved and approved as SOLO CREATOR (no Groq review).":
      "Solo approval cancelled. Your draft remains saved.",!success);
    }
   }
  }finally{busy=false;$("groq-fixall").disabled=false;$("groq-generate").disabled=false}
 });
 return {getGateway:()=>GATEWAY};
}
