const PREFS_KEY = "neathbound.ui.v1";

const defaults = {
  outfit: "morning-outfit",
  bookmarks: [],
  notes: {}
};

export function loadPreferences(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(PREFS_KEY) ?? "null");
    return {
      outfit: typeof parsed?.outfit === "string" ? parsed.outfit : defaults.outfit,
      bookmarks: Array.isArray(parsed?.bookmarks) ? parsed.bookmarks.filter((id) => typeof id === "string") : [],
      notes: parsed?.notes && typeof parsed.notes === "object" ? Object.fromEntries(Object.entries(parsed.notes).filter(([, value]) => typeof value === "string")) : {}
    };
  } catch {
    return { ...defaults, bookmarks: [], notes: {} };
  }
}

export function savePreferences(preferences, storage = globalThis.localStorage) {
  const next = {
    outfit: typeof preferences?.outfit === "string" ? preferences.outfit : defaults.outfit,
    bookmarks: Array.isArray(preferences?.bookmarks) ? [...new Set(preferences.bookmarks)] : [],
    notes: preferences?.notes && typeof preferences.notes === "object" ? Object.fromEntries(Object.entries(preferences.notes).filter(([, value]) => typeof value === "string")) : {}
  };
  storage?.setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}
