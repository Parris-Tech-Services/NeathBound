// Browser end-to-end check of the real site in Chromium (Playwright).
//   npm run test:e2e                     -> serves this checkout locally
//   BASE_URL=https://.../NeathBound/ npm run test:e2e   -> checks a deployment
// Runs in offline mode (?api=local) so it never creates online players.
// The accessibility audit (axe-core) and third-party asset failures are
// REPORTED (E2E_REPORT file) but only fail the run with A11Y_STRICT=1 / never.
import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { appendFile, readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { SAVE_KEY } from "../../src/game/state.js";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

let server;
let browser;
const externalProblems = [];
let baseUrl = process.env.BASE_URL;

before(async () => {
  if (!baseUrl) {
    server = createServer(async (req, res) => {
      const path = normalize(join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname)));
      const file = path.endsWith("/") ? join(path, "index.html") : path;
      if (!file.startsWith(ROOT)) return res.writeHead(403).end();
      try {
        const body = await readFile(file);
        res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(body);
      } catch {
        res.writeHead(404).end("not found");
      }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}/`;
  }
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
  const unique = [...new Set(externalProblems)];
  const report = `## Third-party assets\n\n${unique.length ? `${unique.length} external request(s) failed. Players may see missing images or styling:\n\n${unique.map((p) => `- ${p}`).join("\n")}` : "All external assets loaded."}\n`;
  if (process.env.E2E_REPORT) await appendFile(process.env.E2E_REPORT, `\n${report}`);
  if (unique.length) console.warn(report);
});

async function openGame({ completeTutorial = false } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  const problems = [];
  // Failures of the game's own files fail the test; third-party assets
  // (e.g. hotlinked images) are reported separately and do not.
  const ownOrigin = new URL(baseUrl).origin;
  const record = (url, message) => (new URL(url).origin === ownOrigin ? problems : externalProblems).push(message);
  page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const where = msg.location()?.url;
    if (where && new URL(where).origin !== ownOrigin) return;
    if (/^Failed to load resource/.test(msg.text())) return; // covered by the request/response checks below
    problems.push(`console error: ${msg.text()}`);
  });
  page.on("requestfailed", (req) => record(req.url(), `request failed: ${req.url()} ${req.failure()?.errorText}`));
  page.on("response", (res) => { if (res.status() >= 400) record(res.url(), `HTTP ${res.status()}: ${res.url()}`); });
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(new URL("?api=local&autoplay=1", baseUrl).href, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-choice]");
  if (completeTutorial) await finishTutorial(page);
  return { context, page, problems };
}

const readSave = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), SAVE_KEY);

async function finishTutorial(page) {
  const state = await readSave(page);
  if (state?.flags?.["tutorial.story"]) return;

  const escape = page.locator('[data-story="lair-escape"][data-choice="force"]');
  await escape.waitFor({ state: "visible" });
  await escape.click();
  await page.waitForFunction(
    (key) => JSON.parse(localStorage.getItem(key) ?? "{}").flags?.["tutorial.story"] === true,
    SAVE_KEY
  );
  await page.locator('[data-action="onwards"]').click();
  await page.waitForSelector('[data-story="bell-under-water"]');
}

test("first visit shows the public landing page before loading the game", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(new URL("?api=local", baseUrl).href, { waitUntil: "domcontentloaded" });

  assert.equal(await page.locator("#landing-screen").isVisible(), true);
  assert.match(await page.locator("#landing-screen").innerText(), /NEATH.*BOUND/s);
  assert.match(await page.locator("#landing-screen").innerText(), /Enter the city/i);
  assert.equal(await page.locator(".game-shell").count(), 0, "the game module is not loaded before the player enters");
  await context.close();
});

test("entering the city shows the loader until the game has rendered", async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(/\/src\/main\.js\?v=/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  await page.goto(new URL("?api=local", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.locator("#enter-city").click();

  assert.equal(await page.locator("#landing-screen").isHidden(), true, "landing page leaves immediately after Enter");
  assert.equal(await page.locator("#boot-screen").isVisible(), true, "loader covers module/game startup");
  assert.match(await page.locator("#boot-screen").innerText(), /(Waking the lamps beneath the city|Opening the city from this device|Remembering your place beneath the city)/i);

  await page.waitForSelector("[data-choice]");
  await page.waitForFunction(() => !document.querySelector("#boot-screen"));
  assert.equal(await page.locator("#app").getAttribute("aria-busy"), "false");
  await context.close();
});

test("the game loads with no errors and every asset and module resolves", async () => {
  const { context, page, problems } = await openGame();
  assert.ok(await page.locator("[data-choice]").count() > 0, "storylet choices are rendered");
  assert.deepEqual(problems, []);
  await context.close();
});

test("a choice changes the story, and progress survives a reload", async () => {
  const { context, page, problems } = await openGame();
  const before = await readSave(page);
  const firstEntry = before?.journal?.[0];
  await page.locator("[data-choice]:not([disabled])").first().click();
  await page.waitForFunction(([key, entry]) => JSON.parse(localStorage.getItem(key) ?? "{}").journal?.[0] !== entry, [SAVE_KEY, firstEntry]);
  const played = await readSave(page);
  assert.notEqual(played.journal[0], firstEntry, "the journal records the choice");

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-choice]");
  assert.deepEqual((await readSave(page)).journal, played.journal, "progress is kept after reload");
  assert.match(await page.locator("body").innerText(), new RegExp(escapeRegExp(played.journal[0].split(":")[0])), "the journal is shown");
  assert.deepEqual(problems, []);
  await context.close();
});

test("New life resets the character", async () => {
  const { context, page, problems } = await openGame();
  await page.locator("[data-choice]:not([disabled])").first().click();
  await page.waitForFunction((key) => (JSON.parse(localStorage.getItem(key) ?? "{}").journal ?? []).length > 1, SAVE_KEY);
  // Complete the visible outcome dialog before interacting with background navigation.
  await page.locator('[data-action="onwards"]').click();
  await page.locator("[data-action=reset]").first().click();
  await page.waitForFunction((key) => (JSON.parse(localStorage.getItem(key) ?? "{}").journal ?? []).length === 1, SAVE_KEY);
  const save = await readSave(page);
  assert.equal(save.journal.length, 1, "a new life starts with a single journal entry");
  assert.deepEqual(problems, []);
  await context.close();
});

test("Possessions opens a dedicated inventory view and Story returns to play", async () => {
  const { context, page, problems } = await openGame({ completeTutorial: true });
  await page.locator(".main-tabs [data-view=possessions]").click();

  await assert.doesNotReject(() => page.locator("#possessions").waitFor({ state: "visible" }));
  assert.equal(await page.locator("[data-view-panel=story]").isHidden(), true, "story view is hidden while possessions is open");
  assert.match(await page.locator("#possessions").innerText(), /Brass Key/);
  assert.match(await page.locator("#possessions").innerText(), /\bTools\b/i);

  await page.locator(".main-tabs a[href=\"#stories\"]").click();
  assert.equal(await page.locator("[data-view-panel=story]").isVisible(), true, "Story returns to the playable view");
  assert.equal(await page.locator("#possessions").isHidden(), true, "possessions view closes");
  assert.deepEqual(problems, []);
  await context.close();
});

test("Myself opens a full character screen and outfit changes stay in sync", async () => {
  const { context, page, problems } = await openGame({ completeTutorial: true });
  await page.locator(".main-tabs [data-view=myself]").click();

  await assert.doesNotReject(() => page.locator("#myself").waitFor({ state: "visible" }));
  assert.equal(await page.locator("[data-view-panel=story]").isHidden(), true, "story view is hidden while Myself is open");
  assert.equal(await page.locator("#possessions").isHidden(), true, "possessions view remains hidden");
  const text = await page.locator("#myself").innerText();
  assert.match(text, /The Unmoored/);
  assert.match(text, /Qualities/);
  assert.match(text, /Nerve/);
  assert.match(text, /Insight/);
  assert.match(text, /Poise/);
  assert.match(text, /Shadow/);
  assert.match(text, /Menaces/);
  assert.match(text, /Dread/);
  assert.match(text, /Scandal/);
  assert.match(text, /Wounds/);
  assert.match(text, /Suspicion/);
  assert.match(text, /Momentum/);

  await page.locator("#myself-outfit").selectOption("dock-coat");
  await page.waitForSelector("#myself:not([hidden])");
  assert.equal(await page.locator("#myself-outfit").inputValue(), "dock-coat");
  assert.equal(await page.locator("#outfit").inputValue(), "dock-coat", "sidebar and Myself outfit selectors stay in sync");

  await page.locator(".main-tabs a[href=\"#stories\"]").click();
  assert.equal(await page.locator("[data-view-panel=story]").isVisible(), true, "Story returns to the playable view");
  assert.equal(await page.locator("#myself").isHidden(), true, "Myself closes when returning to Story");
  assert.deepEqual(problems, []);
  await context.close();
});

test("Travel opens on demand and never covers the story after choices", async () => {
  const { context, page, problems } = await openGame({ completeTutorial: true });
  const storyPanel = page.locator('[data-view-panel="story"]');
  const mapPanel = page.locator('#travel-map');

  assert.equal(await storyPanel.isVisible(), true, "the player arrives at the story");
  assert.equal(await mapPanel.isHidden(), true, "the map starts hidden, not expanded above storylets");

  await page.locator('.main-tabs [data-action="open-map"]').click();
  assert.equal(await mapPanel.isVisible(), true, "Travel opens a dedicated map");
  assert.equal(await storyPanel.isHidden(), true, "the map replaces rather than pushes down the story");
  assert.match(await mapPanel.innerText(), /Lantern Quay/);

  await page.locator('[data-action="close-map"]').click();
  assert.equal(await mapPanel.isHidden(), true, "Back to stories closes the map");
  assert.equal(await storyPanel.isVisible(), true);

  // A normal storylet result and the Onwards transition must not re-open the map.
  const branch = page.locator('[data-story="bell-under-water"][data-choice="descend"]');
  await branch.click();
  await page.locator('[data-action="onwards"]').waitFor();
  assert.equal(await mapPanel.isHidden(), true, "result screen never displays the Travel map");
  await page.locator('[data-action="onwards"]').click();
  assert.equal(await mapPanel.isHidden(), true, "Onwards returns to stories with map hidden");

  // Selecting a destination also returns the player to story mode automatically.
  await page.locator('.main-tabs [data-action="open-map"]').click();
  const before = (await readSave(page)).locationId;
  const destination = page.locator('#travel-map [data-action="travel-to"]').first();
  await destination.waitFor();
  await destination.click();
  await page.waitForFunction(({ key, prior }) => JSON.parse(localStorage.getItem(key) ?? "{}").locationId !== prior, { key: SAVE_KEY, prior: before });
  assert.equal(await mapPanel.isHidden(), true, "travelling closes the map");
  assert.equal(await storyPanel.isVisible(), true, "travelling shows the new area's stories");
  assert.deepEqual(problems, []);
  await context.close();
});

test("mobile district has concise single-open storylets and a folded evidence registry", async () => {
  const { context, page, problems } = await openGame({ completeTutorial: true });
  await page.setViewportSize({ width: 390, height: 740 });

  const previews=page.locator(".storylet-disclosure");
  assert.ok(await previews.count() >= 6, "Lantern Quay must still list its available encounters");
  assert.equal(await page.locator('.storylet-disclosure[open]').count(), 1, "only one district story opens initially");
  assert.equal(await page.locator('[data-storylet-id="bell-under-water"]').getAttribute("open"), "", "main objective opens first");
  assert.ok(await page.locator('[data-story="bell-under-water"][data-choice="descend"]').isVisible());

  const registry=page.locator(".storylet-archive");
  await registry.waitFor();
  assert.equal(await registry.getAttribute("open"), null, "the four registry volumes are hidden until requested");
  assert.equal(await page.locator(".storylet-archive .storylet-disclosure").count(), 4);
  const collapsedHeight=await registry.evaluate(el=>el.getBoundingClientRect().height);
  assert.ok(collapsedHeight < 135, "evidence registry must occupy only one row when folded");

  // Open any other story, check the featured story closes and its GO choices are hidden.
  await page.locator('[data-storylet-id="cartographer-at-dusk"] > summary').click();
  assert.equal(await page.locator(".storylet-disclosure[open]").count(), 1);
  assert.equal(await page.locator('[data-story="bell-under-water"][data-choice="descend"]').isVisible(), false);
  assert.ok(await page.locator('[data-story="cartographer-at-dusk"][data-choice]').first().isVisible());
  // Returning to the main lead requires one tap, not scrolling over a wall of choices.
  await page.locator('[data-storylet-id="bell-under-water"] > summary').click();
  assert.equal(await page.locator(".storylet-disclosure[open]").count(), 1);
  assert.ok(await page.locator('[data-story="bell-under-water"][data-choice="descend"]').isVisible());
  assert.deepEqual(problems, []);
  await context.close();
});

test("mobile Gloomwing chapter 3 GO visibly responds, and no-action attempts say WAIT", async () => {
  const { context, page, problems } = await openGame({ completeTutorial: true });
  await page.setViewportSize({ width: 390, height: 740 });
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.locationId = "duskwater";
    if(!state.unlockedLocations.includes("duskwater")) state.unlockedLocations.push("duskwater");
    state.ambition = "gloomwing-hunt";
    state.ambition_progress = { "gloomwing-hunt": 2 };
    state.qualities.gloomwing_hunt_progress = 2;
    state.qualities.insight = 12;
    state.flags["qbn-ambition-chosen"] = true;
    state.actions = 0;
    state.last_action_tick = Date.now();
    localStorage.setItem(key, JSON.stringify(state));
  }, SAVE_KEY);
  await page.reload({ waitUntil: "networkidle" });
  const branch = page.locator('[data-story="gloomwing_hunt_02"][data-choice="investigate"]');
  await branch.waitFor({ state: "visible" });
  assert.equal(await branch.isDisabled(), true, "no-actions choice must be disabled, not silently rejected");
  assert.equal(await branch.innerText(), "WAIT");
  assert.match(await page.locator('[data-story="gloomwing_hunt_02"]').first().locator("..").innerText(), /No actions remaining/);

  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.actions = 10;
    state.last_action_tick = Date.now();
    localStorage.setItem(key, JSON.stringify(state));
  }, SAVE_KEY);
  await page.reload({ waitUntil: "networkidle" });
  const go = page.locator('[data-story="gloomwing_hunt_02"][data-choice="investigate"]');
  await go.waitFor({ state: "visible" });
  await go.click();
  const result = page.locator(".outcome-screen-overlay .outcome-panel[role=dialog]");
  try { await result.waitFor({ state: "visible", timeout: 4500 }); }
  catch (error) {
    const diagnostic = await page.evaluate((key) => ({
      save:JSON.parse(localStorage.getItem(key)||"{}"),
      alerts:[...document.querySelectorAll(".runtime-error,.runtime-notice")].map(n=>n.textContent),
      results:[...document.querySelectorAll(".outcome-screen-overlay")].map(n=>n.textContent.slice(0,300)),
      activeButtons:[...document.querySelectorAll('[data-story="gloomwing_hunt_02"]')].map(n=>({text:n.textContent,disabled:n.disabled})),
      scrollY:window.scrollY
    }), SAVE_KEY);
    console.error("GLOOMWING CHAPTER THREE DIAGNOSTIC",JSON.stringify({diagnostic,problems}).slice(0,3800));
    throw error;
  }
  assert.equal(await page.locator('[data-action="onwards"]').isVisible(), true);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator('[data-action="onwards"]').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press("Shift+Tab");
  assert.equal(await page.locator('[data-action="onwards"]').evaluate(el => el === document.activeElement), true, "reverse Tab cannot escape result dialog");
  const bounds = await result.boundingBox(), viewport = page.viewportSize();
  assert.ok(bounds.y < viewport.height && bounds.y + bounds.height > 0, "outcome must be in the mobile viewport");
  const saved = await readSave(page);
  assert.equal(saved.ambition_progress["gloomwing-hunt"], 3);
  assert.equal(saved.actions, 9);
  await page.locator('[data-action="onwards"]').click();
  assert.equal(await page.locator(".outcome-screen-overlay").count(), 0);
  assert.equal(await page.evaluate(() => /^H[23]$/.test(document.activeElement?.tagName) && !!document.activeElement?.closest('#stories')), true, "Onwards restores focus to the next main lead");
  assert.deepEqual(problems, []);
  await context.close();
});

test("accessibility audit (axe-core)", async (t) => {
  const { context, page } = await openGame();
  const axeSource = await readFile(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => {
    const run = await globalThis.axe.run(document, { resultTypes: ["violations"] });
    return run.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, url: v.helpUrl }));
  });
  await context.close();

  const byImpact = results.reduce((acc, v) => ({ ...acc, [v.impact]: (acc[v.impact] ?? 0) + 1 }), {});
  const lines = results.map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes} element${v.nodes === 1 ? "" : "s"}) ${v.url}`);
  const report = `## Accessibility audit (axe-core)\n\n${results.length ? `${results.length} rule violation(s): ${JSON.stringify(byImpact)}\n\n${lines.join("\n")}` : "No violations found."}\n`;
  if (process.env.E2E_REPORT) await appendFile(process.env.E2E_REPORT, report);
  t.diagnostic(report);

  if (process.env.A11Y_STRICT === "1") {
    assert.equal(results.filter((v) => ["critical", "serious"].includes(v.impact)).length, 0, report);
  }
});

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


test("browsing and backing out are free, and bookmarking preserves the open story", async () => {
 const {context,page,problems}=await openGame({completeTutorial:true});
 const preview=page.locator('details[data-storylet-id="tea-for-the-tide"]');
 const id=await preview.getAttribute('data-storylet-id');
 const story=page.locator('details[data-storylet-id="'+id+'"]');
 if(!await story.evaluate(el=>el.open))await story.locator('summary').click();
 const before=await readSave(page);
 await story.locator('[data-action="close-story"]').click();
 assert.equal(await story.evaluate(el=>el.open),false);
 assert.equal(await readSave(page).then(s=>s.actions),before.actions,"backing out spends no action");
 assert.equal(await story.locator('summary').evaluate(el=>el===document.activeElement),true);
 await story.locator('summary').click();
 await story.locator('[data-action="bookmark"]').click();
 await page.locator('details[data-storylet-id="'+id+'"][open]').waitFor();
 assert.equal(await readSave(page).then(s=>s.actions),before.actions,"bookmarking is free");
 assert.deepEqual(problems,[]);await context.close();
});
