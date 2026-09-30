// Local (offline) save for the browser. When the backend is reachable the
// server is authoritative and this save is only a fallback.
import { newCharacter } from "./engine.js";

export const SAVE_KEY = "neathbound.save.v2";
const LEGACY_SAVE_KEY = "neathbound.save.v1";

export function loadState(content, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(SAVE_KEY);
    if (raw) return { ...newCharacter(content), ...JSON.parse(raw) };
    const legacy = storage?.getItem(LEGACY_SAVE_KEY);
    if (legacy) return migrateV1(content, JSON.parse(legacy));
  } catch {
    // A corrupt save falls through to a fresh character.
  }
  return newCharacter(content);
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(SAVE_KEY, JSON.stringify(state));
}

// v1 kept echoes, stats and items separately; v2 stores everything as qualities.
export function migrateV1(content, v1) {
  const state = newCharacter(content);
  const qualities = { ...(v1.qualities ?? {}) };
  if (typeof v1.echoes === "number") qualities.echoes = v1.echoes;
  for (const item of v1.items ?? []) qualities[item] = 1;
  return {
    ...state,
    name: v1.name ?? state.name,
    areaId: content.areas[v1.locationId] ? v1.locationId : state.areaId,
    qualities: { ...state.qualities, ...qualities },
    journal: Array.isArray(v1.journal) ? v1.journal : state.journal
  };
}
