import test from "node:test";
import assert from "node:assert/strict";
import { choiceAvailable, resolveChoice, storyAvailable } from "../src/game/engine.js";
import { initialState } from "../src/game/state.js";

test("actions never consume a finite action resource", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", () => 0.9);
  assert.equal(result.state.echoes, 12);
  assert.equal(result.state.qualities.insight, 3);
  assert.equal("actions" in result.state, false);
});

test("challenge success applies configured effects", () => {
  const state = initialState();
  const result = resolveChoice(state, "bell-under-water", "descend", () => 0.9);
  assert.equal(result.success, true);
  assert.equal(result.state.items["black-sand"], 1);
  assert.equal(result.state.locationId, "hollow-archive");
  assert.equal(result.state.echoes, 20);
});

test("challenge failure applies failure effects and still advances the story", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", () => 0);
  assert.equal(result.success, false);
  assert.equal(result.state.locationId, "hollow-archive");
  assert.equal(result.state.items["black-sand"], 1);
  assert.equal(result.state.echoes, 12);
  assert.match(result.state.journal[0], /failure/);
});

test("a choice from another location is rejected server-style", () => {
  const result = resolveChoice(initialState(), "borrowed-face", "wear", () => 0.9);
  assert.match(result.error, /not available/i);
  assert.equal(result.state.locationId, "lantern-quay");
});

test("story and choice availability are explicit predicates", () => {
  const state = initialState();
  assert.equal(storyAvailable(state, "bell-under-water"), true);
  assert.equal(storyAvailable(state, "borrowed-face"), false);
  assert.equal(choiceAvailable(state, "bell-under-water", "descend"), true);
});
