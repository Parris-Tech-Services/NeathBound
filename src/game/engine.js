import { locations, stories } from "./content.js?v=20260930-12";
import { bazaarStock, itemDefinition } from "./items.js?v=20260930-12";
import { cloneState, initialState, syncDerivedState } from "./state.js?v=20260930-12";
import { applyEffects, requirementsMet, resolveChallenge } from "./rules.js?v=20260930-12";

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
const requirementsFor = (entry) => asRequirements(entry?.requirements);

export function effectiveChallenge(story, choice) {
  if (!story || !choice || choice.challenge === false || choice.challenge === null) return null;
  return choice.challenge ?? story.challenge ?? null;
}

export function storyAvailable(state, storyId, context = {}) {
  const story = stories[storyId];
  if (!story || !currentLocation(state).stories.includes(storyId)) return false;
  if (story.once && state.flags?.[`story-complete:${storyId}`]) return false;
  if (story.tags?.includes("opportunity") && !state.hand?.includes(storyId)) return false;
  return requirementsMet(state, requirementsFor(story), context);
}

export function canPlay(state, story, context = {}) {
  return Boolean(story && requirementsMet(state, requirementsFor(story), context));
}

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
  const before = cloneState(state);
  const next = cloneState(state);
  const story = stories[storyId];

  if (!storyAvailable(next, storyId, context)) return { state: next, error: "That story is no longer available. Your current state has been refreshed." };
  const choice = story.choices.find((candidate) => candidate.id === choiceId);
  if (!choice || !requirementsMet(next, requirementsFor(choice), context)) return { state: next, error: "That choice is no longer available. Your current state has been refreshed." };

  const challenge = effectiveChallenge(story, choice);
  const check = resolveChallenge(next, challenge, random);
  let success = check.success;
  let usedMomentum = false;
  if (challenge && !success && Number(next.momentum ?? 0) > 0 && check.total + 3 >= challenge.difficulty) {
    next.momentum -= 1;
    check.total += 3;
    check.success = success = true;
    usedMomentum = true;
  }

  const resultText = success ? choice.success : (choice.failure ?? "The city refuses to explain itself.");
  applyEffects(next, success ? (choice.successEffects ?? []) : (choice.failureEffects ?? []));
  next.flags[`${storyId}:${choiceId}`] = true;
  if (story.once) next.flags[`story-complete:${storyId}`] = true;
  if (story.tags?.includes("opportunity")) {
    next.hand = (next.hand ?? []).filter((id) => id !== storyId);
    if (!next.discard.includes(storyId)) next.discard.push(storyId);
  }
  advanceRevision(next);

  const changes = describeChanges(before, next);
  const challengeText = challenge ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty}${usedMomentum ? " with momentum" : ""})` : "";
  const journalText = `${story.title}: ${resultText}${challengeText}`;
  next.journal = [journalText, ...next.journal].slice(0, 100);
  appendEvent(next, { storyId, choiceId, title: story.title, outcome: success ? "success" : "failure", text: resultText, changes });
  syncDerivedState(next);

  return { state: next, storyId, choiceId, title: story.title, result: resultText, success, roll: check.roll, total: check.total, challenge, usedMomentum, baseQuality: check.baseQuality, bonus: check.bonus, changes };
}

export function buyItem(state, itemId) {
  const next = cloneState(state);
  if (!bazaarStock.includes(itemId)) return { state: next, error: "That item is not sold here." };
  const item = itemDefinition(itemId);
  const price = Number(item.price ?? 0);
  if (Number(next.echoes ?? 0) < price) return { state: next, error: `You need ${price} Echoes to buy ${item.name}.` };
  const before = cloneState(next);
  next.echoes -= price;
  next.items[itemId] = Number(next.items[itemId] ?? 0) + 1;
  advanceRevision(next);
  return transaction(before, next, `Bought ${item.name}`, `You purchase ${item.name} for ${price} Echoes.`);
}

export function sellItem(state, itemId) {
  const next = cloneState(state);
  const item = itemDefinition(itemId);
  const quantity = Number(next.items?.[itemId] ?? 0);
  const value = Number(item.sellValue ?? 0);
  if (quantity < 1) return { state: next, error: `You do not have ${item.name}.` };
  if (value <= 0) return { state: next, error: `${item.name} cannot be sold.` };
  const before = cloneState(next);
  next.items[itemId] = quantity - 1;
  if (next.items[itemId] <= 0) delete next.items[itemId];
  for (const [slot, equippedId] of Object.entries(next.equipment ?? {})) if (equippedId === itemId && !next.items[itemId]) next.equipment[slot] = null;
  next.echoes += value;
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
  advanceRevision(next);
  const equipped = Boolean(next.equipment[item.equipSlot]);
  return transaction(before, next, equipped ? `Equipped ${item.name}` : `Unequipped ${item.name}`, equipped ? `${item.name} is now equipped.` : `${item.name} has been removed.`);
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

export function drawOpportunity(state, random = Math.random, context = {}) {
  const next = cloneState(state);
  if ((next.hand ?? []).length >= 3) return { state: next, error: "Your opportunity hand is full." };
  const candidates = currentLocation(next).stories
    .filter((id) => stories[id]?.tags?.includes("opportunity"))
    .filter((id) => !next.hand.includes(id))
    .filter((id) => requirementsMet(next, requirementsFor(stories[id]), context));
  let pool = candidates.filter((id) => !next.discard.includes(id));
  if (!pool.length) {
    next.discard = next.discard.filter((id) => !candidates.includes(id));
    pool = candidates;
  }
  if (!pool.length) return { state: next, error: "There are no eligible opportunities here right now." };
  const before = cloneState(next);
  const picked = pool[Math.floor(random() * pool.length)];
  next.hand.push(picked);
  next.lastDraw = picked;
  advanceRevision(next);
  return transaction(before, next, "Opportunity drawn", `${stories[picked].title} has entered your hand.`);
}

export function discardOpportunity(state, storyId) {
  const next = cloneState(state);
  if (!next.hand.includes(storyId)) return { state: next, error: "That opportunity is not in your hand." };
  const before = cloneState(next);
  next.hand = next.hand.filter((id) => id !== storyId);
  if (!next.discard.includes(storyId)) next.discard.push(storyId);
  advanceRevision(next);
  return transaction(before, next, "Opportunity discarded", `${stories[storyId]?.title ?? "The card"} has been discarded.`);
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
  numericRoot("momentum", "Momentum");
  numericRoot("echoes", "Echoes");
  for (const key of new Set([...Object.keys(before.qualities ?? {}), ...Object.keys(after.qualities ?? {})])) numeric("qualities", key, title(key));
  for (const key of new Set([...Object.keys(before.menaces ?? {}), ...Object.keys(after.menaces ?? {})])) numeric("menaces", key, title(key));
  for (const key of new Set([...Object.keys(before.items ?? {}), ...Object.keys(after.items ?? {})])) numeric("items", key, title(key));
  if (before.locationId !== after.locationId) changes.push({ type: "location", id: after.locationId, label: "Location", before: before.locationId, after: after.locationId, message: `You are now at ${locations[after.locationId]?.name ?? title(after.locationId)}.` });
  return changes;

  function numericRoot(key, label) {
    const from = Number(before[key] ?? 0);
    const to = Number(after[key] ?? 0);
    if (to !== from) changes.push({ type: key, id: key, label, before: from, after: to, delta: to - from });
  }
}

function transaction(before, next, titleText, resultText) {
  const changes = describeChanges(before, next);
  appendEvent(next, { storyId: null, choiceId: null, title: titleText, outcome: "success", text: resultText, changes });
  syncDerivedState(next);
  return { state: next, title: titleText, result: resultText, success: true, changes };
}

function appendEvent(state, event) {
  state.events = [{
    id: `${Date.now()}-${event.storyId ?? "system"}-${event.choiceId ?? "event"}-${state.revision}`,
    at: new Date().toISOString(),
    ...event
  }, ...(state.events ?? [])].slice(0, 250);
}

function advanceRevision(state) {
  state.revision = Number(state.revision ?? 0) + 1;
}

function title(value) {
  return String(value ?? "").split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}
