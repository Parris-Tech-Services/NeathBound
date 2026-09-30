import test from "node:test";
import assert from "node:assert/strict";
import { applyEffects, effectiveQuality, requirementMet, requirementsMet, resolveChallenge } from "../src/game/rules.js";
import { initialState } from "../src/game/state.js";

test("requirements cover qualities, menaces, items, flags, echoes and location", () => {
  const state = initialState();
  state.flags.invited = true;
  state.menaces.dread = 2;

  assert.equal(requirementMet(state, { type: "quality", id: "insight", op: ">=", value: 2 }), true);
  assert.equal(requirementMet(state, { type: "menace", id: "dread", op: ">=", value: 2 }), true);
  assert.equal(requirementMet(state, { type: "item", id: "salted-map", op: ">=", value: 1 }), true);
  assert.equal(requirementMet(state, { type: "flag", id: "invited", op: "==", value: true }), true);
  assert.equal(requirementMet(state, { type: "echoes", op: ">", value: 10 }), true);
  assert.equal(requirementMet(state, { type: "location", op: "==", value: "lantern-quay" }), true);
});

test("requirements use AND semantics", () => {
  const state = initialState();
  assert.equal(requirementsMet(state, [
    { type: "quality", id: "nerve", op: ">=", value: 2 },
    { type: "quality", id: "poise", op: ">=", value: 2 }
  ]), false);
});

test("typed effects include menaces and unlocked locations", () => {
  const state = initialState();
  applyEffects(state, [
    { type: "quality", id: "insight", amount: 2 },
    { type: "menace", id: "dread", amount: 2 },
    { type: "echoes", amount: 5 },
    { type: "item", id: "brass-token", amount: 2 },
    { type: "unlock-location", id: "clockwork-gardens" }
  ]);

  assert.equal(state.qualities.insight, 4);
  assert.equal(state.menaces.dread, 2);
  assert.equal(state.echoes, 17);
  assert.equal(state.items["brass-token"], 2);
  assert.ok(state.unlockedLocations.includes("clockwork-gardens"));
});

test("equipment changes effective challenge qualities without changing base values", () => {
  const state = initialState();
  state.items["archive-lenses"] = 1;
  state.equipment.tool = "archive-lenses";
  const effective = effectiveQuality(state, "insight");
  assert.deepEqual(effective, { base: 2, bonus: 2, total: 4 });

  const result = resolveChallenge(state, { quality: "insight", difficulty: 7 }, () => 0.2);
  assert.equal(result.roll, 3);
  assert.equal(result.total, 7);
  assert.equal(result.success, true);
  assert.equal(state.qualities.insight, 2);
});
