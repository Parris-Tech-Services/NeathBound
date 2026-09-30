// Quality-based narrative (QBN) engine, shared by the browser (offline play)
// and the Supabase `api` Edge Function (authoritative play). It is pure: no
// DOM, storage or network, so both runtimes produce identical results.
//
// Model: a character is a sparse map of quality id -> level. Storylets live
// in areas and are shown when their requirements hold; each branch may have
// its own requirements, an optional challenge, and success/failure outcomes
// made of quality effects plus an optional move to another area.

export const JOURNAL_LIMIT = 30;

export function indexContent({ world, qualities, areas, storylets }) {
  const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]));
  const sorted = [...storylets].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  return {
    world,
    qualities: byId(qualities),
    areas: byId(areas),
    storylets: byId(sorted.map((s) => ({ ...s, branches: [...s.branches].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) }))),
    order: sorted.map((s) => s.id)
  };
}

export function newCharacter(content) {
  const { world } = content;
  return {
    version: 2,
    name: world.startingName,
    areaId: world.startingArea,
    qualities: { ...world.startingQualities },
    currentStoryletId: null,
    journal: [...world.startingJournal]
  };
}

export function level(state, qualityId) {
  return state.qualities[qualityId] ?? 0;
}

export function meets(requirement, state) {
  const value = level(state, requirement.quality);
  if (requirement.min !== undefined && value < requirement.min) return false;
  if (requirement.max !== undefined && value > requirement.max) return false;
  return true;
}

export function describeRequirement(content, requirement) {
  const name = content.qualities[requirement.quality]?.name ?? requirement.quality;
  if (requirement.min !== undefined && requirement.max !== undefined) return `${name} ${requirement.min}–${requirement.max}`;
  if (requirement.min !== undefined) return requirement.min === 1 ? `Have ${name}` : `${name} at least ${requirement.min}`;
  if (requirement.max !== undefined) return requirement.max === 0 ? `Lack ${name}` : `${name} at most ${requirement.max}`;
  return name;
}

function annotateBranches(content, storylet, state) {
  return storylet.branches.map((branch) => {
    const unmet = (branch.requirements ?? []).filter((r) => !meets(r, state));
    return { ...branch, locked: unmet.length > 0, unmet: unmet.map((r) => describeRequirement(content, r)) };
  });
}

// Storylets the character can currently see in their area, with each branch
// marked locked/unlocked. Storylets whose own requirements fail are hidden.
export function availableStorylets(content, state) {
  return content.order
    .map((id) => content.storylets[id])
    .filter((s) => s.area === state.areaId && (s.requirements ?? []).every((r) => meets(r, state)))
    .map((s) => ({ ...s, branches: annotateBranches(content, s, state) }));
}

export function currentStorylet(content, state) {
  const storylet = content.storylets[state.currentStoryletId];
  return storylet ? { ...storylet, branches: annotateBranches(content, storylet, state) } : null;
}

export function beginStorylet(content, state, storyletId) {
  const visible = availableStorylets(content, state).some((s) => s.id === storyletId);
  if (!visible) return { state, error: "That storylet is not available here." };
  return { state: { ...clone(state), currentStoryletId: storyletId } };
}

export function goBack(state) {
  return { state: { ...clone(state), currentStoryletId: null } };
}

export function chooseBranch(content, state, branchId, random = Math.random) {
  const storylet = content.storylets[state.currentStoryletId];
  const branch = storylet?.branches.find((b) => b.id === branchId);
  if (!storylet || !branch) return { state, error: "That choice is no longer available." };
  if (!(branch.requirements ?? []).every((r) => meets(r, state))) return { state, error: "You do not meet that choice's requirements." };

  const next = clone(state);
  const challenge = branch.challenge;
  const roll = challenge ? Math.floor(random() * 10) + 1 + level(next, challenge.quality) : null;
  const success = !challenge || roll >= challenge.difficulty;
  const outcome = success ? branch.success : (branch.failure ?? branch.success);

  const changes = [];
  for (const effect of outcome.effects ?? []) {
    const before = level(next, effect.quality);
    const after = Math.max(0, effect.set !== undefined ? effect.set : before + (effect.add ?? 0));
    if (after === 0) delete next.qualities[effect.quality];
    else next.qualities[effect.quality] = after;
    if (after !== before) changes.push({ quality: effect.quality, before, after });
  }
  if (outcome.moveTo && content.areas[outcome.moveTo]) next.areaId = outcome.moveTo;
  next.currentStoryletId = null;

  const check = challenge ? ` (${success ? "success" : "failure"}: ${roll} vs ${challenge.difficulty})` : "";
  next.journal = [`${storylet.title}: ${outcome.text}${check}`, ...next.journal].slice(0, JOURNAL_LIMIT);
  return { state: next, outcome: { success, roll, challenge, text: outcome.text, changes, areaId: next.areaId } };
}

function clone(state) {
  return JSON.parse(JSON.stringify(state));
}
