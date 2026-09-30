import test from "node:test";
import assert from "node:assert/strict";
import { resolveChoice } from "../src/game/engine.js";
import { initialState } from "../src/game/state.js";

test("actions never consume a finite action resource", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", () => 0.9);
  assert.equal(result.state.echoes, 12);
  assert.equal(result.state.qualities.insight, 3);
});

test("challenge success grants the configured reward", () => {
  const state = initialState();
  const result = resolveChoice(state, "bell-under-water", "descend", () => 0.9);
  assert.equal(result.success, true);
  assert.ok(result.state.items.includes("black-sand"));
  assert.equal(result.state.locationId, "hollow-archive");
});

test("challenge failure still advances the story", () => {
  const result = resolveChoice(initialState(), "index-of-lost-things", "read", () => 0);
  assert.equal(result.success, false);
  assert.equal(result.state.locationId, "hollow-archive");
  assert.match(result.state.journal[0], /failure/);
});
