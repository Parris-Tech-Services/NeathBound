import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { locations, stories, cards } from "../src/game/content.js";

const renderSource = fs.readFileSync(new URL("../src/ui/render.js", import.meta.url), "utf8");

function keysFromMap(name) {
  const match = renderSource.match(new RegExp(`const ${name} = \\\{([\\s\\S]*?)\\n\\};`));
  assert.ok(match, `${name} must exist in render.js`);
  return new Set([...match[1].matchAll(/^\s*"([^"]+)":/gm)].map((entry) => entry[1]));
}

test("every current location has dedicated artwork", () => {
  const keys = keysFromMap("LOCATION_ART");
  const missing = Object.keys(locations).filter((id) => !keys.has(id));
  assert.deepEqual(missing, [], `Missing LOCATION_ART entries: ${missing.join(", ")}`);
});

test("every storylet and opportunity card has dedicated artwork", () => {
  const keys = keysFromMap("STORY_ART");
  const required = [...Object.keys(stories), ...Object.keys(cards ?? {})];
  const missing = required.filter((id) => !keys.has(id));
  assert.deepEqual(missing, [], `Missing STORY_ART entries: ${missing.join(", ")}`);
});

test("renderer keeps the artwork hooks wired into location and story panels", () => {
  assert.match(renderSource, /storyArtSvg\(story\.id, state\.locationId\)/);
  assert.match(renderSource, /locationArtSvg\(state\.locationId\)/);
});

test("real photographs are wired for the visible Lantern Quay introduction", () => {
  assert.match(renderSource, /const STORY_IMAGE_ART = \{/);
  assert.match(renderSource, /"bell-under-water": "https:\/\//);
  assert.match(renderSource, /"cartographer-at-dusk": "https:\/\//);
  assert.match(renderSource, /const LOCATION_IMAGE_ART = \{/);
  assert.match(renderSource, /"lantern-quay": "https:\/\//);
  assert.match(renderSource, /class="narrative-picture"/);
});
