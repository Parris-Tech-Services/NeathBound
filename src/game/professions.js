/** Agent 3: isolated, deterministic profession progression. Not wired to the live engine. */
export const DAY_MS = 86400000;
export const WEEK_MS = 7 * DAY_MS;
export const PROMOTION_SHIFTS = 3;
export const CAREERS = Object.freeze({
 "ink-smuggler": {name:"Ink Smuggler",unlock:"standing-archivists",minimum:1},
 "lamp-trimmer": {name:"Lamp Trimmer",unlock:"standing-lamplighters",minimum:1},
 "roof-spotter": {name:"Roof Spotter",unlock:"insight",minimum:4}
});
const error=(state,message)=>({state,error:message});
const clone=state=>JSON.parse(JSON.stringify(state));
const validTime=t=>Number.isFinite(t)&&t>=0;
const rank=n=>n>=2?2:1;
function recordedCareer(state,now) {
 const record=state.professionCareer;
 if(record&&CAREERS[record.id])return {
  id:record.id,tier:rank(Number(record.tier)),startedAt:Number.isFinite(record.startedAt)?record.startedAt:now,
  lastPaidAt:Number.isFinite(record.lastPaidAt)?record.lastPaidAt:now,
  lastWorkedAt:Number.isFinite(record.lastWorkedAt)?record.lastWorkedAt:null,
  shiftsCompleted:Math.max(0,Math.floor(Number(record.shiftsCompleted)||0)),
  wagesClaimed:Math.max(0,Math.floor(Number(record.wagesClaimed)||0)),
  ...(record.migratedFromLegacy?{migratedFromLegacy:true}:{})
 };
 if(Number(state.qualities?.["trade-tier"]||0)<1)return null;
 const id=Object.keys(CAREERS).find(k=>Number(state.qualities?.["trade-"+k]||0)>0);
 if(!id)return null;
 const old=Number(state.flags?.["last-stipend-claim"]);
 const anchor=Number.isFinite(old)&&old>0?old:now;
 return {id,tier:rank(Number(state.qualities["trade-tier"])),startedAt:anchor,
  lastPaidAt:anchor,lastWorkedAt:null,shiftsCompleted:0,wagesClaimed:0,migratedFromLegacy:true};
}
export function careerView(state,now=Date.now()) {
 if(!validTime(now))throw new RangeError("Invalid time");
 const career=recordedCareer(state,now);
 const legacy=Number(state.flags?.["last-stipend-claim"]||0);
 const anchor=career?Math.max(career.lastPaidAt,Number.isFinite(legacy)?legacy:0):null;
 return {
  career,
  available:Object.entries(CAREERS).map(([id,job])=>({
   id,name:job.name,unlocked:!career&&Number(state.qualities?.[job.unlock]||0)>=job.minimum,
   requirement:{quality:job.unlock,minimum:job.minimum}
  })),
  nextPayAt:career?anchor+WEEK_MS:null,
  payReady:!!career&&now>=anchor+WEEK_MS&&now>=career.startedAt,
  nextShiftAt:career?(career.lastWorkedAt===null?now:career.lastWorkedAt+DAY_MS):null,
  shiftReady:!!career&&(career.lastWorkedAt===null||now>=career.lastWorkedAt+DAY_MS)&&Number(state.actions||0)>=1,
  promotionReady:!!career&&career.tier===1&&career.shiftsCompleted>=PROMOTION_SHIFTS
 };
}
function guard(state,now,options) {
 if(!validTime(now))return "Invalid time";
 if(options.expectedRevision!==undefined&&Number(options.expectedRevision)!==Number(state.revision||0))
  return "Save changed. Refresh before trying again.";
 return null;
}
function commit(state,career,now,title,message) {
 const next=clone(state);
 next.professionCareer=career;
 next.revision=Number(next.revision||0)+1;
 next.flags??={};next.flags.__revision=next.revision;
 next.qualities??={};next.items??={};next.messages??=[];next.journal??=[];
 next.messages.unshift({id:"guild-"+next.revision,at:new Date(now).toISOString(),title,text:message});
 next.messages=next.messages.slice(0,60);
 next.journal.unshift(message);next.journal=next.journal.slice(0,100);
 return next;
}
export function joinCareer(state,id,now=Date.now(),options={}) {
 const denied=guard(state,now,options);if(denied)return error(state,denied);
 const job=CAREERS[id];if(!job)return error(state,"Unknown profession.");
 if(recordedCareer(state,now))return error(state,"Already employed by a guild.");
 if(Number(state.qualities?.[job.unlock]||0)<job.minimum)return error(state,"Qualification or standing required.");
 const career={id,tier:1,startedAt:now,lastPaidAt:now,lastWorkedAt:null,shiftsCompleted:0,wagesClaimed:0};
 const next=commit(state,career,now,"Guild appointment",job.name+" appointed. First payday in seven days.");
 next.qualities["trade-tier"]=1;next.qualities["trade-"+id]=1;
 next.flags["last-stipend-claim"]=now;
 return {state:next,event:"appointed",career};
}
export function workShift(state,now=Date.now(),options={}) {
 const denied=guard(state,now,options);if(denied)return error(state,denied);
 const view=careerView(state,now),old=view.career;
 if(!old)return error(state,"Find a profession first.");
 if(now<old.startedAt||(old.lastWorkedAt!==null&&now<old.lastWorkedAt))
  return error(state,"Shift clock is inconsistent.");
 if(Number(state.actions||0)<1)return error(state,"One action is required.");
 if(!view.shiftReady)return error(state,"Only one shift is available every 24 hours.");
 const earned=old.tier===2?6:3;
 const career={...old,lastWorkedAt:now,shiftsCompleted:old.shiftsCompleted+1};
 const next=commit(state,career,now,"Shift completed",CAREERS[old.id].name+" shift: +"+earned+" Obols; "+career.shiftsCompleted+" shifts total.");
 next.actions=Math.max(0,Math.floor(Number(next.actions||0))-1);
 next.obols=Math.max(0,Number(next.obols||0)+earned);
 return {state:next,event:"shift",career,obolsEarned:earned};
}
export function promoteCareer(state,now=Date.now(),options={}) {
 const denied=guard(state,now,options);if(denied)return error(state,denied);
 const old=recordedCareer(state,now);
 if(!old)return error(state,"Find a profession first.");
 if(old.tier===2)return error(state,"Already guild-qualified.");
 if(old.shiftsCompleted<PROMOTION_SHIFTS)return error(state,"Three shifts are required.");
 if(now<old.startedAt)return error(state,"Promotion clock is inconsistent.");
 const career={...old,tier:2};
 const next=commit(state,career,now,"Guild qualification","Promoted: higher weekly wages and 2 Radiant Crystals awarded.");
 next.qualities["trade-tier"]=2;
 next.items["radiant-crystal"]=Number(next.items["radiant-crystal"]||0)+2;
 return {state:next,event:"promoted",career,itemsEarned:{"radiant-crystal":2}};
}
export function claimWages(state,now=Date.now(),options={}) {
 const denied=guard(state,now,options);if(denied)return error(state,denied);
 const view=careerView(state,now),old=view.career;
 if(!old)return error(state,"Find a profession first.");
 if(now<old.startedAt||now<old.lastPaidAt)return error(state,"Pay clock is inconsistent.");
 if(!view.payReady)return error(state,"Weekly wages are not due.");
 const obols=old.tier===2?26:15,shards=old.tier===2?4:2;
 const career={...old,lastPaidAt:now,wagesClaimed:old.wagesClaimed+1};
 const next=commit(state,career,now,"Guild payday","Weekly guild wage: +"+obols+" Obols and "+shards+" Glimmering Shards.");
 next.obols=Math.max(0,Number(next.obols||0)+obols);
 next.items["glimmering-shard"]=Number(next.items["glimmering-shard"]||0)+shards;
 next.flags["last-stipend-claim"]=now;
 return {state:next,event:"weekly-wage",career,obolsEarned:obols,itemsEarned:{"glimmering-shard":shards},nextPayAt:now+WEEK_MS};
}
