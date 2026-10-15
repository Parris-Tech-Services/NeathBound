// Original NeathBound QBN content; written for this game's setting and player choices.
export const ambitions = {
  "gloomwing-hunt": { name:"The Hunt for the Gloomwing", description:"Discover why the Bureau pays a fortune to destroy the last guardian of the Spire.", treasure:"gloomwing-treasure-treaty", total:30 },
  "missing-name": { name:"The Missing Name", description:"Recover the person the city refuses to remember.", treasure:"treasure-ledger", total:30 },
  "last-light": { name:"The Last Light", description:"Protect the lamplighters from a darkness they helped to create.", treasure:"treasure-lamp", total:30 },
  "river-debt": { name:"The River Debt", description:"Discover the terms of a bargain made with the drowned streets.", treasure:"treasure-oath", total:30 },
  "stolen-hour": { name:"The Stolen Hour", description:"Find the extra hour that the Registry has hidden from the city's clocks.", treasure:"treasure-clock", total:30 }
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
 text:"At Lantern Quay, five sealed commissions have been left beneath a public lamp. You may follow only one. Choose carefully: another life is required to make another choice.",
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

/**
 * Three full, distinct thirty-step Vows. Chapters 1-5 retain their historical
 * story IDs so existing browser and server saves continue from their progress.
 * Chapters 6-30 are authored as separate narrative beats, with two skill routes,
 * an earned cross-scene callback and a final permanent treasure.
 */
const deepVows={"last-light":"A Glimmer in the Smoked Glass|A keeper has found an unlit lantern that casts a shadow at noon.|The glass remembers a fire deliberately extinguished.\nThe Treaty of Cinders|The union ledger records an agreement with an entity called the Cold Guest.|A witness shows where the signatures were removed.\nThe Apprentice's Burn|An apprentice hides a wound shaped like a city map.|The injury points toward an abandoned lampworks.\nThe Bellows Without Breath|The foundry's ancient bellows pump though no one feeds them.|An unseen furnace is still receiving fuel.\nAn Invoice for Dark|The treasurer pays for darkness by weight and refuses to name the supplier.|The invoices link the Council to the missing light.\nThe House with Blue Windows|A family keeps bright curtains in a district where every lamp has failed.|They shelter a keeper who refused the treaty.\nThe Lantern That Accuses|A brass lantern brightens only when someone lies about the catastrophe.|The object names three officials responsible.\nThe Trial of the Wick|Lamplighters demand that the apprentice surrender the accusing lantern.|The tribunal cannot agree whether a witness can be an object.\nUnder the Coal Canal|A narrow channel delivers freezing ash to an unmapped chamber.|The canal leads beneath the original lampworks.\nA Furnace Fed with Names|The hidden furnace burns names instead of coal.|Every spark is a memory taken from the living.\nThe Seamstress of Ash|A dressmaker mends the clothes of people erased by a failed light.|Her needle stitches testimony into a coat.\nThe Door Inside a Flame|A door appears within the standing fire when you speak a true name.|The door leads to the Cold Guest's threshold.\nThe Guest's Bargain|The Cold Guest claims it was summoned to end a plague of uncontrolled brightness.|Its prison has become the city's power source.\nTwo Contradictory Witnesses|The eldest keeper and youngest apprentice disagree about who broke the contract.|Neither knows the Council has altered the record.\nThe Lamp on the Gallows|A public execution lantern burns with light taken from prisoners.|You can identify the next person whose memory will be harvested.\nWhat the Children Carried|Schoolchildren smuggle warm stones to families living beyond the grid.|They have invented a gentler way to share light.\nA Vote Behind Closed Doors|The lamplighters vote on whether to hide their part in the bargain.|A public confession would cost them political protection.\nThe Price of a Second Dawn|The engineer calculates how many homes will lose heat during a repair.|The cost is real and cannot be wished away.\nThe Unlit Procession|Citizens carry lanterns without flame through the factory district.|Their silent march persuades the union to negotiate.\nA Repair Without Permission|An old engineer has a plan to unbind the Cold Guest safely.|The repair demands evidence from the Council's vault.\nThe Keeper's Last Testimony|The dying keeper admits he helped build the first prison of light.|His signature can break the old agreement.\nA Choice of Witnesses|The Council offers immunity to whoever betrays the apprentice.|Loyalty determines who stands beside you at the hearing.\nThe Furnace Opens|The hidden chamber opens onto a sky of sparks and remembered names.|The Guest can leave, but the city must learn to live differently.\nThe Night of Shared Lamps|Households gather their lamps to survive the change together.|The dark is survivable only if neighbours keep their promises.\nThe Last Light Reborn|The keeper asks whether the recovered light should belong to the Council or the streets.|Your verdict changes who controls the lamps forever.","river-debt":"A Coin at Low Water|A ferryman finds a coin stamped with an address beneath the river.|Someone upstream has been paying a debt in other people's names.\nThe Ferry Ledger|A wet ledger lists journeys made by passengers still asleep in their beds.|The crossings record bargains rather than fares.\nThree Knocks at the Hull|Something beneath the ferry knocks once for every promise broken.|The rhythm is a message from the drowned streets.\nThe Cartographer's Floodline|A surveyor draws the river through houses that have never flooded.|The map marks a forgotten municipal district.\nA Mother's Returned Letter|A mother receives a letter signed by her drowned daughter.|The river has learned to imitate voices, but not memories.\nThe Water Auction|Dealers bid on a single dry breath sealed in glass.|The breath belongs to the person who first contracted the debt.\nA Jurist in Waders|A solicitor believes the drowned have enforceable civic rights.|A contract was written to deny them those rights.\nThe Bridge of Missing Planks|The bridge is repaired nightly, but one board always vanishes.|The missing plank conceals a list of unpaid names.\nBelow the Tide Registry|A drowned registrar maintains appointments with citizens who cannot attend.|The entries predate the city's founding.\nA Witness of Salt|An old bargewoman carries salt that never dissolves.|Her testimony can distinguish a promise from a trick.\nThe Flooded Parliament|Seats in the council chamber are filled with water during secret votes.|The river has been represented without a voice.\nThe Debt Collector's Son|A young collector asks you to destroy his father's accounts.|His father was trying to protect the children of the quay.\nThe Choir Beneath the Keel|Singers practise beneath the river's surface without drowning.|Their song preserves the original bargain word for word.\nA Dry Street That Weeps|A neighbourhood floods at midnight though no water enters it.|Its inhabitants are remembering debts inherited without consent.\nA Bargain at Lantern Quay|The Ferrymen propose selling the river's rights to the highest patron.|A tempting solution would make the dispossessed poorer.\nThe Last Honest Toll|An abandoned tollgate accepts only a true confession.|The gate recognises the name of the city's first debtor.\nThe River's Two Faces|At the split current, the river speaks as a witness and an accuser.|Both voices belong to the same injured community.\nThe Boat of Unclaimed Shoes|A drifting boat holds footwear for people struck from public records.|Each pair identifies a household owed restitution.\nAn Audit of the Drowned|The city auditor agrees to count losses that no ledger admits.|The sum is greater than the treasury can pay.\nThe Ferryman's Refusal|The oldest ferryman refuses a profitable crossing for the first time.|He knows the route would abandon a settlement to ruin.\nThe Broken Water Clock|A clock measures how long the submerged families have waited.|The hands stop when you say the contract's hidden clause.\nWitnesses on Both Banks|Living merchants and drowned residents arrive to testify together.|Their accounts expose the same illegal bargain.\nThe Tide Without Permission|The river rises to reclaim what was promised.|You can protect homes without denying the river's claim.\nA Covenant of Dry Stone|Engineers offer to mark protected crossings and return stolen access.|The covenant requires a lasting cost from powerful families.\nThe Debt Finally Named|The river demands to know who will carry the obligation now.|Your ruling grants the drowned a place in the living city's future.","stolen-hour":"The Minute Hand's Secret|A clockmaker finds sixty missing minutes written between two ticks.|The lost hour has been stored rather than destroyed.\nA Calendar with Two Thursdays|The Registry distributes calendars containing a duplicate day.|Someone is hiding events inside the repeated date.\nThe Watch that Ran Backwards|A watch runs backwards only in the presence of an official.|The mechanism records a concealed public order.\nThe Child Before Her Birthday|A child remembers meeting you a year before she was born.|The Registry has altered her family's history.\nThe Clerk of Unspent Time|A clerk keeps jars labelled with hours stolen from ordinary workers.|The stolen time funds private meetings above the city.\nAn Appointment in the Rain|A letter summons you to a square where rain falls upwards.|The meeting occurs in the missing hour.\nThe Chronologist's Debt|An expert confesses that he was paid to erase a strike from the calendar.|The workers never agreed to lose that day.\nA Gallery of Forgotten Clocks|A museum stores clocks that stopped during civic scandals.|Each stopped face points to the same minister.\nThe Midnight Receipt|A shopkeeper gives you a receipt for something you have not bought.|Its date proves the hidden hour can affect the present.\nThe Street Between Bells|An alley appears only after the thirteenth chime.|Its houses shelter people the Registry marked nonexistent.\nThe Hour Collector's Invitation|A masked host invites you to spend one of your childhood memories.|The guests purchase extra time with other people's pasts.\nThe Station that Waited|A railway station's departure board pauses when you enter.|The train carries those evicted from the official calendar.\nThe Council's Second Clock|A sealed mechanism measures time for the rulers alone.|Its hands are powered by forfeited wages and rest.\nThe Baker's Missing Morning|A baker cannot remember the day her husband disappeared.|The missing morning is listed in an annex under a false title.\nThe Minute Trial|Officials prosecute a witness for speaking during an hour that legally never happened.|Your evidence can expose the absurdity of the charge.\nThe Committee of No Tomorrows|The Registry votes to erase the next day of protest.|The vote is not unanimous, and one dissenter left a record.\nA Clockmaker's Confession|Your ally helped design the original hour vault.|They were promised it would preserve lives during a disaster.\nThe Vault of Borrowed Sleep|Workers' lost sleeping hours hang in glass chambers.|Returning the hours could overwhelm the city's schedules.\nA Petition Written at Dawn|Families sign a petition demanding their missing time back.|The signatures fill an entire wall of the Registry.\nThe Minister's Private Summer|An official has spent decades inside a pocket of borrowed time.|His long life depends on the city's quiet suffering.\nThe Bell Tower Contract|An agreement links the hour vault to the citywide bell network.|One strike could free the hour or erase it forever.\nA Witness Who Aged Twice|A watchman has lived both sides of the missing hour.|His memory reveals how to interrupt the mechanism safely.\nA Pause Before the Verdict|A lawyer offers you legal control of the stolen hour.|Ownership might protect it but could repeat the original injustice.\nWhen Every Clock Stopped|The vault opens and all the clocks in the city hold still.|For one breath, everyone can remember what was taken.\nThe Hour Returned|The citizens assemble to decide how their recovered time should be used.|Your testimony ensures the hour can never be traded in secret again."};
for (const [vow,source] of Object.entries(deepVows)){
 const chapters=source.trim().split("\n").map(line=>line.split("|"));
 if(chapters.length!==25)throw Error("Expected 25 new chapters for "+vow);
 const entry=ambitions[vow];
 entry.total=30;
 chapters.forEach(([title,setting,discovery],offset)=>{
  const stage=offset+6,id="qbn-"+vow+"-"+stage;
  const primary=["insight","nerve","shadow","poise"][(stage+offset)%4];
  const alternate=["poise","shadow","insight","nerve"][(stage+offset)%4];
  const keepsake=stage===30?[{type:"item",id:entry.treasure,amount:1},{type:"equip-treasure",id:entry.treasure}]:[];
  qbnStories[id]={
   title:stage+"/30: "+title,kicker:entry.name+" · "+(stage<14?"The inquiry":stage<24?"The reckoning":"The verdict"),
   pattern:"chain",ambition_id:vow,requires_progress:{id:vow,value:stage-1},
   sets_progress:{id:vow,value:stage},once:true,
   text:setting+" What you decide here will follow you to the next chapter.",
   choices:[
    {id:"investigate",label:"Establish the facts ("+primary+")",
     challenge:{quality:primary,difficulty:4+Math.floor(stage/7),scaler:.60},
     success:discovery+" You record evidence that can be checked by others.",
     failure:"You cannot yet corroborate this account. The person most at risk asks you to return.",
     successEffects:[{type:"ambition-progress",id:vow,amount:1},{type:"flag",id:vow+":proof:"+stage,value:true},...keepsake],
     failureEffects:[{type:"menace",id:"dread",amount:1}]},
    {id:"protect",label:"Protect the person who knows ("+alternate+")",
     challenge:{quality:alternate,difficulty:3+Math.floor(stage/7),scaler:.68},
     success:discovery+" The witness survives, but protecting them exposes you to official attention.",
     failure:"The witness withdraws for now. Someone has noticed your interest.",
     successEffects:[{type:"ambition-progress",id:vow,amount:1},{type:"quirk",id:"magnanimous",amount:1},{type:"menace",id:"suspicion",amount:1},{type:"flag",id:vow+":protected:"+stage,value:true},...keepsake],
     failureEffects:[{type:"menace",id:"suspicion",amount:1}]},
    {id:"call-in-favour",label:"Ask the person you protected earlier to testify",
     requirements:[{type:"flag",id:vow+":protected:"+(stage-1),op:"==",value:true}],
     challenge:{quality:"poise",difficulty:4+Math.floor(stage/9),scaler:.66},
     success:"The witness you protected returns. "+discovery+" The testimony costs you standing with the city authorities.",
     failure:"Your witness is frightened of the authorities. You can still take the ordinary routes.",
     successEffects:[{type:"ambition-progress",id:vow,amount:1},{type:"menace",id:"scandal",amount:1},{type:"flag",id:vow+":testimony:"+stage,value:true},...keepsake],
     failureEffects:[{type:"menace",id:"scandal",amount:1}]}
   ]
  };
 });
}

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

// A complete second personal ambition with original continuity, recurring
// witnesses, three approaches per stage and mutually exclusive ending outcomes.
const lastLightChapters = [["The Unlit Stair","Hessa leads you up a public stair where eight lamps have stopped casting shadows. The residents have been told the darkness is a harmless maintenance fault.","You copy the maintenance orders and discover each failure followed a registry inspection.","Hessa convinces the neighbours to share the hour each light failed.","You relight the lowest stair before somebody falls, using the only spare wick."],["A Candle With Two Shadows","A single candle in the inspectors' office throws the shadow of a second person. Its owner has no memory of the colleague whose coat still hangs by the door.","The coat's badge matches the signature on a requisition for experimental fuel.","An exhausted cleaner remembers speaking to the absent inspector yesterday.","You remove the candle from the office, surrendering a useful clue to keep staff safe."],["Oru's Night Clinic","Surgeon Oru treats dockworkers who forget their children's faces after every double shift. His records show the symptoms began when new lamp oil reached the quay.","Oru lets you compare patient notes to the fuel deliveries.","A patient volunteers testimony on condition that you conceal the family's address.","You donate the clinic's last clean light to a child waiting for treatment."],["The Lampmen's Ledger","At Lantern Quay the night crews keep a second ledger in charcoal. Its entries are not hours worked but names surrendered to keep the lights burning.","You trace the charcoal marks to a supply tunnel under the Registry.","Hessa persuades the oldest lampman to explain why the ledger was hidden.","You destroy a page of private names after recording only the responsible officials."],["A Window Left Dark","A widow refuses to light her rooms, even though the council fines households for darkness. She says her husband returned from the lampworks without knowing her.","You establish that her husband's appointment coincided with a fuel-testing session.","You obtain her consent to present the incident to the lamplighters' union.","You pay the fine so she can keep her rooms dark one more night."],["The Union's Unfinished Oath","The night workers gather beneath an abandoned railway bridge. Their oath promises to keep the city safe but says nothing about the people consumed by its safety.","The missing clause is present in an older copy stored in the union's lockbox.","Hessa and Oru persuade the workers to add a duty to protect those supplying the light.","You take the risk of carrying the new oath openly through the patrols."],["Station Nine's Missing Train","The timetable lists a service that departs Station Nine every midnight but never arrives. Its guards carry sealed canisters instead of passenger tickets.","The canister numbers form a route from the Registry to the lampworks.","A porter offers the names of the missing passengers without accepting payment.","You help a passenger escape before asking a single question."],["The Copper Gate","A gate in the lampworks bears a warning in three languages, the newest of which is still wet. No one will say what lies on the other side.","You find a safety drawing showing a reservoir below the furnaces.","A maintenance apprentice tells you who ordered the warning repainted.","You open an emergency vent before entering, losing the advantage of secrecy."],["The Furnace With No Ash","The oldest furnace is still hot, although no coal has been delivered for years. Workers feed it sealed cylinders and refuse to look through the glass.","The furnace log records a measurable loss of memory after each firing.","Oru recognises the symptoms of the workers nearest the glass.","You shut the inspection port long enough to let a trapped worker breathe."],["A Reservoir of Voices","Below the furnace lies a reservoir where voices rise like bubbles from dark oil. One voice speaks in your mother's cadence, although the words are unfamiliar.","You prove the reservoir stores memories extracted from living citizens.","Hessa recognises a friend among the voices and agrees to testify.","You rescue a canister marked for destruction despite the danger it brings."],["The Price Per Hour","A council invoice assigns a monetary value to a person's first memory and a higher rate to their last. The figures balance against the lamp budget.","The invoice is signed by Councillor Venn and countersigned by a city surgeon.","An accounts clerk explains that families were never asked to consent.","You remove the list of victims' home addresses before taking the invoice."],["The Inventor's Margins","The inventor's notebook describes a way to power the lamps without taking memories. A later hand has marked every successful test as prohibited.","You reconstruct the suppressed design from annotations in the binding.","An apprentice who helped build it agrees to return and explain the risks.","You hide the notebook's names while keeping the engineering details."],["A Crate Marked Dawn","A crate of pale glass arrives without customs stamps. Each vessel captures the faint light from cracks in the stone sky.","The vessels could supply a small hospital without the existing memory fuel.","A smuggler agrees to share the source if the families are not exposed.","You divert the first crate to Oru's clinic instead of selling it."],["Committee of Lamps","The ration committee insists that citywide lights cannot change before the next election. Hessa places a patient record beside their spotless financial report.","The committee minutes admit that the memory losses are deliberate.","A nervous delegate gives you a schedule for replacing the most harmful lamps.","You hold the meeting open so the victims can speak instead of being dismissed."],["The Ward After Midnight","A fever ward dims every lamp when its patients sleep, and the patients briefly remember themselves again. Oru asks you to test whether darkness can be a treatment.","The night observations establish a reversible link between light and lost memory.","You help the ward's families document what their relatives recall.","You stay awake to tend the patients when the night nurses are ordered home."],["The School Without Yesterday","Children at a small school can recite their lessons but cannot remember who taught them. Their teacher has chalked every name on the door.","The blackboard dust contains traces of fuel from the streetlights outside.","The parents agree to safeguard the children's testimony as a group.","You cover the school lamps before another lesson can be taken."],["The Union Divides","Half the lamplighters want to strike immediately; the others fear leaving hospitals and stairways dark. Both groups ask you to say which lives matter most.","You calculate a staged shutdown that preserves essential routes and wards.","Hessa secures agreement on a temporary emergency rota.","You volunteer to work the most dangerous unlit shift yourself."],["Confession at the Boiler","A boiler steward confesses to falsifying the safety trials after Venn threatened his daughter's place at the hospital. He has kept every original result.","The original readings prove the new glass design was deliberately suppressed.","You promise the steward's daughter will not be punished for his testimony.","You escort him to a safe district before publishing the readings."],["A Councillor's Ultimatum","Councillor Venn offers to restore the public lamps on one condition: the missing memories and their owners must remain confidential forever.","You find the legal provision allowing a public inquiry without naming patients.","Hessa gathers the workers who can operate the alternative generators.","You refuse to bargain with patients' names, even though the lights grow weaker."],["The First Clear Wick","The forbidden design produces a flame from captured sky-light. It burns pale green and remembers nothing at all.","You measure the new flame's stability through a complete shift.","Oru and Hessa recruit a team to train replacements before the next outage.","You carry a working lamp to the ward while the council guards watch."],["Proof Under Seal","The evidence is ready: fuel records, patient testimony, and the inventor's design. The Archive offers either a public hearing or a sealed emergency intervention.","You bind the proof into a case that can survive the council's objections.","You obtain consent from witnesses whose families may be put at risk.","You remove identifying details from every vulnerable patient's statement."],["The Night of Replacement","Under a citywide curfew the first clear wicks are installed at clinics and bridges. The old furnaces begin to fail as if resisting their replacements.","You coordinate the replacement schedule around the most vulnerable districts.","You negotiate safe passage for workers through the night patrols.","You climb the tower yourself when the last ladder is seized."],["The Council's Witness","Venn admits the lampworks could have been made safer years ago, but claims an immediate change would have killed hundreds. She asks what you would have done.","You challenge her account with the dates of the suppressed trials.","You let the affected families question her instead of speaking for them.","You stop the crowd from attacking her before her evidence is complete."],["Three Plans for the City","The public square fills with citizens demanding their stolen memories. Some want every file opened; others fear the harm such exposure would cause.","You write a transparent restoration plan that protects the identities of victims.","Hessa convenes a binding assembly of workers, patients and ward representatives.","You supervise an emergency system to keep the wards lit while the council debates."],["The Light We Keep","The final switch is beneath the Archive. You may publish the evidence and replace the old fuel openly, entrust the repair to an independent ward council, or shut the extraction furnace for good. Whichever you choose, there will be costs.","The city receives a public account and a safe, measured transition to the new lamps.","The ward council accepts custody of the truth, with strict protection for every patient.","You stop the extraction at once and shoulder the risk of an emergency blackout."]];
ambitions["last-light"].total = 30;
lastLightChapters.forEach(([title, text, evidence, solidarity, rescue], index) => {
 const step = index + 6;
 const final = step === 30;
 const grant = [{type:"ambition-progress",id:"last-light",amount:1}];
 const treasure = final ? [{type:"item",id:ambitions["last-light"].treasure,amount:1},
                          {type:"equip-treasure",id:ambitions["last-light"].treasure}] : [];
 const choices = [
  {id:"trace",label: final ? "Publish the documented truth and transition openly (Insight)" : "Trace the records and secure evidence (Insight)",
   challenge:{quality:"insight",difficulty:Math.min(10,4+Math.floor(step/6)),mode:"broad"},
   success:evidence,failure:"Your evidence is not conclusive. The line of inquiry remains open.",
   successEffects:[...grant,{type:"flag",id:"last-light:evidence-"+step,value:true},
     ...(final?[{type:"flag",id:"last-light:verdict",value:"public-reform"}]:[]),...treasure],
   failureEffects:[{type:"menace",id:"dread",amount:1}]},
  {id:"organise",label:final?"Entrust restoration to the independent ward council (Poise)":"Win witnesses and organise a safer alternative (Poise)",
   challenge:{quality:"poise",difficulty:Math.min(10,4+Math.floor(step/7)),mode:"broad"},
   success:solidarity,failure:"Trust cannot be demanded. The witnesses ask you to return with better terms.",
   successEffects:[...grant,{type:"quirk",id:"magnanimous",amount:1},
     ...(final?[{type:"flag",id:"last-light:verdict",value:"ward-council"}]:[]),...treasure],
   failureEffects:[{type:"menace",id:"scandal",amount:1}]},
  {id:"protect",label:final?"Shut the extraction furnace down immediately (Nerve)":"Protect those endangered while pursuing the lead (Nerve)",
   challenge:{quality:"nerve",difficulty:Math.min(10,4+Math.floor(step/6)),mode:"broad"},
   success:rescue,failure:"The danger forces you back. Nobody has been abandoned, but you must prepare better.",
   successEffects:[...grant,{type:"flag",id:"last-light:protected-"+step,value:true},
     ...(final?[{type:"flag",id:"last-light:verdict",value:"emergency-shutdown"},{type:"menace",id:"wounds",amount:1}]:[]),...treasure],
   failureEffects:[{type:"menace",id:"wounds",amount:1}]}
 ];
 qbnStories["qbn-last-light-"+step]={
   title:step+"/30: "+title,kicker:"The Last Light · personal ambition",
   pattern:"chain",ambition_id:"last-light",requires_progress:{id:"last-light",value:step-1},
   sets_progress:{id:"last-light",value:step},once:true,text,choices
 };
});
for(let step=1;step<=5;step++){
 const story=qbnStories["qbn-last-light-"+step];
 story.title=story.title.replace("/5:","/30:");
 for(const choice of story.choices){
   choice.successEffects=choice.successEffects.filter(effect=>effect.type!=="equip-treasure"&&!(effect.type==="item"&&effect.id===ambitions["last-light"].treasure));
 }
}

// The separate fully authored 30-part Gloomwing storypack supersedes these
// five prototype entries. Keep old saves' ambition IDs, but remove orphan cards.
for(let i=1;i<=5;i++)delete qbnStories["qbn-gloomwing-hunt-"+i];
