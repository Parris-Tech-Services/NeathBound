import test from "node:test";
import assert from "node:assert/strict";
import {
  buyItem,
  discardOpportunity,
  drawOpportunity,
  effectiveChallenge,
  equipItem,
  recoverMenace,
  resolveChoice,
  sellItem,
  storyAvailable
} from "../src/game/engine.js";
import { stories } from "../src/game/content.js";
import { initialState } from "../src/game/state.js";

const SUCCEED = () => 0.99;
const FAIL = () => 0;

function at(locationId, extra = {}) {
  const state = initialState();
  return { ...state, locationId, ...extra };
}

test("actions remain unlimited", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", SUCCEED);
  assert.equal("actions" in result.state, false);
});

test("effectiveChallenge shares inherited challenge logic with the UI/API", () => {
  const catalogue = stories["catalogue-the-dark"];
  assert.deepEqual(effectiveChallenge(catalogue, catalogue.choices[0]), { quality: "insight", difficulty: 7 });
  assert.equal(effectiveChallenge(catalogue, catalogue.choices[1]), null);

  const appointment = stories["garden-appointment"];
  assert.deepEqual(effectiveChallenge(appointment, appointment.choices[0]), { quality: "poise", difficulty: 6 });
  assert.equal(effectiveChallenge(appointment, appointment.choices[1]), null);
});

test("failed Catalogue the Dark does not award success rewards", () => {
  const start = at("hollow-archive");
  const result = resolveChoice(start, "catalogue-the-dark", "catalogue", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.echoes, start.echoes);
  assert.equal(result.state.items["ink-of-absence"], undefined);
  assert.equal(result.state.menaces.dread, 1);
});

test("failed Garden Appointment does not award the seed or poise", () => {
  const start = at("clockwork-gardens", {
    items: { ...initialState().items, "tide-cup": 1 },
    unlockedLocations: [...initialState().unlockedLocations, "clockwork-gardens"]
  });
  const result = resolveChoice(start, "garden-appointment", "attend", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.items["sun-seed"], undefined);
  assert.equal(result.state.qualities.poise, start.qualities.poise);
  assert.equal(result.state.menaces.scandal, 1);
});

test("choice results include explicit state deltas for immediate result UI", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", SUCCEED);
  assert.equal(result.success, true);
  assert.ok(result.changes.some((change) => change.type === "echoes" && change.delta === 8));
  assert.ok(result.changes.some((change) => change.type === "items" && change.id === "black-sand" && change.delta === 1));
  assert.ok(result.changes.some((change) => change.type === "location" && change.after === "hollow-archive"));
});

test("one-shot dramatic storylets retire after a choice", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", SUCCEED);
  result.state.locationId = "lantern-quay";
  assert.equal(storyAvailable(result.state, "bell-under-water"), false);
});

test("Borrowed Face failure actually charges the player and raises Scandal", () => {
  const start = at("velvet-market");
  const result = resolveChoice(start, "borrowed-face", "wear", FAIL);
  assert.equal(result.state.echoes, 10);
  assert.equal(result.state.menaces.scandal, 1);
});

test("bazaar purchases, equipment modifiers and selling are real state changes", () => {
  let state = initialState();
  state.echoes = 50;
  let result = buyItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.echoes, 25);
  assert.equal(state.items["archive-lenses"], 1);

  result = equipItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.equipment.tool, "archive-lenses");

  const check = resolveChoice(state, "bell-under-water", "listen", () => 0.2);
  assert.equal(check.challenge.quality, "nerve");

  result = sellItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.items["archive-lenses"], undefined);
  assert.equal(state.equipment.tool, null);
  assert.equal(state.echoes, 37);
});

test("menace recovery costs Echoes and reduces the menace", () => {
  const state = initialState();
  state.menaces.dread = 4;
  const result = recoverMenace(state, "dread");
  assert.equal(result.state.echoes, 9);
  assert.equal(result.state.menaces.dread, 2);
});

test("opportunities live in a persisted hand and move to discard when played", () => {
  const state = initialState();
  assert.ok(state.hand.includes("tea-for-the-tide"));
  const result = resolveChoice(state, "tea-for-the-tide", "pour", SUCCEED);
  assert.equal(result.state.hand.includes("tea-for-the-tide"), false);
  assert.equal(result.state.discard.includes("tea-for-the-tide"), true);
});

test("draw and discard operate without timers", () => {
  const start = at("velvet-market", { hand: [], discard: [] });
  const drawn = drawOpportunity(start, () => 0);
  assert.equal(drawn.error, undefined);
  assert.equal(drawn.state.hand.length, 1);
  const id = drawn.state.hand[0];
  const discarded = discardOpportunity(drawn.state, id);
  assert.equal(discarded.state.hand.length, 0);
  assert.ok(discarded.state.discard.includes(id));
});
