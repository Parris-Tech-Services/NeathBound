import { items, equipmentSlots, locations, destinies } from "./content.js?v=20261016-gloomwing2";

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
    case "quirk":
      return state.quirks?.[requirement.id] ?? 0;
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

export function applyEffect(state, effect, qualityDefs) {
  if (effect?.quality !== undefined) return applyQualityEffect(state, effect, qualityDefs ?? {});
  switch (effect.type) {
    case "quality":
      state.qualities[effect.id] = Math.max(0, (state.qualities[effect.id] ?? 0) + Number(effect.amount ?? 0));
      break;
    case "set-quality":
      state.qualities[effect.id] = Math.max(0, Number(effect.value ?? 0));
      break;
    case "quirk": {
      state.quirks ??= {};
      state.quirk_cp ??= {};
      const amount = Math.floor(Number(effect.amount ?? 0));
      const applyQuirkCp = (id, change) => {
        const currentLevel = Math.max(0,Number(state.quirks[id]??0));
        const cp = Number.isFinite(state.quirk_cp[id])
          ? state.quirk_cp[id] : levelToTotalCp(currentLevel);
        const next = addCp({id,cp,level:currentLevel},change,15);
        state.quirks[id] = next.level;
        state.quirk_cp[id] = next.cp;
      };
      applyQuirkCp(effect.id,amount);
      if(amount>0)for(const opposite of QUIRK_OPPOSITES[effect.id]??[])
        applyQuirkCp(opposite,-amount);
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
        if(effect.id==="gloomwing-hunt")state.qualities.gloomwing_hunt_progress=state.ambition_progress[effect.id];
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
        state.living_stories.push({ storylet_id: effect.id, trigger_time: Date.now(), delay_hours: Math.max(0, Number(effect.delay_hours ?? 1)), title: effect.title ?? "A delayed letter arrives", text: effect.message ?? `The city has answered an earlier decision: ${effect.id}`, on_arrival: effect.on_arrival ?? [], fired: false });
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
  const difficulty = Number(challenge.difficulty ?? 1);
  switch (challenge.mode ?? "broad") {
    case "broad":
      return broadChance(level, difficulty, Number(challenge.scaler ?? DEFAULT_SCALER)) / 100;
    case "narrow":
    case "luck":
      // A narrow challenge is a fixed chance, not a stat comparison.
      return clamp(Number(challenge.narrow ?? (Number(challenge.chance ?? 0.5) * 100)), 0, 100) / 100;
    case "classic":
      // Opt-in compatibility for explicitly authored legacy d10 storylets.
      return clamp((11 + level - difficulty) / 10, 0, 1);
    default:
      throw new Error("Unknown challenge mode: " + challenge.mode);
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
  return { ...challenge, mode: challenge.mode ?? "broad", chance, percent: band.percent, label: band.label };
}

export function resolveChallenge(state, challenge, random = Math.random) {
  // Standalone rules API: resolveChallenge({ difficulty, scaler, narrow }, qualityLevel)
  if (typeof challenge === "number") return resolveQualityChallenge(state, challenge, random);
  if (!challenge) return { success: true, outcome: "success", roll: null, total: null, quality: null, chance: 1, cpAwarded: 0, rare: false };
  const chance = challengeChance(state, challenge);
  const band = challengeBand(chance);
  const quality = effectiveStat(state, challenge.quality);
  const classic = (challenge.mode ?? "broad") === "classic";
  const die = classic ? Math.floor(random() * 10) + 1 : null;
  const total = classic ? die + quality : null;
  const drawn = classic ? null : random();
  const success = classic ? total >= Number(challenge.difficulty) : drawn < chance;
  // Rare results replace normal success effects, not add to them.
  const rare = success && random() < clamp(Number(challenge.rareChance ?? DEFAULT_RARE_SUCCESS_CHANCE), 0, 1);
  return {
    success, rare, outcome: success ? (rare ? "rare_success" : "success") : "failure",
    roll: classic ? die : drawn, total, quality, chance, percent: band.percent,
    label: band.label, band, cpAwarded: cpAward(band.percent, success)
  };
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
  "austere": [[2,"Restrained"],[4,"Temperate"],[9,"Disciplined"],[15,"Ascetic"]],
  "hedonist": [[2,"Curious"],[4,"Indulgent"],[9,"Unrestrained"],[15,"Devoted to Pleasure"]],
  "daring": [[2,"Bold"],[4,"Dashing"],[9,"Intrepid"],[15,"Fearless"]],
  "subtle": [[2,"Tactful"],[4,"Careful"],[9,"Elusive"],[15,"Unfathomable"]],
  "forceful": [[2,"Resolute"],[4,"Assertive"],[9,"Unyielding"],[15,"Implacable"]],
  "magnanimous": [[2,"Kind"],[4,"Generous"],[9,"Merciful"],[15,"Open-Handed"]],
  "ruthless": [[2,"Hard"],[4,"Relentless"],[9,"Pitiless"],[15,"Iron-Hearted"]],
  "steadfast": [[2,"Reliable"],[4,"Loyal"],[9,"Unshakeable"],[15,"True"]],
  "fickle": [[2,"Restless"],[4,"Changeable"],[9,"Whimsical"],[15,"Inconstant"]],
  "honest": [[2,"Frank"],[4,"Truthful"],[9,"Principled"],[15,"Incorruptible"]],
  "devious": [[2,"Clever"],[4,"Sly"],[9,"Conniving"],[15,"Master of Masks"]]
};
export function quirkTitle(id, level) {
  return (QUIRK_TITLES[id] ?? []).find(([max]) => level <= max)?.[1] ?? id.replace(/(^|-)./g, match => match.toUpperCase());
}


export function awardProgress(state, qualityId, points) {
  state.qualities ??= {};
  state.progress ??= {};
  state.progress_total ??= {};
  const level = Math.max(0, Number(state.qualities[qualityId] ?? 0));
  const previousTotal = levelToTotalCp(level) + Number(state.progress[qualityId] ?? 0);
  const awarded = Math.max(0, Math.floor(Number(points) || 0));
  const updated = addCp({ id: qualityId, cp: previousTotal, level }, awarded);
  state.qualities[qualityId] = updated.level;
  state.progress[qualityId] = updated.cp - levelToTotalCp(updated.level);
  state.progress_total[qualityId] = updated.cp;
  return {
    qualityId, points: awarded, levelsGained: updated.level - level,
    level: updated.level, progress: state.progress[qualityId],
    nextLevelCost: levelCost(updated.level + 1)
  };
}


// ============================================================================
// QBN QUALITY TAXONOMY AND MATHEMATICS (independent of the legacy save shape)
// ============================================================================

export const QualityType = Object.freeze({
  PRIMARY_STAT: "primary_stat", MENACE: "menace", QUIRK: "quirk",
  CONNECTION: "connection", DREAM: "dream", STORY: "story", ITEM: "item",
  STATUS: "status", CIRCUMSTANCE: "circumstance",
  ACCOMPLISHMENT: "accomplishment", ROUTE: "route",
  LIVING_STORY: "living_story", METALQUALITY: "metaquality",
  UNLOCKED_BY_FATE: "unlocked_by_fate"
});
const PYRAMIDAL_TYPES = new Set([
  QualityType.PRIMARY_STAT, QualityType.MENACE, QualityType.QUIRK,
  QualityType.CONNECTION, QualityType.DREAM
]);
export const isPyramidal = (type) => PYRAMIDAL_TYPES.has(type);

export const LEVEL_THRESHOLD = 70;
export const CP_PER_LEVEL_AFTER_THRESHOLD = 70;
export const levelToTotalCp = (level, threshold = LEVEL_THRESHOLD) => levelToCp(level, threshold);
export function cpToNextLevel(cp, threshold = LEVEL_THRESHOLD) {
  const value = Math.max(0, Math.floor(Number(cp) || 0));
  return levelToTotalCp(cpToLevel(value, threshold) + 1, threshold) - value;
}
export function addCp(state, amount, maxLevel = Infinity, threshold = LEVEL_THRESHOLD) {
  const current = Math.max(0, Math.floor(Number(state.cp) || 0));
  const requested = Math.max(0, current + Math.floor(Number(amount) || 0));
  const maxCp = Number.isFinite(maxLevel) ? levelToTotalCp(maxLevel, threshold) : Infinity;
  const cp = Math.min(requested, maxCp);
  return { ...state, cp, level: cpToLevel(cp, threshold) };
}

export const DEFAULT_SCALER = 0.60;
export const MIN_BROAD_CHANCE = 10;
export const DEFAULT_RARE_SUCCESS_CHANCE = 0.04;
export function broadChance(qualityLevel, difficultyLevel, scaler = DEFAULT_SCALER) {
  // Equal stat and difficulty yields 60%, NOT 100%.
  if (difficultyLevel <= 0) return 100;
  const value = Math.floor(100 * Number(scaler) * Math.max(0, Number(qualityLevel)) / difficultyLevel);
  return clamp(value, MIN_BROAD_CHANCE, 100);
}
export function roll(chancePercent, random = Math.random) {
  return random() * 100 < clamp(chancePercent, 0, 100);
}
export function cpAward(chance, success) {
  return !success || chance >= 80 ? 1 : 2;
}
function resolveQualityChallenge(challenge, qualityLevel, random = Math.random) {
  const chance = challenge.narrow !== undefined
    ? clamp(Number(challenge.narrow), 0, 100)
    : broadChance(qualityLevel, Number(challenge.difficulty), challenge.scaler ?? DEFAULT_SCALER);
  const success = roll(chance, random);
  const rare = success && roll((challenge.rareChance ?? DEFAULT_RARE_SUCCESS_CHANCE) * 100, random);
  return { outcome: success ? (rare ? "rare_success" : "success") : "failure",
    success, rare, chance, cpAwarded: cpAward(chance, success) };
}

export const EquipmentSlot = Object.freeze({
  HAT:"hat", CLOTHING:"clothing", ADORNMENT:"adornment", GLOVES:"gloves",
  WEAPON:"weapon", BOOTS:"boots", LUGGAGE:"luggage", COMPANION:"companion",
  TREASURE:"treasure", DESTINY:"destiny", TOOLS:"tools", AFFILIATION:"affiliation",
  TRANSPORT:"transport", HOME:"home_comfort", SHIP:"ship", CREW:"crew",
  AIRSHIP:"airship", SPOUSE:"spouse", CLUB:"club", BOON:"boon"
});
export function getEffectiveStat(player, statId, qualityDefs = {}) {
  const raw = player.qualities?.[statId] ?? 0;
  let value = Number(typeof raw === "object" ? raw.level : raw);
  const equipped = player.equipped ?? player.equipment ?? {};
  for (const itemId of Object.values(equipped)) {
    if (!itemId || player.inventory?.[itemId] === 0 || player.items?.[itemId] === 0) continue;
    const def = qualityDefs[itemId] ?? items[itemId];
    value += Number(def?.stat_bonuses?.[statId] ?? def?.stats?.[statId] ?? 0);
  }
  return value;
}

// Structured quality effects coexist with the existing typed storylet effects.
// State: { qualities: { id: { id, cp, level } } }, definitions keyed by id.
function applyQualityEffect(player, effect, qualityDefs) {
  const def = qualityDefs[effect.quality];
  if (!def) { console.warn("Unknown quality in effect: " + effect.quality); return player; }
  player.qualities ??= {};
  const id = effect.quality;
  if (effect.remove) { delete player.qualities[id]; return player; }
  const current = player.qualities[id] ?? { id, cp: 0, level: 0 };
  if (effect.set !== undefined) {
    const level = clamp(Math.floor(Number(effect.set)), 0, def.max ?? Infinity);
    player.qualities[id] = { id, level, cp: isPyramidal(def.type) ? levelToTotalCp(level) : level };
    return player;
  }
  if (effect.cp === undefined) return player;
  if (isPyramidal(def.type)) {
    player.qualities[id] = addCp(current, effect.cp, def.max ?? Infinity);
    if (def.type === QualityType.QUIRK && effect.cp > 0) {
      const opposites = Array.isArray(def.opposite) ? def.opposite : (def.opposite ? [def.opposite] : []);
      for (const opp of opposites) {
        if (!qualityDefs[opp]) continue;
        player.qualities[opp] = addCp(player.qualities[opp] ?? {id:opp,cp:0,level:0},
          -Math.abs(effect.cp), qualityDefs[opp].max ?? Infinity);
      }
    }
  } else {
    const level = clamp(Number(current.level ?? 0) + Number(effect.cp), 0, def.max ?? Infinity);
    player.qualities[id] = { id, cp: level, level };
  }
  return player;
}

export const MENACE_THRESHOLD = 8;
export const MENACE_PENALTY_LOCATIONS = Object.freeze({
  dread:"the-pale-rooms", suspicion:"the-holding-vaults",
  wounds:"the-stitchery", scandal:"the-whisper-court"
});
export function checkMenaceThreshold(player) {
  for (const [menace, location] of Object.entries(MENACE_PENALTY_LOCATIONS)) {
    const raw = player.menaces?.[menace] ?? player.qualities?.[menace];
    const level = Number(typeof raw === "object" ? raw?.level : raw ?? 0);
    if (level >= MENACE_THRESHOLD) return location;
  }
  return null;
}
export function sendToPenaltyLocation(player, menace) {
  const location = MENACE_PENALTY_LOCATIONS[menace];
  if (!location) return player;
  player.locationId = location;
  player.current_location = location; // compatibility with structured player model
  if (menace === "suspicion") {
    if (typeof player.criminal_record === "number") player.criminal_record = Math.min(7, player.criminal_record + 1);
    else player.qualities.criminal_record = addCp(player.qualities.criminal_record ?? {
      id:"criminal_record",cp:0,level:0
    }, 1, 7);
  }
  return player;
}

// Action economy is available for future optional game modes. NeathBound's
// current published experience intentionally has unlimited actions.
export const ACTION_REGEN_MS = 600_000;
export function regenerateActions(player, now = Date.now()) {
  if (!Number.isFinite(player.last_action_tick) || !Number.isFinite(player.max_actions)) return player;
  if (player.actions >= player.max_actions) { player.last_action_tick = now; return player; }
  const added = Math.max(0, Math.floor((now - player.last_action_tick) / ACTION_REGEN_MS));
  if (added) {
    player.actions = Math.min(player.max_actions, player.actions + added);
    player.last_action_tick = player.actions >= player.max_actions
      ? now : player.last_action_tick + added * ACTION_REGEN_MS;
  }
  return player;
}
export function spendActions(player, cost) {
  if (!Number.isSafeInteger(cost) || cost < 0) return false;
  if (player.actions < cost) return false;
  player.actions -= cost;
  return true;
}

export default {
  QualityType, isPyramidal, LEVEL_THRESHOLD, CP_PER_LEVEL_AFTER_THRESHOLD,
  levelToTotalCp, cpToLevel, cpToNextLevel, addCp,
  DEFAULT_SCALER, MIN_BROAD_CHANCE, DEFAULT_RARE_SUCCESS_CHANCE,
  broadChance, roll, resolveChallenge, cpAward,
  EquipmentSlot, getEffectiveStat, applyEffect,
  MENACE_THRESHOLD, MENACE_PENALTY_LOCATIONS, checkMenaceThreshold,
  sendToPenaltyLocation, ACTION_REGEN_MS, regenerateActions, spendActions
};
