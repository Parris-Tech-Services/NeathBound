export const SAVE_KEY = "neathbound.save.v2";
export const LEGACY_SAVE_KEY = "neathbound.save.v1";

export function initialState() {
  return {
    version: 2,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    momentum: 0,
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: { "salted-map": 1 },
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    acquaintances: [],
    flags: {},
    globalFlags: {},
    hand: [],
    discard: [],
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    lastDraw: "bell-under-water"
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
    momentum: input.momentum ?? base.momentum,
    items: { ...legacyItems },
    menaces: { ...base.menaces, ...(input.menaces ?? {}) },
    unlockedLocations: input.unlockedLocations ?? base.unlockedLocations,
    acquaintances: input.acquaintances ?? base.acquaintances,
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
