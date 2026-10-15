import {project} from "./game-config.js";
import {mountGroqAssistant} from "./ai-assistant.js";
import {repairDraft} from "./auto-repair.js";
import {PHASES,STAGE_NAMES,EFFECTS,REQUIREMENTS,OPERATORS,slug,copy,freshStory,freshChoice,freshEffect,freshRequirement,audit,advance,creatorApprove,exportBundle,importBundle} from "./studio-core.js";
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const storeKey="qbn.studio."+project.game+".v1";
let drafts=[],selected=null,reference=false,secrets=[],docs={};
try{drafts=JSON.parse(localStorage.getItem(storeKey)||"[]");if(!Array.isArray(drafts))drafts=[]}catch{drafts=[]}
$("project-name").textContent=project.name;
$("editor").hidden=true;
const toast=message=>{$("toast").textContent=message;$("toast").classList.add("visible");setTimeout(()=>$("toast").classList.remove("visible"),4500)};
function save(){try{localStorage.setItem(storeKey,JSON.stringify(drafts))}catch{toast("Browser storage is full. Export the JSON now.")}}
function active(){return reference?project.published.find(x=>x.id===selected):drafts.find(x=>x.id===selected)}
function byPath(obj,path){return path.split(".").reduce((v,k)=>v?.[k],obj)}
function put(obj,path,value){const bits=path.split(".");let node=obj;for(const k of bits.slice(0,-1))node=node[k];node[bits.at(-1)]=value}
function context(){return {...project,secrets,draftIds:drafts.map(s=>s.id)}}
const label=(path,title)=>'<label for="p-'+esc(path)+'">'+esc(title)+'</label>';
function input(path,title,value,kind="text",placeholder=""){
 const control=kind==="textarea"?'<textarea id="p-'+esc(path)+'" data-path="'+esc(path)+'" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea>':
 '<input id="p-'+esc(path)+'" type="'+(kind==="number"?"number":"text")+'" data-path="'+esc(path)+'" placeholder="'+esc(placeholder)+'" value="'+esc(value)+'">';
 return '<div class="field">'+label(path,title)+control+'</div>';
}
function select(path,title,value,options){
 return '<div class="field">'+label(path,title)+'<select id="p-'+esc(path)+'" data-path="'+esc(path)+'">'+
 options.map(x=>{const [val,name]=Array.isArray(x)?x:[x,x];return '<option value="'+esc(val)+'" '+(String(value)===String(val)?"selected":"")+'>'+esc(name)+'</option>'}).join("")+'</select></div>';
}
function fieldForTarget(path,type,value){
 const options=type==="item"?project.items:type==="quality"?project.stats:type==="menace"?project.menaces:type==="quirk"?project.quirks:[];
 if(options.length)return select(path,"Target",value,[["","Select a "+type],...options]);
 if(type==="currency"||type==="ambition-progress")return '<input type="hidden" data-path="'+esc(path)+'" value="'+esc(value||"")+'"><small>'+(type==="currency"?"Game currency":"Current ambition")+'</small>';
 return input(path,"Target ID",value,"text","e.g. spoke-to-registrar");
}
function effectRows(path,effects){
 return (effects||[]).map((e,i)=>'<div class="actionrow">'+select(path+"."+i+".type","Effect",e.type,EFFECTS)+fieldForTarget(path+"."+i+".id",e.type,e.id)+
 input(path+"."+i+".amount","Amount",e.amount??1,"number")+
 '<button type="button" data-op="delete-effect" data-base="'+esc(path)+'" data-index="'+i+'" aria-label="Delete effect '+(i+1)+'">×</button></div>').join("")+
 '<button type="button" data-op="add-effect" data-base="'+esc(path)+'">+ Add effect</button>';
}
function requirementRows(path,requirements){
 return (requirements||[]).map((r,i)=>'<div class="actionrow">'+select(path+"."+i+".type","Require",r.type,REQUIREMENTS)+
 fieldForTarget(path+"."+i+".id",r.type,r.id)+select(path+"."+i+".op","Operator",r.op,OPERATORS)+
 input(path+"."+i+".value","Value",r.value)+
 '<button type="button" data-op="delete-requirement" data-base="'+esc(path)+'" data-index="'+i+'" aria-label="Delete requirement">×</button></div>').join("")+
 '<button type="button" data-op="add-requirement" data-base="'+esc(path)+'">+ Add requirement</button>';
}
function outcome(path,title,outcome,optional=false){
 if(optional&&!outcome)return '<div class="outcome"><h4>'+esc(title)+'</h4><button type="button" data-op="enable-rare" data-base="'+esc(path)+'">+ Add rare outcome</button></div>';
 return '<div class="outcome"><div class="row between"><h4>'+esc(title)+'</h4>'+
 (optional?'<button type="button" class="quiet" data-op="remove-rare" data-base="'+esc(path)+'">Remove</button>':'')+'</div>'+
 input(path+".title","Outcome title",outcome.title)+input(path+".text","Result prose (1–4 sentences)",outcome.text,"textarea")+
 '<p class="muted">Effects</p>'+effectRows(path+".effects",outcome.effects)+'</div>';
}
function renderBranches(s){
 $("branches").innerHTML=s.choices.map((c,i)=>{const p="choices."+i;
 return '<article class="branch"><div class="row between"><h3>Choice '+(i+1)+'</h3><button type="button" data-op="delete-choice" data-index="'+i+'">Remove choice</button></div>'+
 '<div class="grid">'+input(p+".id","Branch ID",c.id)+input(p+".label","Player-facing choice",c.label)+
 select(p+".stat","Challenge quality",c.stat,project.stats)+input(p+".difficulty","Difficulty",c.difficulty,"number")+
 select(p+".mode","Challenge type",c.mode,[["broad","Broad (scaled probability)"],["narrow","Narrow (fixed % difficulty)"],["classic","Classic d10 (NeathBound legacy)"]])+
 input(p+".action_cost","Action cost",c.action_cost,"number")+'</div><h4>Choice requirements</h4>'+
 requirementRows(p+".requirements",c.requirements)+
 outcome(p+".success","On success",c.success)+outcome(p+".failure","On failure",c.failure)+outcome(p+".rare_success","Rare success (optional)",c.rare_success,true)+
 '</article>'}).join("");
}
function renderFields(s){
 const secretsField=secrets.length?select("secret_ids.0","First secret touched",s.secret_ids?.[0]||"",[["","None"],...secrets.map(x=>[x.id,x.id+" · depth "+x.depth])]):"";
 $("fields").innerHTML='<div class="panel"><h3>Pitch and ownership</h3><div class="grid">'+
 input("title","Story title",s.title)+input("id","Unique storylet ID",s.id)+
 select("location","District",s.location,project.locations)+
 select("status","Workflow stage",s.status,PHASES.map((x,i)=>[x,STAGE_NAMES[i]]))+
 input("author","Author",s.author)+input("reviewer","Independent reviewer",s.reviewer)+
 '<div class="full">'+input("pitch","Pitch (beat, mechanics, scope and stakes)",s.pitch,"textarea")+'</div>'+
 '<div class="full">'+input("description","Scene prose · second-person present",s.description,"textarea")+'</div>'+
 input("kicker","Short kicker",s.kicker)+input("tags","Tags (comma-separated)",s.tags.join(", "))+
 '</div></div>'+
 '<div class="panel"><h3>Progression and continuity</h3><div class="grid">'+
 input("ambition_id","Ambition ID (blank for independent)",s.ambition_id)+
 input("progress","Expected chain progress (blank for independent)",s.progress??"","number")+
 input("next_storylet","Next storylet ID (if any)",s.next_storylet||"")+
 input("reveal_depth","Approved reveal depth · 1–5",s.reveal_depth,"number")+
 '<div class="full">'+input("secret_ids","Secret IDs (comma-separated)",s.secret_ids.join(", "))+'</div>'+
 '<div class="full">'+input("review_notes","Continuity and review notes",s.review_notes||"","textarea")+'</div>'+
 '</div><h4>Storylet requirements</h4>'+requirementRows("requirements",s.requirements)+'</div>';
}
function renderQA(){
 const s=active();
 if(!s||reference){$("qa-results").innerHTML='<p class="muted">Select a draft to run mechanical checks.</p>';$("qa-signoffs").innerHTML="";return}
 const report=audit(s,context(),{strict:s.status==="approved"});
 $("qa-results").innerHTML='<p><strong>'+(report.ok?"✓ Checks passed":"⚠ "+report.errors.length+" blocking issue(s)")+'</strong> · '+report.warnings.length+' advisory note(s)</p>'+
 report.errors.slice(0,24).map(x=>'<div class="qa-error"><small>'+esc(x.path)+'</small><div>'+esc(x.message)+'</div></div>').join("")+
 report.warnings.map(x=>'<div class="qa-warning">'+esc(x.path+": "+x.message)+'</div>').join("")+
 (!report.errors.length?'<div class="notice">Validation checks structure and references. It cannot replace a human prose or continuity review.</div>':'');
 const labels={content:"Content · copy, tone and spelling",design:"Design · economy and difficulty",mechanical:"Mechanical · progress and references",continuity:"Continuity · bible and secrets",peer:"Independent peer review"};
 $("qa-signoffs").innerHTML='<h3>Human sign-off (optional for solo creator approval)</h3>'+Object.entries(labels).map(([k,v])=>'<label class="check"><input type="checkbox" data-qa="'+k+'" '+(s.qa?.[k]?"checked":"")+'>'+esc(v)+'</label>').join("")+
 '<p class="muted">Only check work actually reviewed by a person. Solo creator approval is an alternative to an independent peer reviewer, and will be labelled in your export.</p>';
}
function renderList(){
 const search=$("story-search").value.toLowerCase().trim(),filter=$("story-filter").value;
 const own=filter==="references"?[]:drafts.map(s=>({...s,_reference:false}));
 const pub=filter==="drafts"?[]:project.published.map(s=>({...s,_reference:true}));
 const all=[...own,...pub].filter(s=>(s.id+" "+s.title).toLowerCase().includes(search)).slice(0,350);
 $("story-list").innerHTML=all.map(s=>'<button type="button" class="story-entry '+(s._reference?"reference ":"")+(s.id===selected&&reference===s._reference?"active":"")+'" data-open="'+esc(s.id)+'" data-ref="'+(s._reference?1:0)+'"><b>'+esc(s.title||s.id)+'</b><small>'+esc(s.id)+' · '+(s._reference?"Published reference":esc(s.status))+'</small></button>').join("")||'<p class="muted">No matching storylets.</p>';
}
const soloButton=document.createElement("button");
soloButton.id="solo-approve";soloButton.type="button";
soloButton.textContent="Approve as solo creator";
$("go-next").insertAdjacentElement("afterend",soloButton);
/** Solo creator approval is explicitly requested, not silently attributed to a peer. */
function approveSolo({fromAutofill=false,aiReview="none"}={}){
 const story=active();
 if(!story||reference)return false;
 if(!fromAutofill&&story.status!=="review"){
  toast("Use solo approval at Peer review, or Autofill & advance all stages.");return false;
 }
 const checked=audit(story,context());
 if(!checked.ok){toast("Resolve "+checked.errors.length+" issue(s): "+checked.errors[0].path);renderQA();return false}
 if(!confirm("Approve this as SOLO CREATOR? Validation passed, but no independent human has reviewed it. Your export will record this honestly."))return false;
 const result=creatorApprove(story,context(),{creatorConfirmed:true,aiReview:aiReview==="groq"?{kind:"groq"}:null});
 if(!result.ok){toast("Cannot approve: "+result.reason);renderQA();return false}
 const i=drafts.findIndex(x=>x===story||x.id===story.id);if(i<0)return false;
 drafts[i]=result.story;save();openStory(result.story.id,false);
 toast("Creator approved. No independent peer reviewer claimed. Export JSON when ready.");
 return true;
}
soloButton.addEventListener("click",()=>approveSolo());
function openStory(id,ref=false){
 selected=id;reference=ref;const s=active();if(!s)return;
 $("editor").hidden=false;$("welcome").hidden=true;
 $("editor-title").textContent=s.title||"Untitled storylet";$("editor-subtitle").textContent=(ref?"Published reference · read-only":"Local draft · "+s.status)+" · "+s.id;
 $("delete-story").disabled=ref;$("save-story").disabled=ref;$("add-choice").disabled=ref;$("export-story").disabled=ref;$("go-next").disabled=ref;
 $("copy-prompt").disabled=ref;
 $("download-publish").disabled=ref||s.status!=="approved";
 soloButton.hidden=ref||s.status!=="review";
 if(ref){
  $("fields").innerHTML='<div class="panel"><h3>'+esc(s.title)+'</h3><p>'+esc(s.text||"")+'</p><p class="muted">This is an existing script-authored story. Duplicate it to start new content without overwriting source.</p></div>';
  $("branches").innerHTML=(s.choices||[]).slice(0,8).map(c=>'<div class="panel"><strong>'+esc(c.label||"Choice")+'</strong><p>'+esc(c.success||"")+'</p></div>').join("");
  $("phase-bar").innerHTML='<span class="pill active">Published · read-only</span>';
 }else{
  $("phase-bar").innerHTML=PHASES.map((x,i)=>'<span class="pill '+(x===s.status?"active":"")+'">'+STAGE_NAMES[i]+'</span>').join("");
  renderFields(s);renderBranches(s);
 }
 renderQA();renderList();
}
function addDraft(s){if(drafts.some(x=>x.id===s.id)){toast("This ID is already a draft. Change the ID before importing.");return}drafts.unshift(s);save();openStory(s.id,false)}
function makeNew(){const s=freshStory(project);addDraft(s)}
$("new-story").onclick=makeNew;
$("save-story").onclick=()=>{save();toast("Saved in this browser. Export JSON for a durable backup.")};
$("story-search").oninput=renderList;$("story-filter").onchange=renderList;
$("story-list").onclick=event=>{const b=event.target.closest("[data-open]");if(b)openStory(b.dataset.open,b.dataset.ref==="1")};
$("secret-search").oninput=renderSecrets;
$("clone-story").onclick=()=>{
 const source=active();if(!source)return;
 const s=freshStory(project);
 s.title=(source.title||"Untitled")+" — new variation";
 s.location=source.location;s.description=source.description||source.text||"";
 s.choices=reference?(source.choices||[]).slice(0,5).map((c,i)=>({...freshChoice("approach-"+(i+1),project.stats[i%4]),label:c.label||""})):copy(source.choices);
 if(s.choices.length<2)s.choices.push(freshChoice("second-approach",project.stats[1]));
 s.id="draft-"+Date.now().toString(36);s.author="";s.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};s.status="pitch";
 addDraft(s);
};
$("delete-story").onclick=()=>{if(reference||!selected||!confirm("Delete this locally saved draft? Export it first if you might want it later."))return;drafts=drafts.filter(s=>s.id!==selected);save();selected=null;$("editor").hidden=true;$("welcome").hidden=false;renderList();renderQA()};
$("go-next").onclick=()=>{
 const s=active();if(!s||reference)return;
 const stage=PHASES[PHASES.indexOf(s.status)+1];
 if(!stage){toast("Already approved. Export and submit for review.");return}
 if(stage==="approved"&&(!s.qa?.peer||!String(s.reviewer||"").trim())){
  approveSolo({fromAutofill:true});return;
 }
 // A fully described scene should not be trapped in Pitch merely because the
 // author used Autofill and the separate pitch field was left empty.
 if(stage==="midflight"&&!String(s.pitch||"").trim()&&String(s.description||"").trim().length>=40){
  const repaired=repairDraft(s,context());
  if(String(repaired.story.pitch||"").trim()){
   s.pitch=repaired.story.pitch;
   s.qa={content:false,design:false,mechanical:false,continuity:false,peer:false};
   save();
  }
 }
 const result=advance(s,stage,context());if(!result.ok){toast(result.reason);renderQA();return}
 s.history.push({from:s.status,to:stage,at:new Date().toISOString(),reviewer:s.reviewer||null});s.status=stage;save();openStory(s.id);
};
$("fields").addEventListener("input",onField);
$("fields").addEventListener("change",onChange);
$("branches").addEventListener("input",onField);
$("branches").addEventListener("change",onChange);
function onField(ev){
 const p=ev.target.dataset.path,s=active();if(!p||!s||reference)return;
 let v=ev.target.value;
 if(["tags","secret_ids"].includes(p))v=v.split(",").map(x=>x.trim()).filter(Boolean);
 else if(p==="progress")v=v===""?null:Math.floor(Number(v));
 else if(p==="reveal_depth"||p.endsWith(".difficulty")||p.endsWith(".action_cost")||p.endsWith(".amount")||p.endsWith(".value"))v=v===""?0:Number(v);
 else if(p==="id"){if(!/^[a-z][a-z0-9-]*$/.test(v)){return}if(drafts.some(x=>x!==s&&x.id===v)||project.knownIds.includes(v)){toast("ID already exists.");return}selected=v}
 if(p==="status"){ev.target.value=s.status;toast("Use Advance stage to preserve the approval gates.");return}
 put(s,p,v);save();if(["id","title"].includes(p)){$("editor-title").textContent=s.title||"Untitled storylet";renderList()}
}
function onChange(ev){
 const p=ev.target.dataset.path;if(!p||reference)return;const s=active();if(!s)return;
 if(p.endsWith(".type")){
  const base=p.slice(0,-5),type=byPath(s,p);
  put(s,base+".id",({item:project.items[0],quality:project.stats[0],menace:project.menaces[0],quirk:project.quirks[0]})[type]||"");
  save();openStory(s.id);
 }else if(["location","id","tags","secret_ids","progress"].includes(p)){save();renderQA()}
 else renderQA();
}
$("branches").onclick=$("fields").onclick=ev=>{
 const b=ev.target.closest("[data-op]"),s=active();if(!b||!s||reference)return;
 const op=b.dataset.op,base=b.dataset.base,index=Number(b.dataset.index);
 if(op==="delete-choice")s.choices.splice(index,1);
 if(op==="add-effect")byPath(s,base).push(freshEffect());
 if(op==="delete-effect")byPath(s,base).splice(index,1);
 if(op==="add-requirement")byPath(s,base).push(freshRequirement("quality",project.stats[0]));
 if(op==="delete-requirement")byPath(s,base).splice(index,1);
 if(op==="enable-rare")put(s,base,{title:"",text:"",effects:[]});
 if(op==="remove-rare")put(s,base,null);
 save();openStory(s.id);
};
$("add-choice").onclick=()=>{const s=active();if(!s||reference)return;if(s.choices.length>=5){toast("Five choices maximum.");return}s.choices.push(freshChoice("approach-"+(s.choices.length+1),project.stats[s.choices.length%4]));save();openStory(s.id)};
$("qa-signoffs").onchange=ev=>{const k=ev.target.dataset.qa,s=active();if(!k||!s||reference)return;s.qa[k]=ev.target.checked;save();renderQA()};
$("run-qa").onclick=renderQA;
function download(name,data){
 const file=new Blob([JSON.stringify(data,null,2)+"\n"],{type:"application/json"}),url=URL.createObjectURL(file);
 const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("download-all").onclick=()=>download(project.game+"-studio-drafts.json",exportBundle(drafts,project.game));
$("export-story").onclick=()=>{const s=active();if(s&&!reference)download(s.id+".studio.json",exportBundle([s],project.game))};
$("download-publish").onclick=()=>{const s=active();if(!s||reference)return;const result=audit(s,context(),{strict:true});if(!result.ok){toast("Cannot publish: "+result.errors[0].message);renderQA();return}download(s.id+".json",s);toast("Approved storylet exported. Add this single JSON file under content/storylets/cms/ and build.");};
$("import-button").onclick=()=>$("file-upload").click();
$("file-upload").onchange=async ev=>{
 const file=ev.target.files?.[0];if(!file)return;
 try{
  const imported=importBundle(JSON.parse(await file.text()),project.game);
  const clashes=imported.filter(s=>drafts.some(x=>x.id===s.id));
  if(clashes.length&&!confirm(clashes.length+" draft(s) have matching IDs. Replace those local drafts?"))return;
  drafts=[...imported,...drafts.filter(x=>!imported.some(y=>y.id===x.id))];save();renderList();if(imported[0])openStory(imported[0].id);toast("Imported "+imported.length+" storylets. Review sign-offs before publishing.");
 }catch(e){toast("Import failed: "+e.message)}finally{ev.target.value=""}
};
function renderSecrets(){
 const query=$("secret-search").value.toLowerCase();
 const matching=secrets.filter(s=>[s.id,s.subject,s.surface,s.deep].join(" ").toLowerCase().includes(query)).slice(0,15);
 $("secret-list").innerHTML=matching.map(s=>'<details><summary>'+esc(s.id)+' · Depth '+s.depth+'</summary><p><strong>'+esc(s.subject)+'</strong></p><p>'+esc(s.surface)+'</p><small>Deeper account kept for reviewed reveals; conflicts are intentional only when attributed.</small></details>').join("")||'<p class="muted">No matching secrets.</p>';
}
$("copy-prompt").onclick=async()=>{
 const s=active();if(!s||reference)return;
 const prompts={
 pitch:"Pitch Agent: propose the story beat, place, mechanics, secret depth and new dependencies. Do not write prose.",
 midflight:"Structure Agent: create 2–5 branches, gates, challenge stats and outcomes. Put [PROSE PENDING] in prose fields. Do not invent schema keys.",
 prose:"Prose Agent: fill all unfinished prose, second person present. NEVER alter mechanics, effects, challenge tests, progress, branches or secret depth.",
 "content-qa":"Copy Chief: edit prose for spelling, tense, cadence, tone and forbidden terms. Return JSON and a change log.",
 "design-qa":"Design QA: check difficulty, CP, rewards, menace and action economy against the rules. Return violations only.",
 "mechanical-qa":"Mechanical QA: validate linked IDs, qualities, items, every branch and progression. Return exact JSON field paths.",
 continuity:"Continuity Agent: compare ALL reveals against the bible and secrets ledger, including the intended contradictions. Report the exact conflicting lines.",
 review:"Peer Reviewer: identify unresolved craft, balance and player clarity problems. Never self-approve.",
 approved:"Release Editor: confirm the independently reviewed, schema-valid JSON and release checklist. Do not deploy without tests."
 };
 const brief=[project.name,docs.bible,docs.secrets,docs.style,
  "STAGE: "+s.status,prompts[s.status],
  "DO NOT claim QA approvals. Preserve branch choices, outcome effects, secret depth and existing game canon.",
  "STORYLET JSON:",JSON.stringify(s,null,2)].join("\n\n---\n\n");
 try{await navigator.clipboard.writeText(brief);toast("Copied a stage-specific AI brief, including the world documents.")}catch{toast("Clipboard permission unavailable. Use a secure HTTPS connection.")}
};
Promise.all(["ledger.json","bible.md","secrets.md","style.md"].map(name=>fetch("./"+name).then(r=>{if(!r.ok)throw Error(name);return name.endsWith(".json")?r.json():r.text()}).catch(()=>name.endsWith(".json")?[]:""))).then(([list,bible,secretsDoc,style])=>{
 secrets=Array.isArray(list)?list:[];docs={bible,secrets:secretsDoc,style};renderSecrets();renderQA();
});
mountGroqAssistant({project,getStory:active,isReference:()=>reference,getContext:context,getDocs:()=>docs,
 createStory:()=>{const draft=freshStory(project);addDraft(draft);return draft},
 updateStory:(current,updated)=>{
  const i=drafts.findIndex(x=>x===current||x.id===current.id);
  if(i<0){toast("Could not find the draft to update.");return}
  if(updated.id!==current.id&&drafts.some((x,j)=>j!==i&&x.id===updated.id)){
   toast("AI suggestion has a duplicate draft ID.");return
  }
  drafts[i]=updated;save();openStory(updated.id,false);renderQA();
 },
 approveCreator:({aiReview="none"}={})=>approveSolo({fromAutofill:true,aiReview}),
 notify:toast});
renderList();renderQA();