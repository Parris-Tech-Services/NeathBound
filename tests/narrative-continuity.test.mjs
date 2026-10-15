import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { resolveChoice, storyAvailable } from "../src/game/engine.js";
import { locations } from "../src/game/content.js";

const success = () => 0.99;
function at(location) {
  const state = initialState();
  state.locationId = location;
  state.unlockedLocations = ["lantern-quay", "hollow-archive", "velvet-market"];
  state.items["brass-key"] = 1;
  return state;
}
test("the Lair's recorded opening and actual key reward agree", () => {
  const fresh = initialState();
  assert.equal(fresh.items["brass-key"], undefined);
  const opened = resolveChoice(fresh, "lair-escape", "pick", success);
  assert.equal(opened.state.items["brass-key"], 1);
  assert.match(opened.result, /brass key/i);
});
test("both bell investigation choices lead to a repeatably reachable archive", () => {
  for (const choice of ["descend", "listen"]) {
    const result = resolveChoice(at("lantern-quay"), "bell-under-water", choice, success);
    assert.equal(result.state.locationId, "hollow-archive");
    assert.ok(result.state.unlockedLocations.includes("hollow-archive"));
  }
});
test("previously unknown destinations become unlocked when visited through a story", () => {
  const state = at("lantern-quay");
  state.unlockedLocations = ["lantern-quay"];
  const result = resolveChoice(state, "cartographer-at-dusk", "trade", success);
  assert.equal(result.state.locationId, "velvet-market");
  assert.ok(result.state.unlockedLocations.includes("velvet-market"));
  assert.equal(result.state.items["salted-map"], 1);
  assert.equal(result.state.flags["cartographer:gave-name"], true);
  assert.equal(storyAvailable(result.state, "a-name-sold"), true);
});
test("a withheld name avoids the broker while preserving an onward route", () => {
  const result = resolveChoice(at("lantern-quay"), "cartographer-at-dusk", "decline", success);
  assert.equal(result.state.locationId, "velvet-market");
  assert.equal(result.state.flags["cartographer:kept-name"], true);
  assert.equal(storyAvailable(result.state, "a-name-sold"), false);
});
test("missing index page remains obtainable after choosing other archive branches", () => {
  const state = at("hollow-archive");
  state.flags["story-complete:index-of-lost-things"] = true;
  assert.equal(storyAvailable(state, "archive-paper-trail"), true);
  const found = resolveChoice(state, "archive-paper-trail", "request-page", success);
  assert.equal(found.state.items["unfinished-page"], 1);
  assert.equal(storyAvailable(found.state, "finish-the-page"), true);
  const solved = resolveChoice(found.state, "finish-the-page", "write-ending", success);
  assert.equal(solved.state.flags["read-own-entry"], true);
  assert.equal(storyAvailable(solved.state, "the-margin-note"), true);
});
test("all main quest storylets are placed in their intended districts", () => {
  assert.ok(locations["hollow-archive"].stories.includes("archive-paper-trail"));
  assert.ok(locations["velvet-market"].stories.includes("a-name-sold"));
});
