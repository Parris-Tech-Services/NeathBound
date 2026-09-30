#!/usr/bin/env node
// The Edge Function bundles its own copy of the shared QBN engine, because
// Supabase deploys only the function folder. Run after editing the engine;
// `npm test` fails if the two copies drift.
import { copyFile } from "node:fs/promises";
await copyFile(new URL("../src/game/engine.js", import.meta.url), new URL("../supabase/functions/api/engine.js", import.meta.url));
console.log("Copied src/game/engine.js -> supabase/functions/api/engine.js");
