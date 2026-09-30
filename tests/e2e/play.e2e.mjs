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

async function openGame() {
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
  await page.goto(new URL("?api=local", baseUrl).href, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-choice]");
  return { context, page, problems };
}

const readSave = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null"), SAVE_KEY);

test("the loading screen is present before JavaScript runs and leaves after the game renders", async () => {
  const staticContext = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(new URL("?api=local", baseUrl).href, { waitUntil: "domcontentloaded" });
  assert.equal(await staticPage.locator("#boot-screen").isVisible(), true, "the initial HTML contains a visible loading screen");
  assert.match(await staticPage.locator("#boot-screen").innerText(), /NEATH.*BOUND/s);
  assert.match(await staticPage.locator("#boot-screen").innerText(), /Waking the lamps beneath the city/i);
  await staticContext.close();

  const { context, page, problems } = await openGame();
  assert.equal(await page.locator("#boot-screen").count(), 0, "the loading screen is removed after first render");
  assert.equal(await page.locator("#app").getAttribute("aria-busy"), "false", "the app reports that initial loading is complete");
  assert.deepEqual(problems, []);
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
  await page.locator("[data-action=reset]").first().click();
  await page.waitForFunction((key) => (JSON.parse(localStorage.getItem(key) ?? "{}").journal ?? []).length === 1, SAVE_KEY);
  const save = await readSave(page);
  assert.equal(save.journal.length, 1, "a new life starts with a single journal entry");
  assert.deepEqual(problems, []);
  await context.close();
});

test("Possessions opens a dedicated inventory view and Story returns to play", async () => {
  const { context, page, problems } = await openGame();
  await page.locator(".main-tabs [data-view=possessions]").click();

  await assert.doesNotReject(() => page.locator("#possessions").waitFor({ state: "visible" }));
  assert.equal(await page.locator("[data-view-panel=story]").isHidden(), true, "story view is hidden while possessions is open");
  assert.match(await page.locator("#possessions").innerText(), /Salted Map/);
  assert.match(await page.locator("#possessions").innerText(), /Brass Key/);
  assert.match(await page.locator("#possessions").innerText(), /DOCUMENTS/i);

  await page.locator(".main-tabs a[href=\"#stories\"]").click();
  assert.equal(await page.locator("[data-view-panel=story]").isVisible(), true, "Story returns to the playable view");
  assert.equal(await page.locator("#possessions").isHidden(), true, "possessions view closes");
  assert.deepEqual(problems, []);
  await context.close();
});

test("Myself opens a full character screen and outfit changes stay in sync", async () => {
  const { context, page, problems } = await openGame();
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
