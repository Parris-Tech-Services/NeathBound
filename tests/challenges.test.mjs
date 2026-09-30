import test from "node:test";
import assert from "node:assert/strict";
import { awardProgress, challengeBand, challengeChance, describeChallenge, levelCost } from "../src/game/rules.js";
import { resolveChoice, travelBlockedReason } from "../src/game/engine.js";
import { menaceAreas, locations } from "../src/game/content.js";
import { initialState as baseInitialState, normaliseState } from "../src/game/state.js";
  function initialState() {
    const s = baseInitialState();
    s.locationId = "lantern-quay";
    s.unlockedLocations = ["lantern-quay", "velvet-market", "hollow-archive"];
    s.items = { "salted-map": 1, "brass-key": 1 };
    return s;
  }

const at = (qualities) => ({ qualities });

test("classic challenges keep their original odds, now reported exactly", () => {
  assert.equal(challengeChance(at({ nerve: 2 }), { quality: "nerve", difficulty: 5 }), 0.8);   // d10+2 >= 5
  assert.equal(challengeChance(at({ nerve: 0 }), { quality: "nerve", difficulty: 12 }), 0);
  assert.equal(challengeChance(at({ nerve: 9 }), { quality: "nerve", difficulty: 5 }), 1);
});

test("broad, narrow and luck follow the Fallen London formulas", () => {
  assert.equal(challengeChance(at({ nerve: 50 }), { quality: "nerve", difficulty: 50, mode: "broad" }), 0.6);
  assert.equal(challengeChance(at({ nerve: 100 }), { quality: "nerve", difficulty: 50, mode: "broad" }), 1);
  assert.equal(challengeChance(at({ nerve: 5 }), { quality: "nerve", difficulty: 5, mode: "narrow" }), 0.5);
  assert.ok(Math.abs(challengeChance(at({ nerve: 7 }), { quality: "nerve", difficulty: 5, mode: "narrow" }) - 0.7) < 1e-9);
  assert.equal(challengeChance(at({ nerve: 0 }), { quality: "nerve", difficulty: 9, mode: "narrow" }), 0.1);
  assert.equal(challengeChance(at({}), { quality: "nerve", difficulty: 1, mode: "luck", chance: 0.3 }), 0.3);
});

test("labels and progress rewards follow the bands", () => {
  assert.deepEqual([challengeBand(1).label, challengeBand(0.9).label, challengeBand(0.6).label, challengeBand(0.35).label, challengeBand(0.05).label],
    ["Straightforward", "Low-risk", "Chancy", "Tough", "Almost impossible"]);
  assert.deepEqual([challengeBand(0.35).success, challengeBand(0.35).failure], [4, 2]);
  const info = describeChallenge(at({ nerve: 2 }), { quality: "nerve", difficulty: 5 });
  assert.equal(`${info.label} ${info.percent}`, "Very modest 80");
});

test("the progress pyramid: reaching level n costs n", () => {
  const state = { qualities: { insight: 2 }, progress: {} };
  assert.deepEqual(awardProgress(state, "insight", 2), { qualityId: "insight", points: 2, levelsGained: 0, level: 2, progress: 2, nextLevelCost: 3 });
  assert.equal(awardProgress(state, "insight", 5).levelsGained, 2); // 2+5 = 7 = 3 (->3) + 4 (->4) + 0
  assert.deepEqual([state.qualities.insight, state.progress.insight], [4, 0]);
  assert.equal(levelCost(200), 70);
});

test("a challenge pays progress on success and on failure", () => {
  const win = resolveChoice(initialState(), "bell-under-water", "descend", () => 0.99);
  const lose = resolveChoice(initialState(), "bell-under-water", "descend", () => 0);
  for (const result of [win, lose]) {
    assert.ok(result.progress.points > 0, "progress is awarded");
    assert.equal(result.label, "Very modest");
    assert.ok(result.changes.some((c) => c.type === "progress" && /Nerve is increasing/.test(c.message)));
  }
  assert.equal(win.progress.points, 2);
  assert.equal(lose.progress.points, 1);
});

test("menace 5 warns; menace 8 sends you to its area, which you cannot travel out of", () => {
  const market = { ...initialState(), locationId: "velvet-market" };
  const play = (suspicion) => resolveChoice({ ...market, menaces: { ...market.menaces, suspicion } }, "market-gossip", "trade-rumour", () => 0.99);

  const warned = play(4);                       // 4 -> 5
  assert.equal(warned.state.locationId, "clockwork-gardens");
  assert.ok(warned.changes.some((c) => c.type === "menace-warning" && /Suspicion is 5/.test(c.message)));

  const taken = play(7);                        // 7 -> 8
  assert.equal(taken.state.locationId, menaceAreas.suspicion);
  assert.ok(taken.changes.some((c) => c.type === "menace-consequence" && /The Holding Vaults/.test(c.message)));
  assert.match(travelBlockedReason(taken.state), /cannot simply leave The Holding Vaults/);
  assert.equal(travelBlockedReason(initialState()), null);
});

test("each consequence area has an escape that lowers the menace and returns you to the quay", () => {
  for (const [menace, areaId] of Object.entries(menaceAreas)) {
    const state = { ...initialState(), locationId: areaId, echoes: 20, menaces: { ...initialState().menaces, [menace]: 8 } };
    const storyId = locations[areaId].stories[0];
    const result = resolveChoice(state, storyId, "pay", () => 0.5);
    assert.equal(result.error, undefined, `${areaId}: ${result.error}`);
    assert.equal(result.state.locationId, "lantern-quay");
    assert.equal(result.state.menaces[menace], 2);
    assert.equal(travelBlockedReason(result.state), null);
  }
});
