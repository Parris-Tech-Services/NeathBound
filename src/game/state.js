export const SAVE_KEY = "neathbound.save.v4";
export const LEGACY_SAVE_KEYS = ["neathbound.save.v3", "neathbound.save.v2", "neathbound.save.v1"];
const MENACE_IDS = ["dread", "scandal", "wounds", "suspicion"];

const DEFAULT_OUTFITS = {
  "morning-outfit": {},
  "working-outfit": {},
  "dangerous-outfit": {}
};

export function initialState() {
  const state = {
    version: 4,
    revision: 0,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    momentum: 0,
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: { "salted-map": 1, "brass-key": 1 },
    equipped: {},
    savedOutfits: structuredClone(DEFAULT_OUTFITS),
    activeOutfit: "morning-outfit",
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    acquaintances: [],
    flags: {},
    globalFlags: {},
    hand: [],
    discard: [],
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    events: [],
    lastDraw: null
  };
  syncPersistentFlags(state);
  return state;
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
  const sourceFlags = { ...(input.flags ?? {}) };

  for (const id of MENACE_IDS) {
    if (qualities[id] !== undefined) {
      menaces[id] = Math.max(Number(menaces[id] ?? 0), Number(qualities[id] ?? 0));
      delete qualities[id];
    }
  }

  const revision = Number.isInteger(input.revision)
    ? input.revision
    : Number(sourceFlags.__revision ?? 0);
  const momentum = Number.isFinite(input.momentum)
    ? Number(input.momentum)
    : Number(sourceFlags.__momentum ?? base.momentum);
  const equipped = objectValue(input.equipped ?? sourceFlags.__equipped, {});
  const savedOutfits = {
    ...structuredClone(DEFAULT_OUTFITS),
    ...objectValue(input.savedOutfits ?? sourceFlags.__savedOutfits, {})
  };
  const activeOutfit = typeof (input.activeOutfit ?? sourceFlags.__activeOutfit) === "string"
    ? (input.activeOutfit ?? sourceFlags.__activeOutfit)
    : base.activeOutfit;
  const hand = arrayValue(input.hand ?? sourceFlags.__hand);
  const discard = arrayValue(input.discard ?? sourceFlags.__discard);
  const globalFlags = objectValue(input.globalFlags ?? sourceFlags.__globalFlags, {});
  const events = arrayValue(input.events ?? sourceFlags.__events).slice(0, 60);

  const state = {
    ...base,
    ...input,
    version: 4,
    revision,
    qualities,
    menaces,
    momentum,
    equipped,
    savedOutfits,
    activeOutfit,
    globalFlags,
    items: { ...legacyItems },
    unlockedLocations: [...new Set(input.unlockedLocations ?? base.unlockedLocations)],
    acquaintances: [...new Set(input.acquaintances ?? base.acquaintances)],
    flags: sourceFlags,
    journal: Array.isArray(input.journal) ? input.journal.slice(0, 100) : base.journal,
    events,
    hand: [...new Set(hand)],
    discard: [...new Set(discard)]
  };

  syncPersistentFlags(state);
  return state;
}

export function syncPersistentFlags(state) {
  state.flags ??= {};
  state.flags.__revision = Number(state.revision ?? 0);
  state.flags.__momentum = Number(state.momentum ?? 0);
  state.flags.__equipped = { ...(state.equipped ?? {}) };
  state.flags.__savedOutfits = structuredClone(state.savedOutfits ?? DEFAULT_OUTFITS);
  state.flags.__activeOutfit = state.activeOutfit ?? "morning-outfit";
  state.flags.__hand = [...(state.hand ?? [])];
  state.flags.__discard = [...(state.discard ?? [])];
  state.flags.__globalFlags = { ...(state.globalFlags ?? {}) };
  state.flags.__events = (state.events ?? []).slice(0, 60);
  return state;
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

function arrayValue(value) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string" || (entry && typeof entry === "object")) : [];
}

function objectValue(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : { ...fallback };
}
