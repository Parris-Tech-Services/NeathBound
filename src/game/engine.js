import { locations, stories } from "./content.js";
import { cloneState, initialState } from "./state.js";

export function currentLocation(state) {
  return locations[state.locationId] ?? locations["lantern-quay"];
}

export function availableStories(state) {
  return currentLocation(state).stories.map((id) => ({ id, ...stories[id] }));
}

export function resolveChoice(state, storyId, choiceId, random = Math.random) {
  const next = cloneState(state);
  const story = stories[storyId];
  const choice = story?.choices.find((candidate) => candidate.id === choiceId);
  if (!story || !choice) return { state: next, error: "That story choice is no longer available." };

  const challenge = story.challenge;
  const roll = challenge ? Math.floor(random() * 10) + 1 + (next.qualities[challenge.stat] ?? 0) : null;
  const success = !challenge || roll >= challenge.difficulty;
  const resultText = success ? choice.success : (choice.failure ?? "The city refuses to explain itself.");
  const reward = choice.reward ?? {};
  if (reward.echoes) next.echoes += reward.echoes;
  if (reward.item && !next.items.includes(reward.item)) next.items.push(reward.item);
  if (reward.quality) next.qualities[reward.quality[0]] = (next.qualities[reward.quality[0]] ?? 0) + reward.quality[1];
  next.locationId = choice.target ?? next.locationId;
  next.flags[`${storyId}:${choiceId}`] = true;
  const check = challenge ? ` (${success ? "success" : "failure"}: ${roll} vs ${challenge.difficulty})` : "";
  next.journal = [`${story.title}: ${resultText}${check}`, ...next.journal].slice(0, 30);
  return { state: next, result: resultText, success, roll, challenge };
}

export function resetState() {
  return initialState();
}
