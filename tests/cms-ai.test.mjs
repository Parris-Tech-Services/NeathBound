import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {fileURLToPath} from "node:url";
import path from "node:path";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("shared AI helper is a valid ES module with a protected gateway",async()=>{
 const helper=await import("../tools/cms/ai-assistant.js");
 assert.equal(typeof helper.mountGroqAssistant,"function");
 const source=read("tools/cms/ai-assistant.js");
 assert.match(source,/https:\/\/qbn-studio-ai\./);
 assert.match(source,/sessionStorage/);
 assert.match(source,/export AI-ready handoff|Export AI-ready handoff/);
 assert.match(source,/qa:\{content:false/);
 assert.doesNotMatch(source,/gsk_[A-Za-z0-9]{12}/,"API keys must not be bundled");
});
test("gateway requires correct allowed origin and secret access header",async()=>{
 let onfetch;const gateway=read("tools/cms/groq-worker.js");
 const context=vm.createContext({
  addEventListener:(name,callback)=>{if(name==="fetch")onfetch=callback;},
  Response,Request,Headers,URL,Date,Map,Set,JSON,Array,Math,
  CMS_ACCESS_TOKEN:"test-access",
  GROQ_KEYS:JSON.stringify(["gsk_test_key_only"]),
  fetch:()=>{throw Error("An unauthorised request must never reach the provider")}
 });
 new vm.Script(gateway).runInContext(context);
 const handle=async (req)=>{let result;onfetch({request:req,respondWith:p=>{result=p}});return await result};
 const forbidden=await handle(new Request("https://qbn-studio-ai.example/v1/assist",{method:"POST",
  headers:{"Origin":"https://attacker.invalid","X-Studio-Access":"test-access","Content-Type":"application/json"},
  body:JSON.stringify({game:"undercity",mode:"pitch",model:"openai/gpt-oss-20b"})}));
 assert.equal(forbidden.status,403);
 const without=await handle(new Request("https://qbn-studio-ai.example/v1/assist",{method:"POST",
  headers:{"Origin":"https://parris-tech-services.github.io","Content-Type":"application/json"},
  body:JSON.stringify({game:"neathbound",mode:"pitch",model:"openai/gpt-oss-20b"})}));
 assert.equal(without.status,401);
 assert.equal(without.headers.get("access-control-allow-origin"),"https://parris-tech-services.github.io");
 assert.doesNotMatch(gateway,/gsk_[A-Za-z0-9]{16,}/);
});
test("Studio integration offers reversible suggestions and cannot approve an AI draft",()=>{
 const app=read("tools/cms/app.js");
 assert.match(app,/mountGroqAssistant/);
 assert.match(app,/updateStory:/);
 assert.match(app,/notify:toast/);
 const helper=read("tools/cms/ai-assistant.js");
 for(const mode of ["pitch","branches","prose","character","mechanics","rare","living","continuity","economy","accessibility","qa","export","ideas","batch"])
  assert.match(helper,new RegExp('\\b'+mode+':'));
 assert.match(helper,/next\.qa=\{content:false/);
 assert.match(helper,/never interpret as an approved/i);
});
