export const SAVE_KEY = "neathbound.save.v3";
export const LEGACY_SAVE_KEYS = ["neathbound.save.v2", "neathbound.save.v1"];
const MENACE_IDS = ["dread", "scandal", "wounds", "suspicion"];

export function initialState() {
  return {
    version: 3,
    revision: 0,
    name: "The Unmoored",
    locationId: "the-lair",
    echoes: 12,
    momentum: 0,
    progress: {},
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: {},
    unlockedLocations: ["the-lair"],
    acquaintances: [],
    flags: { __revision: 0 },
    globalFlags: {},
    hand: [],
    discard: [],
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    events: [],
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
  const qualities = { ...base.qualities, ...(input.qualities ?? {}) };
  const menaces = { ...base.menaces, ...(input.menaces ?? {}) };

  // Older saves accidentally stored menaces as qualities. Reconcile by taking
  // the larger value so a duplicated historical value is never double-counted.
  for (const id of MENACE_IDS) {
    if (qualities[id] !== undefined) {
      menaces[id] = Math.max(Number(menaces[id] ?? 0), Number(qualities[id] ?? 0));
      delete qualities[id];
    }
  }

  return {
    ...base,
    ...input,
    version: 3,
    revision: Number.isInteger(input.revision) ? input.revision : Number(input.flags?.__revision ?? 0),
    qualities,
    menaces,
    momentum: Number.isFinite(input.momentum) ? input.momentum : base.momentum,
    progress: { ...(input.progress ?? {}) },
    globalFlags: { ...(input.globalFlags ?? {}) },
    items: { ...legacyItems },
    unlockedLocations: [...new Set(input.unlockedLocations ?? base.unlockedLocations)],
    acquaintances: [...new Set(input.acquaintances ?? base.acquaintances)],
    flags: { ...(input.flags ?? {}), __revision: Number.isInteger(input.revision) ? input.revision : Number(input.flags?.__revision ?? 0) },
    journal: Array.isArray(input.journal) ? input.journal.slice(0, 100) : base.journal,
    events: Array.isArray(input.events) ? input.events.slice(0, 250) : [],
    hand: Array.isArray(input.hand) ? [...new Set(input.hand)] : [],
    discard: Array.isArray(input.discard) ? [...new Set(input.discard)] : []
  };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY)
      ?? LEGACY_SAVE_KEYS.map((key) => storage?.getItem(key)).find(Boolean);
    if (!raw) return initialState();
    const state = normaliseState(JSON.parse(raw));
    storage?.setItem(SAVE_KEY, JSON.stringify(state));
    return state;
  } catch {
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(normaliseState(state)));
}
