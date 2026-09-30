import test from "node:test";
import assert from "node:assert/strict";
import { availableStorylets, beginStorylet, chooseBranch, newCharacter } from "../src/game/engine.js";
import { content } from "./helpers.mjs";

const play = (state, storyletId, branchId, roll) =>
  chooseBranch(content, beginStorylet(content, state, storyletId).state, branchId, () => roll);

test("actions never consume a finite action resource", () => {
  const result = play(newCharacter(content), "bell-under-water", "bell-under-water.listen", 0.9);
  assert.equal(result.state.qualities.echoes, 12);
  assert.equal(result.state.qualities.insight, 3);
});

test("challenge success grants the configured effects and moves area", () => {
  const result = play(newCharacter(content), "bell-under-water", "bell-under-water.descend", 0.9);
  assert.equal(result.outcome.success, true);
  assert.equal(result.state.qualities["black-sand"], 1);
  assert.equal(result.state.areaId, "hollow-archive");
});

test("challenge failure still advances the story", () => {
  const start = { ...newCharacter(content), areaId: "hollow-archive" };
  const result = play(start, "index-of-lost-things", "index-of-lost-things.read", 0);
  assert.equal(result.outcome.success, false);
  assert.equal(result.state.areaId, "hollow-archive");
  assert.match(result.state.journal[0], /failure/);
});

test("storylet requirements hide content until the quality is held", () => {
  const archive = { ...newCharacter(content), areaId: "hollow-archive" };
  const ids = (state) => availableStorylets(content, state).map((s) => s.id);
  assert.ok(!ids(archive).includes("the-locked-stacks"));
  assert.ok(ids({ ...archive, qualities: { ...archive.qualities, "archive-key": 1 } }).includes("the-locked-stacks"));
});

test("branch requirements lock a choice and the engine enforces them", () => {
  const poor = { ...newCharacter(content), areaId: "hollow-archive", qualities: { "archive-key": 1, echoes: 3 } };
  const stacks = availableStorylets(content, poor).find((s) => s.id === "the-locked-stacks");
  const bribe = stacks.branches.find((b) => b.id === "the-locked-stacks.bribe");
  assert.equal(bribe.locked, true);
  assert.deepEqual(bribe.unmet, ["Echoes at least 10"]);
  assert.match(play(poor, "the-locked-stacks", "the-locked-stacks.bribe", 0.5).error, /requirements/);
});

test("negative effects spend a quality and zero levels are removed", () => {
  const rich = { ...newCharacter(content), areaId: "hollow-archive", qualities: { "archive-key": 1, echoes: 10 } };
  const result = play(rich, "the-locked-stacks", "the-locked-stacks.bribe", 0.5);
  assert.equal(result.state.qualities.echoes, undefined);
  assert.equal(result.state.qualities.insight, 2);
});

test("a storylet from another area cannot be begun", () => {
  assert.ok(beginStorylet(content, newCharacter(content), "red-thread").error);
});
