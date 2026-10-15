import {handle} from "./handler.js";
import {normaliseState} from "./game/state.js";
const ORIGIN="https://parris-tech-services.github.io";
const cors=(origin)=>({"Access-Control-Allow-Origin":origin===ORIGIN||origin==="http://localhost:4173"||origin==="http://127.0.0.1:4173"?origin:ORIGIN,"Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"});
const json=(obj,status,headers)=>new Response(JSON.stringify(obj),{status,headers:{"Content-Type":"application/json",...headers}});
async function idFor(token){const raw=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));return [...new Uint8Array(raw)].map(x=>x.toString(16).padStart(2,"0")).join("");}
export default {async fetch(request,env){
 const headers=cors(request.headers.get("Origin"));
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 const url=new URL(request.url);
 if(url.pathname==="/health")return json({ok:true,service:"neathbound-cloudflare",storage:"D1"},200,headers);
 if(!["GET","POST"].includes(request.method))return json({error:"Method not allowed"},405,headers);
 const token=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!/^[a-f0-9]{64}$/.test(token))return json({error:"A player session is required."},401,headers);
 const userId=await idFor(token);
 let previouslyLoaded=null;
 const repo={
   async loadPlayer(id){const row=await env.DB.prepare("SELECT state_json FROM player_saves WHERE player_id=?").bind(id).first();return row?JSON.parse(row.state_json):null;},
   async savePlayer(id,state){const payload=JSON.stringify(normaliseState(state));const revision=Number(state.revision||0);if(payload.length>250000)throw Error("Save exceeds size limit");
     if(previouslyLoaded===null){const exists=await env.DB.prepare("SELECT revision FROM player_saves WHERE player_id=?").bind(id).first();if(!exists){await env.DB.prepare("INSERT OR IGNORE INTO player_saves(player_id,state_json,revision) VALUES(?,?,?)").bind(id,payload,revision).run();return;}}
     const oldRevision=Number(previouslyLoaded?.revision??revision-1);const query=await env.DB.prepare("UPDATE player_saves SET state_json=?,revision=?,updated_at=CURRENT_TIMESTAMP WHERE player_id=? AND revision=?").bind(payload,revision,id,oldRevision).run();
     if(!query.meta.changes)throw Error("Concurrent save conflict");},
   async loadWorldQualities(){return {}}
 };
 try{
   const row=await env.DB.prepare("SELECT state_json FROM player_saves WHERE player_id=?").bind(userId).first();
   previouslyLoaded=row?JSON.parse(row.state_json):null;
   if(url.pathname==="/api/import" && request.method==="POST"){
      if(previouslyLoaded && (previouslyLoaded.revision>0 || previouslyLoaded.flags?.["imported-from-local"]))return json({error:"Online save already exists. Import refused to protect progress."},409,headers);
      const body=await request.json().catch(()=>null);const state=body?.state;
      if(!state||typeof state!=="object"||typeof state.locationId!=="string"||!Array.isArray(state.unlockedLocations)||JSON.stringify(state).length>250000)return json({error:"Invalid save data"},400,headers);
      const next=normaliseState(state);next.flags["imported-from-local"]=true;
      if(!previouslyLoaded){const q=await env.DB.prepare("INSERT OR IGNORE INTO player_saves(player_id,state_json,revision) VALUES(?,?,?)").bind(userId,JSON.stringify(next),next.revision).run();if(!q.meta.changes)return json({error:"Save already exists"},409,headers);}
      else {const q=await env.DB.prepare("UPDATE player_saves SET state_json=?,revision=? WHERE player_id=? AND revision=0").bind(JSON.stringify(next),next.revision,userId).run();if(!q.meta.changes)return json({error:"Save already changed"},409,headers);}
      return json({state:next,imported:true},200,headers);
   }
   const body=request.method==="POST"?await request.json().catch(()=>({})):{};
   const response=await handle({method:request.method,path:url.pathname,userId,body},{repo});
   return json(response.body,response.status,headers);
 }catch(err){console.error("NeathBound backend",err);return json({error:err.message==="Concurrent save conflict"?"Save changed in another tab. Refresh before trying again.":"The city is temporarily unreachable."},err.message==="Concurrent save conflict"?409:500,headers);}
}};
