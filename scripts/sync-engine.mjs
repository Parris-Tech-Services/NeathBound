#!/usr/bin/env node
// Copies the shared game modules into the Supabase function, because Supabase
// deploys only the function folder. The browser's cache-busting "?v=..." import
// suffixes are stripped for Deno. `npm test` fails if the copies drift.
import { mkdir, readFile, writeFile } from "node:fs/promises";

export const SHARED_MODULES = ["engine.js", "rules.js", "state.js", "content.js", "decks.js"];
export const stripVersions = (source) => source.replace(/(from\s+["'][^"'?]+\.js)\?v=[^"']*(["'])/g, "$1$2");

const src = new URL("../src/game/", import.meta.url);
const dest = new URL("../supabase/functions/api/game/", import.meta.url);

if (import.meta.url === `file://${process.argv[1]}`) {
  await mkdir(dest, { recursive: true });
  for (const name of SHARED_MODULES) {
    await writeFile(new URL(name, dest), stripVersions(await readFile(new URL(name, src), "utf8")));
  }
  console.log(`Copied ${SHARED_MODULES.join(", ")} -> supabase/functions/api/game/`);
}
