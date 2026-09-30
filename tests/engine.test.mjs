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

test("actions remain unlimited", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "listen", SUCCEED);
  assert.equal("actions" in result.state, false);
});

test("shared effectiveChallenge exposes inherited checks and deliberate no-check branches", () => {
  const catalogue = stories["catalogue-the-dark"];
  assert.deepEqual(effectiveChallenge(catalogue, catalogue.choices.find(c => c.id === "catalogue")), { quality: "insight", difficulty: 7 });
  assert.equal(effectiveChallenge(catalogue, catalogue.choices.find(c => c.id === "close-shelf")), null);

  const appointment = stories["garden-appointment"];
  assert.deepEqual(effectiveChallenge(appointment, appointment.choices.find(c => c.id === "attend")), { quality: "poise", difficulty: 6 });
  assert.equal(effectiveChallenge(appointment, appointment.choices.find(c => c.id === "apologise")), null);
});

test("failed Catalogue the Dark never awards success rewards", () => {
  const state = { ...initialState(), locationId: "hollow-archive" };
  const result = resolveChoice(state, "catalogue-the-dark", "catalogue", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.echoes, state.echoes);
  assert.equal(result.state.items["ink-of-absence"], undefined);
  assert.equal(result.state.menaces.dread, 1);
});

test("failed Garden Appointment never awards its seed or Poise", () => {
  const base = initialState();
  const state = {
    ...base,
    locationId: "clockwork-gardens",
    items: { ...base.items, "tide-cup": 1 },
    unlockedLocations: [...base.unlockedLocations, "clockwork-gardens"]
  };
  const result = resolveChoice(state, "garden-appointment", "attend", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.items["sun-seed"], undefined);
  assert.equal(result.state.qualities.poise, state.qualities.poise);
  assert.equal(result.state.menaces.scandal, 1);
});

test("Borrowed Face failure charges Echoes and raises Scandal as its prose promises", () => {
  const state = { ...initialState(), locationId: "velvet-market" };
  const result = resolveChoice(state, "borrowed-face", "wear", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.echoes, 10);
  assert.equal(result.state.menaces.scandal, 1);
});

test("the Bell is staged: listening does not erase the descent branch", () => {
  let state = initialState();
  let result = resolveChoice(state, "bell-under-water", "listen", SUCCEED);
  state = result.state;
  assert.equal(state.flags["bell-under-water:listen"], true);
  assert.equal(storyAvailable(state, "bell-under-water"), true);

  result = resolveChoice(state, "bell-under-water", "descend", SUCCEED);
  assert.equal(result.success, true);
  assert.equal(result.state.flags["bell-under-water:descend"], true);
});

test("choice results contain explicit deltas for the outcome screen", () => {
  const result = resolveChoice(initialState(), "bell-under-water", "descend", SUCCEED);
  assert.ok(result.changes.some(change => change.type === "echoes" && change.delta === 8));
  assert.ok(result.changes.some(change => change.type === "items" && change.id === "black-sand" && change.delta === 1));
  assert.ok(result.changes.some(change => change.type === "location" && change.after === "hollow-archive"));
});

test("momentum still rescues a near miss and is reported", () => {
  const state = initialState();
  state.momentum = 1;
  const result = resolveChoice(state, "bell-under-water", "descend", FAIL);
  assert.equal(result.success, true);
  assert.equal(result.usedMomentum, true);
  assert.equal(result.state.momentum, 0);
  assert.ok(result.changes.some(change => change.type === "momentum" && change.delta === -1));
});

test("bazaar purchase, equipment and sale are meaningful state changes", () => {
  let state = initialState();
  state.echoes = 50;

  let result = buyItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.echoes, 25);
  assert.equal(state.items["archive-lenses"], 1);

  result = equipItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.equipment.tool, "archive-lenses");

  result = sellItem(state, "archive-lenses");
  state = result.state;
  assert.equal(state.items["archive-lenses"], undefined);
  assert.equal(state.equipment.tool, null);
  assert.equal(state.echoes, 37);
});

test("menace recovery spends Echoes and lowers a menace", () => {
  const state = initialState();
  state.menaces.dread = 4;
  const result = recoverMenace(state, "dread");
  assert.equal(result.state.echoes, 9);
  assert.equal(result.state.menaces.dread, 2);
});

test("opportunity cards can be drawn, played and discarded without timers", () => {
  let state = { ...initialState(), locationId: "velvet-market", hand: [], discard: [] };
  const drawn = drawOpportunity(state, () => 0);
  assert.equal(drawn.error, undefined);
  state = drawn.state;
  assert.equal(state.hand.length, 1);

  const cardId = state.hand[0];
  const discarded = discardOpportunity(state, cardId);
  assert.equal(discarded.state.hand.length, 0);
  assert.ok(discarded.state.discard.includes(cardId));
});

test("playing an opportunity removes it from hand and puts it in discard", () => {
  const base = initialState();
  const state = { ...base, locationId: "lantern-quay", hand: ["tea-for-the-tide"], discard: [] };
  const result = resolveChoice(state, "tea-for-the-tide", "pour", SUCCEED);
  assert.equal(result.state.hand.includes("tea-for-the-tide"), false);
  assert.equal(result.state.discard.includes("tea-for-the-tide"), true);
  assert.ok(result.state.acquaintances.includes("dockworker"));
});
