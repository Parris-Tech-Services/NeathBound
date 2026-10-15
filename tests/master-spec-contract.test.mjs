import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
test("full ten-part original game systems specification and explicit contradictions",()=>{
 const text=read("docs/MASTER_SYSTEMS_SPEC.md");
 for(const roman of ["I","II","III","IV","V","VI","VII","VIII","IX","X"])
  assert.match(text,new RegExp("^## Part "+roman+" — ","m"),"part "+roman+" missing");
 for(const decision of ["D-01","D-02","D-03","D-04","D-05","D-06","D-07","D-08","D-09","D-10"])
  assert.ok(text.includes(decision),"explicit decision "+decision+" missing");
 assert.match(text,/2485/);
 assert.match(text,/one.*ambition/i);
 assert.match(text,/rollback/);
});
test("NeathBound mapping and machine-readable gap contract match the local game",()=>{
 const status=JSON.parse(read("docs/MASTER_SYSTEMS_STATUS.json"));
 assert.equal(status.game,"neathbound");
 assert.equal(status.parts.length,10);
 assert.deepEqual(status.primary_stats,["nerve","insight","poise","shadow"]);
 assert.deepEqual(status.menaces,["suspicion","dread","wounds","scandal"]);
 assert.equal(status.currency,"obols");
 assert.equal(new Set(status.parts.map(x=>x.id)).size,10);
 for(const row of status.parts){assert.ok(row.source&&row.phase&&row.gap)}
 const prompt=read("MASTER_PROMPT.md");
 for(const stat of status.primary_stats)assert.ok(prompt.includes(stat));
 for(const id of status.canonical_paths)assert.ok(prompt.includes(id));
 assert.match(prompt,/Session 2/);
});
