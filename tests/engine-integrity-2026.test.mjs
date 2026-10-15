import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { items, stories } from "../src/game/content.js?v=20261015-07";
import { drawCard, equipItem, discard, resolveChoice } from "../src/game/engine.js";
import { LocalGameService } from "../src/services/local-game-service.js?v=20261015-07";
import { createGameService } from "../src/services/index.js";

function memory() {
  const store = new Map();
  return { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
}

test("verified Cloudflare boots online by default and local mode remains explicit", () => {
  assert.equal(createGameService({ search:"", storage:memory() }).mode, "online");
  assert.ok(createGameService({ search:"?api=local", storage:memory() }) instanceof LocalGameService);
});

test("draw and discard increment the same revision used by choice conflict checks", () => {
  const s = initialState();
  const r = drawCard(s, "whispers", () => 0);
  assert.ok(r.drawn);
  assert.equal(r.state.revision, s.revision + 1);
  assert.equal(r.state.flags.__revision, r.state.revision);
  const d = discard(r.state, r.drawn);
  assert.equal(d.state.revision, r.state.revision + 1);
});

test("invalid equipment cannot create items or stat bonuses", () => {
  const s = initialState();
  const id = Object.keys(items).find(key => items[key]?.slot);
  const slot = items[id].slot;
  const missing = equipItem(s, slot, id);
  assert.match(missing.error, /do not own/);
  assert.deepEqual(missing.state.equipment, {});
  assert.match(equipItem(s, "forged-slot", id).error, /Unknown/);
  s.items[id] = 1;
  const worn = equipItem(s, slot, id);
  assert.equal(worn.error, undefined);
  assert.equal(worn.state.equipment[slot], id);
  assert.equal(worn.state.revision, s.revision + 1);
});

test("non-die checks cannot spend momentum on a fictitious dice total", () => {
  const s = initialState();
  s.locationId = "lantern-quay";
  s.momentum = 2;
  // Mechanics must not turn null into zero for broad/narrow odds.
  const choice = stories["tea-for-the-tide"].choices.find(c => c.id === "drink");
  const original = choice.challenge;
  try {
    choice.challenge = { ...original, mode: "broad" };
    s.qualities[choice.challenge.quality] = 0; // Guaranteed failure tests momentum eligibility, not odds.
    const outcome = resolveChoice(s, "tea-for-the-tide", "drink", () => 0.99);
    assert.equal(outcome.success, false);
    assert.equal(outcome.state.momentum, 2);
  } finally {
    choice.challenge = original;
  }
});
