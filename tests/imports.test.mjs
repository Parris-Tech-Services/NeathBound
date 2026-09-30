// Module integrity for the static site: walks the import graph the browser
// loads (index.html -> main.js -> ...) and checks that every import resolves
// to a file, and that each module is always imported with the same "?v="
// cache-busting version. Two versions of one module make the browser fetch
// and run it twice, splitting any module-level state between two instances.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IMPORT_PATTERN = /(?:import|export)\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function importGraph(root = ROOT) {
  const html = await readFile(join(root, "index.html"), "utf8");
  const entries = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Map(); // path -> Map(version -> [importers])
  const missing = [];
  const queue = entries.map((spec) => ({ spec, from: join(root, "index.html") }));
  const visited = new Set();

  while (queue.length) {
    const { spec, from } = queue.shift();
    if (!spec.startsWith(".")) continue; // bare or absolute URLs are out of scope
    const [pathPart, query = ""] = spec.split("?");
    const path = join(dirname(from), pathPart);
    const version = new URLSearchParams(query).get("v") ?? "(none)";
    const importer = relative(root, from);
    if (!seen.has(path)) seen.set(path, new Map());
    const versions = seen.get(path);
    versions.set(version, [...(versions.get(version) ?? []), importer]);

    if (visited.has(path)) continue;
    visited.add(path);
    if (!(await exists(path))) {
      missing.push(`${relative(root, path)} (imported by ${importer})`);
      continue;
    }
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(IMPORT_PATTERN)) queue.push({ spec: match[1] ?? match[2], from: path });
  }
  return { seen, missing, root };
}

test("every module the browser loads exists", async () => {
  const { missing } = await importGraph();
  assert.deepEqual(missing, [], `Missing modules:\n- ${missing.join("\n- ")}`);
});

test("each module is imported with a single cache-busting version", async () => {
  const { seen, root } = await importGraph();
  const conflicts = [...seen]
    .filter(([, versions]) => versions.size > 1)
    .map(([path, versions]) => `${relative(root, path)}: ${[...versions].map(([v, by]) => `v=${v} from ${by.join(", ")}`).join("; ")}`);
  assert.deepEqual(conflicts, [], `Modules loaded under more than one version (they would run twice):\n- ${conflicts.join("\n- ")}`);
});
