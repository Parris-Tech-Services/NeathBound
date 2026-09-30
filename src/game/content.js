// Loads the narrative content (the "CMS" data in /content) and validates it.
// Writers edit the JSON files; CI validates them and syncs them to the
// database, which is what the authoritative API reads.
import { indexContent } from "./engine.js";

export const CONTENT_FILES = ["world", "qualities", "areas", "storylets"];

export async function loadContent(readJson) {
  const [world, qualities, areas, storylets] = await Promise.all(CONTENT_FILES.map((name) => readJson(name)));
  const raw = { world, qualities, areas, storylets };
  const problems = validateContent(raw);
  if (problems.length) throw new Error(`Invalid content:\n- ${problems.join("\n- ")}`);
  return indexContent(raw);
}

export function browserJsonReader(base = new URL("../../content/", import.meta.url)) {
  return async (name) => {
    const response = await fetch(new URL(`${name}.json`, base));
    if (!response.ok) throw new Error(`Could not load content/${name}.json (${response.status})`);
    return response.json();
  };
}

export function validateContent({ world, qualities, areas, storylets }) {
  const problems = [];
  const qualityIds = new Set();
  for (const q of qualities) {
    if (qualityIds.has(q.id)) problems.push(`duplicate quality ${q.id}`);
    qualityIds.add(q.id);
    if (!["stat", "currency", "item", "story"].includes(q.category)) problems.push(`quality ${q.id} has unknown category ${q.category}`);
  }
  const areaIds = new Set(areas.map((a) => a.id));
  const checkQuality = (where, id) => { if (!qualityIds.has(id)) problems.push(`${where} references unknown quality ${id}`); };
  const checkArea = (where, id) => { if (id && !areaIds.has(id)) problems.push(`${where} references unknown area ${id}`); };

  checkArea("world.startingArea", world.startingArea);
  Object.keys(world.startingQualities ?? {}).forEach((id) => checkQuality("world.startingQualities", id));

  const storyletIds = new Set();
  const branchIds = new Set();
  for (const s of storylets) {
    if (storyletIds.has(s.id)) problems.push(`duplicate storylet ${s.id}`);
    storyletIds.add(s.id);
    checkArea(`storylet ${s.id}`, s.area);
    (s.requirements ?? []).forEach((r) => checkQuality(`storylet ${s.id} requirement`, r.quality));
    if (!s.branches?.length) problems.push(`storylet ${s.id} has no branches`);
    for (const b of s.branches ?? []) {
      if (branchIds.has(b.id)) problems.push(`duplicate branch ${b.id}`);
      branchIds.add(b.id);
      (b.requirements ?? []).forEach((r) => checkQuality(`branch ${b.id} requirement`, r.quality));
      if (b.challenge) checkQuality(`branch ${b.id} challenge`, b.challenge.quality);
      if (!b.success?.text) problems.push(`branch ${b.id} has no success text`);
      if (b.challenge && !b.failure?.text) problems.push(`branch ${b.id} has a challenge but no failure outcome`);
      for (const outcome of [b.success, b.failure].filter(Boolean)) {
        (outcome.effects ?? []).forEach((e) => checkQuality(`branch ${b.id} effect`, e.quality));
        checkArea(`branch ${b.id} moveTo`, outcome.moveTo);
      }
    }
  }
  return problems;
}
