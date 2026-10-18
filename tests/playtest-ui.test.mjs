import test from 'node:test';
import assert from 'node:assert/strict';
import {render} from '../src/ui/render.js';
import {initialState} from '../src/game/state.js';

function view(state){
 const listeners=new Map();
 const button={dataset:{slot:'hat',item:'test-hat'},disabled:false,addEventListener(type,fn){const key=type;listeners.set(key,[...(listeners.get(key)||[]),fn]);}};
 const app={innerHTML:'',querySelectorAll(selector){return selector==='[data-action=equip-item]'?[button]:[];},querySelector(){return {addEventListener(){},classList:{toggle(){}},setAttribute(){}};}};
 let equips=0;
 render(app,state,{equipItem(){equips++;}});
 return {app,clickEquip(){for(const fn of listeners.get('click')||[])fn();return equips;}};
}
test('one equipment click dispatches exactly one mutation',()=>{
 assert.equal(view(initialState()).clickEquip(),1);
});
test('action counts and lock explanations agree with the current rules',()=>{
 const state=initialState();state.locationId='lantern-quay';state.flags['tutorial.myself']=true;state.actions=3;
 const {app}=view(state);
 assert.match(app.innerHTML,/<strong>Actions<\/strong><div>3 \/ 10<\/div>/);
 assert.doesNotMatch(app.innerHTML,/Unlimited|No waiting or payment gates|you have undefined/);
 assert.match(app.innerHTML,/must be not true/);
 assert.match(app.innerHTML,/Last Stipend Claim: ready/);
 assert.match(app.innerHTML,/five sealed commissions/);
});

test('choice controls announce their action, choice and story while preserving visible labels',()=>{
 for(const actions of [10,0]){
  const state=initialState();state.actions=actions;
  const html=view(state).app.innerHTML;
  const buttons=[...html.matchAll(/<button class="go-button"[^>]*aria-label="([^"]+)"[^>]*>(GO|WAIT|LOCKED)<\/button>/g)];
  assert.ok(buttons.length>=4,'all opening choices have accessible names');
  assert.equal(new Set(buttons.map(match=>match[1])).size,buttons.length,'opening choices have distinct names');
  for(const [,name,label] of buttons){
   assert.ok(name.startsWith(label+': '),'accessible name contains visible button label');
   assert.match(name,/: .+ — .+/,'choice and story provide context');
  }
  assert.ok(buttons.some(([, ,label])=>label===(actions?'GO':'WAIT')));
 }
});

test('Plans controls identify their story and retain toggle semantics',()=>{
 const state=initialState();state.locationId='lantern-quay';state.flags['tutorial.myself']=true;
 const html=view(state).app.innerHTML;
 const buttons=[...html.matchAll(/<button class="bookmark[^"]*"[^>]*aria-label="([^"]+)"[^>]*aria-pressed="(true|false)"/g)];
 assert.ok(buttons.length>1);
 assert.equal(new Set(buttons.map(match=>match[1])).size,buttons.length);
 for(const [,name,pressed] of buttons){assert.match(name,/^Add to Plans: .+/);assert.equal(pressed,'false');}
});
