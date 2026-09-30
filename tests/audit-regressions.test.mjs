import test from "node:test";
import assert from "node:assert/strict";
import { effectiveChallenge, resolveChoice } from "../src/game/engine.js";
import { stories } from "../src/game/content.js";
import { initialState, normaliseState } from "../src/game/state.js";
import { handle } from "../supabase/functions/api/handler.js";

const FAIL = () => 0;
const SUCCEED = () => 0.99;

function at(locationId) {
  const state = initialState();
  state.locationId = locationId;
  return state;
}

function fakeRepo(initial = null) {
  let saved = initial ? structuredClone(initial) : null;
  return {
    get state() { return saved; },
    loadPlayer: async () => saved ? structuredClone(saved) : null,
    savePlayer: async (_id, state) => { saved = structuredClone(state); },
    loadWorldQualities: async () => ({})
  };
}

test("story-level challenges are inherited by choices consistently", () => {
  const catalogue = stories["catalogue-the-dark"];
  const catalogueChoice = catalogue.choices.find((choice) => choice.id === "catalogue");
  assert.deepEqual(effectiveChallenge(catalogue, catalogueChoice), { quality: "insight", difficulty: 7 });

  const garden = stories["garden-appointment"];
  const attend = garden.choices.find((choice) => choice.id === "attend");
  assert.deepEqual(effectiveChallenge(garden, attend), { quality: "poise", difficulty: 6 });

  const apologise = garden.choices.find((choice) => choice.id === "apologise");
  assert.equal(effectiveChallenge(garden, apologise), null);
});

test("API exposes inherited challenge definitions instead of claiming no roll", async () => {
  const state = at("hollow-archive");
  const repo = fakeRepo(state);
  const response = await handle(
    { method: "GET", path: "/api/storylets", userId: "u1" },
    { repo, random: SUCCEED }
  );
  const catalogue = response.body.find((story) => story.id === "catalogue-the-dark");
  const choice = catalogue.choices.find((candidate) => candidate.id === "catalogue");
  assert.deepEqual(choice.challenge, { quality: "insight", difficulty: 7 });
});

test("failing Catalogue the Dark never grants its success rewards", () => {
  const state = at("hollow-archive");
  const result = resolveChoice(state, "catalogue-the-dark", "catalogue", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.echoes, state.echoes);
  assert.equal(result.state.items["ink-of-absence"], undefined);
  assert.equal(result.state.menaces.dread, 1);
});

test("failing the Garden Appointment never grants the sun seed or Poise", () => {
  const state = at("clockwork-gardens");
  state.items["tide-cup"] = 1;
  const result = resolveChoice(state, "garden-appointment", "attend", FAIL);
  assert.equal(result.success, false);
  assert.equal(result.state.items["sun-seed"], undefined);
  assert.equal(result.state.qualities.poise, state.qualities.poise);
  assert.equal(result.state.menaces.scandal, 1);
});

test("old Dread quality values migrate into the single menace store", () => {
  const migrated = normaliseState({
    qualities: { nerve: 2, dread: 3 },
    menaces: { dread: 1 }
  });
  assert.equal(migrated.qualities.dread, undefined);
  assert.equal(migrated.menaces.dread, 3);
});

test("a stale revision is rejected with authoritative state", async () => {
  const state = initialState();
  state.revision = 4;
  state.flags.__revision = 4;
  const repo = fakeRepo(state);
  const response = await handle(
    {
      method: "POST",
      path: "/api/storylets/bell-under-water/branches/descend/choose",
      userId: "u1",
      body: { expectedRevision: 3 }
    },
    { repo, random: SUCCEED }
  );
  assert.equal(response.status, 409);
  assert.match(response.body.error, /another tab/i);
  assert.equal(response.body.state.revision, 4);
  assert.equal(repo.state.locationId, "lantern-quay");
});

test("the same mutation revision cannot be submitted twice sequentially", async () => {
  const repo = fakeRepo(initialState());
  const request = {
    method: "POST",
    path: "/api/storylets/bell-under-water/branches/descend/choose",
    userId: "u1",
    body: { expectedRevision: 0 }
  };
  const first = await handle(request, { repo, random: SUCCEED });
  assert.equal(first.status, 200);
  assert.equal(first.body.state.revision, 1);

  const second = await handle(request, { repo, random: SUCCEED });
  assert.equal(second.status, 409);
  assert.equal(second.body.state.revision, 1);
});

test("one-shot Echo rewards cannot be farmed repeatedly", () => {
  const state = at("velvet-market");
  const first = resolveChoice(state, "red-thread", "cut", SUCCEED);
  assert.equal(first.state.echoes, state.echoes + 4);
  const second = resolveChoice(first.state, "red-thread", "cut", SUCCEED);
  assert.match(second.error, /no longer available/i);
  assert.equal(second.state.echoes, first.state.echoes);
});
