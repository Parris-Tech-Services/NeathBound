// Original NeathBound QBN content; written for this game's setting and player choices.
export const ambitions = {
  "gloomwing-hunt": { name:"The Hunt for the Gloomwing", description:"Discover why the Bureau pays a fortune to destroy the last guardian of the Spire.", treasure:"gloomwing-treasure-treaty", total:30 },
  "missing-name": { name:"The Missing Name", description:"Recover the person the city refuses to remember.", treasure:"treasure-ledger", total:30 },
  "last-light": { name:"The Last Light", description:"Protect the lamplighters from a darkness they helped to create.", treasure:"treasure-lamp", total:5 },
  "river-debt": { name:"The River Debt", description:"Discover the terms of a bargain made with the drowned streets.", treasure:"treasure-oath", total:5 },
  "stolen-hour": { name:"The Stolen Hour", description:"Find the extra hour that the Registry has hidden from the city's clocks.", treasure:"treasure-clock", total:5 }
};
export const destinies = {
  "steady-lantern":{name:"Steady Lantern",stat_bonus:{nerve:5},fate_locked:false},
  "clear-mirror":{name:"Clear Mirror",stat_bonus:{insight:5},fate_locked:false},
  "gentle-voice":{name:"Gentle Voice",stat_bonus:{poise:5},fate_locked:false},
  "silent-foot":{name:"Silent Foot",stat_bonus:{shadow:5},fate_locked:false},
  "last-watch":{name:"Last Watch",stat_bonus:{nerve:5,insight:3},fate_locked:true},
  "kind-judge":{name:"Kind Judge",stat_bonus:{poise:5,nerve:3},fate_locked:true},
  "hidden-star":{name:"Hidden Star",stat_bonus:{shadow:5,insight:3},fate_locked:true},
  "unburnt-page":{name:"Unburnt Page",stat_bonus:{insight:5,poise:3},fate_locked:true},
  "the-seeking":{name:"The Seeking",stat_bonus:{nerve:-3,insight:-3,poise:-3,shadow:-3},seeking:true,fate_locked:false}
};
// Annual, local-calendar festival windows, not copied Fallen London events.
export const festivals = {
 "lanternfall": { name:"Lanternfall",start:[10,14],end:[11,2]},
 "clockmas": { name:"Clockmas",start:[12,15],end:[1,6]},
 "tidewake": { name:"Tidewake",start:[7,1],end:[7,18]},
 "first-bloom": { name:"First Bloom",start:[4,5],end:[4,22]},
 "cinder-fair": { name:"Cinder Fair",start:[8,10],end:[8,25]},
 "winter-names": { name:"Winter Names",start:[6,1],end:[6,20]}
};
export const qbnStories = {};
export const qbnCards = {};
const stages=[["The Candle Census","A lamplighter has counted one more flame than there are inhabited rooms. The excess light carries the outline of a face no one will name.","The lamplighter records the phantom flame beside your name."],["The Debt Written Sideways","An account book lists payments made to a person who never existed. Every entry has been signed by a different hand.","You find the seal of the Registry underneath the ledger's binding."],["The Keeper's Empty Chair","At dawn, a clerk lays two cups at an empty desk. The second cup is still warm, though nobody has entered.","The clerk admits somebody has been removed from her official recollection."],["A Ticket for Yesterday","A station porter offers you a return ticket stamped with tomorrow's date and yesterday's destination.","The false timestamp matches the moment your identity disappeared."],["The Green Wax Seal","A ministerial envelope is sealed with living moss. Breaking it makes the air taste of rain.","The broken seal releases a remembered address beside the quay."],["The Child Who Knows the Bell","A child describes a bell that rings when a name is stolen, then asks why yours is silent.","Her drawing shows a route hidden behind the lampworks."],["A Witness Behind Glass","At a shuttered glasshouse, a witness speaks through a pane that fogs only on your side.","The witness recalls a second version of your arrest."],["The Surgeon of Memories","A surgeon offers to remove the painful edge of a recollection, but refuses to promise what else will go with it.","You retain the memory and learn the price of its removal."],["A Letter Without Ink","An empty letter bleeds words when held near the waterline. The signature is one you recognise but cannot place.","The first word is the name of the person who erased you."],["An Oath Beneath the Bridge","Dockworkers swear to remember the missing, even if it costs them their licences.","Their testimony establishes that the disappearances are deliberate."],["The Clock With No Noon","The public clocks skip an hour. In the missing interval, lamps illuminate doorways that do not exist.","You map an impossible route using the clocks' second hands."],["Three Contradictory Maps","Three surveyors swear their maps are correct. None of the streets overlap except the one that leads to you.","The overlapping street points to a locked registry annex."],["The Brass Union's Offer","A lawyer offers you a legally valid identity in exchange for forgetting how you lost the first.","You refuse an easy substitution and learn who issued the forged papers."],["The Quietest Auction","A merchant auctions sealed silences. One lot is marked with your birth date.","You recover a fragment of testimony hidden in the silence."],["The Archivist's Unwritten Index","An archivist shows you a catalogue of books whose contents have been forgotten by every reader.","One index card contains your missing entry, crossed out twice."],["The Ledger's Torn Margin","Someone has carefully torn the same corner from every page of the city's attendance ledger.","The margins assemble into a list of people who resisted erasure."],["A Choir of Two Voices","The choir sings a duet, but only one singer is visible. The harmony comes from an empty place.","The absent voice gives you a date and an eyewitness."],["The Watchman's Hesitation","A watchman recognises you and then seems surprised to have said so. He begs for a chance to retract it.","His testimony reveals the warrant under which you were detained."],["The Luminous Smuggler","A smuggler carries jars of stolen lamplight across the roofs. Each jar contains somebody's last honest memory.","You rescue one jar without betraying the families it protects."],["The Promise in Red Thread","A red thread leads from your coat to an old hospital register, then vanishes through the floor.","The register records your arrival on the day before you were born."],["The Night Clerk's Bargain","A clerk proposes a bargain: she can certify your name, but must strike another from the list.","You find an overlooked correction instead of accepting the exchange."],["The First False Bell","Under the oldest tower hangs a bell with no clapper. Everyone claims to have heard it once.","You learn who ordered the bell silenced and why."],["The Unpaid Ferryman","A ferryman demands a fare of one truthful memory. He offers to carry you across water that has no shore.","You pay with an honest memory and cross to the last witness."],["The Witness in the River","Beneath the surface waits a witness who has kept every name the Registry tried to drown.","The river returns the testimony in your own handwriting."],["The Second Name","A second name appears under yours, written in pencil so faint it can be erased by breath.","You realise the erasure protected someone who could not escape."],["The Room Above the Registry","An unused chamber holds the original seals used to alter the civic record. One has never been returned.","The missing seal's imprint is on your imprisonment order."],["The Trial of Evidence","The Registry hears your petition. Every witness has something to lose by speaking truthfully.","You secure a hearing in which the city must acknowledge the missing."],["The Price of Restoration","The clerk admits that restoring names may expose hidden families to a danger above the stone sky.","You understand the cost of both recognition and concealment."],["A Petition With Two Endings","You can publish the entire archive, or protect the families in a sealed private record. Either choice changes lives.","You prepare a petition that tells the truth without using people as evidence."],["The Last Entry","The final ledger awaits your signature. Beneath the page, a second hand taps from the stone.","You sign your own name and become the keeper of those the city forgets."]];
qbnStories["qbn-choose-ambition"] = {
 title:"A Promise of Your Own", pattern:"decoupled",
 kicker:"Choose one personal ambition after escaping the chamber",
 text:"At Lantern Quay, four sealed commissions have been left beneath a public lamp. You may follow only one. Choose carefully: another life is required to make another choice.",
 requirements:[{type:"flag",id:"qbn-ambition-chosen",op:"!=",value:true}],
 choices:Object.entries(ambitions).map(([id,entry])=>({
 id:"take-"+id,label:entry.name+" — "+entry.description,
 success:"Your name appears on the contract. The first clue will find you here at Lantern Quay.",
 successEffects:[{type:"ambition",id},{type:"flag",id:"qbn-ambition-chosen",value:true}]
 }))
};
stages.forEach(([title,text,revelation],index)=>{
 const stage=index+1;
 const id="qbn-missing-name-"+stage;
 const stat=["insight","shadow","poise","nerve"][index%4];
 const alternate=["poise","nerve","insight","shadow"][index%4];
 const progress={type:"ambition-progress",id:"missing-name",amount:1};
 const final=stage===30?[{type:"item",id:"treasure-ledger",amount:1},{type:"equip-treasure",id:"treasure-ledger"}]:[];
 qbnStories[id]={
  title:stage+"/30: "+title, kicker:"The Missing Name · personal ambition",
  pattern:"chain",ambition_id:"missing-name",requires_progress:{id:"missing-name",value:index},
  sets_progress:{id:"missing-name",value:stage},once:true,text,
  choices:[
   {id:"seek-evidence",label:"Investigate the evidence ("+stat+")",challenge:{quality:stat,difficulty:3+Math.floor(index/5),scaler:0.60},
    success:revelation,failure:"The trail breaks under scrutiny, but you can return with another approach.",
    successEffects:[progress,...final],failureEffects:[{type:"menace",id:index%2?"suspicion":"dread",amount:1}]},
   {id:"ask-for-help",label:"Ask a witness to assist ("+alternate+")",challenge:{quality:alternate,difficulty:3+Math.floor(index/6),scaler:0.68},
    success:revelation+" A witness chooses to stand beside you.",failure:"The witness does not yet trust you. The investigation remains open.",
    successEffects:[progress,{type:"quirk",id:"magnanimous",amount:1},...final],
    failureEffects:[{type:"menace",id:"scandal",amount:1}]}
  ]
 };
});
Object.entries(ambitions).filter(([id])=>id!=="missing-name").forEach(([id,entry])=>{
 for(let step=1;step<=5;step++){
 qbnStories["qbn-"+id+"-"+step]={
  title:step+"/5: "+entry.name, pattern:"chain",ambition_id:id,
  requires_progress:{id,value:step-1},sets_progress:{id,value:step},once:true,
  text:entry.description+" A new witness brings evidence, but asks you to decide how much of the truth the city can bear. Chapter "+step+" follows the same inquiry through its consequences.",
  choices:[{id:"follow-lead",label:"Follow the lead (Insight)",challenge:{quality:"insight",difficulty:3+step},
  success:"The witness trusts you with the next portion of the truth.",
  failure:"The lead turns cold. You can return when you are ready.",
  successEffects:[{type:"ambition-progress",id,amount:1},...(step===5?[{type:"item",id:entry.treasure,amount:1},{type:"equip-treasure",id:entry.treasure}]:[])],
  failureEffects:[{type:"menace",id:"dread",amount:1}]}]
 };
 }
});
for (const menace of ["suspicion","dread","wounds","scandal"]){
 qbnStories["qbn-arrival-"+menace]={
 title:"Arrival: "+menace,pattern:"decoupled",once:true,autofire:true,action_cost:0,
 kicker:"A consequence that cannot be ignored",
 text:"Your "+menace+" has overwhelmed you. The city has brought you to its custody. Recover before resuming ordinary travel.",
 requirements:[{type:"flag",id:"qbn-arrived-"+menace,op:"==",value:true}],
 choices:[{id:"understand",label:"Take stock of your surroundings",success:"You recognise the work needed to recover.",successEffects:[]}]
 };
}
for(const [id,festival] of Object.entries(festivals)){
 qbnStories["qbn-festival-"+id]={
  title:festival.name,pattern:"decoupled",festival_id:id,
  kicker:"A seasonal gathering",
  text:"Lanterns and records are hung throughout the city for "+festival.name+". For a brief season, strangers may choose the sort of future they intend to defend.",
  choices:[
   {id:"share-supper",label:"Share a meal with strangers",success:"You leave with a warmer heart and the names of three new neighbours.",successEffects:[{type:"menace",id:"dread",amount:-1},{type:"obols",amount:2}]},
   ...Object.entries(destinies).filter(([,d])=>!d.fate_locked).map(([key,d])=>({
    id:"destiny-"+key,label:"Choose destiny: "+d.name,requirements:[{type:"flag",id:"destiny-chosen",op:"!=",value:true}],
    success:"You have chosen a lasting destiny: "+d.name+".",successEffects:[{type:"destiny",id:key}]
   }))
  ]
 };
}
for(const [id,stat] of [["read","insight"],["shadow","shadow"],["plead","poise"]]){
 qbnStories["qbn-investigate-"+id]={
 title:"The Three Paths to the Registry: "+id,pattern:"pyramid",kicker:"Parallel investigations",
 text:"Three separate approaches may advance the same investigation. This evidence does not depend on the order in which the other paths are followed.",
 once:true,choices:[{id:"investigate",label:"Pursue this line of evidence ("+stat+")",
 challenge:{quality:stat,difficulty:5},success:"A fresh lead adds to your common investigation.",
 failure:"The evidence is not yet convincing.",
 successEffects:[{type:"quality",id:"investigation-progress",amount:1}],failureEffects:[{type:"menace",id:"suspicion",amount:1}]}]
 };
}
for(let i=1;i<=20;i++){
 const id="qbn-card-"+i;
 qbnCards[id]={
 id,title:["A Borrowed Lantern","The Mayor's Invisible Guest","Paper Boats at Low Water","A Memory in Copper","The Night Printer"][i%5]+" "+i,
 text:"A citizen asks for a small kindness beneath the city lights. The encounter may reveal a new truth, or simply improve an evening.",
 frequency:["standard","frequent","infrequent","rare","abundant"][i%5],
 urgency:i%10===0?"high":"normal",requirements:null,
 choices:[{id:"hear",label:"Hear the citizen out",challenge:{quality:["insight","poise","nerve","shadow"][i%4],difficulty:4},
 success:"You listen, and are rewarded with a useful scrap of information.",failure:"The conversation ends awkwardly.",
 successEffects:[{type:"obols",amount:2}],failureEffects:[{type:"menace",id:"scandal",amount:1}]}]
 };
}
