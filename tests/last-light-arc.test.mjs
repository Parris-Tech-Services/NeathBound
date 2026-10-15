import test from "node:test";
import assert from "node:assert/strict";
import { ambitions,qbnStories } from "../src/game/qbn-expansion.js";
import { initialState } from "../src/game/state.js";
import { resolveChoice,storyAvailable } from "../src/game/engine.js";
test("Last Light is thirty complete distinct chapters",()=>{
 assert.equal(ambitions["last-light"].total,30);
 const stories=Array.from({length:30},(_,i)=>qbnStories["qbn-last-light-"+(i+1)]);
 assert.ok(stories.every(Boolean));
 assert.equal(new Set(stories.map(s=>s.title)).size,30);
 assert.ok(stories.slice(5).every(s=>s.choices.length===3&&s.choices.every(c=>c.challenge&&c.success&&c.failure)));
});
test("treasure is reserved for the finale",()=>{
 for(let i=1;i<30;i++)for(const c of qbnStories["qbn-last-light-"+i].choices){
  assert.equal((c.successEffects||[]).some(e=>e.id==="treasure-lamp"),false);
 }
 assert.ok(qbnStories["qbn-last-light-30"].choices.every(c=>c.successEffects.some(e=>e.type==="equip-treasure")));
});
test("each stage is strictly gated by current ambition progress",()=>{
 const state=initialState();state.locationId="lantern-quay";state.ambition="last-light";state.ambition_progress={"last-light":5};
 assert.equal(storyAvailable(state,"qbn-last-light-6"),true);
 assert.equal(storyAvailable(state,"qbn-last-light-7"),false);
 const outcome=resolveChoice(state,"qbn-last-light-6","trace",()=>0);
 assert.equal(outcome.success,true);
 assert.equal(outcome.state.ambition_progress["last-light"],6);
 assert.equal(storyAvailable(outcome.state,"qbn-last-light-7"),true);
});
test("last chapter's ethical outcomes leave distinct permanent records",()=>{
 const verdicts=["public-reform","ward-council","emergency-shutdown"];
 for(const [i,id] of ["trace","organise","protect"].entries()){
  const state=initialState();state.locationId="lantern-quay";state.ambition="last-light";state.ambition_progress={"last-light":29};
  state.qualities.nerve=100;state.qualities.insight=100;state.qualities.poise=100;
  const result=resolveChoice(state,"qbn-last-light-30",id,()=>0);
  assert.equal(result.success,true);
  assert.equal(result.state.flags["last-light:verdict"],verdicts[i]);
  assert.equal(result.state.items["treasure-lamp"],1);
  assert.equal(result.state.ambition_progress["last-light"],30);
 }
});
