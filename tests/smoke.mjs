import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const html = await read("../index.html");
const app = await read("../src/main.js");
assert.match(html, /Neathbound/);
assert.match(html, /src\/main\.js/);
assert.match(app, /connect\(/);
for (const name of ["world", "qualities", "areas", "storylets"]) JSON.parse(await read(`../content/${name}.json`));
console.log("Neathbound static smoke check passed");
