import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { handle, normalise } from "../supabase/functions/api/handler.js";
import { validateContent } from "../src/game/content.js";
import { migrateV1, loadState } from "../src/game/state.js";
import { OfflineGame } from "../src/api/client.js";
import { content, memoryStorage, readContentJson } from "./helpers.mjs";

function fakeDb() {
  const characters = new Map();
  return {
    characters,
    loadContent: async () => content,
    loadCharacter: async (id) => (characters.has(id) ? structuredClone(characters.get(id)) : null),
    saveCharacter: async (id, state) => characters.set(id, structuredClone(state))
  };
}

const call = (db, method, path, body, random = () => 0.9) => handle({ method, path, body }, { db, userId: "u1", random });

test("the API creates a character on first contact and lists storylets", async () => {
  const db = fakeDb();
  const res = await call(db, "GET", "/api/storylet");
  assert.equal(res.status, 200);
  assert.equal(res.body.phase, "Available");
  assert.equal(res.body.character.areaId, "lantern-quay");
  assert.ok(db.characters.has("u1"));
});

test("begin -> choosebranch mirrors the Fallen London flow and persists", async () => {
  const db = fakeDb();
  const begun = await call(db, "POST", "/api/storylet/begin", { storyletId: "bell-under-water" });
  assert.equal(begun.body.phase, "In");
  assert.equal(db.characters.get("u1").currentStoryletId, "bell-under-water");
  const chosen = await call(db, "POST", "/api/storylet/choosebranch", { branchId: "bell-under-water.descend" });
  assert.equal(chosen.status, 200);
  assert.equal(chosen.body.outcome.success, true);
  assert.equal(db.characters.get("u1").qualities["black-sand"], 1);
  assert.equal(chosen.body.phase, "Available");
});

test("the server refuses actions the rules do not allow", async () => {
  const db = fakeDb();
  const res = await call(db, "POST", "/api/storylet/begin", { storyletId: "the-locked-stacks" });
  assert.equal(res.status, 409);
  assert.equal(db.characters.get("u1").currentStoryletId, null);
});

test("goback and reset work and unknown routes 404", async () => {
  const db = fakeDb();
  await call(db, "POST", "/api/storylet/begin", { storyletId: "bell-under-water" });
  assert.equal((await call(db, "POST", "/api/storylet/goback")).body.phase, "Available");
  assert.equal((await call(db, "POST", "/api/character/reset")).body.character.qualities.echoes, 12);
  assert.equal((await call(db, "GET", "/api/nope")).status, 404);
});

test("route normalisation handles Supabase and local path prefixes", () => {
  assert.equal(normalise("/api/storylet/"), "/api/storylet");
  assert.equal(normalise("/functions/v1/api/Storylet/Begin"), "/api/storylet/begin");
});

test("the Edge Function ships the same engine the browser runs", async () => {
  const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
  assert.equal(await read("../supabase/functions/api/engine.js"), await read("../src/game/engine.js"),
    "run `npm run sync:engine` after editing src/game/engine.js");
});

test("content validation catches broken references", async () => {
  const raw = Object.fromEntries(await Promise.all(["world", "qualities", "areas", "storylets"].map(async (n) => [n, await readContentJson(n)])));
  assert.deepEqual(validateContent(raw), []);
  raw.storylets[0].branches[0].success.effects.push({ quality: "no-such-quality", add: 1 });
  assert.ok(validateContent(raw).some((p) => p.includes("no-such-quality")));
});

test("v1 local saves migrate into the quality model", () => {
  const storage = memoryStorage();
  storage.setItem("neathbound.save.v1", JSON.stringify({ locationId: "velvet-market", echoes: 30, qualities: { nerve: 4 }, items: ["archive-key"], journal: ["old"] }));
  const state = loadState(content, storage);
  assert.equal(state.areaId, "velvet-market");
  assert.equal(state.qualities.echoes, 30);
  assert.equal(state.qualities.nerve, 4);
  assert.equal(state.qualities["archive-key"], 1);
  assert.deepEqual(migrateV1(content, {}).areaId, "lantern-quay");
});

test("offline play uses the same engine and saves locally", async () => {
  const storage = memoryStorage();
  const game = new OfflineGame(content, storage);
  await game.begin("cartographer-at-dusk");
  const view = await game.choose("cartographer-at-dusk.trade");
  assert.equal(view.character.areaId, "velvet-market");
  assert.equal(JSON.parse(storage.getItem("neathbound.save.v2")).qualities.echoes, 16);
});
