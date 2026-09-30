#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const SHARED_MODULES = ["engine.js", "rules.js", "state.js", "content.js", "decks.js", "items.js"];
export const stripVersions = (source) => source.replace(/(from\s+["'][^"'?]+\.js)\?v=[^"']*(["'])/g, "$1$2");

const src = new URL("../src/game/", import.meta.url);
const dest = new URL("../supabase/functions/api/game/", import.meta.url);

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
const thisPath = resolve(fileURLToPath(import.meta.url));

if (invokedPath === thisPath) {
  await mkdir(dest, { recursive: true });
  for (const name of SHARED_MODULES) {
    await writeFile(new URL(name, dest), stripVersions(await readFile(new URL(name, src), "utf8")));
  }
  console.log(`Copied ${SHARED_MODULES.join(", ")} -> supabase/functions/api/game/`);
}
