import { requirementsMet } from "./rules.js";

export function eligibleCards(state, deck, cards, context = {}) {
  return (deck.cardIds ?? [])
    .map((id) => ({ id, ...cards[id] }))
    .filter((card) => card.title && !state.hand?.includes(card.id) && requirementsMet(state, card.requirements, context) && requirementsMet(state, card.unlock_conditions, context));
}

// Relative frequency tiers; standard is represented internally by weight 10.
// The rare tiers are configurable estimates, rather than falsely advertised as wiki-exact.
export const FREQUENCY = Object.freeze({
  very_rare: 0.05, rare: 0.2, infrequent: 0.8, standard: 1,
  frequent: 2, abundant: 5, ubiquitous: 10, unique: 1
});
export const MAX_HAND = 6;
export function cardWeight(card) {
  const tier = FREQUENCY[card.frequency ?? "standard"] ?? 1;
  const conditions = Math.max(1, card.unlock_conditions?.length ?? 1);
  return Math.max(0, Number(card.weight ?? 1)) * 10 * tier * conditions;
}
export function drawWeightedCard(state, deck, cards, random = Math.random, context = {}) {
  if ((state.hand?.length ?? 0) >= MAX_HAND) return null;
  const eligible = eligibleCards(state, deck, cards, context);
  if (!eligible.length) return null;
  const urgent = eligible.filter(card => card.urgency === "high" || card.high_urgency);
  // Urgent legal cards must draw even when authored with weight zero.
  if (urgent.length) return urgent[Math.min(urgent.length - 1, Math.floor(random() * urgent.length))];
  const pool = eligible;
  const totalWeight = pool.reduce((sum, card) => sum + cardWeight(card), 0);
  if (totalWeight <= 0) return null;
  let cursor = random() * totalWeight;
  for (const card of pool) {
    cursor -= cardWeight(card);
    if (cursor < 0) return card;
  }
  return pool.at(-1);
}

export function drawCardToHand(state, deck, cards, random = Math.random, context = {}) {
  if ((state.hand?.length ?? 0) >= MAX_HAND) return null;
  const card = drawWeightedCard(state, deck, cards, random, context);
  if (card) {
    if (!state.hand) state.hand = [];
    state.hand.push(card.id);
  }
  return card;
}

export function discardCard(state, cardId) {
  if (!state.hand) return;
  const index = state.hand.indexOf(cardId);
  if (index !== -1) {
    state.hand.splice(index, 1);
    if (!state.discard) state.discard = [];
    state.discard.push(cardId);
  }
}
