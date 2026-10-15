import test from "node:test";
import assert from "node:assert/strict";
import {
  QualityType, isPyramidal, levelToTotalCp, cpToLevel, cpToNextLevel, addCp,
  broadChance, cpAward, resolveChallenge, getEffectiveStat, applyEffect,
  checkMenaceThreshold, sendToPenaltyLocation, regenerateActions, spendActions,
  ACTION_REGEN_MS
} from "../src/game/rules.js";

test("CP levels are triangular until 70 and flat thereafter", () => {
  assert.equal(levelToTotalCp(1), 1);
  assert.equal(levelToTotalCp(50), 1275);
  assert.equal(levelToTotalCp(70), 2485);
  assert.equal(levelToTotalCp(71), 2555);
  assert.equal(levelToTotalCp(72), 2625);
  assert.equal(cpToLevel(2484), 69);
  assert.equal(cpToLevel(2485), 70);
  assert.equal(cpToLevel(2554), 70);
  assert.equal(cpToLevel(2555), 71);
  assert.equal(cpToNextLevel(2485), 70);
  assert.deepEqual(addCp({ id: "nerve", cp: 0, level: 0 }, 99, 2),
    { id: "nerve", cp: 3, level: 2 });
});

test("broad scaler honours equality, clamp, and per-branch variations", () => {
  assert.equal(broadChance(10, 10), 60);
  assert.equal(broadChance(10, 10, 0.68), 68);
  assert.equal(broadChance(1, 100), 10);
  assert.equal(broadChance(20, 10), 100);
  assert.equal(broadChance(0, 0), 100);
});

test("rare result rolls after success, not after failure", () => {
  let rolls = 0;
  const normal = resolveChallenge({ difficulty: 10 }, 10, () => { rolls++; return 0.5; });
  assert.equal(normal.outcome, "success");
  assert.equal(normal.cpAwarded, 2);
  assert.equal(rolls, 2);
  const rare = resolveChallenge({ difficulty: 10, rareChance: 0.04 }, 10, () => 0);
  assert.equal(rare.outcome, "rare_success");
  rolls = 0;
  const fail = resolveChallenge({ difficulty: 10 }, 10, () => { rolls++; return 0.99; });
  assert.equal(fail.outcome, "failure");
  assert.equal(rolls, 1);
  assert.equal(cpAward(79, true), 2);
  assert.equal(cpAward(80, true), 1);
  assert.equal(cpAward(80, false), 1);
});

test("taxonomy, flat equipment bonuses, opposition, additive effects", () => {
  assert.equal(isPyramidal(QualityType.MENACE), true);
  assert.equal(isPyramidal(QualityType.ITEM), false);
  const defs = {
    daring: {type:QualityType.QUIRK, max:15, opposite:"forceful"},
    forceful: {type:QualityType.QUIRK, max:15},
    journal: {type:QualityType.STORY},
    "copper-hat": {stat_bonuses:{insight:2}}
  };
  const p = { qualities: {
    insight: {id:"insight",cp:6,level:3},
    forceful: {id:"forceful",cp:6,level:3}
  }, inventory:{"copper-hat":1}, equipped:{hat:"copper-hat"} };
  assert.equal(getEffectiveStat(p, "insight", defs), 5);
  applyEffect(p,{quality:"daring",cp:2},defs);
  assert.equal(p.qualities.daring.level, 1);
  assert.equal(p.qualities.forceful.cp, 4);
  applyEffect(p,{quality:"journal",cp:3},defs);
  assert.equal(p.qualities.journal.level,3);
});

test("menace consequences use original NeathBound areas", () => {
  const p = { menaces: {suspicion:8}, locationId:"lantern-quay", criminal_record:0 };
  assert.equal(checkMenaceThreshold(p),"the-holding-vaults");
  sendToPenaltyLocation(p,"suspicion");
  assert.equal(p.locationId,"the-holding-vaults");
  assert.equal(p.criminal_record,1);
});

test("optional action timer regenerates correctly without activating a paywall", () => {
  const now = 10 * ACTION_REGEN_MS;
  const p = {actions:2,max_actions:5,last_action_tick:now - 4*ACTION_REGEN_MS};
  regenerateActions(p,now);
  assert.equal(p.actions,5);
  assert.equal(p.last_action_tick,now);
  assert.equal(spendActions(p,2),true);
  assert.equal(spendActions(p,4),false);
});
