export const SAVE_KEY = "neathbound.save.v1";

export function initialState() {
  return {
    version: 1,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    qualities: { nerve: 2, insight: 2, poise: 1 },
    items: ["salted-map"],
    flags: {},
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."]
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    return { ...initialState(), ...parsed, qualities: { ...initialState().qualities, ...parsed.qualities } };
  } catch {
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(state));
}
