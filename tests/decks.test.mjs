import test from "node:test";
import assert from "node:assert/strict";
import { drawWeightedCard, eligibleCards } from "../src/game/decks.js";
import { initialState } from "../src/game/state.js";

const cards = {
  common: { title: "Common", weight: 3, requirements: [] },
  rare: { title: "Rare", weight: 1, requirements: [] },
  gated: {
    title: "Gated",
    weight: 10,
    requirements: [{ type: "world-quality", id: "festival", op: ">=", value: 1 }]
  }
};

const deck = { cardIds: ["common", "rare", "gated"] };

test("opportunity deck filters cards by QBN requirements", () => {
  assert.deepEqual(
    eligibleCards(initialState(), deck, cards).map((card) => card.id),
    ["common", "rare"]
  );
  assert.deepEqual(
    eligibleCards(initialState(), deck, cards, { worldQualities: { festival: 1 } }).map((card) => card.id),
    ["common", "rare", "gated"]
  );
});

test("weighted draw is deterministic under injected randomness", () => {
  const state = initialState();
  assert.equal(drawWeightedCard(state, deck, cards, () => 0).id, "common");
  assert.equal(drawWeightedCard(state, deck, cards, () => 0.99).id, "rare");
});
