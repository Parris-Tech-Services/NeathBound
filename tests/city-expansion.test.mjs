import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { availableStories, resolveChoice } from "../src/game/engine.js";
import { locations, stories } from "../src/game/content.js";
import { getQuestGuide, CITY_ROUTES } from "../src/ui/narrative-guide.js";

test("the three new ordinary districts have real storylets and map routes", () => {
  for (const id of ["ashrail-station", "cinder-ward", "registry-of-hours"]) {
    assert.ok(locations[id], id);
    assert.ok(locations[id].stories.length >= 3, id);
    assert.ok(CITY_ROUTES.some((route) => route.id === id), id);
    for (const sid of locations[id].stories) assert.ok(stories[sid], sid);
  }
});

test("a new player can reach Ashrail, the Registry and Cinder Ward by stories", () => {
  let s = resolveChoice(initialState(), "lair-escape", "force", () => 0).state;
  assert.ok(availableStories(s).some(({ id }) => id === "quay-roads"));
  s = resolveChoice(s, "quay-roads", "take-north-line").state;
  assert.equal(s.locationId, "ashrail-station");
  assert.ok(s.unlockedLocations.includes("ashrail-station"));
  s = resolveChoice(s, "ashrail-cancelled-platform", "study-ticket", () => 0).state;
  assert.equal(s.flags["chapter-two:ticket"], true);
  assert.ok(s.unlockedLocations.includes("registry-of-hours"));
  s = resolveChoice(s, "ashrail-ticket-office", "find-passenger").state;
  assert.equal(s.locationId, "cinder-ward");
  assert.ok(s.unlockedLocations.includes("cinder-ward"));
});

test("chapter two offers a permanent moral decision with a follow-on", () => {
  let s = initialState();
  s.locationId = "registry-of-hours";
  s.unlockedLocations.push("registry-of-hours");
  s.flags["far-crack-answered"] = true;
  s.flags["chapter-two:ticket"] = true;
  assert.ok(availableStories(s).some(({id}) => id === "registry-thirteenth-correction"));
  s = resolveChoice(s, "registry-thirteenth-correction", "hear-clerk").state;
  assert.equal(s.flags["chapter-two:evidence"], true);
  assert.match(getQuestGuide(s).objective, /What Shall the City Remember/i);
  s = resolveChoice(s, "registry-last-decision", "shelter-names").state;
  assert.equal(s.flags["chapter-two:complete"], true);
  assert.equal(s.flags["chapter-two:names-sheltered"], true);
  assert.ok(!s.flags["chapter-two:truth-published"]);
  assert.ok(availableStories(s).some(({id}) => id === "registry-afterword"));
  s = resolveChoice(s, "registry-afterword", "keep-note").state;
  assert.match(getQuestGuide(s).chapter, /complete/);
});

test("exploration remains available independently of chapter progress", () => {
  let s = initialState();
  s.locationId = "cinder-ward";
  assert.ok(availableStories(s).some(({id}) => id === "cinder-choir"));
  assert.ok(availableStories(s).some(({id}) => id === "cinder-communal-stove"));
  assert.ok(!availableStories(s).some(({id}) => id === "cinder-blue-door"));
});
