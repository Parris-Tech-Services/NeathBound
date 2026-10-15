import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pack = JSON.parse(readFileSync(new URL("../content/ambitions/gloomwing.v1.json", import.meta.url), "utf8"));
const chapter = n => pack.stories["gloomwing_hunt_" + String(n).padStart(2,"0")];
const revised = [6,8,16,25,26,29];
const ids = ["investigate","endure","negotiate"];

test("thirty chapter gates, IDs and three choices remain intact", () => {
  assert.equal(pack.metadata.chapter_count,30);
  assert.equal(Object.keys(pack.stories).length,30);
  for(let n=0;n<30;n++){
    const entry=chapter(n);
    assert.ok(entry,"missing chapter "+n);
    assert.equal(entry.requires_progress.value,n);
    assert.equal(entry.ambition_id,"gloomwing-hunt");
    assert.deepEqual(entry.choices.map(c=>c.id),ids);
    assert.ok(entry.choices.every(c=>c.successEffects.some(e=>e.type==="ambition-progress"&&e.id==="gloomwing-hunt"&&e.amount===1)));
  }
});
test("all six revised scenes have distinctive, non-template outcomes", () => {
  for(const n of revised){
    const entry=chapter(n),successes=new Set(),failures=new Set();
    assert.ok(entry.text.length>140, "scene too short "+n);
    for(const c of entry.choices){
      assert.ok(c.success.length>=130,n+"/"+c.id+" needs meaningful success");
      assert.ok(c.failure.length>=100,n+"/"+c.id+" needs meaningful setback");
      assert.doesNotMatch(c.success,/You set a fact down where another person may find it|The cost is real, but you leave the chamber unbowed|You gain a witness who will remember which way you chose/);
      assert.doesNotMatch(c.failure,/The hunt has not advanced; you can try another approach/);
      successes.add(c.success);failures.add(c.failure);
    }
    assert.equal(successes.size,3,"success branches must diverge "+n);
    assert.equal(failures.size,3,"failed branches must diverge "+n);
  }
});
test("rare bargain outcome is authored without changing rare mechanics", () => {
  const option=chapter(8).choices[0];
  assert.ok(option.rare_success?.length>90);
  assert.ok(option.rareSuccessEffects.some(e=>e.type==="flag"&&e.id==="gloomwing-rare-8"));
  assert.ok(option.rareSuccessEffects.some(e=>e.type==="ambition-progress"&&e.amount===1));
  assert.notEqual(option.rare_success,option.success);
});
test("timed Paper Court letter remains 24 hours and is mandatory", () => {
  for(const c of chapter(15).choices){
    const evt=c.successEffects.find(e=>e.type==="living-story"&&e.id==="moth-king-letter");
    assert.equal(evt?.delay_hours,24);
  }
  assert.deepEqual(chapter(16).requirements,[{type:"flag",id:"living-story-fired:moth-king-letter",op:"==",value:true}]);
});
test("moral verdict flags gate exactly one of the three permanent trophies", () => {
  const flags=["gloomwing-saved-final","gloomwing-killed-final","gloomwing-truce-final"];
  const trophies=["gloomwing-treasure-scale","gloomwing-treasure-claw","gloomwing-treasure-treaty"];
  const initial=chapter(25),end=chapter(29);
  for(let i=0;i<3;i++){
    assert.ok(initial.choices[i].successEffects.some(e=>e.type==="flag"&&e.id===flags[i]&&e.value===true));
    assert.ok(end.choices[i].requirements.some(r=>r.type==="flag"&&r.id===flags[i]&&r.value===true));
    assert.ok(end.choices[i].successEffects.some(e=>e.type==="equip-treasure"&&e.id===trophies[i]));
    assert.ok(end.choices[i].successEffects.some(e=>e.type==="item"&&e.id===trophies[i]&&e.amount===1));
    assert.ok(end.choices[i].successEffects.some(e=>e.type==="flag"&&e.id==="gloomwing-hunt-complete"));
    assert.equal(end.choices[i].challenge,false,"ending must not be luck-gated");
  }
});
test("later NPC testimony recalls named earlier encounters", () => {
  const stage6=chapter(6).choices[0].success;
  assert.match(stage6,/Marrow/);
  const stage16=chapter(16).choices.map(c=>c.success).join(" ");
  assert.match(stage16,/messenger|clerk/i);
  const stages=[25,26,29].map(n=>chapter(n).text+" "+chapter(n).choices.map(c=>c.success).join(" ")).join(" ");
  assert.match(stages,/Marrow/);
  assert.match(stages,/Archivist/);
  assert.match(stages,/Bureau/);
});
