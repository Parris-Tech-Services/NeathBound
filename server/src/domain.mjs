export function defaultPlayer(id) {
  return {
    id,
    name: "The Unmoored",
    locationId: "lantern-quay",
    echoes: 12,
    actions: "unlimited",
    qualities: { nerve: 2, insight: 2, poise: 1, shadow: 0 },
    menaces: { dread: 0, scandal: 0, wounds: 0, suspicion: 0 },
    items: { "salted-map": 1 },
    unlockedLocations: ["lantern-quay", "velvet-market", "hollow-archive"],
    flags: {},
    journal: ["You woke beneath a sky made of stone, with a brass key in your hand."]
  };
}

export function meetsRequirements(player, requirements = {}) {
  for (const [item, amount] of Object.entries(requirements.items ?? {})) if ((player.items[item] ?? 0) < amount) return false;
  for (const [quality, amount] of Object.entries(requirements.qualities ?? {})) if ((player.qualities[quality] ?? 0) < amount) return false;
  return true;
}

export function eligibleStorylets(player, all) {
  return all.filter((entry) => entry.locationId === player.locationId && meetsRequirements(player, entry.requirements));
}

export function resolveBranch(player, story, branch, random = Math.random) {
  if (!story || !branch) throw new Error("storylet or branch not found");
  if (!meetsRequirements(player, story.requirements)) throw new Error("requirements not met");
  const next = structuredClone(player);
  let success = true;
  let roll = null;
  if (branch.challenge) {
    roll = Math.floor(random() * 10) + 1 + (next.qualities[branch.challenge.quality] ?? 0);
    success = roll >= branch.challenge.difficulty;
  }
  const effects = branch.effects ?? {};
  next.echoes += effects.echoes ?? 0;
  for (const [key, value] of Object.entries(effects.qualities ?? {})) next.qualities[key] = (next.qualities[key] ?? 0) + value;
  for (const [key, value] of Object.entries(effects.menaces ?? {})) next.menaces[key] = Math.max(0, (next.menaces[key] ?? 0) + value);
  for (const [key, value] of Object.entries(effects.items ?? {})) next.items[key] = Math.max(0, (next.items[key] ?? 0) + value);
  for (const locationId of effects.unlockLocations ?? []) if (!next.unlockedLocations.includes(locationId)) next.unlockedLocations.push(locationId);
  if (effects.locationId && next.unlockedLocations.includes(effects.locationId)) next.locationId = effects.locationId;
  next.flags[`${story.id}:${branch.id}`] = true;
  const result = success ? branch.onSuccess : (branch.onFailure ?? "The city refuses to explain itself.");
  next.journal = [`${story.title}: ${result}`, ...next.journal].slice(0, 50);
  return { player: next, result, success, roll };
}
