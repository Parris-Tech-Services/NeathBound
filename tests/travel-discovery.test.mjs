import test from "node:test";
import assert from "node:assert/strict";
import { initialState, normaliseState } from "../src/game/state.js";
import { resolveChoice } from "../src/game/engine.js";

test("story-led travel records a way back from the archive", () => {
  let s = resolveChoice(initialState(), "lair-escape", "force", () => 0).state;
  s = resolveChoice(s, "bell-under-water", "descend", () => 0).state;
  assert.equal(s.locationId, "hollow-archive");
  assert.ok(s.unlockedLocations.includes("hollow-archive"));
});

test("legacy saves recover visited districts but not menace wards", () => {
  const s = normaliseState({
    ...initialState(), locationId: "hollow-archive",
    unlockedLocations: ["the-lair", "lantern-quay"],
    flags: { "story-complete:cartographer-at-dusk": true },
    events: [{ changes: [
      { type: "location", after: "clockwork-gardens" },
      { type: "location", after: "the-pale-rooms" }
    ] }]
  });
  for (const id of ["hollow-archive", "velvet-market", "clockwork-gardens"]) {
    assert.ok(s.unlockedLocations.includes(id), id);
  }
  assert.ok(!s.unlockedLocations.includes("the-pale-rooms"));
});


test("Travel map includes the Gloomwing districts for return visits", async () => {
  const { CITY_ROUTES } = await import("../src/ui/narrative-guide.js");
  for (const id of ["duskwater", "black-spire", "bureau-hall"]) assert.ok(CITY_ROUTES.some(route=>route.id===id), id);
});
