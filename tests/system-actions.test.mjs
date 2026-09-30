import test from "node:test";
import assert from "node:assert/strict";
import { initialState, normaliseState } from "../src/game/state.js";
import { resolveGameAction } from "../src/game/engine.js";
import { resolveChallenge } from "../src/game/rules.js";
import { OPPORTUNITY_CARDS } from "../src/game/opportunities.js";

const SUCCEED = () => 0.99;

test("Bazaar purchases cost Echoes and persist as inventory", () => {
  const state = initialState();
  state.echoes = 30;
  const result = resolveGameAction(state, "buy", { itemId: "dock-coat" });
  assert.equal(result.error, undefined);
  assert.equal(result.state.echoes, 12);
  assert.equal(result.state.items["dock-coat"], 1);
  assert.equal(result.state.revision, 1);
});

test("equipment modifiers change actual challenge totals", () => {
  let state = initialState();
  state.items["dock-coat"] = 1;
  state = resolveGameAction(state, "equip", { itemId: "dock-coat" }).state;
  const check = resolveChallenge(state, { quality: "nerve", difficulty: 6 }, () => 0.2); // roll 3
  assert.equal(check.quality, 3, "base Nerve 2 + coat 1");
  assert.equal(check.total, 6);
  assert.equal(check.success, true);
});

test("saved outfits restore equipped slots", () => {
  let state = initialState();
  state.items["dock-coat"] = 1;
  state.items["velvet-gloves"] = 1;
  state = resolveGameAction(state, "equip", { itemId: "dock-coat" }).state;
  state = resolveGameAction(state, "equip", { itemId: "velvet-gloves" }).state;
  state = resolveGameAction(state, "save-outfit", { outfitId: "working-outfit" }).state;
  state = resolveGameAction(state, "unequip", { slot: "attire" }).state;
  state = resolveGameAction(state, "unequip", { slot: "accessory" }).state;
  state = resolveGameAction(state, "apply-outfit", { outfitId: "working-outfit" }).state;
  assert.equal(state.equipped.attire, "dock-coat");
  assert.equal(state.equipped.accessory, "velvet-gloves");
});

test("consumables and direct recovery reduce menaces", () => {
  let state = initialState();
  state.menaces.dread = 4;
  state.items["bottled-calm"] = 1;
  state = resolveGameAction(state, "use", { itemId: "bottled-calm" }).state;
  assert.equal(state.menaces.dread, 2);
  assert.equal(state.items["bottled-calm"], undefined);

  state.echoes = 12;
  state = resolveGameAction(state, "recover", { menaceId: "dread" }).state;
  assert.equal(state.menaces.dread, 1);
  assert.ok(state.echoes < 12);
});

test("opportunity cards draw into a persistent hand, play and discard", () => {
  let state = initialState();
  const drawn = resolveGameAction(state, "draw-card", {}, () => 0);
  state = drawn.state;
  assert.equal(state.hand.length, 1);
  const cardId = state.hand[0];

  const choiceId = OPPORTUNITY_CARDS[cardId].choices[0].id;
  const played = resolveGameAction(state, "play-card", { cardId, choiceId }, SUCCEED);
  assert.equal(played.error, undefined);
  assert.equal(played.state.hand.includes(cardId), false);
  assert.equal(played.state.discard.includes(cardId), true);
});

test("state v4 round-trips new systems through shadow flags for online persistence", () => {
  let state = initialState();
  state.items["smoked-lenses"] = 1;
  state = resolveGameAction(state, "equip", { itemId: "smoked-lenses" }).state;
  state = resolveGameAction(state, "draw-card", {}, () => 0).state;
  state.momentum = 3;

  // Simulate the subset reconstructed by the Supabase repository: direct
  // system fields omitted, player_flags retained.
  const restored = normaliseState({
    qualities: state.qualities,
    menaces: state.menaces,
    items: state.items,
    echoes: state.echoes,
    flags: state.flags,
    locationId: state.locationId
  });
  assert.equal(restored.equipped.tool, "smoked-lenses");
  assert.equal(restored.hand.length, 1);
  assert.equal(restored.momentum, 3);
  assert.equal(restored.revision, state.revision);
});

test("cannot sell an equipped item", () => {
  let state = initialState();
  state.items["dock-coat"] = 1;
  state = resolveGameAction(state, "equip", { itemId: "dock-coat" }).state;
  const sale = resolveGameAction(state, "sell", { itemId: "dock-coat" });
  assert.match(sale.error, /Unequip/);
});
