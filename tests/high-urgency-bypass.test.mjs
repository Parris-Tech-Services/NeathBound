import test from "node:test";
import assert from "node:assert/strict";
import {drawWeightedCard,cardWeight,MAX_HAND} from "../src/game/decks.js";
const deck={cardIds:["quiet","alarm"]};
test("urgency bypass ignores zero weighting but respects eligibility",()=>{
 const cards={quiet:{title:"Ordinary",weight:500},alarm:{title:"Emergency",weight:0,urgency:"high"}};
 const result=drawWeightedCard({hand:[]},deck,cards,()=>0.8);
 assert.equal(result.id,"alarm");
 assert.equal(drawWeightedCard({hand:["alarm"]},deck,cards,()=>0.2).id,"quiet");
});
test("unlock multiplicity scales probability, not eligibility bypass",()=>{
 assert.equal(cardWeight({weight:1,frequency:"standard"}),10);
 assert.equal(cardWeight({weight:1,frequency:"standard",unlock_conditions:[{type:"flag",id:"a"},{type:"flag",id:"b"}]}),20);
});
test("full hand never draws or advances hand state",()=>{
 const cards={quiet:{title:"Ordinary"},alarm:{title:"Emergency",urgency:"high"}};
 const state={hand:Array.from({length:MAX_HAND},(_,i)=>"card-"+i)};
 assert.equal(drawWeightedCard(state,deck,cards),null);
 assert.equal(state.hand.length,MAX_HAND);
});
