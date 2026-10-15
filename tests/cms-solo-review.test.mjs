import test from "node:test";
import assert from "node:assert/strict";
import {freshStory,audit,advance,creatorApprove} from "../tools/cms/studio-core.js";
const ctx={game:"neathbound",stats:["nerve","insight","poise","shadow"],
 menaces:["dread","scandal","wounds","suspicion"],quirks:["honest","subtle"],
 items:["paper-key"],locations:["court"],knownIds:[],draftIds:[],secrets:[],forbidden:[]};
function complete(){
 const s=freshStory(ctx);s.id="a-witness-in-iron";s.title="Echoes of Iron";
 s.pitch="A factory witness must decide whether to expose the metalworks or spare the families who survive on its wages.";
 s.description="The bell of the iron foundry rings after midnight, and a tired witness places a dangerous letter in your hands.";
 s.author="Creator";s.status="review";
 s.choices.forEach((c,i)=>{
  c.label=i?"Protect the hungry foundry families":"Expose the foundry's concealed records";
  c.success={title:"A consequential discovery",text:"The witness and workers remember who risked their livelihoods to find the truth.",effects:[]};
  c.failure={title:"A costly silence",text:"The furnacekeepers close ranks and another household loses its claim.",effects:[]};
 });
 return s;
}
test("a real user can approve a schema-valid story solo without inventing a human peer",()=>{
 const s=complete();
 assert.equal(audit(s,ctx).ok,true);
 assert.equal(advance(s,"approved",ctx).ok,false,"legacy independent peer gate remains");
 assert.equal(creatorApprove(s,ctx).ok,false,"approval requires explicit user action");
 const result=creatorApprove(s,ctx,{creatorConfirmed:true});
 assert.equal(result.ok,true);
 const approved=result.story;
 assert.equal(approved.status,"approved");
 assert.equal(approved.review_mode,"solo-creator");
 assert.equal(approved.reviewer,"");
 assert.equal(approved.qa.peer,false);
 assert.equal(approved.creator_approval.method,"creator-confirmed");
 assert.equal(approved.creator_approval.independent_human_review,false);
 assert.equal(approved.creator_approval.ai_assistance,"none");
 assert.ok(approved.creator_approval.confirmed_at);
 assert.equal(audit(approved,ctx,{strict:true}).ok,true);
 assert.equal(s.status,"review","input draft preserved");
});
test("actual Groq content assistance is disclosed without fabricating AI human reviewer",()=>{
 const result=creatorApprove(complete(),ctx,{creatorConfirmed:true,aiReview:{kind:"groq"}});
 assert.equal(result.ok,true);
 assert.equal(result.story.creator_approval.ai_assistance,"groq");
 assert.equal(result.story.creator_approval.ai_claimed_approval,false);
 assert.equal(result.story.qa.peer,false);
});
test("schema errors and absent confirmation cannot be bypassed by the solo path",()=>{
 const bad=complete();bad.choices[0].success.effects.push({type:"item",id:"unknown-item",amount:1});
 const result=creatorApprove(bad,ctx,{creatorConfirmed:true,aiReview:{kind:"groq"}});
 assert.equal(result.ok,false);
 assert.match(result.reason,/item|Unknown/i);
 const missing=creatorApprove(complete(),ctx);
 assert.equal(missing.ok,false);
 const spoof=complete();spoof.status="approved";spoof.review_mode="solo-creator";
 assert.equal(audit(spoof,ctx,{strict:true}).ok,false,"incomplete solo provenance must fail strict publishing");
});
test("traditional five-check independent review remains available and distinct",()=>{
 const s=complete();s.reviewer="Another independent human";
 s.qa={content:true,design:true,mechanical:true,continuity:true,peer:true};
 assert.equal(advance(s,"approved",ctx).ok,true);
 const approved={...s,status:"approved"};
 assert.equal(audit(approved,ctx,{strict:true}).ok,true);
});
