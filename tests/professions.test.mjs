import test from "node:test";
import assert from "node:assert/strict";
import {initialState,normaliseState} from "../src/game/state.js";
import {items,trades} from "../src/game/content.js";
import {CAREERS,DAY_MS,WEEK_MS,PROMOTION_SHIFTS,careerView,joinCareer,workShift,promoteCareer,claimWages} from "../src/game/professions.js";

const T=Date.UTC(2026,9,15,12);
function eligible(){const s=initialState();s.qualities["standing-archivists"]=1;return s;}
function join(){const result=joinCareer(eligible(),"ink-smuggler",T);assert.equal(result.error,undefined);return result.state;}
function threeShifts(){let state=join();for(let i=0;i<3;i++){const r=workShift(state,T+i*DAY_MS);assert.equal(r.error,undefined,r.error);state=r.state;}return state;}
test("profession definitions reuse original trades and real inventory items",()=>{
 for(const id of Object.keys(CAREERS))assert.ok(trades[id],id);
 assert.ok(items["glimmering-shard"]);assert.ok(items["radiant-crystal"]);
 assert.equal(PROMOTION_SHIFTS,3);
});
test("unlock depends on standing, appointment pays no advance",()=>{
 const notYet=initialState();
 assert.equal(careerView(notYet,T).available.find(x=>x.id==="ink-smuggler").unlocked,false);
 const source=eligible(),view=careerView(source,T);
 assert.equal(view.available.find(x=>x.id==="ink-smuggler").unlocked,true);
 const r=joinCareer(source,"ink-smuggler",T);
 assert.equal(r.state.obols,source.obols);
 assert.equal(r.state.professionCareer.tier,1);
 assert.equal(r.state.revision,source.revision+1);
 assert.equal(r.state.flags["last-stipend-claim"],T);
 assert.match(r.state.messages[0].text,/seven days/);
 assert.equal(careerView(r.state,T).nextPayAt,T+WEEK_MS);
});
test("cannot invent a profession, bypass eligibility or join twice",()=>{
 const s=initialState();
 for(const [id,pattern] of [["bogus",/Unknown/],["ink-smuggler",/required/]]){
  const r=joinCareer(s,id,T);assert.match(r.error,pattern);assert.strictEqual(r.state,s);
 }
 const member=join();assert.match(joinCareer(member,"roof-spotter",T).error,/Already/);
});
test("daily shift costs an action, pays once a day and never mutates input",()=>{
 const s=join(),first=workShift(s,T);
 assert.equal(first.error,undefined);
 assert.equal(first.state.actions,s.actions-1);
 assert.equal(first.state.obols,s.obols+3);
 assert.equal(s.professionCareer.shiftsCompleted,0);
 assert.equal(first.state.professionCareer.shiftsCompleted,1);
 assert.match(workShift(first.state,T+DAY_MS-1).error,/24 hours/);
 assert.equal(workShift(first.state,T+DAY_MS).error,undefined);
});
test("zero actions, backwards clock and optimistic conflict block work",()=>{
 const s=join();s.actions=0;
 assert.match(workShift(s,T).error,/One action/);
 const first=workShift({...s,actions:1},T).state;
 assert.match(workShift(first,T-1).error,/inconsistent/);
 assert.match(workShift(first,T+DAY_MS,{expectedRevision:0}).error,/Save changed/);
});
test("three shifts unlock a one-time tier upgrade with visible inventory reward",()=>{
 assert.match(promoteCareer(join(),T).error,/Three shifts/);
 const s=threeShifts(),r=promoteCareer(s,T+2*DAY_MS);
 assert.equal(r.error,undefined);
 assert.equal(r.state.professionCareer.tier,2);
 assert.equal(r.state.items["radiant-crystal"],2);
 assert.equal(r.state.qualities["trade-tier"],2);
 assert.match(r.state.messages[0].text,/Radiant Crystals/);
 assert.match(promoteCareer(r.state,T+2*DAY_MS).error,/Already/);
});
test("seven-day exact boundary, one claim, and no multi-week windfall",()=>{
 const s=join();
 assert.match(claimWages(s,T+WEEK_MS-1).error,/not due/);
 const r=claimWages(s,T+WEEK_MS);
 assert.equal(r.error,undefined);
 assert.equal(r.state.obols,s.obols+15);
 assert.equal(r.state.items["glimmering-shard"],2);
 assert.equal(r.state.professionCareer.wagesClaimed,1);
 assert.equal(r.state.flags["last-stipend-claim"],T+WEEK_MS);
 assert.match(claimWages(r.state,T+WEEK_MS).error,/not due/);
 const catchup=claimWages(r.state,T+9*WEEK_MS);
 assert.equal(catchup.state.professionCareer.wagesClaimed,2);
});
test("tier two yields substantially better weekly payout and the same cooldown",()=>{
 const promoted=promoteCareer(threeShifts(),T+2*DAY_MS).state;
 const r=claimWages(promoted,T+WEEK_MS);
 assert.equal(r.state.obols,promoted.obols+26);
 assert.equal(r.state.items["glimmering-shard"],4);
 assert.equal(r.state.items["radiant-crystal"],2);
 assert.equal(r.nextPayAt,T+2*WEEK_MS);
});
test("version-three saves round trip without changing the save version",()=>{
 const source=promoteCareer(threeShifts(),T+2*DAY_MS).state;
 const migrated=normaliseState(JSON.parse(JSON.stringify(source)));
 assert.equal(migrated.version,3);
 assert.deepEqual(migrated.professionCareer,source.professionCareer);
 assert.equal(migrated.revision,source.revision);
});
test("legacy trade-tier and prior claim are recognised, not paid twice",()=>{
 const s=initialState();s.qualities["trade-ink-smuggler"]=1;
 s.qualities["trade-tier"]=1;s.flags["last-stipend-claim"]=T;
 assert.equal(careerView(s,T+WEEK_MS-1).payReady,false);
 const r=claimWages(s,T+WEEK_MS);
 assert.equal(r.error,undefined);
 assert.equal(r.state.professionCareer.migratedFromLegacy,true);
 assert.match(claimWages(r.state,T+WEEK_MS).error,/not due/);
});
test("a newer legacy Guild Hall claim also blocks the new route",()=>{
 const s=join();s.flags["last-stipend-claim"]=T+WEEK_MS;
 assert.equal(careerView(s,T+WEEK_MS).payReady,false);
 assert.match(claimWages(s,T+WEEK_MS).error,/not due/);
});
test("invalid clock and stale revision fail without a cloned money award",()=>{
 const s=join();
 const invalid=claimWages(s,NaN);
 assert.match(invalid.error,/Invalid/);
 assert.strictEqual(invalid.state,s);
 assert.match(claimWages(s,T-1).error,/inconsistent/);
 assert.match(claimWages(s,T+WEEK_MS,{expectedRevision:99}).error,/Save changed/);
});
