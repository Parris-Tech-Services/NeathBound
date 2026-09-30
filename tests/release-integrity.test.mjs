import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

function stripQuery(value) {
  return value.split("?")[0].split("#")[0];
}

test("all local entry-point assets resolve to real files", async () => {
  const html = await read("index.html");
  const refs = [
    ...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)
  ].map((match) => stripQuery(match[1].replace(/^\.\//, "")));

  assert.ok(refs.length >= 2, "expected stylesheet and module references");
  for (const ref of refs) {
    await assert.doesNotReject(access(resolve(root, ref)), `missing local asset: ${ref}`);
  }
});

test("versioned browser imports use the current release cache token", async () => {
  const files = [
    "index.html",
    "src/main.js",
    "src/services/index.js",
    "src/services/local-game-service.js",
    "src/game/engine.js",
    "src/ui/render.js"
  ];
  const versions = new Set();

  for (const file of files) {
    const source = await read(file);
    for (const match of source.matchAll(/[?&]v=([0-9A-Za-z._-]+)/g)) {
      versions.add(match[1]);
    }
  }

  assert.equal(versions.size, 1, `browser module cache tokens drifted: ${[...versions].join(", ")}`);
});

test("every remote CSS image is approved and licence-documented", async () => {
  const css = await read("src/styles.css");
  const assets = JSON.parse(await read("assets/open-assets.json"));
  const attribution = await read("ATTRIBUTION.md");
  const approved = new Map(assets.map((asset) => [asset.assetUrl, asset]));
  const urls = [...css.matchAll(/url\(["']?(https:\/\/[^"')]+)["']?\)/g)].map((match) => match[1]);

  assert.ok(urls.length > 0, "expected at least one remote visual asset");

  for (const url of new Set(urls)) {
    const asset = approved.get(url);
    assert.ok(asset, `unregistered remote asset in CSS: ${url}`);
    assert.match(asset.sourcePage, /^https:\/\/commons\.wikimedia\.org\//);
    assert.ok(["CC0-1.0", "Public-Domain", "CC-BY-4.0", "CC-BY-SA-4.0"].includes(asset.license), `unsupported licence for ${asset.id}`);
    assert.ok(asset.author);
    assert.ok(attribution.includes(asset.sourcePage), `ATTRIBUTION.md is missing source page for ${asset.id}`);
  }
});

test("production files do not hotlink Fallen London or Failbetter assets", async () => {
  const files = ["index.html", "src/styles.css", "src/ui/render.js"];
  for (const file of files) {
    const source = await read(file);
    assert.doesNotMatch(source, /(?:fallenlondon\.com|failbettergames\.com|images\.failbettergames)/i, `${file} references a protected upstream asset host`);
  }
});

test("remote production images use HTTPS only", async () => {
  const css = await read("src/styles.css");
  assert.doesNotMatch(css, /url\(["']?http:\/\//i);
});
