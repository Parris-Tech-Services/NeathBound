import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApi } from "../src/api.mjs";
import { openDatabase } from "../src/db.mjs";

test("API creates a player with unlimited actions and persists branches", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "neathbound-"));
  const api = createApi(openDatabase(path.join(dir, "test.sqlite")));
  const created = await api("POST", "/api/players", { name: "Tester" });
  assert.equal(created.status, 201);
  assert.equal(created.body.name, "Tester");
  const list = await api("GET", `/api/players/${created.body.id}/storylets`);
  assert.equal(list.status, 200);
  assert.equal(list.body.actions, "unlimited");
  const result = await api("POST", `/api/players/${created.body.id}/resolve`, { storyletId: "bell-under-water", branchId: "descend" });
  assert.equal(result.status, 200);
  assert.equal(result.body.player.obols, 20);
  const loaded = await api("GET", `/api/players/${created.body.id}`);
  assert.equal(loaded.body.journal.length, 2);
});
