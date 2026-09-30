export const SAVE_KEY = "neathbound.save.v3";
export const LEGACY_SAVE_KEY = "neathbound.save.v1";
export const LEGACY_SAVE_KEYS = ["neathbound.save.v2", LEGACY_SAVE_KEY];
const MENACE_IDS = ["dread", "scandal", "wounds", "suspicion"];

export function initialState() {
  const equipment = { coat: null, tool: null, charm: null };
  const hand = ["tea-for-the-tide"];
  const discard = [];
  const events = [];
  return {
    version: 3,
    revision: 0,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: { "salted-map": 1, "brass-key": 1 },
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    acquaintances: [],
    equipment,
    flags: {
      "__revision": 0,
      "__equipment": equipment,
      "__events": events,
      "__hand": hand,
      "__discard": discard
    },
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."],
    events,
    hand,
    discard,
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

  const revision = Number.isInteger(input.revision)
    ? input.revision
    : Number(input.flags?.["__revision"] ?? 0);
  const equipment = {
    ...base.equipment,
    ...(input.flags?.["__equipment"] ?? {}),
    ...(input.equipment ?? {})
  };
  const events = Array.isArray(input.events)
    ? input.events.slice(0, 250)
    : (Array.isArray(input.flags?.["__events"]) ? input.flags["__events"].slice(0, 250) : []);
  const hand = Array.isArray(input.hand)
    ? [...new Set(input.hand)]
    : (Array.isArray(input.flags?.["__hand"]) ? [...new Set(input.flags["__hand"])] : [...base.hand]);
  const discard = Array.isArray(input.discard)
    ? [...new Set(input.discard)]
    : (Array.isArray(input.flags?.["__discard"]) ? [...new Set(input.flags["__discard"])] : []);

  return {
    ...base,
    ...input,
    version: 3,
    revision,
    qualities,
    menaces,
    items: legacyItems,
    unlockedLocations: [...new Set(input.unlockedLocations ?? base.unlockedLocations)],
    acquaintances: [...new Set(input.acquaintances ?? base.acquaintances)],
    equipment,
    flags: {
      ...(input.flags ?? {}),
      "__revision": revision,
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
