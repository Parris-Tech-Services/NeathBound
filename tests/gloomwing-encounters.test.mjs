import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../src/game/state.js';
import { stories, locations } from '../src/game/content.js';
import { chooseAmbition, resolveChoice, storyAvailable, availableChoices } from '../src/game/engine.js';
import { gloomwingEncounterStories as pack } from '../src/game/gloomwing-content.js';
function stateAt(location='lantern-quay',progress=1){
 const s=chooseAmbition({...initialState(),locationId:'lantern-quay'},'gloomwing-hunt').state;
 s.locationId=location;s.unlockedLocations=['lantern-quay','duskwater','black-spire','bureau-hall'];s.ambition_progress['gloomwing-hunt']=progress;s.qualities.gloomwing_hunt_progress=progress;s.obols=20;
 return s;
}
function go(s,id,choice,roll=0){s.actions=10;s.last_action_tick=Date.now();const result=resolveChoice(s,id,choice,()=>roll);assert.equal(result.error,undefined,id+'/'+choice);return result;}
const ids={claims:'gloomwing-claims-desk',salt:'gloomwing-salt-and-wick',price:'gloomwing-price-of-a-claim',cupboard:'gloomwing-lamp-cupboard',audit:'gloomwing-bureau-counterfoil'};
function route(price='borrow',salt='tools',claims='impression'){
 let s=go(stateAt(),ids.claims,claims).state;s.locationId='duskwater';s=go(s,ids.salt,salt).state;s.locationId='lantern-quay';return go(s,ids.price,price).state;
}
for(const [id,story] of Object.entries(pack))for(const c of story.choices){
 test(`playable success and once-only reward: ${id}/${c.id}`,()=>{
  const loc=Object.entries(locations).find(([,v])=>v.stories.includes(id))[0];const s=stateAt(loc);
  for(const r of [...story.requirements,...(c.requirements??[])]){
   const obj=r.type==='flag'?s.flags:r.type==='item'?s.items:r.type==='quality'?s.qualities:null;
   if(obj)obj[r.id]=r.op==='!='?false:r.value;
  }
  const result=go(s,id,c.id);assert.equal(result.success,true);assert.equal(storyAvailable(result.state,id),false);
  assert.match(resolveChoice(result.state,id,c.id,()=>0).error,/no longer available/);
  assert.equal(result.state.ambition_progress['gloomwing-hunt'],1,'side scenes never skip chapters');
 });
 if(c.challenge)test(`failure retries without consuming fee or token: ${id}/${c.id}`,()=>{
  const loc=Object.entries(locations).find(([,v])=>v.stories.includes(id))[0];const s=stateAt(loc);
  for(const r of [...story.requirements,...(c.requirements??[])]){const o=r.type==='flag'?s.flags:r.type==='item'?s.items:r.type==='quality'?s.qualities:null;if(o)o[r.id]=r.op==='!='?false:r.value;}
  const before=structuredClone(s);const result=go(s,id,c.id,0.999999);assert.equal(result.success,false);assert.equal(storyAvailable(result.state,id),true);assert.deepEqual(result.state.items,before.items);assert.equal(result.state.obols,before.obols);
 });
}
test('copy success charges once, failure charges nothing, public record has two free exits',()=>{
 let s=route('copy');assert.equal(s.obols,12);assert.equal(s.items['quill-copy-permit'],1);assert.equal(s.flags['quill-vane-exposed'],true);
 s.locationId='bureau-hall';s.obols=0;const c=availableChoices(s,ids.audit).map(c=>c.id);assert.ok(c.includes('withdraw'));assert.ok(c.includes('exposure'));
 s=go(s,ids.audit,'withdraw').state;assert.equal(s.items['quill-copy-permit'],undefined);assert.equal(s.flags['quill-account-pending'],false);
 s.locationId='black-spire';assert.ok(availableChoices(s,ids.cupboard).some(c=>c.id==='leave'));
});
test('honest delivery still allows dated evidence to be submitted; receipt opens no lock',()=>{
 let s=route('deliver','ledger','ledger');s.locationId='black-spire';s=go(s,ids.cupboard,'receipt').state;assert.equal(s.flags['spire-cupboard-examined'],true);assert.equal(s.items['quill-household-receipt'],1);
 s.locationId='bureau-hall';assert.equal(storyAvailable(s,ids.audit),true);assert.ok(availableChoices(s,ids.audit).some(c=>c.id==='date-copy'));s=go(s,ids.audit,'date-copy').state;assert.equal(s.flags['pell-date-inquiry'],true);assert.equal(s.items['pell-date-copy'],undefined);
});
for(const price of ['borrow','forge','copy'])test(`${price}: pending account gates chapter 20 but cannot trap a penniless player`,()=>{
 let s=route(price,'leave');s.locationId='bureau-hall';s.ambition_progress['gloomwing-hunt']=20;s.qualities.gloomwing_hunt_progress=20;s.obols=0;
 assert.equal(storyAvailable(s,'gloomwing_hunt_20'),false);s=go(s,ids.audit,price==='copy'?'withdraw':'admit').state;assert.equal(storyAvailable(s,'gloomwing_hunt_20'),true);
 s.locationId='black-spire';assert.ok(availableChoices(s,ids.cupboard).length>0,'optional cupboard always has an exit');
});
test('core encounters close before Bureau progression; existing late saves incur no new obligations',()=>{
 for(const n of [0,20,30]){const s=stateAt('lantern-quay',n);s.flags['pell-contact']=true;s.flags['vane-cottage-seen']=true;assert.equal(storyAvailable(s,ids.claims),false);assert.equal(storyAvailable(s,ids.price),false);s.locationId='duskwater';assert.equal(storyAvailable(s,ids.salt),false);}
});
test('tool and token ownership are explicit; each item is consumed exactly once',()=>{
 let s=route();s.locationId='black-spire';s=go(s,ids.cupboard,'key').state;assert.equal(s.items['vane-trimmer-key'],undefined);assert.equal(s.items['vane-trimmer-knife'],1);assert.equal(s.items['quill-claim-token'],1);
 s.locationId='bureau-hall';s=go(s,ids.audit,'repay').state;assert.equal(s.obols,12);assert.equal(s.items['quill-claim-token'],undefined);
 let t=route('forge','leave');assert.equal(t.items['pell-seal-impression'],undefined);t.locationId='black-spire';t=go(t,ids.cupboard,'token').state;assert.equal(t.items['quill-claim-token'],undefined);t.locationId='bureau-hall';t=go(t,ids.audit,'forgery-fee').state;assert.equal(t.obols,16);assert.equal(t.menaces.scandal,1);
});
