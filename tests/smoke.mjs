import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const service = await readFile(new URL("../src/services/index.js", import.meta.url), "utf8");
const worker = await readFile(new URL("../worker/index.js", import.meta.url), "utf8");

assert.match(html, /NeathBound/i);
assert.match(html, /src\/main\.js/);
assert.match(app, /createGameService/);
assert.match(service, /LocalGameService/);
assert.match(service, /RemoteGameService/);
assert.match(worker, /resolveChoice/);
assert.match(worker, /\/api\//);

console.log("NeathBound static smoke check passed");
