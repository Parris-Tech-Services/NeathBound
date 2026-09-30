import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const html = await read("../index.html");
const app = await read("../src/main.js");
const service = await read("../src/services/index.js");
const api = await read("../supabase/functions/api/handler.js");

assert.match(html, /NeathBound/i);
assert.match(html, /src\/main\.js/);
assert.match(app, /createGameService/);
assert.match(service, /LocalGameService/);
assert.match(service, /SupabaseGameService/);
assert.match(api, /resolveChoice/);
assert.match(api, /\/api\//);

console.log("NeathBound static smoke check passed");
