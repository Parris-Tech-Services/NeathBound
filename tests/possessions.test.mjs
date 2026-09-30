import test from "node:test";
import assert from "node:assert/strict";
import { locations, stories } from "../src/game/content.js";
import { availableStories, choiceAvailable, resolveChoice, storyAvailable } from "../src/game/engine.js";
import { initialState } from "../src/game/state.js";

const SUCCEED = () => 0.99;
const FAIL = () => 0;

function stateWith(locationId, items = {}, flags = {}) {
  const state = initialState();
  state.locationId = locationId;
  state.items = { ...state.items, ...items };
  state.flags = { ...state.flags, ...flags };
  return state;
}

function requirementItems(requirements) {
  if (Array.isArray(requirements)) return requirements.filter((r) => r.type === "item").map((r) => r.id);
  return requirements?.item ? [requirements.item] : [];
}

function awardedItems(choice) {
  const effects = [...(choice.successEffects ?? []), ...(choice.failureEffects ?? [])];
  const awarded = effects.filter((e) => e.type === "item" && Number(e.amount) > 0).map((e) => e.id);
  if (choice.reward?.item) awarded.push(choice.reward.item);
  return awarded;
}

test("every possession the game hands out is used by some storylet", () => {
  const awarded = new Set(Object.keys(initialState().items));
  const used = new Set();
  for (const story of Object.values(stories)) {
    requirementItems(story.requirements).forEach((id) => used.add(id));
    for (const choice of story.choices) {
      awardedItems(choice).forEach((id) => awarded.add(id));
      requirementItems(choice.requirements).forEach((id) => used.add(id));
    }
  }
  const unused = [...awarded].filter((id) => !used.has(id));
  assert.deepEqual(unused, [], `items with no storylet that uses them: ${unused.join(", ")}`);
});

test("every item a storylet requires can be obtained somewhere", () => {
  const obtainable = new Set(Object.keys(initialState().items));
  for (const story of Object.values(stories)) story.choices.forEach((c) => awardedItems(c).forEach((id) => obtainable.add(id)));
  for (const [storyId, story] of Object.entries(stories)) {
    for (const id of requirementItems(story.requirements)) assert.ok(obtainable.has(id), `${storyId} requires unobtainable ${id}`);
  }
});

test("item storylets stay hidden until the possession is held", () => {
  const empty = stateWith("velvet-market");
  assert.equal(storyAvailable(empty, "the-sand-reader"), false);
  assert.equal(storyAvailable(stateWith("velvet-market", { "black-sand": 1 }), "the-sand-reader"), true);
});

test("the salted map reveals the route to the gardens once", () => {
  const start = initialState();
  assert.ok(availableStories(start).some((story) => story.id === "salt-on-the-map"));
  const { state } = resolveChoice(start, "salt-on-the-map", "soak", SUCCEED);
  assert.equal(state.locationId, "clockwork-gardens");
  assert.ok(state.unlockedLocations.includes("clockwork-gardens"), "the gardens become a travel destination");
  assert.equal(state.items["salted-map"], 1, "the starting map is kept");
  state.locationId = "lantern-quay";
  assert.equal(storyAvailable(state, "salt-on-the-map"), false);
});

test("spending a possession consumes it on success and on failure", () => {
  const start = stateWith("velvet-market", { "black-sand": 2 });
  const win = resolveChoice(start, "the-sand-reader", "reading", SUCCEED);
  assert.equal(win.success, true);
  assert.equal(win.state.items["black-sand"], 1);
  assert.equal(win.state.qualities.insight, start.qualities.insight + 1);
  const loss = resolveChoice(start, "the-sand-reader", "reading", FAIL);
  assert.equal(loss.success, false);
  assert.equal(loss.state.items["black-sand"], 1);
});

test("a failed attempt at the locked stacks keeps the key for another try", () => {
  const start = stateWith("hollow-archive", { "archive-key": 1 });
  const loss = resolveChoice(start, "the-locked-stacks", "unlock", FAIL);
  assert.equal(loss.state.items["archive-key"], 1);
  const win = resolveChoice(start, "the-locked-stacks", "unlock", SUCCEED);
  assert.equal(win.state.items["archive-key"], undefined);
  assert.equal(win.state.flags["read-the-debt-ledgers"], true);
});

test("stitching the page needs the silver thimble and spends both", () => {
  const withoutThimble = stateWith("hollow-archive", { "unfinished-page": 1 });
  assert.match(resolveChoice(withoutThimble, "finish-the-page", "stitch-page", SUCCEED).error, /no longer available/);
  const { state } = resolveChoice(stateWith("hollow-archive", { "unfinished-page": 1, "silver-thimble": 1 }), "finish-the-page", "stitch-page", SUCCEED);
  assert.equal(state.items["unfinished-page"], undefined);
  assert.equal(state.items["silver-thimble"], undefined);
  assert.equal(state.flags["bound-into-the-index"], true);
});

test("the sun seed grows a dawn whose morning must be returned", () => {
  let state = stateWith("clockwork-gardens", { "sun-seed": 1 });
  assert.equal(storyAvailable(state, "the-seedling-dawn"), false);
  state = resolveChoice(state, "plant-the-sun-seed", "plant", SUCCEED).state;
  assert.equal(state.items["sun-seed"], undefined);
  assert.equal(storyAvailable(state, "the-seedling-dawn"), true);

  state.items["sun-seed"] = 1;
  assert.equal(choiceAvailable(state, "plant-the-sun-seed", "plant"), false, "only one seed can be planted");
  assert.equal(choiceAvailable(state, "plant-the-sun-seed", "swallow"), true, "spare seeds are still usable");
  delete state.items["sun-seed"];

  state = resolveChoice(state, "the-seedling-dawn", "harvest", SUCCEED).state;
  assert.equal(state.items["small-sun"], 1);

  state.locationId = "lantern-quay";
  assert.equal(storyAvailable(state, "return-the-darkness"), true);
  state = resolveChoice(state, "return-the-darkness", "gather", SUCCEED).state;
  assert.equal(state.items["small-sun"], undefined);
  assert.equal(state.flags["kept-the-sun-promise"], true);
  assert.equal(state.locationId, "clockwork-gardens");
});

test("the memory can only be gifted after keeping the flower's appointment", () => {
  const start = stateWith("clockwork-gardens", { "bright-memory": 1 });
  assert.match(resolveChoice(start, "the-memory-graft", "gift-to-flower", SUCCEED).error, /no longer available/);
  const kept = stateWith("clockwork-gardens", { "bright-memory": 1 }, { "garden-appointment:attend": true });
  const { state } = resolveChoice(kept, "the-memory-graft", "gift-to-flower", SUCCEED);
  assert.equal(state.items["bright-memory"], undefined);
  assert.equal(state.qualities.poise, kept.qualities.poise + 2);
});

const payoffs = [
  { story: "the-cartographer-returns", location: "lantern-quay", flag: "map-route-known", once: "cartographer-reckoned", choice: "describe-route" },
  { story: "the-debt-collector", location: "velvet-market", flag: "read-the-debt-ledgers", once: "collector-answered", choice: "sell-secrets" },
  { story: "the-gardeners-thanks", location: "clockwork-gardens", flag: "kept-the-sun-promise", once: "gardener-thanked", choice: "ask-work" }
];

for (const payoff of payoffs) {
  test(`${payoff.story} reacts to ${payoff.flag} and then retires`, () => {
    assert.equal(storyAvailable(stateWith(payoff.location), payoff.story), false);
    const primed = stateWith(payoff.location, {}, { [payoff.flag]: true });
    assert.equal(storyAvailable(primed, payoff.story), true);
    for (const random of [SUCCEED, FAIL]) {
      const { state, error } = resolveChoice(primed, payoff.story, payoff.choice, random);
      assert.equal(error, undefined);
      assert.equal(state.flags[payoff.once], true);
      assert.equal(storyAvailable(state, payoff.story), false, "payoff plays once, win or lose");
    }
  });
}

test("the debt collector's charity needs echoes to spend", () => {
  const broke = stateWith("velvet-market", {}, { "read-the-debt-ledgers": true });
  broke.echoes = 4;
  assert.equal(choiceAvailable(broke, "the-debt-collector", "settle-stranger"), false);
  broke.echoes = 5;
  const { state } = resolveChoice(broke, "the-debt-collector", "settle-stranger", SUCCEED);
  assert.equal(state.echoes, 0);
});

test("the full salted-map arc ends with the cartographer", () => {
  let state = resolveChoice(initialState(), "salt-on-the-map", "soak", SUCCEED).state;
  state.locationId = "lantern-quay";
  assert.equal(storyAvailable(state, "the-cartographer-returns"), true);
  state = resolveChoice(state, "the-cartographer-returns", "give-map", SUCCEED).state;
  assert.equal(state.items["salted-map"], undefined);
  assert.equal(storyAvailable(state, "the-cartographer-returns"), false);
});

test("being bound into the index opens a repeatable archive storylet", () => {
  const indexed = stateWith("hollow-archive", {}, { "bound-into-the-index": true });
  const once = resolveChoice(indexed, "an-entry-in-the-index", "be-borrowed", SUCCEED).state;
  assert.equal(storyAvailable(once, "an-entry-in-the-index"), true);
});

test("every new possession storylet is listed at exactly one location", () => {
  const ids = ["salt-on-the-map", "the-sand-reader", "the-locked-stacks", "finish-the-page", "return-the-darkness", "plant-the-sun-seed", "the-seedling-dawn", "the-memory-graft", "unwritten-ink", "the-cartographer-returns", "the-debt-collector", "an-entry-in-the-index", "the-gardeners-thanks", "the-margin-note", "survey-the-stone-sky", "the-lamp-that-fell-upward", "the-far-crack", "the-submerged-door", "the-loose-end"];
  for (const id of ids) {
    const homes = Object.values(locations).filter((location) => location.stories.includes(id));
    assert.equal(homes.length, 1, `${id} should appear at exactly one location`);
  }
});

test("tea for the tide raises dread as a menace, not a quality", () => {
  const { state } = resolveChoice(initialState(), "tea-for-the-tide", "drink", FAIL);
  assert.equal(state.menaces.dread, 1);
  assert.equal(state.qualities.dread, undefined);
});

test("reading your own index entry leads up to the glass observatory", () => {
  let state = stateWith("hollow-archive", {}, { "bound-into-the-index": true });
  assert.equal(storyAvailable(state, "the-margin-note"), false);
  state = resolveChoice(state, "an-entry-in-the-index", "look-yourself-up", SUCCEED).state;
  assert.equal(storyAvailable(state, "the-margin-note"), true);
  state = resolveChoice(state, "the-margin-note", "follow-upward", SUCCEED).state;
  assert.equal(state.locationId, "glass-observatory");
  assert.ok(state.unlockedLocations.includes("glass-observatory"));
});

test("the far crack answers once, and the small sun can signal the surface", () => {
  let state = stateWith("glass-observatory", { "small-sun": 1 });
  assert.equal(storyAvailable(state, "the-far-crack"), false);
  state = resolveChoice(state, "survey-the-stone-sky", "take-the-lens", SUCCEED).state;
  assert.equal(storyAvailable(state, "the-far-crack"), true);
  state = resolveChoice(state, "the-far-crack", "signal", SUCCEED).state;
  assert.equal(state.items["small-sun"], undefined);
  assert.equal(state.flags["signalled-the-surface"], true);
  assert.equal(storyAvailable(state, "the-far-crack"), false);
});

test("every location a storylet can send the player to is reachable by travel afterwards", () => {
  const start = new Set(initialState().unlockedLocations);
  const unlocked = new Set(start);
  for (const story of Object.values(stories)) {
    for (const choice of story.choices) {
      for (const effect of [...(choice.successEffects ?? []), ...(choice.failureEffects ?? [])]) {
        if (effect.type === "unlock-location") unlocked.add(effect.id);
      }
      if (choice.reward?.unlock) unlocked.add(choice.reward.unlock);
    }
  }
  // Menace consequence areas are reached only by a menace reaching 8, never by
  // travel (docs/FALLEN-LONDON-MECHANICS-AND-LINGO.md), so they are exempt.
  for (const [locationId, location] of Object.entries(locations)) {
    if (location.consequenceOf) continue;
    assert.ok(unlocked.has(locationId), `${locationId} can never be unlocked for travel`);
  }
});

test("the brass key goes back to its door only after the bell has been answered", () => {
  const start = initialState();
  assert.equal(storyAvailable(start, "the-submerged-door"), false);
  const descended = resolveChoice(start, "bell-under-water", "descend", SUCCEED).state;
  descended.locationId = "lantern-quay";
  assert.equal(storyAvailable(descended, "the-submerged-door"), true);
  const failed = resolveChoice(descended, "the-submerged-door", "leave-key", FAIL).state;
  assert.equal(failed.items["brass-key"], 1, "a failed attempt keeps the key");
  const { state } = resolveChoice(descended, "the-submerged-door", "leave-key", SUCCEED);
  assert.equal(state.items["brass-key"], undefined);
  assert.equal(state.flags["returned-the-brass-key"], true);
  assert.equal(storyAvailable(state, "the-submerged-door"), false);
});

test("cutting the red thread leaves a loose end that leads somewhere", () => {
  let state = stateWith("velvet-market");
  state = resolveChoice(state, "red-thread", "cut", SUCCEED).state;
  assert.equal(state.items["red-thread-end"], 1);
  assert.equal(storyAvailable(state, "the-loose-end"), true);
  state = resolveChoice(state, "the-loose-end", "tie-finger", SUCCEED).state;
  assert.equal(state.items["red-thread-end"], undefined);
});
