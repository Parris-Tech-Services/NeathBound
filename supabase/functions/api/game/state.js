export const SAVE_KEY = "neathbound.save.v3";
export const LEGACY_SAVE_KEYS = ["neathbound.save.v2", "neathbound.save.v1"];
const MENACE_IDS = ["dread", "scandal", "wounds", "suspicion"];

export function initialState() {
  return {
    version: 3,
    revision: 0,
    name: "The Unmoored",
    locationId: "the-lair",
    obols: 12,
    momentum: 0,
    actions: 10,
    max_actions: 10,
    last_action_tick: Date.now(),
    progress: {},
    progress_total: {},
    quirks: {},
    quirk_cp: {},
    ambition: null,
    ambition_progress: {},
    destinies: [],
    destiny_bonus: {},
    criminal_record: 0,
    living_stories: [],
    messages: [],
    draw_timer: Date.now(),
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: {},
    equipment: {},
    unlockedLocations: ["the-lair"],
    acquaintances: [],
    flags: { __revision: 0 },
    refuge: "camp-on-the-docks",
    globalFlags: {},
    hand: [],
    discard: [],
    journal: ["You woke in a locked municipal chamber. The file on its door bears someone else\u0027s name. A bell is stamped into the iron."],
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

  // Preserve return routes for saves from before automatic district discovery.
  const penaltyAreas = new Set(["the-holding-vaults", "the-pale-rooms", "the-stitchery", "the-whisper-court"]);
  const visited = (input.events ?? []).flatMap((event) =>
    (event.changes ?? []).filter((change) => change.type === "location").map((change) => change.after)
  );
  const olderRoutes = [
    input.flags?.["story-complete:bell-under-water"] && "hollow-archive",
    input.flags?.["story-complete:cartographer-at-dusk"] && "velvet-market"
  ].filter(Boolean);
  const knownLocations = [...(input.unlockedLocations ?? base.unlockedLocations), input.locationId, ...visited, ...olderRoutes]
    .filter((id) => typeof id === "string" && !penaltyAreas.has(id));

  return {
    ...base,
    ...input,
    version: 3,
    revision: Number.isInteger(input.revision) ? input.revision : Number(input.flags?.__revision ?? 0),
    qualities,
    menaces,
    momentum: Number.isFinite(input.momentum) ? input.momentum : base.momentum,
    max_actions: Number.isFinite(input.max_actions) ? Math.max(10,Math.min(20,Math.floor(input.max_actions))) : 10,
    actions: Number.isFinite(input.actions) ? Math.max(0,Math.min(Number.isFinite(input.max_actions) ? Math.max(10,Math.min(20,Math.floor(input.max_actions))) : 10,Math.floor(input.actions))) : 10,
    last_action_tick: Number.isFinite(input.last_action_tick) ? input.last_action_tick : Date.now(),
    progress: { ...(input.progress ?? {}) },
    progress_total: { ...(input.progress_total ?? {}) },
    quirks: { ...(input.quirks ?? {}) },
    quirk_cp: { ...(input.quirk_cp ?? {}) },
    ambition: input.ambition ?? null,
    ambition_progress: { ...(input.ambition_progress ?? {}) },
    destinies: Array.isArray(input.destinies) ? [...new Set(input.destinies)] : [],
    destiny_bonus: { ...(input.destiny_bonus ?? {}) },
    criminal_record: Math.min(7, Math.max(0, Number(input.criminal_record ?? 0))),
    living_stories: Array.isArray(input.living_stories) ? input.living_stories : [],
    messages: Array.isArray(input.messages) ? input.messages : [],
    draw_timer: Number.isFinite(input.draw_timer) ? input.draw_timer : Date.now(),
    globalFlags: { ...(input.globalFlags ?? {}) },
    items: { ...legacyItems },
    equipment: { ...(input.equipment ?? {}) },
    unlockedLocations: [...new Set(knownLocations)],
    acquaintances: [...new Set(input.acquaintances ?? base.acquaintances)],
    flags: { ...(input.flags ?? {}), __revision: Number.isInteger(input.revision) ? input.revision : Number(input.flags?.__revision ?? 0) },
    refuge: input.refuge || base.refuge,
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
