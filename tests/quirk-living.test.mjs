import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { applyEffects, quirkTitle } from "../src/game/rules.js";
import { tickLivingStories } from "../src/game/engine.js";

test("quirks gain pyramidal CP and subtract the same CP from opposites",()=>{
  const s=initialState();
  s.quirks.forceful=2;
  s.quirk_cp.forceful=3;
  applyEffects(s,[{type:"quirk",id:"daring",amount:2}]);
  assert.equal(s.quirks.daring,1);
  assert.equal(s.quirk_cp.daring,2);
  assert.equal(s.quirk_cp.forceful,1);
  assert.equal(s.quirks.forceful,1);
  assert.equal(quirkTitle("daring",1),"Bold");
  assert.equal(quirkTitle("magnanimous",15),"Open-Handed");
});

test("authored delayed messages fire only once and can apply follow-up effects",()=>{
  const s=initialState();
  applyEffects(s,[{type:"living-story",id:"courier-arrival",delay_hours:1,title:"A Named Letter",message:"The courier knows the answer.",on_arrival:[{type:"flag",id:"courier-seen",value:true}]}]);
  const soon=tickLivingStories(s,Date.now()+1000);
  assert.equal(soon.fired,0);
  const later=tickLivingStories(s,Date.now()+3601000);
  assert.equal(later.fired,1);
  assert.equal(later.state.flags["living-story-fired:courier-arrival"],true);
  assert.equal(later.state.flags["courier-seen"],true);
  assert.equal(later.state.messages[0].title,"A Named Letter");
  assert.match(later.state.messages[0].text,/courier knows/);
  assert.equal(tickLivingStories(later.state,Date.now()+7200000).fired,0);
});
