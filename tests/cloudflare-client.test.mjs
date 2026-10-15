import test from "node:test";
import assert from "node:assert/strict";
import { CloudflareGameService } from "../src/services/cloudflare-game-service.js";
import { createGameService } from "../src/services/index.js";

function storage(values={}){const store=new Map(Object.entries(values));return {getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),store};}
test("online service generates and reuses a 256-bit browser token",async()=>{
 const s=storage();const requests=[];
 const service=new CloudflareGameService({apiUrl:"https://example.com"},s,async(url,options)=>{
  requests.push({url,options});return {ok:true,status:200,json:async()=>({revision:0,locationId:"the-lair"})};
 });
 await service.getState();await service.getState();
 assert.match(s.getItem("neathbound.cloudflare.session.v1"),/^[a-f0-9]{64}$/);
 assert.equal(requests[0].options.headers.Authorization,requests[1].options.headers.Authorization);
 assert.equal(requests[0].url,"https://example.com/api/player");
});
test("developed local progress is offered for import once",async()=>{
 const s=storage({"neathbound.save.v3":JSON.stringify({revision:3,locationId:"lantern-quay",unlockedLocations:["lantern-quay"],items:{},flags:{},qualities:{},menaces:{}})});
 const calls=[];
 const service=new CloudflareGameService({apiUrl:"https://example.com"},s,async(url,options)=>{
  calls.push(url);return {ok:true,status:200,json:async()=>url.endsWith("/api/import")?{imported:true,state:{revision:3}}:{revision:3}};
 });
 assert.equal((await service.getState()).revision,3);
 assert.ok(calls[0].endsWith("/api/import"));
 assert.ok(s.getItem("neathbound.save.v3"));
 assert.equal(calls.length,1);
});
test("explicit offline mode remains available",()=>{const s=storage();const service=createGameService({settings:{apiUrl:"https://example.com"},search:"?api=local",storage:s});assert.ok(service.constructor.name==="LocalGameService")});
