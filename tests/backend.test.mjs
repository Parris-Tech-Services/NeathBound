import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { handle, normalise } from "../supabase/functions/api/handler.js";
import { SHARED_MODULES, stripVersions } from "../scripts/sync-engine.mjs";
import { FallbackGameService } from "../src/services/index.js";

function fakeRepo(world = {}) {
  const players = new Map();
  return {
    players,
    loadPlayer: async (id) => (players.has(id) ? structuredClone(players.get(id)) : null),
    savePlayer: async (id, state) => players.set(id, structuredClone(state)),
    loadWorldQualities: async () => world
  };
}

const call = (repo, method, path, { random = () => 0.9, body = {} } = {}) =>
  handle({ method, path, userId: "u1", body }, { repo, random });

test("POST /api/player creates once and is idempotent", async () => {
  const repo = fakeRepo();
  const first = await call(repo, "POST", "/api/player");
  assert.equal(first.status, 201);
  assert.equal(first.body.playerId, "u1");
  const again = await call(repo, "POST", "/api/player");
  assert.equal(again.status, 200);
  assert.equal(repo.players.size, 1);
});

test("choosing a branch resolves on the server and persists detailed state", async () => {
  const repo = fakeRepo();
  const res = await call(repo, "POST", "/api/storylets/bell-under-water/branches/descend/choose", {
    body: { expectedRevision: 0 }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.changes.length >= 1);
  const saved = repo.players.get("u1");
  assert.equal(saved.locationId, "hollow-archive");
  assert.equal(saved.items["black-sand"], 1);
  assert.equal(saved.items["brass-key"], undefined);
  assert.equal(saved.revision, 1);
});

test("rule refusals are normal game responses rather than browser-console 409s", async () => {
  const repo = fakeRepo();
  await call(repo, "GET", "/api/player");
  const before = structuredClone(repo.players.get("u1"));
  const res = await call(repo, "POST", "/api/storylets/borrowed-face/branches/wear/choose", {
    body: { expectedRevision: 0 }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.rejected, true);
  assert.match(res.body.error, /no longer available/i);
  assert.deepEqual(repo.players.get("u1"), before);
});

test("stale revisions return refreshed authoritative state without changing it", async () => {
  const repo = fakeRepo();
  await call(repo, "GET", "/api/player");
  const res = await call(repo, "POST", "/api/travel/velvet-market", {
    body: { expectedRevision: 99 }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.rejected, true);
  assert.match(res.body.error, /changed before/i);
  assert.equal(res.body.state.locationId, "lantern-quay");
});

test("public story projection exposes inherited challenges and deliberate no-checks", async () => {
  const repo = fakeRepo();
  let state = (await call(repo, "GET", "/api/player")).body;
  state.locationId = "hollow-archive";
  repo.players.set("u1", state);

  const stories = (await call(repo, "GET", "/api/storylets")).body;
  const catalogue = stories.find((story) => story.id === "catalogue-the-dark");
  assert.deepEqual(catalogue.choices.find((choice) => choice.id === "catalogue").challenge, { quality: "insight", difficulty: 7 });
  assert.equal(catalogue.choices.find((choice) => choice.id === "close-shelf").challenge, null);
});

test("travel validates unlocked destinations and persists revision", async () => {
  const repo = fakeRepo();
  const moved = await call(repo, "POST", "/api/travel/velvet-market", {
    body: { expectedRevision: 0 }
  });
  assert.equal(moved.status, 200);
  assert.equal(moved.body.state.locationId, "velvet-market");
  assert.equal(moved.body.state.revision, 1);

  const locked = await call(repo, "POST", "/api/travel/clockwork-gardens", {
    body: { expectedRevision: 1 }
  });
  assert.equal(locked.status, 200);
  assert.equal(locked.body.rejected, true);
  assert.equal(locked.body.state.locationId, "velvet-market");
});

test("bazaar, equipment and menace recovery routes are server-authoritative", async () => {
  const repo = fakeRepo();
  let state = (await call(repo, "GET", "/api/player")).body;
  state.echoes = 50;
  state.menaces.dread = 4;
  repo.players.set("u1", state);

  let res = await call(repo, "POST", "/api/bazaar/buy/archive-lenses", { body: { expectedRevision: 0 } });
  assert.equal(res.body.state.items["archive-lenses"], 1);
  assert.equal(res.body.state.echoes, 25);

  res = await call(repo, "POST", "/api/equipment/toggle/archive-lenses", { body: { expectedRevision: 1 } });
  assert.equal(res.body.state.equipment.tool, "archive-lenses");

  res = await call(repo, "POST", "/api/menaces/dread/recover", { body: { expectedRevision: 2 } });
  assert.equal(res.body.state.menaces.dread, 2);
  assert.equal(res.body.state.echoes, 22);
});

test("opportunity draw and discard persist the hand", async () => {
  const repo = fakeRepo();
  let state = (await call(repo, "GET", "/api/player")).body;
  state.locationId = "velvet-market";
  state.hand = [];
  state.discard = [];
  state.flags["__hand"] = [];
  state.flags["__discard"] = [];
  repo.players.set("u1", state);

  let res = await call(repo, "POST", "/api/opportunities/draw", {
    random: () => 0,
    body: { expectedRevision: 0 }
  });
  assert.equal(res.body.state.hand.length, 1);
  const card = res.body.state.hand[0];

  res = await call(repo, "POST", `/api/opportunities/discard/${card}`, {
    body: { expectedRevision: 1 }
  });
  assert.equal(res.body.state.hand.length, 0);
  assert.ok(res.body.state.discard.includes(card));
});

test("route normalisation accepts Supabase and local prefixes", () => {
  assert.equal(normalise("/api/player/"), "/api/player");
  assert.equal(normalise("/functions/v1/api/player"), "/api/player");
});

test("the Edge Function ships exactly the same game modules as the browser", async () => {
  for (const name of SHARED_MODULES) {
    const browser = stripVersions(await readFile(new URL(`../src/game/${name}`, import.meta.url), "utf8"));
    const server = await readFile(new URL(`../supabase/functions/api/game/${name}`, import.meta.url), "utf8");
    assert.equal(server, browser, `${name} drifted: run npm run sync:engine`);
  }
});

test("the game falls back to offline play if the backend is unreachable", async () => {
  const offline = { getState: async () => ({ offline: true }) };
  const service = new FallbackGameService(
    { getState: async () => { throw new Error("down"); } },
    () => offline
  );
  assert.deepEqual(await service.getState(), { offline: true });
  assert.equal(service.mode, "offline");
});

test("once online, later errors surface instead of silently switching saves", async () => {
  let calls = 0;
  const online = { getState: async () => { if (calls++) throw new Error("blip"); return { online: true }; } };
  const service = new FallbackGameService(online, () => assert.fail("must not switch to offline"));
  assert.deepEqual(await service.getState(), { online: true });
  await assert.rejects(service.getState(), /blip/);
  assert.equal(service.mode, "online");
});
