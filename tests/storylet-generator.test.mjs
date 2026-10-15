import test from "node:test";
import assert from "node:assert/strict";
import {context,validate,adapt} from "../tools/storylet-generator.mjs";

const ctx=context();
const description="You meet an exhausted clerk beneath the municipal stair. Her hands smell of sealing wax, but the ledger is wet with salt although no water reaches this office. She asks which witness may keep their own name. Two families wait at the door. One of the children is carefully rehearsing a lie.";
const success="You examine the ledger and find a fresh alteration hidden beneath an older signature. The clerk leaves you alone with the original page, an ordinary mercy that could cost her a week's wages. You take down the evidence while there is still time.";
const failure="The clerk locks the evidence away before you finish reading. She does not call a guard, but adds a careful note about your visit. You have at least learned where the missing page was filed and who fears it.";
function example(){
 return {id:"qa_original_test_01",title:"A Ledger Against the Door",location:ctx.locations[0],rarity:"story",description,
 options:[
  {id:"inspect_record",text:"Inspect the altered register carefully",action_cost:1,challenge:{stat:ctx.stats[0],difficulty:7},
   success:{text:success,effects:[{type:"currency",id:ctx.resources[0],delta:2}]},
   failure:{text:failure,effects:[{type:"menace",id:ctx.menaces[0],delta:1}]}},
  {id:"defend_witness",text:"Help the witnesses escape together",action_cost:1,
   success:{text:"You escort both families past the public desk, making sure the youngest child has her coat. The clerk will be questioned, but you leave behind a small token of solidarity. The witnesses now know you chose their safety over a tidy answer.",effects:[{type:"flag",id:"generated:qa_original_test_01-witness",set:true}]}}
 ]};
}
test("game registry provides locations and four real skills",()=>{assert.ok(ctx.locations.length>=5);assert.equal(ctx.stats.length,4)});
test("a well-formed independent storylet validates",()=>{assert.deepEqual(validate(example(),ctx).errors,[])});
test("an existing ID is rejected",()=>{const s=example();ctx.existing.add(s.id);assert.match(validate(s,ctx).errors.join(" "),/overwritten/);ctx.existing.delete(s.id)});
test("invented quality and unknown item are rejected",()=>{
 const s=example();s.options[0].challenge.stat="made_up_quality";s.options[0].success.effects=[{type:"item",id:"made_up_item",delta:2}];
 assert.match(validate(s,ctx).errors.join(" "),/invalid challenge/);
 assert.match(validate(s,ctx).errors.join(" "),/unknown item/);
});
test("a challenge must include distinct failure prose",()=>{
 const s=example();delete s.options[0].failure;
 assert.match(validate(s,ctx).errors.join(" "),/failure/);
});
test("the schema adapter produces actual game-native structures",()=>{
 const r=adapt(example());assert.equal(r.location,ctx.locations[0]);assert.equal(r.story.choices.length,2);
 if(ctx.game==="neathbound"){
  assert.equal(r.story.choices[0].challenge.quality,ctx.stats[0]);
  assert.equal(r.story.choices[0].successEffects[0].type,"obols");
 }else{
  assert.equal(r.story.choices[0].stat,ctx.stats[0]);
  assert.equal(r.story.choices[0].effects.coin,2);
 }
});
test("duplicate outcome prose is blocked",()=>{
 const s=example();s.options[0].failure.text=success;
 assert.match(validate(s,ctx).errors.join(" "),/identical|Duplicated/);
});

test("rare successes compile as replacement outcomes using each real engine schema",()=>{
 const s=example();
 s.options[0].challenge.rareChance=0.04;
 s.options[0].rare_success={
  text:"The ledger opens to a hidden register of names, each written in the clerk's own careful hand. She gives you the duplicate and accepts the risk of official inquiry. This is a rare discovery, not an additional reward layered upon the ordinary success.",
  effects:[{type:"currency",id:ctx.resources[0],delta:3}]
 };
 const result=validate(s,ctx);
 assert.deepEqual(result.errors,[]);
 const compiled=adapt(s).story.choices[0];
 if(ctx.game==="neathbound"){
  assert.equal(compiled.challenge.rareChance,0.04);
  assert.match(compiled.rare_success,/hidden register/);
  assert.equal(compiled.rareSuccessEffects[0].type,"obols");
 }else{
  assert.equal(compiled.rare_success_chance,0.04);
  assert.match(compiled.rare_success,/hidden register/);
  assert.equal(compiled.rare.coin,3);
 }
});
test("rare outcome cannot exist without a challenge",()=>{
 const s=example();
 s.options[1].rare_success={text:failure,effects:[]};
 assert.match(validate(s,ctx).errors.join(" "),/rare success requires a challenge/);
});
