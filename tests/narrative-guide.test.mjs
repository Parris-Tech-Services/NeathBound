import test from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../src/game/state.js";
import { CITY_ROUTES, getQuestGuide } from "../src/ui/narrative-guide.js";
import { readFileSync } from "node:fs";

test("opening objective is present without needing a hidden sidebar", () => {
  const initial = initialState();
  assert.match(getQuestGuide(initial).objective, /escape/i);
  const source = readFileSync(new URL("../src/ui/render.js", import.meta.url), "utf8");
  assert.ok(source.includes('outcome ? "" : questHtml'));
  assert.match(source, /data-view-panel="map"/);
  assert.match(source, /data-action="open-map"/);
  assert.equal(source.includes('<details class="city-route-map" open>'), false);
  assert.match(source, /\[data-action=travel-to\]/);
  assert.match(source, /main-storylet/);
});
test("chapter objectives advance through each meaningful milestone", () => {
  const s = initialState();
  s.locationId = "lantern-quay";
  assert.match(getQuestGuide(s).objective, /bell/i);
  s.flags["story-complete:bell-under-water"] = true;
  assert.match(getQuestGuide(s).objective, /Index of Lost Things/i);
  s.flags["story-complete:index-of-lost-things"] = true;
  assert.match(getQuestGuide(s).objective, /Page They Overlooked/i);
  s.items["unfinished-page"] = 1;
  assert.match(getQuestGuide(s).objective, /Finish the Page/i);
  s.flags["read-own-entry"] = true;
  assert.match(getQuestGuide(s).objective, /Margin Note/i);
  s.unlockedLocations.push("glass-observatory");
  assert.match(getQuestGuide(s).objective, /Survey the Stone Sky/i);
  s.flags["found-the-far-crack"] = true;
  assert.match(getQuestGuide(s).objective, /Far Crack/i);
  s.flags["far-crack-answered"] = true;
  assert.match(getQuestGuide(s).chapter, /Chapter Two/i);
});
test("the navigable map has explicit discovery hints", () => {
  assert.equal(new Set(CITY_ROUTES.map(route => route.id)).size, CITY_ROUTES.length);
  assert.ok(CITY_ROUTES.every(route => route.hint.length > 20));
  const style = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(style, /\.city-route-map/);
  assert.match(style, /@media \(max-width: 700px\)/);
});
