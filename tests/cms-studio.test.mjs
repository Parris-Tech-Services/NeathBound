import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {audit,advance,freshStory,exportBundle,importBundle} from "../tools/cms/studio-core.js";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const ctx={game:"neathbound",stats:["nerve","insight","poise","shadow"],menaces:["dread","scandal","wounds","suspicion"],
 quirks:["honest","devious"],items:["paper-key"],locations:["lantern-quay"],knownIds:["existing-scene"],secrets:[{id:"NB-TEST",depth:4}],forbidden:["Fallen London"]};
function ready(){
 const s=freshStory(ctx);s.id="original-test-story";s.title="The Missing Receipt";s.location="lantern-quay";
 s.author="Writer A";s.reviewer="Reviewer B";s.pitch="A receipt reveals an unrecorded delivery, with two ways to secure it.";
 s.description="You find a damp receipt in the quay master's ledger. Its destination has been scraped away.";
 s.choices.forEach((c,i)=>{c.label=i?"Ask the dockworker":"Read the receipt";c.success={title:"Evidence secured",text:"The witness provides a signed copy of the document.",effects:[]};c.failure={title:"Lead withdrawn",text:"The clerk refuses to corroborate the signature today.",effects:[]};});
 return s;
}
test("narrative CMS schema catches missing prose, forbidden terms, unknown references and secrets",()=>{
 const s=ready();
 assert.equal(audit(s,ctx).ok,true);
 s.secret_ids=["NB-TEST"];s.reveal_depth=2;
 assert.ok(audit(s,ctx).errors.some(x=>x.path==="reveal_depth"));
 s.reveal_depth=4;s.description+=" Fallen London.";
 assert.ok(audit(s,ctx).errors.some(x=>x.path==="prose"));
 s.description=s.description.replace(" Fallen London.","");
 s.choices[0].success.effects=[{type:"item",id:"never-declared",amount:1}];
 assert.ok(audit(s,ctx).errors.some(x=>x.path.includes(".effects")));
});
test("ambition chain success requires explicit +1 and rare success also advances",()=>{
 const s=ready();s.ambition_id="test-arc";s.progress=7;
 assert.ok(audit(s,ctx).errors.some(x=>x.message.includes("chain")));
 s.choices.forEach(c=>c.success.effects=[{type:"ambition-progress",amount:1,id:"test-arc"}]);
 assert.equal(audit(s,ctx).ok,true);
 s.choices[0].rare_success={title:"Unusual rescue",text:"A witness returns from an impossible journey.",effects:[]};
 assert.ok(audit(s,ctx).errors.some(x=>x.path.endsWith(".rare_success.effects")));
});
test("studio stages cannot skip writing or self-approve",()=>{
 const s=ready();assert.equal(advance(s,"approved",ctx).ok,false);
 assert.equal(advance(s,"midflight",ctx).ok,true);
 s.status="review";s.qa={content:true,design:true,mechanical:true,continuity:true,peer:false};
 assert.equal(advance(s,"approved",ctx).ok,false);
 s.qa.peer=true;s.reviewer=s.author;
 assert.equal(advance(s,"approved",ctx).ok,false);
 s.reviewer="A second writer";assert.equal(advance(s,"approved",ctx).ok,true);
});
test("draft exports are engine-scoped and round-trip without mutating input",()=>{
 const s=ready(),p=exportBundle([s],"neathbound");
 assert.deepEqual(importBundle(p,"neathbound"),[s]);
 assert.throws(()=>importBundle(p,"undercity"));
 p.stories[0].title="Changed";
 assert.equal(s.title,"The Missing Receipt");
});
test("editor JavaScript parses and generated release output stays current",()=>{
 execFileSync("node",["--check","tools/cms/studio-core.js"],{cwd:root});
 execFileSync("node",["--check","tools/cms/app.js"],{cwd:root});
 execFileSync("node",["tools/cms/build.mjs","--check"],{cwd:root,stdio:"pipe"});
});
