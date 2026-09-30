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
const call = (repo, method, path, random = () => 0.9) => handle({ method, path, userId: "u1" }, { repo, random });

test("POST /api/player creates once and is idempotent", async () => {
  const repo = fakeRepo();
  const first = await call(repo, "POST", "/api/player");
  assert.equal(first.status, 201);
  assert.equal(first.body.playerId, "u1");
  const again = await call(repo, "POST", "/api/player");
  assert.equal(again.status, 200);
  assert.equal(repo.players.size, 1);
});

test("choosing a branch resolves on the server and persists the whole state", async () => {
  const repo = fakeRepo();
  const res = await call(repo, "POST", "/api/storylets/bell-under-water/branches/descend/choose");
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const saved = repo.players.get("u1");
  assert.equal(saved.locationId, "hollow-archive");
  assert.equal(saved.items["black-sand"], 1);
  assert.ok(saved.menaces && saved.unlockedLocations, "menaces and unlocked locations are part of the saved state");
});

test("rule violations are refused with 409 and nothing is saved", async () => {
  const repo = fakeRepo();
  await call(repo, "GET", "/api/player");
  const before = structuredClone(repo.players.get("u1"));
  const res = await call(repo, "POST", "/api/storylets/borrowed-face/branches/wear/choose");
  assert.equal(res.status, 409);
  assert.deepEqual(repo.players.get("u1"), before);
});

test("location, storylets, journal, world and reset routes answer", async () => {
  const repo = fakeRepo({ "city-mood": 2 });
  const location = await call(repo, "GET", "/api/location");
  assert.ok(location.body.location.name);
  assert.ok(Array.isArray(location.body.stories));
  assert.ok(Array.isArray((await call(repo, "GET", "/api/storylets")).body));
  assert.ok(Array.isArray((await call(repo, "GET", "/api/journal")).body.journal));
  assert.equal((await call(repo, "GET", "/api/world")).body.worldQualities["city-mood"], 2);
  await call(repo, "POST", "/api/storylets/cartographer-at-dusk/branches/trade/choose");
  assert.equal((await call(repo, "POST", "/api/reset")).body.locationId, "lantern-quay");
  assert.equal((await call(repo, "GET", "/api/nope")).status, 404);
});

test("travel changes location only when the destination is unlocked", async () => {
  const repo = fakeRepo();
  const moved = await call(repo, "POST", "/api/travel/velvet-market");
  assert.equal(moved.status, 200);
  assert.equal(moved.body.locationId, "velvet-market");
  assert.match(moved.body.journal[0], /velvet market/);

  const locked = await call(repo, "POST", "/api/travel/clockwork-gardens");
  assert.equal(locked.status, 409);
  assert.equal(locked.body.state.locationId, "velvet-market");
});



test("system actions are server-authoritative and revision-checked", async () => {
  const repo = fakeRepo();
  await call(repo, "GET", "/api/player");
  const before = repo.players.get("u1");
  before.echoes = 30;
  repo.players.set("u1", structuredClone(before));

  const buy = await handle(
    {
      method: "POST",
      path: "/api/action/buy",
      userId: "u1",
      body: { itemId: "dock-coat", expectedRevision: before.revision }
    },
    { repo, random: () => 0.9 }
  );
  assert.equal(buy.status, 200);
  assert.equal(buy.body.state.items["dock-coat"], 1);
  assert.equal(buy.body.state.echoes, 12);

  const stale = await handle(
    {
      method: "POST",
      path: "/api/action/buy",
      userId: "u1",
      body: { itemId: "bandage-roll", expectedRevision: before.revision }
    },
    { repo, random: () => 0.9 }
  );
  assert.equal(stale.status, 409);
  assert.equal(stale.body.state.items["bandage-roll"], undefined);
});

test("route normalisation accepts Supabase and local prefixes", () => {
  assert.equal(normalise("/api/player/"), "/api/player");
  assert.equal(normalise("/functions/v1/api/player"), "/api/player");
});

test("the function ships the same game modules the browser runs", async () => {
  for (const name of SHARED_MODULES) {
    const browser = stripVersions(await readFile(new URL(`../src/game/${name}`, import.meta.url), "utf8"));
    const server = await readFile(new URL(`../supabase/functions/api/game/${name}`, import.meta.url), "utf8");
    assert.equal(server, browser, `${name} drifted: run npm run sync:engine`);
  }
});

test("the game falls back to offline play if the backend is unreachable", async () => {
  const offline = { getState: async () => ({ offline: true }) };
  const service = new FallbackGameService({ getState: async () => { throw new Error("down"); } }, () => offline);
  assert.deepEqual(await service.getState(), { offline: true });
  assert.equal(service.mode, "offline");
});

test("once online, later errors surface instead of switching saves", async () => {
  let calls = 0;
  const online = { getState: async () => { if (calls++) throw new Error("blip"); return { online: true }; } };
  const service = new FallbackGameService(online, () => assert.fail("must not switch to offline"));
  assert.deepEqual(await service.getState(), { online: true });
  await assert.rejects(service.getState(), /blip/);
  assert.equal(service.mode, "online");
});
