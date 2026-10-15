import { locations, stories, cards, decks, items, equipmentSlots, ambitions, destinies } from "../src/game/content.js";

const effectTypes = new Set(["quality", "set-quality", "obols", "item", "flag", "location", "menace", "unlock-location", "momentum", "global-flag", "acquaintance", "set-time-flag", "quirk", "living-story", "progress", "ambition", "ambition-progress", "destiny", "equip-treasure"]);
const requirementTypes = new Set(["quirk", "quality", "item", "flag", "obols", "location", "world-quality", "menace", "time-since-flag"]);
const errors = [];
function requirements(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [
    ...(value.item ? [{ type: "item", id: value.item }] : []),
    ...(value.quality ? [{ type: "quality", id: value.quality[0] }] : [])
  ];
}

for (const [locationId, location] of Object.entries(locations)) {
  for (const storyId of location.stories) {
    if (!stories[storyId]) errors.push(`Location ${locationId} references missing story ${storyId}`);
  }
}

for (const [storyId, story] of Object.entries(stories)) {
  if (!story.title || !story.text || !Array.isArray(story.choices) || story.choices.length === 0) {
    errors.push(`Story ${storyId} is missing required narrative fields`);
  }

  for (const requirement of requirements(story.requirements)) {
    if (!requirementTypes.has(requirement.type)) errors.push(`Story ${storyId} has unknown requirement type ${requirement.type}`);
  }

  if(story.ambition_id&&!ambitions[story.ambition_id])errors.push("Unknown ambition in "+storyId);
  if(story.pattern&&!["chain","pyramid","decoupled"].includes(story.pattern))errors.push("Unknown pattern in "+storyId);
  const choiceIds = new Set();
  for (const choice of story.choices ?? []) {
    if (choiceIds.has(choice.id)) errors.push(`Story ${storyId} repeats choice id ${choice.id}`);
    choiceIds.add(choice.id);

    for (const requirement of requirements(choice.requirements)) {
      if (!requirementTypes.has(requirement.type)) errors.push(`Choice ${storyId}/${choice.id} has unknown requirement type ${requirement.type}`);
    }

    if (choice.next_storylet && !stories[choice.next_storylet]) errors.push(`Unknown next_storylet ${choice.next_storylet} in ${storyId}/${choice.id}`);
    for (const effect of [...(choice.successEffects ?? []), ...(choice.failureEffects ?? []), ...(choice.rareSuccessEffects ?? [])]) {
      if (!effectTypes.has(effect.type)) errors.push(`Choice ${storyId}/${choice.id} has unknown effect type ${effect.type}`);
      if ((effect.type==="item"||effect.type==="equip-treasure")&&!items[effect.id])errors.push(`Unknown item ${effect.id} in ${storyId}`);
      if (effect.type==="destiny"&&!destinies[effect.id])errors.push(`Unknown destiny ${effect.id} in ${storyId}`);
      if ((effect.type === "location" || effect.type === "unlock-location") && !locations[effect.id]) {
        errors.push(`Choice ${storyId}/${choice.id} targets missing location ${effect.id}`);
      }
    }
  }
}

for(const [deckId,deck] of Object.entries(decks))for(const id of deck.cardIds){
 if(!cards[id])errors.push(`Deck ${deckId} references missing card ${id}`);
}
for(const [cardId,card] of Object.entries(cards)){
 if(!card.title||!card.choices?.length)errors.push(`Invalid card ${cardId}`);
}
if(new Set(equipmentSlots).size!==20)errors.push("All 20 named equipment slots must be unique");

/** Strict checks for the standalone Gloomwing narrative pack. */
const gloomwing = Object.entries(stories).filter(([id]) => /^gloomwing_hunt_\\d{2}$/.test(id));
if (gloomwing.length !== 30) errors.push("Gloomwing must have exactly 30 authored chapters.");
for (let n=0;n<30;n++){
  const id="gloomwing_hunt_"+String(n).padStart(2,"0");
  const story=stories[id];
  if(!story){errors.push("Missing Gloomwing stage "+id);continue;}
  if(story.ambition_id!=="gloomwing-hunt"||Number(story.requires_progress?.value)!==n)
    errors.push(id+" has incorrect ambition gate");
  const locationIds=Object.entries(locations).filter(([,loc])=>loc.stories.includes(id)).map(([key])=>key);
  if(locationIds.length!==1)errors.push(id+" should appear in one location, found "+locationIds.length);
  if(story.choices.length!==3)errors.push(id+" should offer three distinct choices");
  for(const choice of story.choices){
    const success=choice.successEffects??[];
    if(!success.some(e=>e.type==="ambition-progress" && e.id==="gloomwing-hunt" && e.amount===1))
      errors.push(id+"/"+choice.id+" does not advance ambition exactly once on success");
    if(choice.rareSuccessEffects && !choice.rareSuccessEffects.some(e=>e.type==="ambition-progress"&&e.amount===1))
      errors.push(id+"/"+choice.id+" rare success cannot advance ambition");
    if(n===29){
      if(choice.challenge!==false) errors.push("Final reward should not be luck-gated");
      if(!choice.requirements?.some(r=>r.type==="flag"))errors.push("Final reward must require recorded disposition");
      if(!success.some(e=>e.type==="equip-treasure"))errors.push("Final reward missing treasure");
    }
  }
}
if(!ambitions["gloomwing-hunt"]||ambitions["gloomwing-hunt"].total!==30)
  errors.push("Gloomwing ambition definition must be 30 chapters.");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(locations).length} locations and ${Object.keys(stories).length} storylets.`);
}
