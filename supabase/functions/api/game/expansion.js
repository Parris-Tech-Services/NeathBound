// Original NeathBound expansion: ordinary districts, independent encounters,
// and Chapter Two of The Missing Name. Content is data, not executable logic.
// Imported by both the offline engine and the Supabase authoritative engine.
export const expansionLocations = {
  "ashrail-station": {
    name: "Ashrail Station", region: "The Lower City",
    subtitle: "Every train has a destination. Not every destination has a name.",
    atmosphere: "Hot iron, late trains and a station clock with thirteen hours marked on its face.",
    stories: ["ashrail-cancelled-platform", "ashrail-last-train", "ashrail-ticket-office"]
  },
  "cinder-ward": {
    name: "Cinder Ward", region: "The Lower City",
    subtitle: "A neighbourhood that remembers people the city erased.",
    atmosphere: "Coal dust, shared suppers, and children's chalk marks on doors without numbers.",
    stories: ["cinder-communal-stove", "cinder-choir", "cinder-blue-door"]
  },
  "registry-of-hours": {
    name: "Registry of Hours", region: "The Civic Heights",
    subtitle: "The ministry that decides which people officially happened.",
    atmosphere: "Frosted windows, blue sealing wax, and the clock striking thirteen.",
    stories: ["registry-counter", "registry-thirteenth-correction", "registry-last-decision", "registry-afterword"]
  }
};

export const expansionStories = {
  "quay-roads": {
    title: "Three Roads Out of Lantern Quay",
    kicker: "Where can you go?", tags: ["always-available"],
    text: "A ferryman marks three roads on a freight docket. The northbound iron line reaches Ashrail Station, where the city removes cancelled journeys from the timetables. The east stair climbs to Cinder Ward, where neighbours remember people the officials deny exist. Your first visit teaches you the route; thereafter you can return using the city map.",
    choices: [
      { id: "take-north-line", label: "Take the north line to Ashrail Station", success: "The conductor punches a ticket without a destination. At Ashrail Station, someone has painted over a twelfth platform on the wall map.", successEffects: [{type:"location",id:"ashrail-station"},{type:"unlock-location",id:"ashrail-station"},{type:"flag",id:"route:ashrail",value:true}] },
      { id: "climb-east-stair", label: "Climb the east stair to Cinder Ward", success: "You pass a row of doors whose house numbers have been chiselled away. Families have chalked their own names underneath.", successEffects: [{type:"location",id:"cinder-ward"},{type:"unlock-location",id:"cinder-ward"},{type:"flag",id:"route:cinder",value:true}] },
      { id: "ask-about-registry", label: "Ask who erased these destinations", success: "The ferryman taps the clock tower above the station. 'Registry of Hours. They'll tell you what they removed, if you can persuade them you ought to exist.'", successEffects: [{type:"flag",id:"heard-about-registry",value:true}] }
    ]
  },
  "ashrail-cancelled-platform": {
    title: "The Cancelled Platform", kicker: "A lead in the missing-name mystery",
    once: true,
    text: "Eleven platforms appear on the public station map. The brass control board lists twelve. A porter says Platform Twelve disappeared from the records on the morning you were arrested. In the waste-paper basket, you find a ticket punched with the same bell as the lock on your cell.",
    choices: [
      { id:"study-ticket", label:"Copy the ticket's service number (Insight)", challenge:{quality:"insight",difficulty:6},
        success:"The issuing office is the Registry of Hours. You copy its address and the date the platform was closed. Your name is written faintly on the reverse.",
        failure:"Ink smears over the date, but the porter helps you read the issuing office: the Registry of Hours. He begs you not to write down his name.",
        successEffects:[{type:"flag",id:"chapter-two:ticket",value:true},{type:"unlock-location",id:"registry-of-hours"},{type:"item",id:"unfinished-page",amount:1}],
        failureEffects:[{type:"flag",id:"chapter-two:ticket",value:true},{type:"unlock-location",id:"registry-of-hours"},{type:"menace",id:"suspicion",amount:1}] },
      { id:"ask-porter", label:"Ask the porter who cancelled the platform (Poise)", challenge:{quality:"poise",difficulty:5},
        success:"He remembers a frightened clerk leading a child off the train. He gives you the address of the Registry, then says, 'She erased the journey to protect somebody.'",
        failure:"He will not name the clerk, but slips you a Registry address. Someone behind the ticket grille watches you leave.",
        successEffects:[{type:"flag",id:"chapter-two:ticket",value:true},{type:"unlock-location",id:"registry-of-hours"},{type:"flag",id:"chapter-two:clerk-had-child",value:true}],
        failureEffects:[{type:"flag",id:"chapter-two:ticket",value:true},{type:"unlock-location",id:"registry-of-hours"},{type:"menace",id:"scandal",amount:1}] }
    ]
  },
  "ashrail-last-train": {
    title: "The Train Without Passengers", kicker: "An independent encounter",
    text: "A goods train waits on the disused line every night. The driver has a lantern but no timetable. Its carriages bear the words TRANSFER OF HOURS, beneath seals someone has tried to scrape away.",
    choices: [
      { id:"carry-coal", label:"Help unload the sealed train (Nerve)", challenge:{quality:"nerve",difficulty:6},
        success:"The driver pays you and says the carriages once carried records, not passengers. Then the midnight bell rings a thirteenth time.",
        failure:"A coal sack bursts against your leg. You are paid a little for the work and sent away before the seals come off.",
        successEffects:[{type:"obols",amount:8},{type:"flag",id:"heard-of-record-train",value:true}],
        failureEffects:[{type:"obols",amount:2},{type:"menace",id:"wounds",amount:1}] },
      { id:"read-seals", label:"Study the labels without being noticed (Shadow)", challenge:{quality:"shadow",difficulty:6},
        success:"Beneath the seals you see the dates of three vanished people. The last is the date of your own imprisonment. You pocket a flake of ink.",
        failure:"A watchman turns the lamp your way. You escape his questions, but he will remember your face.",
        successEffects:[{type:"item",id:"ink-of-absence",amount:1},{type:"flag",id:"heard-of-record-train",value:true}],
        failureEffects:[{type:"menace",id:"suspicion",amount:1}] }
    ]
  },
  "ashrail-ticket-office": {
    title: "Follow the Cancelled Ticket", kicker: "A newly discovered route",
    once: true, requirements:[{type:"flag",id:"chapter-two:ticket",op:"==",value:true}],
    text: "The service code on the ticket leads upstairs to the Registry of Hours. The same ticket bears a former passenger's address in Cinder Ward. The city map now shows the Registry; you can go there at any time, or look for the passenger first.",
    choices: [
      {id:"go-registry",label:"Go to the Registry and join the queue",success:"A clerk gives you a queue number. There is nobody else in line. Behind the glass, a clock strikes thirteen.",successEffects:[{type:"location",id:"registry-of-hours"},{type:"unlock-location",id:"registry-of-hours"}]},
      {id:"find-passenger",label:"Go to Cinder Ward and search for the passenger",success:"The neighbours recognise the ticket punch. A child draws you a chalk map to a blue door without a number.",successEffects:[{type:"location",id:"cinder-ward"},{type:"unlock-location",id:"cinder-ward"}]}
    ]
  },
  "cinder-communal-stove": {
    title:"Supper for the Unlisted", kicker:"The people behind the paperwork", once:true,
    text:"At a communal stove, neighbours serve soup to families no longer on the municipal register. One mother says her house was declared empty while her children were inside. She wants the city to acknowledge them, but fears what might find them if it does.",
    choices:[
      {id:"sign-petition",label:"Sign a petition demanding recognition",success:"The families thank you for standing beside them. The petition goes straight to the Registry, with your name visible at the top.",successEffects:[{type:"flag",id:"cinder:stood-openly",value:true},{type:"quality",id:"poise",amount:1},{type:"menace",id:"suspicion",amount:1}]},
      {id:"feed-families",label:"Help prepare supper without giving your name",success:"You keep the stove burning until the room is full. The neighbours cannot put your name on the petition, but they will remember your kindness.",successEffects:[{type:"flag",id:"cinder:helped-quietly",value:true},{type:"quality",id:"shadow",amount:1},{type:"item",id:"glimmering-shard",amount:2}]}
    ]
  },
  "cinder-choir": {
    title:"The Choir of Missing Names", kicker:"The ward's living memory",
    text:"Each evening the ward's choir sings the names of people the official ledgers have forgotten. New verses are added when a name disappears. Tonight they ask you to remember one detail about a person nobody else can prove lived.",
    choices:[
      {id:"sing",label:"Sing with the neighbours (Poise)",challenge:{quality:"poise",difficulty:5},success:"The tune steadies you. A woman says the Registry bell sounds thirteen times whenever it erases another name.",failure:"Your voice catches. The choir carries the melody until you can finish, and you hear the story of the thirteenth bell.",successEffects:[{type:"menace",id:"dread",amount:-1},{type:"flag",id:"heard-thirteenth-bell",value:true}],failureEffects:[{type:"menace",id:"dread",amount:1},{type:"flag",id:"heard-thirteenth-bell",value:true}]},
      {id:"write-verses",label:"Copy the names into a private notebook",success:"You write until your hand aches. The last name is yours, though none of the singers remembers adding it.",successEffects:[{type:"item",id:"unfinished-page",amount:1},{type:"flag",id:"heard-thirteenth-bell",value:true}]}
    ]
  },
  "cinder-blue-door": {
    title:"The Blue Door Without a Number", kicker:"An optional investigation", once:true,
    requirements:[{type:"flag",id:"chapter-two:ticket",op:"==",value:true}],
    text:"The house named on the cancelled ticket is behind a blue door. Its number has been removed. Inside, children's heights are marked along the frame. The family is still here; only the city insists they are not.",
    choices:[
      {id:"leave-message",label:"Leave a note promising not to expose the family",success:"A small hand reaches through the letterbox and takes your note. From inside, a voice says, 'Thank you for remembering us.'",successEffects:[{type:"flag",id:"chapter-two:promised-safety",value:true},{type:"quality",id:"poise",amount:1}]},
      {id:"trace-signature",label:"Examine the removal order for a signature",success:"Under the seal is the Registry's requisition number. The handwritten instruction reads: 'Protect the household until the thirteenth bell.'",successEffects:[{type:"flag",id:"chapter-two:protection-order",value:true},{type:"item",id:"ink-of-absence",amount:1}]}
    ]
  },
  "registry-counter": {
    title:"The Counter for Missing Hours", kicker:"At the Ministry",
    text:"The Registry has three windows: Arrivals, Departures, and Corrections. Behind the third sits a clerk whose wristwatch runs backwards. She asks if you intend to restore a name, or to erase one. Neither answer seems satisfactory to her.",
    choices:[
      {id:"ask-price",label:"Ask the price of correcting a record",success:"'Memory,' she says. 'Somebody must remember what the book forgets.' She shows you where to present evidence about your own name.",successEffects:[{type:"flag",id:"registry:heard-price",value:true}]},
      {id:"return-rails",label:"Return to Ashrail Station",success:"The station whistle is the most reassuringly ordinary thing you have heard all day.",successEffects:[{type:"location",id:"ashrail-station"},{type:"unlock-location",id:"ashrail-station"}]},
      {id:"visit-neighbours",label:"Visit the families of Cinder Ward",success:"You leave the Registry's queue and join the neighbours keeping vigil outside its gates.",successEffects:[{type:"location",id:"cinder-ward"},{type:"unlock-location",id:"cinder-ward"}]}
    ]
  },
  "registry-thirteenth-correction": {
    title:"The Thirteenth Correction", kicker:"The Missing Name · Chapter Two", once:true,
    requirements:[{type:"flag",id:"far-crack-answered",op:"==",value:true},{type:"flag",id:"chapter-two:ticket",op:"==",value:true}],
    text:"The Observatory's charts show impossible light pressing through the cavern roof. The train ticket dates that light to a thirteenth bell from this Registry. The clerk admits the truth: something outside the stone sky follows names recorded here. She removed several families from the public ledger to protect them. She altered your own entry because you witnessed the erasure.",
    choices:[
      {id:"copy-ledger",label:"Copy the correction order (Insight)",challenge:{quality:"insight",difficulty:6},success:"You preserve the order, the rail ticket and your amended record. The clerk signs a copy, knowing her superiors will see it.",failure:"An ink trap blots the original, but you rescue its seal and a damaged duplicate. Your evidence is incomplete, but it proves an official choice was made.",successEffects:[{type:"flag",id:"chapter-two:evidence",value:true},{type:"item",id:"unfinished-page",amount:1},{type:"menace",id:"suspicion",amount:1}],failureEffects:[{type:"flag",id:"chapter-two:evidence",value:true},{type:"menace",id:"dread",amount:1}]},
      {id:"hear-clerk",label:"Ask whom the clerk was trying to protect",success:"She tells you she first erased her own child's name when the roof whispered it aloud. The other families came next. You now have a sworn confession, not merely a suspicion.",successEffects:[{type:"flag",id:"chapter-two:evidence",value:true},{type:"flag",id:"chapter-two:heard-clerk",value:true},{type:"quality",id:"poise",amount:1}]}
    ]
  },
  "registry-last-decision": {
    title:"What Shall the City Remember?", kicker:"Chapter Two finale · a lasting decision", once:true,
    requirements:[{type:"flag",id:"chapter-two:evidence",op:"==",value:true}],
    text:"The clerk offers a choice she cannot make for you. Restore the erased names and expose the Registry's wrongdoing, even if the thing above finds those families. Or shelter them outside the public record, leaving people unrecognised by the very city in which they live. You cannot have both safety and recognition on these terms.",
    choices:[
      {id:"restore-names",label:"Restore the names to the public ledger",success:"You publish the names, including your own. Families weep to see themselves recognised. Above the city, the far crack brightens. Truth has escaped the Registry, but the people it reveals may be in danger.",successEffects:[{type:"flag",id:"chapter-two:complete",value:true},{type:"flag",id:"chapter-two:truth-published",value:true},{type:"quality",id:"nerve",amount:1},{type:"menace",id:"dread",amount:2}]},
      {id:"shelter-names",label:"Keep the names safe in a private ledger",success:"You seal a separate record and give a copy to the Cinder Ward choir. The families remain officially absent, but they are no longer entirely forgotten. Your own name stays unsettled. Above, the crack dims.",successEffects:[{type:"flag",id:"chapter-two:complete",value:true},{type:"flag",id:"chapter-two:names-sheltered",value:true},{type:"quality",id:"poise",amount:1},{type:"menace",id:"suspicion",amount:1}]}
    ]
  },
  "registry-afterword": {
    title:"The Clerk's Last Note", kicker:"A chapter epilogue", once:true,
    requirements:[{type:"flag",id:"chapter-two:complete",op:"==",value:true}],
    text:"A note lies on the empty counter. 'Your choice did not end the danger,' it says. 'It changed who must carry it. Return when you are ready to ask what the stone sky wants.' The sentence ends in a long scratch, as though the pen was taken away.",
    choices:[
      {id:"keep-note",label:"Keep the warning as evidence",success:"You fold the note into your satchel. You have an answer about who changed your name, even if the city still owes you an answer about the thing beyond it.",successEffects:[{type:"item",id:"bright-memory",amount:1},{type:"flag",id:"chapter-three:invitation",value:true}]},
      {id:"leave-note",label:"Leave the note for the next missing person",success:"You leave the warning where another petitioner might read it. You hope they find it before their own name disappears.",successEffects:[{type:"quality",id:"poise",amount:1},{type:"flag",id:"chapter-three:invitation",value:true}]}
    ]
  }
};
