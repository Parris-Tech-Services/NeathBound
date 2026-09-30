import test from "node:test";
import assert from "node:assert/strict";
import { choiceAvailable, resolveChoice, storyAvailable } from "../src/game/engine.js";
import { initialState as baseInitialState } from "../src/game/state.js";
function initialState() {
  const s = baseInitialState();
  s.locationId = "lantern-quay";
  s.unlockedLocations = ["lantern-quay", "velvet-market", "hollow-archive"];
  s.items = { "salted-map": 1, "brass-key": 1 };
  return s;
}

test("actions never consume a finite action resource", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", () => 0.9);
  assert.equal(result.state.obols, 12);
  assert.equal(result.state.qualities.insight, 3);
  assert.equal("actions" in result.state, false);
});

test("challenge success applies configured effects", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", () => 0.9);
  assert.equal(result.success, true);
  assert.equal(result.state.items["black-sand"], 1);
  assert.equal(result.state.locationId, "hollow-archive");
  assert.equal(result.state.obols, 20);
});

test("challenge failure applies failure effects and still advances the story", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", () => 0);
  assert.equal(result.success, false);
  assert.equal(result.state.locationId, "hollow-archive");
  assert.equal(result.state.items["black-sand"], 1);
  assert.equal(result.state.obols, 12);
  assert.match(result.state.journal[0], /failure/);
});

test("required-item storylets stay locked until discovered", () => {
  const locked = resolveChoice(initialState(), "garden-appointment", "attend", () => 0.9);
  assert.match(locked.error, /no longer available/i);
  const equipped = { ...initialState(), locationId: "clockwork-gardens", items: { ...initialState().items, "tide-cup": 1 }, unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive", "clockwork-gardens"] };
  const unlocked = resolveChoice(equipped, "garden-appointment", "attend", () => 0.9);
  assert.equal(unlocked.success, true);
  assert.equal(unlocked.state.items["sun-seed"], 1);
});

test("opportunity rewards can unlock a new region and raise a menace", () => {
  const state = { ...initialState(), locationId: "velvet-market" };
  const result = resolveChoice(state, "market-gossip", "trade-rumour", () => 0.9);
  assert.equal(result.state.locationId, "clockwork-gardens");
  assert.ok(result.state.unlockedLocations.includes("clockwork-gardens"));
  assert.equal(result.state.menaces.suspicion, 1);
});

test("a choice from another location is rejected server-style", () => {
  const result = resolveChoice(initialState(), "borrowed-face", "wear", () => 0.9);
  assert.match(result.error, /no longer available/i);
  assert.equal(result.state.locationId, "lantern-quay");
});

test("story and choice availability are explicit predicates", () => {
  const state = initialState();
  assert.equal(storyAvailable(state, "bell-under-water"), true);
  assert.equal(storyAvailable(state, "borrowed-face"), false);
  assert.equal(choiceAvailable(state, "bell-under-water", "descend"), true);
});

test("momentum turns a near-miss challenge into a success and is spent", () => {
  const state = initialState();
  state.momentum = 1;
  // die 1 + nerve 2 = 3 vs difficulty 5: a near miss that momentum (+3) rescues
  const result = resolveChoice(state, "bell-under-water", "descend", () => 0);
  assert.equal(result.success, true);
  assert.equal(result.usedMomentum, true);
  assert.equal(result.state.momentum, 0);
  assert.match(result.state.journal[0], /with momentum/);
  assert.ok(result.changes.some((change) => change.type === "momentum" && change.delta === -1));
});

test("without momentum the same near miss fails", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", () => 0);
  assert.equal(result.success, false);
  assert.equal(result.usedMomentum, false);
});
