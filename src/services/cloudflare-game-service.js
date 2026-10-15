// Cloudflare Workers + D1 player save service. The private random session key
// never goes in URLs; only its SHA-256 hash is stored by the backend.
import { loadState, saveState } from "../game/state.js?v=20261016-gloomwing2";
const SESSION_KEY="neathbound.cloudflare.session.v1";
export class CloudflareGameService {
  mode="online";
  constructor(config,storage=globalThis.localStorage,fetchImpl=globalThis.fetch?.bind(globalThis)){
    this.config=config;this.storage=storage;this.fetch=fetchImpl;
  }
  async #token(){
    let token=this.storage?.getItem(SESSION_KEY);
    if(!/^[a-f0-9]{64}$/.test(token??"")){
      const bytes=new Uint8Array(32);globalThis.crypto.getRandomValues(bytes);
      token=Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
      this.storage?.setItem(SESSION_KEY,token);
    }
    return token;
  }
  async #call(method,path,body){
    const token=await this.#token();
    const response=await this.fetch(this.config.apiUrl+path,{
      method,headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:method==="POST"?JSON.stringify(body??{}):undefined
    });
    let data=await response.json().catch(()=>({}));
    if(response.ok||response.status===409)return data;
    throw new Error(data.error||"Server unavailable ("+response.status+")");
  }
  async getState(){
    if(!this.initialised){
      const offline=loadState(this.storage);
      // Never write over a developed online save. Server accepts this import
      // only for a fresh, empty character; original local save remains intact.
      if(offline.revision>0 && !this.storage?.getItem("neathbound.cloudflare.import-attempted.v1")){
        const result=await this.#call("POST","/api/import",{state:offline});
        this.storage?.setItem("neathbound.cloudflare.import-attempted.v1","1");
        if(result.imported){this.initialised=true;return result.state;}
      }
      this.initialised=true;
    }
    return this.#call("GET","/api/player");
  }
  choose(storyId,choiceId,{expectedRevision,useLesson}={}){
    return this.#call("POST","/api/storylets/"+encodeURIComponent(storyId)+"/branches/"+encodeURIComponent(choiceId)+"/choose",{expectedRevision,useLesson});
  }
  travel(locationId,{expectedRevision}={}){return this.#call("POST","/api/travel/"+encodeURIComponent(locationId),{expectedRevision});}
  drawCard(deckId,{expectedRevision}={}){return this.#call("POST","/api/deck/"+encodeURIComponent(deckId)+"/draw",{expectedRevision});}
  equipItem(slot,itemId,{expectedRevision}={}){return this.#call("POST","/api/equipment/"+encodeURIComponent(slot),{expectedRevision,itemId});}
  setRefuge(refugeId,{expectedRevision}={}){return this.#call("POST","/api/refuge/"+encodeURIComponent(refugeId),{expectedRevision});}
  discard(cardId,{expectedRevision}={}){return this.#call("POST","/api/deck/"+encodeURIComponent(cardId)+"/discard",{expectedRevision});}
  reset(){return this.#call("POST","/api/reset");}
}
