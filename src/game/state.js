export const SAVE_KEY = "neathbound.save.v2";
export const LEGACY_SAVE_KEY = "neathbound.save.v1";

export function initialState() {
  return {
    version: 2,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    qualities: { nerve: 2, insight: 2, poise: 1 },
    items: { "salted-map": 1 },
    flags: {},
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."]
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function normaliseState(input = {}) {
  const base = initialState();
  const legacyItems = Array.isArray(input.items)
    ? Object.fromEntries(input.items.map((item) => [item, 1]))
    : (input.items ?? {});

  return {
    ...base,
    ...input,
    version: 2,
    qualities: { ...base.qualities, ...(input.qualities ?? {}) },
    items: { ...legacyItems },
    flags: { ...(input.flags ?? {}) },
    journal: Array.isArray(input.journal) ? input.journal.slice(0, 30) : base.journal
  };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY) ?? storage?.getItem(LEGACY_SAVE_KEY);
    if (!raw) return initialState();
    const state = normaliseState(JSON.parse(raw));
    if (storage && !storage.getItem(SAVE_KEY)) {
      storage.setItem(SAVE_KEY, JSON.stringify(state));
    }
    return state;
  } catch {
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(normaliseState(state)));
}
