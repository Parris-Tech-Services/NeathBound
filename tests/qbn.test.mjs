import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { challengeChance, levelToCp, cpToLevel, awardProgress, applyEffects, effectiveStat } from "../src/game/rules.js";
import { cardWeight, drawWeightedCard } from "../src/game/decks.js";
import { resolveChoice, availableStories, chooseAmbition, tickLivingStories, festivalActive } from "../src/game/engine.js";
import { festivals } from "../src/game/content.js";

test("main qualities reach level 70 at exactly 2485 CP and then require 70 CP per level",()=>{
 assert.equal(levelToCp(50),1275);
 assert.equal(levelToCp(70),2485);
 assert.equal(levelToCp(71),2555);
 assert.equal(cpToLevel(2484),69);
 assert.equal(cpToLevel(2485),70);
 assert.equal(cpToLevel(2554),70);
 assert.equal(cpToLevel(2555),71);
 const state=initialState();
 state.qualities.nerve=70;
 const change=awardProgress(state,"nerve",70);
 assert.equal(change.level,71);
 assert.equal(change.progress,0);
});
test("broad default clamps at ten percent and accepts a per-challenge scaler",()=>{
 const s=initialState();
 assert.equal(challengeChance(s,{quality:"nerve",difficulty:2}),0.6);
 assert.equal(challengeChance(s,{quality:"nerve",difficulty:2,scaler:0.68}),0.68);
 assert.equal(challengeChance(s,{quality:"nerve",difficulty:1000}),0.1);
});
test("urgent cards bypass frequency weights and the six-card ceiling is enforced",()=>{
 const s=initialState(),cards={
 normal:{title:"Common",frequency:"ubiquitous"},
 priority:{title:"Urgent",urgency:"high",frequency:"very_rare"}
 },deck={cardIds:["normal","priority"]};
 assert.equal(drawWeightedCard(s,deck,cards,()=>0.5).id,"priority");
 s.hand=["a","b","c","d","e","f"];
 assert.equal(drawWeightedCard(s,deck,cards,()=>0.5),null);
 assert.ok(cardWeight(cards.normal)>cardWeight(cards.priority));
});
test("one ambition is chosen and the 30-stage chain advances only on success",()=>{
 let s=initialState();s.locationId="lantern-quay";
 const selection=resolveChoice(s,"qbn-choose-ambition","take-missing-name",()=>0);
 assert.equal(selection.error,undefined);
 s=selection.state;
 assert.equal(s.ambition,"missing-name");
 assert.ok(availableStories(s).some(x=>x.id==="qbn-missing-name-1"));
 const step=resolveChoice(s,"qbn-missing-name-1","seek-evidence",()=>0);
 assert.equal(step.success,true);
 assert.equal(step.state.ambition_progress["missing-name"],1);
 assert.ok(!availableStories(step.state).some(x=>x.id==="qbn-missing-name-1"));
 assert.ok(availableStories(step.state).some(x=>x.id==="qbn-missing-name-2"));
 assert.ok(chooseAmbition(step.state,"last-light").error);
});
test("a delayed story fires once and is copied into messages",()=>{
 const s=initialState();s.living_stories=[{storylet_id:"qbn-letter",trigger_time:1000,delay_hours:1,fired:false}];
 const first=tickLivingStories(s,3601001);
 assert.equal(first.fired,1);assert.equal(first.state.messages.length,1);
 assert.equal(s.messages.length,0,"input state remains unchanged");
 assert.equal(tickLivingStories(first.state,3602000).fired,0);
});
test("quirks reduce opposites and free destiny bonuses affect effective stats",()=>{
 const s=initialState();
 s.quirks.forceful=4;
 applyEffects(s,[{type:"quirk",id:"subtle",amount:2}]);
 assert.equal(s.quirks.forceful,2);
 applyEffects(s,[{type:"destiny",id:"steady-lantern"}]);
 assert.equal(effectiveStat(s,"nerve"),7);
 assert.deepEqual(s.destinies,["steady-lantern"]);
});
test("seasonal festivals respect wraparound year boundaries",()=>{
 assert.equal(festivalActive(festivals.lanternfall,new Date("2026-10-15T00:00:00Z")),true);
 assert.equal(festivalActive(festivals.clockmas,new Date("2026-12-31T00:00:00Z")),true);
 assert.equal(festivalActive(festivals.clockmas,new Date("2027-01-02T00:00:00Z")),true);
 assert.equal(festivalActive(festivals.clockmas,new Date("2026-04-01T00:00:00Z")),false);
});
