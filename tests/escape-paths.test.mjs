import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { availableChoices, resolveChoice } from "../src/game/engine.js";

test("the opening offers all four abilities and each path reaches the quay", () => {
  const s = initialState();
  const choices = availableChoices(s, "lair-escape");
  assert.deepEqual(new Set(choices.map(c => c.challenge.quality)), new Set(["nerve","insight","poise","shadow"]));
  for (const choice of choices) {
    const outcome = resolveChoice(s, "lair-escape", choice.id, () => 0);
    assert.equal(outcome.state.locationId, "lantern-quay", choice.id);
    assert.ok(outcome.state.items["brass-key"] >= 1);
    assert.ok(outcome.state.unlockedLocations.includes("lantern-quay"));
  }
});

test("the escape method can change starting equipment", () => {
  const s = initialState();
  assert.equal(resolveChoice(s,"lair-escape","bargain",()=>0).state.items["silk-gloves"],1);
  assert.equal(resolveChoice(s,"lair-escape","slip",()=>0).state.items["velvet-cloak"],1);
});
