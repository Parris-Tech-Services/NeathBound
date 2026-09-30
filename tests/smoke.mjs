import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
assert.match(html, /Neathbound/);
assert.match(html, /src\/main\.js/);
assert.match(app, /resolveChoice/);
console.log("Neathbound static smoke check passed");
