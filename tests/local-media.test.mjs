// Regression guard: shipped decorative images must resolve locally.
// No external Wikimedia hotlink should be needed to play the game.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CSS_PATH = resolve(ROOT, "src/styles.css");
const [css, render, page] = await Promise.all([
  readFile(CSS_PATH, "utf8"),
  readFile(resolve(ROOT, "src/ui/render.js"), "utf8"),
  readFile(resolve(ROOT, "index.html"), "utf8")
]);

test("shipped CSS and UI use local artwork instead of remote Wikimedia images", () => {
  assert.doesNotMatch(css, /url\(\s*['"]?https?:\/\//i, "external CSS images can be blocked or unavailable");
  assert.doesNotMatch(render, /(?:upload|commons)\.wikimedia\.org/i, "UI must not hotlink Wikimedia images");
  assert.match(page, /src\/styles\.css\?v=20261015-11/, "cached stylesheet needs a new URL");
});

test("all local WebP artworks referenced by CSS exist and are nonempty", async () => {
  const paths = [...css.matchAll(/url\(\s*["']?(\.\.\/assets\/art\/[^"'\s)]+)["']?\s*\)/g)].map(m => m[1]);
  assert.ok(paths.length >= 10, `expected original images to replace every old CSS hotlink; got ${paths.length}`);
  for (const path of new Set(paths)) {
    assert.match(path, /^\.\.\/assets\/art\/[a-z0-9-]+\.webp$/);
    const file = resolve(dirname(CSS_PATH), path);
    assert.ok(file.startsWith(resolve(ROOT, "assets/art") + "/"), "asset must remain within assets/art");
    const info = await stat(file);
    assert.ok(info.isFile() && info.size > 1000, `missing or empty local image ${path}`);
  }
});
