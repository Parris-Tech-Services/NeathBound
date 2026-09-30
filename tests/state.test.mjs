import test from "node:test";
import assert from "node:assert/strict";
import { LEGACY_SAVE_KEYS, SAVE_KEY, initialState, loadState, normaliseState, saveState } from "../src/game/state.js";

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    data
  };
}

test("legacy array inventories migrate to quantity maps", () => {
  const storage = memoryStorage({
    [LEGACY_SAVE_KEYS.at(-1)]: JSON.stringify({ ...initialState(), version: 1, items: ["salted-map", "black-sand"] })
  });
  const state = loadState(storage);
  assert.equal(state.version, 3);
  assert.equal(state.items["salted-map"], 1);
  assert.equal(state.items["black-sand"], 1);
  assert.ok(storage.getItem(SAVE_KEY));
});

test("empty inventories remain empty after normalisation", () => {
  const state = normaliseState({ ...initialState(), items: {} });
  assert.deepEqual(state.items, {});
});

test("current state round-trips through storage", () => {
  const storage = memoryStorage();
  const state = initialState();
  state.items["black-sand"] = 3;
  saveState(state, storage);
  assert.equal(loadState(storage).items["black-sand"], 3);
});

test("menaces saved as qualities by older builds migrate into menaces", () => {
  const legacy = { ...initialState(), version: 2, qualities: { ...initialState().qualities, dread: 2 }, menaces: { dread: 1 } };
  const state = normaliseState(legacy);
  assert.equal(state.menaces.dread, 2);
  assert.equal(state.qualities.dread, undefined);
});
