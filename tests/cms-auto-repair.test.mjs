import test from "node:test";
import assert from "node:assert/strict";
import {freshStory,audit,advance} from "../tools/cms/studio-core.js";
import {repairDraft,fullAutoMerge} from "../tools/cms/auto-repair.js";
const ctx={
 game:"undercity",knownIds:[],draftIds:[],locations:["court","quays"],stats:["observation","guile","persuasion","resolve"],
 menaces:["suspicion","notoriety","wounds","delirium"],items:["ledger","brass"],quirks:["honest","steadfast"],
 secrets:[],forbidden:[]
};
function story(){
 const s=freshStory(ctx);s.title="The Tenant of the Thirteenth Stair";
 s.pitch="A witness is about to betray her neighbours to buy back her mother's stolen lamp.";
 s.description="In the registrar's office, a witness holds an unpaid bill against a half-lit window and waits for you to answer.";
 s.author="Automated draft";
 for(const [i,c] of s.choices.entries()){
  c.label=i?"Protect the witness and her family":"Demand the evidence in public";
  c.success={title:"The testimony survives",text:"The witness provides testimony while the registrar conceals the family's address.",effects:[]};
  c.failure={title:"A name slips away",text:"The registrar writes down a name before the tenant can hide her trembling hands.",effects:[]};
 }
 return s;
}
test("repairs blank effect placeholders, quality aliases and numeric strings without inventing effects",()=>{
 const s=story();
 s.choices[0].success.effects=[
  {},{type:"stat",stat:"observation",amount:"2"},{item:"ledger",amount:"1"},
  {type:"menace",id:"suspicion",amount:"-2"}];
 s.choices[1].failure.effects=[{type:"",id:"",amount:""}];
 const before=audit(s,ctx),r=repairDraft(s,ctx);
 assert.ok(before.errors.length>r.report.errors.length);
 assert.deepEqual(r.story.choices[0].success.effects,[
  {type:"quality",id:"observation",amount:2,value:undefined},
  {type:"item",id:"ledger",amount:1,value:undefined},
  {type:"menace",id:"suspicion",amount:-2,value:undefined}]);
 assert.equal(r.story.choices[1].failure.effects.length,0);
 assert.equal(r.report.errors.length,0);
});
test("unrecognized target stays blocked instead of inventing a different resource",()=>{
 const s=story();s.choices[0].success.effects=[{type:"item",id:"unknown-artifact",amount:5}];
 const r=repairDraft(s,ctx);
 assert.equal(r.story.choices[0].success.effects[0].id,"unknown-artifact");
 assert.ok(r.report.errors.some(e=>e.message==="Unknown item."));
});
test("restores one ambition step to each successful branch, and never to failure",()=>{
 const s=story();s.progress=12;s.ambition_id="tide";
 const out=repairDraft(s,ctx);
 assert.equal(out.report.errors.length,0);
 for(const c of out.story.choices){
  assert.equal(c.success.effects.filter(e=>e.type==="ambition-progress").length,1);
  assert.equal(c.failure.effects.filter(e=>e.type==="ambition-progress").length,0);
 }
});
test("AI full draft merge preserves identity, author, reviewer and spoiler/approval protection",()=>{
 const original=story();original.qa={content:true,design:true,mechanical:true,continuity:true,peer:true};
 original.reveal_depth=1;original.reviewer="Independent Human";
 const proposal={id:"hack-the-id",game:"neathbound",title:"The Restored Lamp",
  author:"Model",reviewer:"AI",status:"approved",reveal_depth:5,
  qa:{content:true,design:true,mechanical:true,continuity:true,peer:true},
  choices:original.choices.map(c=>({...c,label:"Tell the Council why "+c.id+" matters"}))};
 const r=fullAutoMerge(original,proposal,ctx);
 assert.equal(r.story.id,original.id);
 assert.equal(r.story.game,"undercity");
 assert.equal(r.story.author,"Automated draft");
 assert.equal(r.story.reviewer,"Independent Human");
 assert.equal(r.story.reveal_depth,1);
 assert.deepEqual(Object.values(r.story.qa),[false,false,false,false,false]);
 assert.equal(r.story.title,"The Restored Lamp");
 assert.equal(r.report.errors.length,0);
});
test("blank draft can be filled by a canonical AI proposal, then pass structural QA",()=>{
 const original=freshStory(ctx);
 const completed=story();
 const r=fullAutoMerge(original,completed,ctx);
 assert.equal(r.report.errors.length,0);
 assert.equal(r.story.id,original.id);
 assert.equal(r.story.title,completed.title);
 assert.equal(r.story.choices.length,2);
});

test("autofill repairs a missing pitch using existing scene, choice and setback; Advance then works",()=>{
 const original=story();
 original.pitch="";
 const blocked=advance(original,"midflight",ctx);
 assert.equal(blocked.ok,false);
 assert.ok(audit(original,ctx).errors.some(e=>e.path==="pitch"),"QA must report the same missing pitch as Advance");
 const result=repairDraft(original,ctx);
 assert.ok(result.story.pitch.startsWith("Premise: "));
 assert.ok(result.story.pitch.includes("Protect the witness and her family"));
 assert.ok(result.story.pitch.includes("Stakes:"));
 assert.ok(result.changes.some(x=>x.startsWith("pitch:")));
 assert.equal(result.report.errors.length,0);
 assert.equal(advance(result.story,"midflight",ctx).ok,true,"autofill must unlock the next writing stage");
});
test("no invented pitch when a draft has no scene or usable narrative foundation",()=>{
 const empty=freshStory(ctx);
 const result=repairDraft(empty,ctx);
 assert.equal(result.story.pitch,"");
 assert.ok(result.report.errors.some(e=>e.path==="pitch"));
 assert.equal(advance(result.story,"midflight",ctx).ok,false);
});
test("AI suggestions that omit a pitch cannot erase a grounded autogenerated one",()=>{
 const original=story();
 original.pitch="";
 const fixed=repairDraft(original,ctx).story;
 const merged=fullAutoMerge(fixed,{title:"The Repaired Witness",choices:fixed.choices},ctx);
 assert.equal(merged.story.title,"The Repaired Witness");
 assert.equal(merged.story.pitch,fixed.pitch);
 assert.equal(merged.report.errors.length,0);
});
