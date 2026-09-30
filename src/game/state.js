export const SAVE_KEY = "neathbound.save.v1";

export function initialState() {
  return {
    version: 1,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    actions: "unlimited",
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: ["salted-map"],
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    acquaintances: [],
    flags: {},
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    lastDraw: "bell-under-water"
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
    const defaults = initialState();
    return {
      ...defaults,
      ...parsed,
      qualities: { ...defaults.qualities, ...parsed.qualities },
      menaces: { ...defaults.menaces, ...parsed.menaces },
      unlockedLocations: parsed.unlockedLocations ?? defaults.unlockedLocations,
      acquaintances: parsed.acquaintances ?? defaults.acquaintances
    };
  } catch {
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(state));
}
