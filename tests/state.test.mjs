import test from "node:test";
import assert from "node:assert/strict";
import { LEGACY_SAVE_KEY, SAVE_KEY, initialState, loadState, normaliseState, saveState } from "../src/game/state.js";

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    removeItem(key) { data.delete(key); },
    data
  };
}

test("legacy inventories migrate into v3 saves", () => {
  const storage = memoryStorage({
    [LEGACY_SAVE_KEY]: JSON.stringify({ version: 1, items: ["salted-map", "black-sand"] })
  });
  const state = loadState(storage);
  assert.equal(state.version, 3);
  assert.equal(state.items["salted-map"], 1);
  assert.equal(state.items["black-sand"], 1);
  assert.ok(storage.getItem(SAVE_KEY));
});

test("legacy Dread quality migrates to the menace system without double-counting", () => {
  const state = normaliseState({
    ...initialState(),
    qualities: { ...initialState().qualities, dread: 3 },
    menaces: { ...initialState().menaces, dread: 2 }
  });
  assert.equal(state.qualities.dread, undefined);
  assert.equal(state.menaces.dread, 3);
});

test("revision equipment events and opportunity hand survive persistence", () => {
  const storage = memoryStorage();
  const state = initialState();
  state.revision = 7;
  state.equipment.tool = "salted-map";
  state.events = [{ id: "e1", title: "Test" }];
  state.hand = ["tea-for-the-tide"];
  state.discard = ["market-gossip"];
  state.flags["__revision"] = state.revision;
  state.flags["__equipment"] = state.equipment;
  state.flags["__events"] = state.events;
  state.flags["__hand"] = state.hand;
  state.flags["__discard"] = state.discard;

  saveState(state, storage);
  const loaded = loadState(storage);
  assert.equal(loaded.revision, 7);
  assert.equal(loaded.equipment.tool, "salted-map");
  assert.equal(loaded.events[0].id, "e1");
  assert.deepEqual(loaded.hand, ["tea-for-the-tide"]);
  assert.deepEqual(loaded.discard, ["market-gossip"]);
});

test("new characters really possess the brass key mentioned in the opening", () => {
  assert.equal(initialState().items["brass-key"], 1);
});
