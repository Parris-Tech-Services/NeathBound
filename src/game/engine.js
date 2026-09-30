import { locations, stories } from "./content.js?v=20260930-9";
import { bazaarStock, itemDefinition } from "./items.js?v=20260930-9";
import { cloneState, initialState } from "./state.js?v=20260930-9";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js?v=20260930-9";

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
  const success = check.success;
  const resultText = success ? choice.success : (choice.failure ?? "The city refuses to explain itself.");

  applyEffects(next, success ? (choice.successEffects ?? []) : (choice.failureEffects ?? []));
  next.flags[`${storyId}:${choiceId}`] = true;
  if (story.once) next.flags[`story-complete:${storyId}`] = true;
  advanceRevision(next);

  const changes = describeChanges(before, next);
  const challengeText = challenge ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty})` : "";
  const journalText = `${story.title}: ${resultText}${challengeText}`;
  next.journal = [journalText, ...next.journal].slice(0, 100);
  appendEvent(next, {
    storyId,
    choiceId,
    title: story.title,
    outcome: success ? "success" : "failure",
    text: resultText,
    changes
  });

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
    baseQuality: check.baseQuality,
    bonus: check.bonus,
    changes
  };
}

export function buyItem(state, itemId) {
  const next = cloneState(state);
  if (!bazaarStock.includes(itemId)) return { state: next, error: "That item is not sold here." };
  const item = itemDefinition(itemId);
  const price = Number(item.price ?? 0);
  if (price <= 0) return { state: next, error: "That item has no purchase price." };
  if (Number(next.echoes ?? 0) < price) return { state: next, error: `You need ${price} Echoes to buy ${item.name}.` };

  const before = cloneState(next);
  next.echoes -= price;
  next.items[itemId] = Number(next.items[itemId] ?? 0) + 1;
  advanceRevision(next);
  return transaction(before, next, `Bought ${item.name}`, `You purchase ${item.name} for ${price} Echoes.`);
}

export function sellItem(state, itemId) {
  const next = cloneState(state);
  const quantity = Number(next.items?.[itemId] ?? 0);
  const item = itemDefinition(itemId);
  const value = Number(item.sellValue ?? 0);
  if (quantity < 1) return { state: next, error: `You do not have ${item.name}.` };
  if (value <= 0) return { state: next, error: `${item.name} cannot be sold.` };

  const before = cloneState(next);
  next.items[itemId] = quantity - 1;
  if (next.items[itemId] <= 0) delete next.items[itemId];
  for (const [slot, equippedId] of Object.entries(next.equipment ?? {})) {
    if (equippedId === itemId && !next.items[itemId]) next.equipment[slot] = null;
  }
  next.echoes += value;
  syncEquipment(next);
  advanceRevision(next);
  return transaction(before, next, `Sold ${item.name}`, `You sell ${item.name} for ${value} Echoes.`);
}

export function equipItem(state, itemId) {
  const next = cloneState(state);
  const item = itemDefinition(itemId);
  if (Number(next.items?.[itemId] ?? 0) < 1) return { state: next, error: `You do not own ${item.name}.` };
  if (!item.equipSlot) return { state: next, error: `${item.name} cannot be equipped.` };

  const before = cloneState(next);
  next.equipment[item.equipSlot] = next.equipment[item.equipSlot] === itemId ? null : itemId;
  syncEquipment(next);
  advanceRevision(next);
  const equipped = Boolean(next.equipment[item.equipSlot]);
  return transaction(
    before,
    next,
    equipped ? `Equipped ${item.name}` : `Unequipped ${item.name}`,
    equipped ? `${item.name} is now equipped.` : `${item.name} has been removed.`
  );
}

export function recoverMenace(state, menaceId) {
  const next = cloneState(state);
  if (!(menaceId in (next.menaces ?? {}))) return { state: next, error: "That menace is unknown." };
  if (Number(next.menaces[menaceId] ?? 0) <= 0) return { state: next, error: `${title(menaceId)} is already at zero.` };
  if (Number(next.echoes ?? 0) < 3) return { state: next, error: "You need 3 Echoes for a quiet recovery." };

  const before = cloneState(next);
  next.echoes -= 3;
  next.menaces[menaceId] = Math.max(0, Number(next.menaces[menaceId]) - 2);
  advanceRevision(next);
  return transaction(before, next, `Recover from ${title(menaceId)}`, "A little time, privacy and practical help take the edge off.");
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

  if (Number(before.echoes ?? 0) !== Number(after.echoes ?? 0)) {
    changes.push({
      type: "echoes",
      id: "echoes",
      label: "Echoes",
      before: Number(before.echoes ?? 0),
      after: Number(after.echoes ?? 0),
      delta: Number(after.echoes ?? 0) - Number(before.echoes ?? 0)
    });
  }
  for (const key of new Set([...Object.keys(before.qualities ?? {}), ...Object.keys(after.qualities ?? {})])) numeric("qualities", key, title(key));
  for (const key of new Set([...Object.keys(before.menaces ?? {}), ...Object.keys(after.menaces ?? {})])) numeric("menaces", key, title(key));
  for (const key of new Set([...Object.keys(before.items ?? {}), ...Object.keys(after.items ?? {})])) numeric("items", key, title(key));
  if (before.locationId !== after.locationId) {
    changes.push({ type: "location", id: after.locationId, label: "Location", before: before.locationId, after: after.locationId });
  }
  return changes;
}

function transaction(before, next, titleText, resultText) {
  const changes = describeChanges(before, next);
  appendEvent(next, { storyId: null, choiceId: null, title: titleText, outcome: "success", text: resultText, changes });
  return { state: next, title: titleText, result: resultText, success: true, changes };
}

function appendEvent(state, event) {
  const entry = {
    id: `${Date.now()}-${event.storyId ?? "system"}-${event.choiceId ?? "event"}-${state.revision}`,
    at: new Date().toISOString(),
    ...event
  };
  state.events = [entry, ...(state.events ?? [])].slice(0, 250);
  state.flags["__events"] = state.events;
}

function syncEquipment(state) {
  state.flags["__equipment"] = { ...(state.equipment ?? {}) };
}

function advanceRevision(state) {
  state.revision = Number(state.revision ?? 0) + 1;
  state.flags["__revision"] = state.revision;
}

function title(value) {
  return String(value ?? "").split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}
