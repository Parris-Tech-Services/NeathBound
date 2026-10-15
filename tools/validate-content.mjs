import { locations, stories, cards, decks, items, equipmentSlots, ambitions, destinies } from "../src/game/content.js";

const effectTypes = new Set(["quality", "set-quality", "obols", "item", "flag", "location", "menace", "unlock-location", "momentum", "global-flag", "acquaintance", "set-time-flag", "quirk", "living-story", "progress", "ambition", "ambition-progress", "destiny", "equip-treasure"]);
const requirementTypes = new Set(["quality", "item", "flag", "obols", "location", "world-quality", "menace", "time-since-flag"]);
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

    for (const effect of [...(choice.successEffects ?? []), ...(choice.failureEffects ?? [])]) {
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
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(locations).length} locations and ${Object.keys(stories).length} storylets.`);
}
