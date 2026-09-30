import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderUrl = new URL("../src/ui/render.js", import.meta.url);

test("story interface module parses with restored story rendering and Plans", async () => {
  const module = await import("../src/ui/render.js?v=20260930-story-depth-test");
  assert.equal(typeof module.render, "function");

  const source = readFileSync(renderUrl, "utf8");
  assert.match(source, /const renderStory =/);
  assert.match(source, /const storiesHtml =/);
  assert.match(source, /let deckHtml =/);
  assert.match(source, /const preferences = loadPreferences\(\)/);
  assert.match(source, /data-view-panel="plans"/);
});

test("locked choices visibly explain requirements", () => {
  const source = readFileSync(renderUrl, "utf8");
  assert.match(source, /locked-requirement/);
  assert.match(source, /requirementSummary\(state, requirements\)/);
  assert.match(source, /you have/);
  assert.match(source, /'LOCKED'/);
});

test("Plans use persistent bookmarks and the Lair has distinct location art", () => {
  const source = readFileSync(renderUrl, "utf8");
  assert.match(source, /preferences\.bookmarks/);
  assert.match(source, /Add to Plans/);
  assert.match(source, /href="#plans" data-view="plans"/);
  assert.match(source, /"the-lair": \["▣", "⚿", "The Lair"/);
});
