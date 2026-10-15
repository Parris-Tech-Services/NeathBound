import { items, equipmentSlots, locations, destinies } from "./content.js?v=20261015-04";

const operators = {
  "==": (actual, expected) => actual === expected,
  "!=": (actual, expected) => actual !== expected,
  ">": (actual, expected) => Number(actual) > Number(expected),
  ">=": (actual, expected) => Number(actual) >= Number(expected),
  "<": (actual, expected) => Number(actual) < Number(expected),
  "<=": (actual, expected) => Number(actual) <= Number(expected)
};

export function valueForRequirement(state, requirement, context = {}) {
  switch (requirement.type) {
    case "quality":
      return state.qualities?.[requirement.id] ?? 0;
    case "menace":
      return state.menaces?.[requirement.id] ?? 0;
    case "item":
      return state.items?.[requirement.id] ?? 0;
    case "flag":
      return state.flags?.[requirement.id];
    case "obols":
      return state.obols ?? 0;
    case "location":
      return state.locationId;
    case "world-quality":
      return context.worldQualities?.[requirement.id] ?? state.worldQualities?.[requirement.id] ?? 0;
    case "time-since-flag":
      return Date.now() - Number(state.flags?.[requirement.id] ?? 0);
    default:
      return undefined;
  }
}

export function requirementMet(state, requirement, context = {}) {
  const op = operators[requirement.op ?? "=="];
  if (!op) return false;
  return op(valueForRequirement(state, requirement, context), requirement.value);
}

export function requirementsMet(state, requirements = [], context = {}) {
  return (requirements ?? []).every((requirement) => requirementMet(state, requirement, context));
}

export function applyEffect(state, effect) {
  switch (effect.type) {
    case "quality":
      state.qualities[effect.id] = Math.max(0, (state.qualities[effect.id] ?? 0) + Number(effect.amount ?? 0));
      break;
    case "set-quality":
      state.qualities[effect.id] = Math.max(0, Number(effect.value ?? 0));
      break;
    case "quirk": {
      state.quirks ??= {};
      const change = Number(effect.amount ?? 0);
      state.quirks[effect.id] = clamp((state.quirks[effect.id] ?? 0) + change, 0, 15);
      if (change > 0) for (const opposite of QUIRK_OPPOSITES[effect.id] ?? []) {
        state.quirks[opposite] = clamp((state.quirks[opposite] ?? 0) - change, 0, 15);
      }
      break;
    }
    case "ambition":
      if (!state.ambition) {
        state.ambition=effect.id;
        state.ambition_progress ??= {};
        state.ambition_progress[effect.id]=0;
      }
      break;
    case "ambition-progress":
      if(state.ambition===effect.id) {
        state.ambition_progress ??= {};
        state.ambition_progress[effect.id]=Math.max(0,(state.ambition_progress[effect.id]??0)+Number(effect.amount??1));
      }
      break;
    case "destiny":
      if(!state.destinies?.length && destinies[effect.id] && !destinies[effect.id].fate_locked) {
        state.destinies=[effect.id];
        state.flags["destiny-chosen"]=true;
        state.destiny_bonus={...destinies[effect.id].stat_bonus};
      }
      break;
    case "equip-treasure":
      if(Number(state.items?.[effect.id]??0)>=1 && items[effect.id]?.slot==="treasure"){
        state.equipment??={};
        state.equipment.treasure=effect.id;
      }
      break;
    case "living-story":
      state.living_stories ??= [];
      if (!state.living_stories.some(entry => entry.storylet_id === effect.id && !entry.fired)) {
        state.living_stories.push({ storylet_id: effect.id, trigger_time: Date.now(), delay_hours: Math.max(0, Number(effect.delay_hours ?? 1)), fired: false });
      }
      break;
    case "progress":
      awardProgress(state, effect.id, effect.amount ?? 1);
      break;
    case "menace":
      state.menaces ??= {};
      state.menaces[effect.id] = Math.max(0, (state.menaces[effect.id] ?? 0) + Number(effect.amount ?? 0));
      break;
    case "obols":
      state.obols = Math.max(0, (state.obols ?? 0) + Number(effect.amount ?? 0));
      break;
    case "item": {
      const next = Math.max(0, (state.items[effect.id] ?? 0) + Number(effect.amount ?? 0));
      if (next === 0) delete state.items[effect.id];
      else state.items[effect.id] = next;
      break;
    }
    case "flag":
      state.flags[effect.id] = effect.value ?? true;
      break;
    case "location":
      state.locationId = effect.id;
      // Story travel discovers normal destinations, but not menace-only areas.
      if (!locations[effect.id]?.consequenceOf) {
        state.unlockedLocations ??= [];
        if (!state.unlockedLocations.includes(effect.id)) state.unlockedLocations.push(effect.id);
      }
      break;
    case "unlock-location":
      state.unlockedLocations ??= [];
      if (!state.unlockedLocations.includes(effect.id)) state.unlockedLocations.push(effect.id);
      break;
    case "momentum":
      state.momentum = Math.max(0, Number(state.momentum ?? 0) + Number(effect.amount ?? 0));
      break;
    case "global-flag":
      state.globalFlags ??= {};
      state.globalFlags[effect.id] = effect.value ?? true;
      break;
    case "acquaintance":
      state.acquaintances ??= [];
      if (!state.acquaintances.includes(effect.id)) state.acquaintances.push(effect.id);
      break;
    default:
      throw new Error(`Unknown effect type: ${effect.type}`);
  }
  return state;
}

export function applyEffects(state, effects = []) {
  for (const effect of effects) applyEffect(state, effect);
  return state;
}

// Challenge difficulty labels and progress rewards (Fallen London's bands,
// see docs/FALLEN-LONDON-MECHANICS-AND-LINGO.md). Progress is paid on success
// AND failure, so failing is never wasted.
export const CHALLENGE_BANDS = [
  { min: 91, label: "Straightforward", success: 1, failure: 1 },
  { min: 81, label: "Low-risk", success: 2, failure: 1 },
  { min: 71, label: "Very modest", success: 2, failure: 1 },
  { min: 61, label: "Modest", success: 2, failure: 1 },
  { min: 51, label: "Chancy", success: 3, failure: 1 },
  { min: 41, label: "Very chancy", success: 3, failure: 1 },
  { min: 31, label: "Tough", success: 4, failure: 2 },
  { min: 11, label: "High-risk", success: 5, failure: 3 },
  { min: 0, label: "Almost impossible", success: 6, failure: 4 }
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// Chance of success, 0..1. Modes:
//   classic (default): the original d10 + quality >= difficulty rule, so
//                      existing content keeps its balance; exact odds shown.
//   broad:  0.6 x quality / difficulty (60% when they are equal).
//   narrow: 50% at the difficulty, +/-10% per level, 10% minimum.
//   luck:   a fixed chance (challenge.chance), unaffected by qualities.
export function challengeChance(state, challenge) {
  if (!challenge) return 1;
  const level = effectiveStat(state, challenge.quality);
  const difficulty = Math.max(1, Number(challenge.difficulty ?? 1));
  switch (challenge.mode ?? "classic") {
    case "broad":
      return clamp(Math.floor(Number(challenge.scaler ?? 0.60) * level / difficulty * 100) / 100, 0.1, 1);
    case "narrow":
      return clamp(0.5 + 0.1 * (level - difficulty), 0.1, 1);
    case "luck":
      return clamp(Number(challenge.chance ?? 0.5), 0, 1);
    default:
      return clamp((11 + level - difficulty) / 10, 0, 1);
  }
}

export function challengeBand(chance) {
  const percent = Math.round(chance * 100);
  return { percent, ...CHALLENGE_BANDS.find((band) => percent >= band.min) };
}

export function effectiveStat(state, stat) {
  let value = Number(state.qualities?.[stat] ?? 0);
  for (const slot of equipmentSlots) {
    const itemId = state.equipment?.[slot];
    if (itemId && items[itemId]?.stats?.[stat]) {
      value += items[itemId].stats[stat];
    }
  }
  return value + Number(state.destiny_bonus?.[stat] ?? 0);
}

export function describeChallenge(state, challenge) {
  if (!challenge) return null;
  const chance = challengeChance(state, challenge);
  const band = challengeBand(chance);
  return { ...challenge, mode: challenge.mode ?? "classic", chance, percent: band.percent, label: band.label };
}

export function resolveChallenge(state, challenge, random = Math.random) {
  if (!challenge) return { success: true, roll: null, total: null, quality: null, chance: 1 };
  const chance = challengeChance(state, challenge);
  const band = challengeBand(chance);
  const quality = effectiveStat(state, challenge.quality);
  if ((challenge.mode ?? "classic") === "classic") {
    const die = Math.floor(random() * 10) + 1;
    const total = die + quality;
    return { success: total >= challenge.difficulty, roll: die, total, quality, chance, percent: band.percent, label: band.label, band };
  }
  const roll = random();
  return { success: roll < chance, roll, total: null, quality, chance, percent: band.percent, label: band.label, band };
}

// The four primary attributes require triangular CP to level 70, then 70 per level.
// 70 * 71 / 2 = 2485 (1275 is the total at level 50).
export const LEVEL_COST_CAP = 70;
export const LEVEL_70_CP = 2485;
export const CP_PER_LEVEL_AFTER_70 = 70;
export const levelCost = (targetLevel) => Math.max(1, Math.min(Math.floor(targetLevel), LEVEL_COST_CAP));
export function levelToCp(level, cap = LEVEL_COST_CAP) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  const threshold = Math.max(1, Math.floor(cap));
  return n <= threshold ? n * (n + 1) / 2 : threshold * (threshold + 1) / 2 + (n - threshold) * threshold;
}
export function cpToLevel(cp, cap = LEVEL_COST_CAP) {
  const amount = Math.max(0, Math.floor(Number(cp) || 0));
  const threshold = Math.max(1, Math.floor(cap));
  const thresholdCp = threshold * (threshold + 1) / 2;
  return amount < thresholdCp ? Math.floor((Math.sqrt(8 * amount + 1) - 1) / 2)
    : threshold + Math.floor((amount - thresholdCp) / threshold);
}
export const QUIRK_OPPOSITES = {
  austere: ["hedonist"], hedonist: ["austere"],
  daring: ["forceful"], subtle: ["forceful"], forceful: ["daring", "subtle"],
  magnanimous: ["ruthless"], ruthless: ["magnanimous"],
  steadfast: ["fickle"], fickle: ["steadfast"],
  honest: ["devious"], devious: ["honest"]
};
export const QUIRK_TITLES = {
  austere: [[2,"Restrained"],[4,"Temperate"],[9,"Disciplined"],[15,"Ascetic"]],
  daring: [[2,"Bold"],[4,"Dashing"],[9,"Intrepid"],[15,"Fearless"]]
};
export function quirkTitle(id, level) {
  return (QUIRK_TITLES[id] ?? []).find(([max]) => level <= max)?.[1] ?? id.replace(/(^|-)./g, match => match.toUpperCase());
}


export function awardProgress(state, qualityId, points) {
  state.qualities ??= {};
  state.progress ??= {};
  let level = Number(state.qualities[qualityId] ?? 0);
  let progress = Number(state.progress[qualityId] ?? 0) + Math.max(0, Number(points) || 0);
  let levelsGained = 0;
  while (progress >= levelCost(level + 1)) {
    progress -= levelCost(level + 1);
    level += 1;
    levelsGained += 1;
  }
  state.qualities[qualityId] = level;
  state.progress[qualityId] = progress;
  state.progress_total ??= {};
  state.progress_total[qualityId] = levelToCp(level) + progress;
  return { qualityId, points, levelsGained, level, progress, nextLevelCost: levelCost(level + 1) };
}
