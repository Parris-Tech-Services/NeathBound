import { locations, stories } from "./content.js";
import { cloneState, initialState } from "./state.js";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js";
import { mutateSystemAction } from "./systems.js";
import { OPPORTUNITY_CARDS, OPPORTUNITY_DECK } from "./opportunities.js";
import { drawWeightedCard } from "./decks.js";
import { syncPersistentFlags } from "./state.js";

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
  return currentLocation(state).stories
    .filter((id) => storyAvailable(state, id, context))
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
  syncPersistentFlags(next);

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

export function resolveGameAction(state, action, payload = {}, random = Math.random, context = {}) {
  const before = cloneState(state);
  const next = cloneState(state);

  if (action === "draw-card") {
    next.hand ??= [];
    next.discard ??= [];
    if (next.hand.length >= 3) return { state: next, error: "Your hand is already full." };
    let availableIds = OPPORTUNITY_DECK.cardIds.filter((id) => !next.hand.includes(id) && !next.discard.includes(id));
    if (!availableIds.length && next.discard.length) {
      next.discard = [];
      availableIds = OPPORTUNITY_DECK.cardIds.filter((id) => !next.hand.includes(id));
    }
    const deck = { ...OPPORTUNITY_DECK, cardIds: availableIds };
    const card = drawWeightedCard(next, deck, OPPORTUNITY_CARDS, random, context);
    if (!card) return { state: next, error: "No opportunity is available to draw right now." };
    next.hand.push(card.id);
    next.lastDraw = card.id;
    return finishAction(before, next, { title: "An Opportunity", text: card.title + " has entered your hand.", action, success: true });
  }

  if (action === "discard-card") {
    const cardId = payload.cardId;
    const index = next.hand?.indexOf(cardId) ?? -1;
    if (index < 0) return { state: next, error: "That card is not in your hand." };
    next.hand.splice(index, 1);
    next.discard = [...(next.discard ?? []), cardId];
    return finishAction(before, next, { title: OPPORTUNITY_CARDS[cardId]?.title ?? "Opportunity", text: "You let the opportunity pass.", action, success: true });
  }

  if (action === "play-card") {
    const { cardId, choiceId } = payload;
    const card = OPPORTUNITY_CARDS[cardId];
    if (!card || !(next.hand ?? []).includes(cardId)) return { state: next, error: "That opportunity is not in your hand." };
    if (!requirementsMet(next, card.requirements ?? [], context)) return { state: next, error: "That opportunity is no longer available." };
    const choice = card.choices.find((candidate) => candidate.id === choiceId);
    if (!choice || !requirementsMet(next, choice.requirements ?? [], context)) return { state: next, error: "That card choice is not available." };
    const challenge = choice.challenge === false ? null : choice.challenge ?? null;
    const check = resolveChallenge(next, challenge, random);
    let success = check.success;
    let usedMomentum = false;
    if (challenge && !success && (next.momentum ?? 0) > 0 && check.total + 3 >= challenge.difficulty) {
      next.momentum -= 1;
      check.total += 3;
      check.success = success = true;
      usedMomentum = true;
    }
    const resultText = success ? choice.success : (choice.failure ?? "The opportunity slips away.");
    applyEffects(next, success ? (choice.successEffects ?? []) : (choice.failureEffects ?? []));
    next.hand.splice(next.hand.indexOf(cardId), 1);
    next.discard = [...(next.discard ?? []), cardId];
    return finishAction(before, next, { title: card.title, text: resultText, action, success, challenge, roll: check.roll, total: check.total, usedMomentum, cardId, choiceId });
  }

  const system = mutateSystemAction(next, action, payload);
  if (system.error) return { state: next, error: system.error };
  if (system.effects?.length) applyEffects(next, system.effects);
  return finishAction(before, next, { title: system.title ?? "A change", text: system.text ?? "Something changes.", action, success: true });
}

function finishAction(before, next, meta) {
  next.revision = Number(next.revision ?? 0) + 1;
  const changes = describeChanges(before, next);
  const journalText = meta.title + ": " + meta.text;
  next.journal = [journalText, ...(next.journal ?? [])].slice(0, 100);
  next.events = [{
    id: Date.now() + "-" + meta.action + "-" + next.revision,
    at: new Date().toISOString(),
    title: meta.title,
    outcome: meta.success === false ? "failure" : "success",
    text: meta.text,
    changes
  }, ...(next.events ?? [])].slice(0, 250);
  syncPersistentFlags(next);
  return { state: next, result: meta.text, title: meta.title, success: meta.success !== false, challenge: meta.challenge ?? null, roll: meta.roll ?? null, total: meta.total ?? null, usedMomentum: Boolean(meta.usedMomentum), changes, cardId: meta.cardId, choiceId: meta.choiceId, action: meta.action };
}

export function resetState() {
  return initialState();
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
