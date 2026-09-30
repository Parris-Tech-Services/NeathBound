import { requirementsMet } from "./rules.js?v=20260930-22";

export function eligibleCards(state, deck, cards, context = {}) {
  return (deck.cardIds ?? [])
    .map((id) => ({ id, ...cards[id] }))
    .filter((card) => card.title && requirementsMet(state, card.requirements, context));
}

export function drawWeightedCard(state, deck, cards, random = Math.random, context = {}) {
  const eligible = eligibleCards(state, deck, cards, context);
  if (!eligible.length) return null;

  const totalWeight = eligible.reduce((sum, card) => sum + Math.max(0, Number(card.weight ?? 1)), 0);
  if (totalWeight <= 0) return eligible[0];

  let cursor = random() * totalWeight;
  for (const card of eligible) {
    cursor -= Math.max(0, Number(card.weight ?? 1));
    if (cursor < 0) return card;
  }
  return eligible.at(-1);
}

export function drawCardToHand(state, deck, cards, random = Math.random, context = {}) {
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
