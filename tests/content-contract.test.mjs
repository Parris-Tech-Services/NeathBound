import test from "node:test";
import assert from "node:assert/strict";
import { locations, stories } from "../src/game/content.js";

const operators = new Set(["==", "!=", ">", ">=", "<", "<="]);
const requirementTypes = new Set(["quality", "item", "flag", "obols", "location", "world-quality"]);
const effectTypes = new Set(["quality", "set-quality", "obols", "item", "flag", "location", "unlock-location", "menace"]);

function asRequirements(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
}

test("every story is reachable from at least one location and all references resolve", () => {
  const referenced = new Set();
  for (const [locationId, location] of Object.entries(locations)) {
    assert.ok(location.name, `${locationId} needs a name`);
    assert.ok(Array.isArray(location.stories), `${locationId}.stories must be an array`);
    assert.equal(new Set(location.stories).size, location.stories.length, `${locationId} repeats a story id`);

    for (const storyId of location.stories) {
      assert.ok(stories[storyId], `${locationId} references missing story ${storyId}`);
      referenced.add(storyId);
    }
  }

  for (const storyId of Object.keys(stories)) {
    assert.ok(referenced.has(storyId), `orphan storylet is never reachable: ${storyId}`);
  }
});

test("story and choice ids are unique and narrative fields are complete", () => {
  for (const [storyId, story] of Object.entries(stories)) {
    assert.match(storyId, /^[a-z0-9][a-z0-9-]*$/);
    assert.ok(story.title?.trim(), `${storyId} missing title`);
    assert.ok(story.text?.trim(), `${storyId} missing text`);
    assert.ok(Array.isArray(story.choices) && story.choices.length > 0, `${storyId} needs choices`);

    const ids = story.choices.map((choice) => choice.id);
    assert.equal(new Set(ids).size, ids.length, `${storyId} repeats a choice id`);

    for (const choice of story.choices) {
      assert.match(choice.id, /^[a-z0-9][a-z0-9-]*$/, `${storyId} has invalid choice id`);
      assert.ok(choice.label?.trim(), `${storyId}/${choice.id} missing label`);
      assert.ok(choice.success?.trim(), `${storyId}/${choice.id} missing success text`);
    }
  }
});

test("challenge contracts are finite and name a real quality key", () => {
  for (const [storyId, story] of Object.entries(stories)) {
    for (const choice of story.choices) {
      if (!choice.challenge) continue;
      const quality = choice.challenge.quality ?? choice.challenge.stat;
      assert.equal(typeof quality, "string", `${storyId}/${choice.id} challenge needs quality`);
      assert.ok(quality.length > 0);
      assert.ok(Number.isFinite(choice.challenge.difficulty), `${storyId}/${choice.id} challenge difficulty must be finite`);
      assert.ok(choice.challenge.difficulty > 0, `${storyId}/${choice.id} challenge difficulty must be positive`);
    }
  }
});

test("requirements and effects use supported declarative contracts", () => {
  for (const [storyId, story] of Object.entries(stories)) {
    const owners = [
      [`story ${storyId}`, asRequirements(story.requirements)],
      ...story.choices.map((choice) => [`choice ${storyId}/${choice.id}`, asRequirements(choice.requirements)])
    ];

    for (const [owner, requirements] of owners) {
      for (const requirement of requirements) {
        assert.ok(requirementTypes.has(requirement.type), `${owner} has unsupported requirement ${requirement.type}`);
        assert.ok(operators.has(requirement.op ?? "=="), `${owner} has unsupported operator ${requirement.op}`);
        if (!["obols", "location"].includes(requirement.type)) {
          assert.ok(requirement.id, `${owner} requirement is missing id`);
        }
        if (requirement.type === "location") {
          assert.ok(locations[requirement.value], `${owner} references missing location ${requirement.value}`);
        }
      }
    }

    for (const choice of story.choices) {
      for (const effect of [...(choice.successEffects ?? []), ...(choice.failureEffects ?? [])]) {
        assert.ok(effectTypes.has(effect.type), `${storyId}/${choice.id} has unsupported effect ${effect.type}`);
        if (["quality", "item", "menace"].includes(effect.type)) {
          assert.ok(Number.isFinite(Number(effect.amount)), `${storyId}/${choice.id} effect amount must be numeric`);
        }
        if (["location", "unlock-location"].includes(effect.type)) {
          assert.ok(locations[effect.id], `${storyId}/${choice.id} targets missing location ${effect.id}`);
        }
      }
    }
  }
});
