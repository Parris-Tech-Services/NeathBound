import { locations, stories } from "./content.js?v=20260930-10";
import { cloneState, initialState } from "./state.js?v=20260930-10";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js?v=20260930-10";

export function currentLocation(state) { return locations[state.locationId] ?? locations["lantern-quay"]; }

function asRequirements(requirements) {
  if (Array.isArray(requirements)) return requirements;
  if (!requirements) return [];
  const normalized = [];
  if (requirements.item) normalized.push({ type: "item", id: requirements.item, op: ">=", value: 1 });
  if (requirements.quality) normalized.push({ type: "quality", id: requirements.quality[0], op: ">=", value: requirements.quality[1] });
  return normalized;
}

function requirementsFor(entry) { return asRequirements(entry?.requirements); }

function legacyEffects(choice) {
  const reward = choice.reward ?? {};
  const effects = [];
  if (reward.echoes) effects.push({ type: "echoes", amount: reward.echoes });
  if (reward.momentum) effects.push({ type: "momentum", amount: reward.momentum });
  if (reward.item) effects.push({ type: "item", id: reward.item, amount: 1 });
  if (reward.quality) effects.push({ type: "quality", id: reward.quality[0], amount: reward.quality[1] });
  if (reward.menace) effects.push({ type: "menace", id: reward.menace[0], amount: reward.menace[1] });
  if (reward.unlock) effects.push({ type: "unlock", id: reward.unlock });
  if (reward.globalFlag) effects.push({ type: "global-flag", id: reward.globalFlag[0], value: reward.globalFlag[1] });
  if (choice.target) effects.push({ type: "location", id: choice.target });
  return effects;
}


function computeChanges(oldState, newState) {
  const changes = [];
  
  for (const [id, val] of Object.entries(newState.qualities || {})) {
    const oldVal = oldState.qualities?.[id] ?? 0;
    if (val !== oldVal) changes.push({ type: 'quality', id, amount: val - oldVal });
  }
  
  for (const [id, val] of Object.entries(newState.items || {})) {
    const oldVal = oldState.items?.[id] ?? 0;
    if (val !== oldVal) changes.push({ type: 'item', id, amount: val - oldVal });
  }
  for (const [id, oldVal] of Object.entries(oldState.items || {})) {
    if (!(id in (newState.items || {}))) changes.push({ type: 'item', id, amount: -oldVal });
  }
  
  for (const [id, val] of Object.entries(newState.menaces || {})) {
    const oldVal = oldState.menaces?.[id] ?? 0;
    if (val !== oldVal) changes.push({ type: 'menace', id, amount: val - oldVal });
  }
  
  if ((newState.momentum ?? 0) !== (oldState.momentum ?? 0)) {
    changes.push({ type: 'momentum', amount: (newState.momentum ?? 0) - (oldState.momentum ?? 0) });
  }
  
  if ((newState.echoes ?? 0) !== (oldState.echoes ?? 0)) {
    changes.push({ type: 'echoes', amount: (newState.echoes ?? 0) - (oldState.echoes ?? 0) });
  }
  
  return changes;
}

export function storyAvailable(state, storyId, context = {}) {
  const story = stories[storyId];
  return Boolean(story && currentLocation(state).stories.includes(storyId) && requirementsMet(state, requirementsFor(story), context));
}

export function canPlay(state, story, context = {}) { return Boolean(story && requirementsMet(state, requirementsFor(story), context)); }

export function availableStories(state, context = {}) {
  return currentLocation(state).stories.filter((id) => storyAvailable(state, id, context)).map((id) => ({ id, ...stories[id] }));
}

export function choiceAvailable(state, storyId, choiceId, context = {}) {
  if (!storyAvailable(state, storyId, context)) return false;
  const choice = stories[storyId]?.choices.find((candidate) => candidate.id === choiceId);
  return Boolean(choice && requirementsMet(state, requirementsFor(choice), context));
}

export function availableChoices(state, storyId, context = {}) {
  const story = stories[storyId];
  if (!storyAvailable(state, storyId, context) || !story) return [];
  return story.choices.filter((choice) => requirementsMet(state, requirementsFor(choice), context));
}

export function resolveChoice(state, storyId, choiceId, random = Math.random, context = {}) {
  const next = cloneState(state);
  const story = stories[storyId];
  if (!storyAvailable(next, storyId, context)) return { state: next, error: "That story is not available here anymore." };
  const choice = story.choices.find((candidate) => candidate.id === choiceId);
  if (!choice || !requirementsMet(next, requirementsFor(choice), context)) return { state: next, error: "That story choice is not available anymore." };

  const challenge = choice.challenge ?? story.challenge ?? null;
  const check = resolveChallenge(next, challenge, random);
  let success = check.success;
  let usedMomentum = false;
  if (challenge && !success && next.momentum > 0 && check.total + 3 >= challenge.difficulty) {
    next.momentum -= 1;
    check.total += 3;
    success = true;
    check.success = true;
    usedMomentum = true;
  }
  const resultText = success ? choice.success : (choice.failure ?? "The city refuses to explain itself.");
  if (choice.successEffects || choice.failureEffects) {
    applyEffects(next, success ? choice.successEffects : choice.failureEffects);
  } else {
    for (const effect of legacyEffects(choice)) {
      if (effect.type === "menace") next.menaces[effect.id] = Math.max(0, (next.menaces[effect.id] ?? 0) + effect.amount);
      else if (effect.type === "unlock") { if (!next.unlockedLocations.includes(effect.id)) next.unlockedLocations.push(effect.id); }
      else if (effect.type === "global-flag") next.globalFlags[effect.id] = effect.value;
      else if (effect.type === "momentum") next.momentum = Math.max(0, (next.momentum ?? 0) + effect.amount);
      else applyEffects(next, [effect]);
    }
  }
  if (choice.reward?.acquaintance && !next.acquaintances.includes(choice.reward.acquaintance)) next.acquaintances.push(choice.reward.acquaintance);
  next.flags[`${storyId}:${choiceId}`] = true;
  if (next.hand?.includes(storyId)) {
    const index = next.hand.indexOf(storyId);
    next.hand.splice(index, 1);
    if (!next.discard) next.discard = [];
    next.discard.push(storyId);
  }
  const challengeText = challenge ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty}${usedMomentum ? ' with momentum' : ''})` : "";
  next.journal = [`${story.title}: ${resultText}${challengeText}`, ...next.journal].slice(0, 30);
  const changes = computeChanges(state, next);
  return { state: next, result: resultText, success, roll: check.roll, total: check.total, challenge, changes };
}

export function resetState() { return initialState(); }
