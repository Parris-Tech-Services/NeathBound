#!/usr/bin/env node
// "GitHub as the CMS": validate /content and emit one idempotent SQL
// transaction that makes the database content tables match it exactly.
//   node scripts/sync-content.mjs            -> print SQL
//   node scripts/sync-content.mjs | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1
import { readFile } from "node:fs/promises";
import { CONTENT_FILES, validateContent } from "../src/game/content.js";

const root = new URL("../content/", import.meta.url);
const [world, qualities, areas, storylets] = await Promise.all(
  CONTENT_FILES.map(async (name) => JSON.parse(await readFile(new URL(`${name}.json`, root), "utf8")))
);
const problems = validateContent({ world, qualities, areas, storylets });
if (problems.length) {
  console.error(`Invalid content:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

const text = (value) => (value === null || value === undefined ? "null" : `'${String(value).replaceAll("'", "''")}'`);
const json = (value) => (value === null || value === undefined ? "null" : `${text(JSON.stringify(value))}::jsonb`);
const ids = (list) => list.map((item) => text(item.id)).join(", ") || "null";
const branches = storylets.flatMap((s) => s.branches.map((b) => ({ ...b, storylet: s.id })));

const sql = [
  "begin;",
  `insert into public.world (id, settings) values (true, ${json(world)}) on conflict (id) do update set settings = excluded.settings;`,
  ...qualities.map((q) => `insert into public.qualities (id, name, category, description) values (${text(q.id)}, ${text(q.name)}, ${text(q.category)}, ${text(q.description ?? "")}) on conflict (id) do update set name = excluded.name, category = excluded.category, description = excluded.description;`),
  ...areas.map((a) => `insert into public.areas (id, name, subtitle, atmosphere, sort) values (${text(a.id)}, ${text(a.name)}, ${text(a.subtitle ?? "")}, ${text(a.atmosphere ?? "")}, ${a.sort ?? 0}) on conflict (id) do update set name = excluded.name, subtitle = excluded.subtitle, atmosphere = excluded.atmosphere, sort = excluded.sort;`),
  ...storylets.map((s) => `insert into public.storylets (id, area_id, title, kicker, body, requirements, sort) values (${text(s.id)}, ${text(s.area)}, ${text(s.title)}, ${text(s.kicker ?? "")}, ${text(s.text)}, ${json(s.requirements ?? [])}, ${s.sort ?? 0}) on conflict (id) do update set area_id = excluded.area_id, title = excluded.title, kicker = excluded.kicker, body = excluded.body, requirements = excluded.requirements, sort = excluded.sort;`),
  ...branches.map((b) => `insert into public.branches (id, storylet_id, label, requirements, challenge, success, failure, sort) values (${text(b.id)}, ${text(b.storylet)}, ${text(b.label)}, ${json(b.requirements ?? [])}, ${json(b.challenge)}, ${json(b.success)}, ${json(b.failure)}, ${b.sort ?? 0}) on conflict (id) do update set storylet_id = excluded.storylet_id, label = excluded.label, requirements = excluded.requirements, challenge = excluded.challenge, success = excluded.success, failure = excluded.failure, sort = excluded.sort;`),
  // Remove content that was deleted from the repo (branches first, then storylets).
  `delete from public.branches where id not in (${ids(branches)});`,
  `delete from public.storylets where id not in (${ids(storylets)});`,
  "commit;"
];
console.log(sql.join("\n"));
