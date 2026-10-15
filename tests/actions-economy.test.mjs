import test from "node:test";
import assert from "node:assert/strict";
import {initialState, normaliseState} from "../src/game/state.js";
import {refreshActions,resolveChoice,ACTION_REGEN_MS} from "../src/game/engine.js";
test("new characters have ten actions and old saves migrate without resetting the story",()=>{
 const fresh=initialState();
 assert.equal(fresh.actions,10);assert.equal(fresh.max_actions,10);
 const migrated=normaliseState({version:2,qualities:{nerve:7},flags:{"story-complete:lair-escape":true}});
 assert.equal(migrated.actions,10);assert.equal(migrated.qualities.nerve,7);
 assert.equal(migrated.flags["story-complete:lair-escape"],true);
});
test("action regen accumulates offline time, caps at ten, preserves leftovers and cannot reverse time",()=>{
 const now=Date.now();
 const state={...initialState(),actions:0,last_action_tick:now-3*ACTION_REGEN_MS-30000};
 const recharged=refreshActions(state,now);
 assert.equal(recharged.actions,3);
 assert.equal(recharged.last_action_tick,now-30000);
 assert.equal(refreshActions(recharged,now+ACTION_REGEN_MS).actions,4);
 assert.equal(refreshActions({...state,actions:9},now).actions,10);
 assert.equal(refreshActions({...state,last_action_tick:now+500000},now).actions,0);
 assert.equal(state.actions,0,"engine helpers do not change caller state");
});
test("zero actions blocks paid choices, but zero-cost arrival storylets remain available",()=>{
 const state=initialState();state.locationId="lantern-quay";state.actions=0;state.last_action_tick=Date.now();
 const denied=resolveChoice(state,"bell-under-water","listen",()=>0);
 assert.match(denied.error,/Not enough actions/);
 assert.equal(denied.state.actions,0);
 const arrival=initialState();arrival.locationId="the-holding-vaults";arrival.actions=0;arrival.menaces.suspicion=8;arrival.flags["qbn-arrived-suspicion"]=true;
 const free=resolveChoice(arrival,"qbn-arrival-suspicion","understand",()=>0);
 assert.equal(free.error,undefined);assert.equal(free.state.actions,0);
});
