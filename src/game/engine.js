import { locations, stories } from "./content.js?v=20260930-19";
import { cloneState, newPlayerState } from "./state.js?v=20260930-19";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js?v=20260930-19";

export function currentLocation(state) {
  return locations[state.locationId] ?? locations["lantern-quay"];
}

function asRequirements(requirements) {
  if (Array.isArray(requirements)) return requirements;
  if (!requirements) return [];
  const normalized = [];
  if (requirements.item) normalized.push({ type: "item", id: requirements.item, op: ">=", value: 1 });
  if (requirements.quality) normalized.push({ type: "quality", id: requirements.quality[0], op: ">=", value: requirements.quality[1] });
  return normalized;
}

function requirementsFor(entry) {
  return asRequirements(entry?.requirements);
}

export function effectiveChallenge(story, choice) {
  if (!story || !choice) return null;
  if (choice.challenge === false || choice.challenge === null) return null;
  return choice.challenge ?? story.challenge ?? null;
}

export function storyAvailable(state, storyId, context = {}) {
  const story = stories[storyId];
  if (!story) return false;
  if (!currentLocation(state).stories.includes(storyId)) return false;
  if (story.once && state.flags[`story-complete:${storyId}`]) return false;
  return requirementsMet(state, requirementsFor(story), context);
}

export function canPlay(state, story, context = {}) {
  return Boolean(story && requirementsMet(state, requirementsFor(story), context));
}

export function availableStories(state, context = {}) {
  const tutorialComplete = state.flags?.["tutorial:complete"] === true;
  return currentLocation(state).stories
    .filter((id) => storyAvailable(state, id, context))
    .filter((id) => tutorialComplete || stories[id]?.tags?.includes("tutorial"))
    .map((id) => ({ id, ...stories[id] }));
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
  const before = cloneState(state);
  const next = cloneState(state);
  const story = stories[storyId];

  if (!storyAvailable(next, storyId, context)) {
    return { state: next, error: "That story is no longer available. Your current state has been refreshed." };
  }

  const choice = story.choices.find((candidate) => candidate.id === choiceId);
  if (!choice || !requirementsMet(next, requirementsFor(choice), context)) {
    return { state: next, error: "That choice is no longer available. Your current state has been refreshed." };
  }

  const challenge = effectiveChallenge(story, choice);
  const check = resolveChallenge(next, challenge, random);
  let success = check.success;
  // Momentum: a near miss (within 3) can be turned into a success by
  // spending one point of momentum.
  let usedMomentum = false;
  if (challenge && !success && (next.momentum ?? 0) > 0 && check.total + 3 >= challenge.difficulty) {
    next.momentum -= 1;
    check.total += 3;
    check.success = success = true;
    usedMomentum = true;
  }
  const resultText = success
    ? choice.success
    : (choice.failure ?? "The city refuses to explain itself.");

  applyEffects(next, success ? (choice.successEffects ?? []) : (choice.failureEffects ?? []));
  next.flags[`${storyId}:${choiceId}`] = true;
  if (story.once) next.flags[`story-complete:${storyId}`] = true;
  if (next.hand?.includes(storyId)) {
    next.hand.splice(next.hand.indexOf(storyId), 1);
    next.discard = [...(next.discard ?? []), storyId];
  }
  next.revision = Number(next.revision ?? 0) + 1;
  next.flags.__revision = next.revision;

  const changes = describeChanges(before, next);
  const challengeText = challenge
    ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty}${usedMomentum ? " with momentum" : ""})`
    : "";
  const journalText = `${story.title}: ${resultText}${challengeText}`;
  next.journal = [journalText, ...next.journal].slice(0, 100);
  next.events = [{
    id: `${Date.now()}-${storyId}-${choiceId}-${next.revision}`,
    at: new Date().toISOString(),
    storyId,
    choiceId,
    title: story.title,
    outcome: success ? "success" : "failure",
    text: resultText,
    changes
  }, ...(next.events ?? [])].slice(0, 250);

  return {
    state: next,
    storyId,
    choiceId,
    title: story.title,
    result: resultText,
    success,
    roll: check.roll,
    total: check.total,
    challenge,
    usedMomentum,
    changes
  };
}

export function resetState() {
  return newPlayerState();
}

export function describeChanges(before, after) {
  const changes = [];
  const numeric = (group, key, label) => {
    const from = Number(before[group]?.[key] ?? 0);
    const to = Number(after[group]?.[key] ?? 0);
    if (to !== from) changes.push({ type: group, id: key, label, before: from, after: to, delta: to - from });
  };

  if (Number(before.momentum ?? 0) !== Number(after.momentum ?? 0)) {
    changes.push({ type: "momentum", id: "momentum", label: "Momentum", before: Number(before.momentum ?? 0), after: Number(after.momentum ?? 0), delta: Number(after.momentum ?? 0) - Number(before.momentum ?? 0) });
  }

  if (Number(before.echoes ?? 0) !== Number(after.echoes ?? 0)) {
    changes.push({ type: "echoes", id: "echoes", label: "Echoes", before: Number(before.echoes ?? 0), after: Number(after.echoes ?? 0), delta: Number(after.echoes ?? 0) - Number(before.echoes ?? 0) });
  }

  for (const key of new Set([...Object.keys(before.qualities ?? {}), ...Object.keys(after.qualities ?? {})])) numeric("qualities", key, title(key));
  for (const key of new Set([...Object.keys(before.menaces ?? {}), ...Object.keys(after.menaces ?? {})])) numeric("menaces", key, title(key));
  for (const key of new Set([...Object.keys(before.items ?? {}), ...Object.keys(after.items ?? {})])) numeric("items", key, title(key));

  if (before.locationId !== after.locationId) {
    changes.push({ type: "location", id: after.locationId, label: "Location", before: before.locationId, after: after.locationId, message: `You are now at ${locations[after.locationId]?.name ?? title(after.locationId)}.` });
  }
  return changes;
}

function title(value) {
  return String(value).split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}
