import { effectiveQualityValue } from "./systems.js";

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
    case "echoes":
      return state.echoes ?? 0;
    case "location":
      return state.locationId;
    case "world-quality":
      return context.worldQualities?.[requirement.id] ?? state.worldQualities?.[requirement.id] ?? 0;
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
  return requirements.every((requirement) => requirementMet(state, requirement, context));
}

export function applyEffect(state, effect) {
  switch (effect.type) {
    case "quality":
      state.qualities[effect.id] = Math.max(0, (state.qualities[effect.id] ?? 0) + Number(effect.amount ?? 0));
      break;
    case "set-quality":
      state.qualities[effect.id] = Math.max(0, Number(effect.value ?? 0));
      break;
    case "menace":
      state.menaces ??= {};
      state.menaces[effect.id] = Math.max(0, (state.menaces[effect.id] ?? 0) + Number(effect.amount ?? 0));
      break;
    case "echoes":
      state.echoes = Math.max(0, (state.echoes ?? 0) + Number(effect.amount ?? 0));
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

export function resolveChallenge(state, challenge, random = Math.random) {
  if (!challenge) return { success: true, roll: null, total: null, quality: null };
  const die = Math.floor(random() * 10) + 1;
  const quality = effectiveQualityValue(state, challenge.quality);
  const total = die + quality;
  return { success: total >= challenge.difficulty, roll: die, total, quality };
}
