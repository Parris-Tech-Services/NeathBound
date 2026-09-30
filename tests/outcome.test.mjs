import test from "node:test";
import assert from "node:assert/strict";
import { describeChanges, formatName } from "../src/ui/outcome.js";
import { resolveChoice } from "../src/game/engine.js";
import { initialState } from "../src/game/state.js";

const texts = (before, after) => describeChanges(before, after).map((line) => line.text);

test("item and Echoes changes read like a storylet RPG result", () => {
  const before = { echoes: 12, items: { "salted-map": 1, "black-sand": 4 } };
  const after = { echoes: 20, items: { "salted-map": 1, "tide-cup": 1 } };
  assert.deepEqual(texts(before, after), [
    "You've gained 8 x Echoes (new total 20).",
    "You've lost 4 x Black Sand (new total 0).",
    "You've gained 1 x Tide Cup (new total 1)."
  ]);
});

test("a new quality is an occurrence; changes to existing ones show the new level", () => {
  const lines = describeChanges({ qualities: { nerve: 2, poise: 3 } }, { qualities: { nerve: 3, poise: 1, "tracking-the-courier": 1 } });
  assert.deepEqual(lines.map((l) => [l.kind, l.text]), [
    ["gain", "Your 'Nerve' quality has increased by 1 to 3."],
    ["loss", "Your 'Poise' quality has dropped by 2 to 1."],
    ["occurrence", "An occurrence! Your 'Tracking The Courier' quality is now 1!"]
  ]);
});

test("moving, unlocking areas, menaces and acquaintances are all reported", () => {
  const before = { locationId: "velvet-market", unlockedLocations: ["velvet-market"], menaces: { suspicion: 0 }, acquaintances: [] };
  const after = { locationId: "clockwork-gardens", unlockedLocations: ["velvet-market", "clockwork-gardens"], menaces: { suspicion: 1 }, acquaintances: ["the-tailor"] };
  assert.deepEqual(texts(before, after), [
    "Your 'Suspicion' menace has increased to 1.",
    "A new area is open to you: The Clockwork Gardens.",
    "You have made an acquaintance: The Tailor.",
    "You have moved to a new area: The Clockwork Gardens."
  ]);
});

test("no change produces no lines", () => {
  const state = initialState();
  assert.deepEqual(describeChanges(state, structuredClone(state)), []);
});

test("a real engine outcome produces the expected lines", () => {
  const before = initialState();
  const { state: after } = resolveChoice(before, "bell-under-water", "descend", () => 0.9);
  const lines = texts(before, after);
  assert.ok(lines.includes("You've gained 1 x Black Sand (new total 1)."), lines.join(" | "));
  assert.ok(lines.some((line) => line.startsWith("You have moved to a new area: ")), lines.join(" | "));
});

test("names are title-cased from ids", () => {
  assert.equal(formatName("black-sand"), "Black Sand");
});
