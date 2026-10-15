import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { ambitions, locations, stories, items } from "../src/game/content.js";
import { chooseAmbition, resolveChoice, storyAvailable, tickLivingStories } from "../src/game/engine.js";

const id = (n) => "gloomwing_hunt_" + String(n).padStart(2,"0");

function start() {
  const state = initialState();
  state.locationId = "lantern-quay";
  state.unlockedLocations.push("lantern-quay");
  const outcome = chooseAmbition(state,"gloomwing-hunt");
  assert.equal(outcome.error,undefined);
  return outcome.state;
}

test("Gloomwing registers 30 distinct chapters, routes and treasure rewards", () => {
  assert.equal(ambitions["gloomwing-hunt"].total,30);
  for(let n=0;n<30;n++){
    const chapter=stories[id(n)];
    assert.ok(chapter,id(n));
    assert.equal(chapter.requires_progress.value,n);
    assert.equal(chapter.choices.length,3);
    assert.equal(Object.entries(locations).filter(([,loc])=>loc.stories.includes(id(n))).length,1);
  }
  for(const trophy of ["gloomwing-treasure-scale","gloomwing-treasure-claw","gloomwing-treasure-treaty"]){
    assert.equal(items[trophy].slot,"treasure");
  }
});

test("failed first chapter is retryable and does not advance the hunt",()=>{
  const original=start();
  assert.equal(storyAvailable(original,id(0)),true);
  const failure=resolveChoice(original,id(0),"investigate",()=>0.999);
  assert.equal(failure.error,undefined);
  assert.equal(failure.success,false);
  assert.equal(failure.state.ambition_progress["gloomwing-hunt"],0);
  assert.equal(Boolean(failure.state.flags["story-complete:"+id(0)]),false);
  assert.equal(storyAvailable(failure.state,id(0)),true);
});

for(const [choiceIndex,trophy] of [
  [0,"gloomwing-treasure-scale"],
  [1,"gloomwing-treasure-claw"],
  [2,"gloomwing-treasure-treaty"]
]){
  test("30-stage hunt completes with distinct consequence: "+trophy,()=>{
    let state=start();
    for(let n=0;n<30;n++){
      if(n===16){
        assert.equal(storyAvailable(state,id(16)),false,"letter must arrive first");
        const tick=tickLivingStories(state,Date.now()+25*3600000);
        assert.equal(tick.fired,1);
        state=tick.state;
        assert.equal(state.flags["living-story-fired:moth-king-letter"],true);
      }
      const choice=n===25||n===29 ? ["investigate","endure","negotiate"][choiceIndex] : "investigate";
      assert.equal(storyAvailable(state,id(n)),true,"locked chapter "+n);
      // Simulate the next ten-minute action tick between chapter visits.
      state.last_action_tick=Date.now()-600001;
      const result=resolveChoice(state,id(n),choice,()=>0);
      assert.equal(result.error,undefined,"error at "+id(n));
      assert.equal(result.success,true,"failed "+id(n));
      state=result.state;
      assert.equal(state.ambition_progress["gloomwing-hunt"],n+1,"progress at "+id(n));
    }
    assert.equal(state.flags["gloomwing-hunt-complete"],true);
    assert.equal(state.items[trophy],1);
    assert.equal(state.equipment.treasure,trophy);
    assert.equal(storyAvailable(state,id(29)),false);
  });
}

test("old ambitions and opening mystery remain available",()=>{
  assert.ok(ambitions["missing-name"]);
  assert.ok(stories["qbn-missing-name-1"]);
  assert.equal(start().ambition,"gloomwing-hunt");
});
