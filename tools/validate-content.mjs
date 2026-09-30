import { locations, stories } from "../src/game/content.js";

const effectTypes = new Set(["quality", "set-quality", "echoes", "item", "flag", "location"]);
const requirementTypes = new Set(["quality", "item", "flag", "echoes", "location"]);
const errors = [];

for (const [locationId, location] of Object.entries(locations)) {
  for (const storyId of location.stories) {
    if (!stories[storyId]) errors.push(`Location ${locationId} references missing story ${storyId}`);
  }
}

for (const [storyId, story] of Object.entries(stories)) {
  if (!story.title || !story.text || !Array.isArray(story.choices) || story.choices.length === 0) {
    errors.push(`Story ${storyId} is missing required narrative fields`);
  }

  for (const requirement of story.requirements ?? []) {
    if (!requirementTypes.has(requirement.type)) errors.push(`Story ${storyId} has unknown requirement type ${requirement.type}`);
  }

  const choiceIds = new Set();
  for (const choice of story.choices ?? []) {
    if (choiceIds.has(choice.id)) errors.push(`Story ${storyId} repeats choice id ${choice.id}`);
    choiceIds.add(choice.id);

    for (const requirement of choice.requirements ?? []) {
      if (!requirementTypes.has(requirement.type)) errors.push(`Choice ${storyId}/${choice.id} has unknown requirement type ${requirement.type}`);
    }

    for (const effect of [...(choice.successEffects ?? []), ...(choice.failureEffects ?? [])]) {
      if (!effectTypes.has(effect.type)) errors.push(`Choice ${storyId}/${choice.id} has unknown effect type ${effect.type}`);
      if (effect.type === "location" && !locations[effect.id]) {
        errors.push(`Choice ${storyId}/${choice.id} targets missing location ${effect.id}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${Object.keys(locations).length} locations and ${Object.keys(stories).length} storylets.`);
}
