import test from "node:test";
import assert from "node:assert/strict";
import { applyEffects, requirementMet, requirementsMet, resolveChallenge } from "../src/game/rules.js";
import { initialState } from "../src/game/state.js";

test("quality, item, flag, echo and location requirements are evaluated", () => {
  const state = initialState();
  state.flags.invited = true;

  assert.equal(requirementMet(state, { type: "quality", id: "insight", op: ">=", value: 2 }), true);
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

test("typed effects mutate only declared state", () => {
  const state = initialState();
  applyEffects(state, [
    { type: "quality", id: "insight", amount: 2 },
    { type: "echoes", amount: 5 },
    { type: "item", id: "brass-token", amount: 2 },
    { type: "flag", id: "knows-bell", value: true },
    { type: "location", id: "hollow-archive" }
  ]);

  assert.equal(state.qualities.insight, 4);
  assert.equal(state.echoes, 17);
  assert.equal(state.items["brass-token"], 2);
  assert.equal(state.flags["knows-bell"], true);
  assert.equal(state.locationId, "hollow-archive");
});

test("challenge resolution is deterministic when random is injected", () => {
  const state = initialState();
  const result = resolveChallenge(state, { quality: "nerve", difficulty: 5 }, () => 0.2);
  assert.equal(result.roll, 3);
  assert.equal(result.total, 5);
  assert.equal(result.success, true);
});
