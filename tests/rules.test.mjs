import test from "node:test";
import assert from "node:assert/strict";
import { applyEffects, requirementMet, requirementsMet, resolveChallenge } from "../src/game/rules.js";
import { initialState as baseInitialState, normaliseState } from "../src/game/state.js";
  function initialState() {
    const s = baseInitialState();
    s.locationId = "lantern-quay";
    s.unlockedLocations = ["lantern-quay", "velvet-market", "hollow-archive"];
    s.items = { "salted-map": 1, "brass-key": 1 };
    return s;
  }

test("quality, item, flag, obol and location requirements are evaluated", () => {
  const state = initialState();
  state.flags.invited = true;

  assert.equal(requirementMet(state, { type: "quality", id: "insight", op: ">=", value: 2 }), true);
  assert.equal(requirementMet(state, { type: "item", id: "salted-map", op: ">=", value: 1 }), true);
  assert.equal(requirementMet(state, { type: "flag", id: "invited", op: "==", value: true }), true);
  assert.equal(requirementMet(state, { type: "obols", op: ">", value: 10 }), true);
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
    { type: "obols", amount: 5 },
    { type: "item", id: "brass-token", amount: 2 },
    { type: "flag", id: "knows-bell", value: true },
    { type: "location", id: "hollow-archive" }
  ]);

  assert.equal(state.qualities.insight, 4);
  assert.equal(state.obols, 17);
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

test("menace effects adjust menaces and never go below zero", () => {
  const state = initialState();
  applyEffects(state, [{ type: "menace", id: "suspicion", amount: 2 }]);
  assert.equal(state.menaces.suspicion, 2);
  assert.equal(state.qualities.suspicion, undefined, "menaces are not qualities");
  applyEffects(state, [{ type: "menace", id: "suspicion", amount: -5 }]);
  assert.equal(state.menaces.suspicion, 0);
});

test("unlock-location effects add a travel destination once", () => {
  const state = initialState();
  applyEffects(state, [
    { type: "unlock-location", id: "clockwork-gardens" },
    { type: "unlock-location", id: "clockwork-gardens" }
  ]);
  assert.equal(state.unlockedLocations.filter((id) => id === "clockwork-gardens").length, 1);
  assert.equal(state.locationId, "lantern-quay", "unlocking does not move the player");
});
