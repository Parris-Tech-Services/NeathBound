export const SAVE_KEY = "neathbound.save.v3";
export const LEGACY_SAVE_KEY = "neathbound.save.v1";
export const LEGACY_SAVE_KEYS = ["neathbound.save.v2", LEGACY_SAVE_KEY];
const MENACE_IDS = ["dread", "scandal", "wounds", "suspicion"];

export function initialState() {
  const equipment = { coat: null, tool: null, charm: null };
  return {
    version: 3,
    revision: 0,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    momentum: 0,
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: { "salted-map": 1, "brass-key": 1 },
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    acquaintances: [],
    equipment,
    flags: {
      "__revision": 0,
      "__momentum": 0,
      "__globalFlags": {},
      "__equipment": equipment,
      "__events": [],
      "__hand": [],
      "__discard": []
    },
    globalFlags: {},
    hand: [],
    discard: [],
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    events: [],
    lastDraw: null
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

export function normaliseState(input = {}) {
  const base = initialState();
  const legacyItems = Array.isArray(input.items)
    ? Object.fromEntries(input.items.map((item) => [item, 1]))
    : { ...(input.items ?? {}) };
  const qualities = { ...base.qualities, ...(input.qualities ?? {}) };
  const menaces = { ...base.menaces, ...(input.menaces ?? {}) };

  for (const id of MENACE_IDS) {
    if (qualities[id] !== undefined) {
      menaces[id] = Math.max(Number(menaces[id] ?? 0), Number(qualities[id] ?? 0));
      delete qualities[id];
    }
  }

  const flags = { ...(input.flags ?? {}) };
  const revision = Number.isInteger(input.revision) ? input.revision : Number(flags.__revision ?? 0);
  const momentum = Number.isFinite(input.momentum) ? input.momentum : Number(flags.__momentum ?? base.momentum);
  const globalFlags = { ...(flags.__globalFlags ?? {}), ...(input.globalFlags ?? {}) };
  const equipment = { ...base.equipment, ...(flags.__equipment ?? {}), ...(input.equipment ?? {}) };
  const events = Array.isArray(input.events) ? input.events.slice(0, 250) : (Array.isArray(flags.__events) ? flags.__events.slice(0, 250) : []);
  const hand = Array.isArray(input.hand) ? [...new Set(input.hand)] : (Array.isArray(flags.__hand) ? [...new Set(flags.__hand)] : []);
  const discard = Array.isArray(input.discard) ? [...new Set(input.discard)] : (Array.isArray(flags.__discard) ? [...new Set(flags.__discard)] : []);

  return {
    ...base,
    ...input,
    version: 3,
    revision,
    qualities,
    menaces,
    momentum,
    globalFlags,
    items: legacyItems,
    unlockedLocations: [...new Set(input.unlockedLocations ?? base.unlockedLocations)],
    acquaintances: [...new Set(input.acquaintances ?? base.acquaintances)],
    equipment,
    flags: {
      ...flags,
      "__revision": revision,
      "__momentum": momentum,
      "__globalFlags": globalFlags,
      "__equipment": equipment,
      "__events": events,
      "__hand": hand,
      "__discard": discard
    },
    journal: Array.isArray(input.journal) ? input.journal.slice(0, 100) : base.journal,
    events,
    hand,
    discard,
    lastDraw: input.lastDraw ?? null
  };
}

export function syncDerivedState(state) {
  state.flags ??= {};
  state.flags.__revision = Number(state.revision ?? 0);
  state.flags.__momentum = Number(state.momentum ?? 0);
  state.flags.__globalFlags = { ...(state.globalFlags ?? {}) };
  state.flags.__equipment = { ...(state.equipment ?? {}) };
  state.flags.__events = [...(state.events ?? [])];
  state.flags.__hand = [...(state.hand ?? [])];
  state.flags.__discard = [...(state.discard ?? [])];
  return state;
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY)
      ?? LEGACY_SAVE_KEYS.map((key) => storage?.getItem(key)).find(Boolean);
    if (!raw) return initialState();
    const state = normaliseState(JSON.parse(raw));
    storage?.setItem(SAVE_KEY, JSON.stringify(syncDerivedState(state)));
    return state;
  } catch {
    return initialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(normaliseState(syncDerivedState(state))));
}
