import { locations, stories } from "./content.js";
import { cloneState, initialState } from "./state.js";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js";

export function currentLocation(state) {
  return locations[state.locationId] ?? locations["lantern-quay"];
}

export function storyAvailable(state, storyId) {
  const location = currentLocation(state);
  const story = stories[storyId];
  return Boolean(
    story &&
    location.stories.includes(storyId) &&
    requirementsMet(state, story.requirements)
  );
}

export function availableStories(state) {
  return currentLocation(state).stories
    .filter((id) => storyAvailable(state, id))
    .map((id) => ({ id, ...stories[id] }));
}

export function choiceAvailable(state, storyId, choiceId) {
  if (!storyAvailable(state, storyId)) return false;
  const choice = stories[storyId]?.choices.find((candidate) => candidate.id === choiceId);
  return Boolean(choice && requirementsMet(state, choice.requirements));
}

export function availableChoices(state, storyId) {
  const story = stories[storyId];
  if (!storyAvailable(state, storyId) || !story) return [];
  return story.choices.filter((choice) => requirementsMet(state, choice.requirements));
}

export function resolveChoice(state, storyId, choiceId, random = Math.random) {
  const next = cloneState(state);
  const story = stories[storyId];

  if (!storyAvailable(next, storyId)) {
    return { state: next, error: "That story is not available here anymore." };
  }

  const choice = story.choices.find((candidate) => candidate.id === choiceId);
  if (!choice || !requirementsMet(next, choice.requirements)) {
    return { state: next, error: "That story choice is not available anymore." };
  }

  const challenge = choice.challenge ?? null;
  const check = resolveChallenge(next, challenge, random);
  const success = check.success;
  const resultText = success
    ? choice.success
    : (choice.failure ?? "The city refuses to explain itself.");

  applyEffects(next, success ? choice.successEffects : choice.failureEffects);
  next.flags[`${storyId}:${choiceId}`] = true;

  const challengeText = challenge
    ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty})`
    : "";

  next.journal = [
    `${story.title}: ${resultText}${challengeText}`,
    ...next.journal
  ].slice(0, 30);

  return {
    state: next,
    result: resultText,
    success,
    roll: check.roll,
    total: check.total,
    challenge
  };
}

export function resetState() {
  return initialState();
}
