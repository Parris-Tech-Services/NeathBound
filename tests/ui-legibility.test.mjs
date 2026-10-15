import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const marker = "/* Story-reading contrast and mobile legibility (Agent 7) */";
assert.ok(css.includes(marker), "legibility stylesheet must exist");
const section = css.slice(css.indexOf(marker));

function declaration(selector, property) {
  const position = section.indexOf(selector + " {");
  assert.ok(position >= 0, "Missing selector: " + selector);
  const block = section.slice(position, section.indexOf("}", position) + 1);
  const propertyLine = block.split(";").map(line => line.trim())
    .find(line => line.startsWith(property + ":"));
  assert.ok(propertyLine, "Missing " + property + " in " + selector);
  return propertyLine.slice(property.length + 1).trim();
}

function luminance(hex) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map(chunk => parseInt(chunk, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(foreground, background) {
  const levels = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (levels[0] + 0.05) / (levels[1] + 0.05);
}

test("main-story label meets AA contrast on light parchment", () => {
  const selector = ".storylet .story-body > .story-role";
  const foreground = declaration(selector, "color");
  const background = declaration(selector, "background");
  assert.ok(contrast(foreground, background) >= 4.5);
});

test("enabled and disabled buttons retain readable contrast", () => {
  const selector = ".storylet .go-button";
  const firstBackground = declaration(selector, "background").match(/#[0-9a-f]{6}/gi)?.[0];
  assert.ok(firstBackground);
  assert.ok(contrast(declaration(selector, "color"), firstBackground) >= 4.5);
  const disabled = ".storylet .go-button:disabled";
  assert.ok(contrast(declaration(disabled, "color"), declaration(disabled, "background")) >= 4.5);
  assert.equal(declaration(disabled, "opacity"), "1");
});

test("paragraphs have readable text size and leading", () => {
  const selector = ".storylet .story-body > p:not(.story-role)";
  assert.ok(parseFloat(declaration(selector, "font-size")) >= 0.95);
  assert.ok(parseFloat(declaration(selector, "line-height")) >= 1.5);
});

test("mobile story cards give words full width and provide touch-sized buttons", () => {
  assert.match(section, /@media \(max-width: 700px\)/);
  assert.match(section, /grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(section, /\.storylet \.story-art\s*\{[^}]*height:\s*100px/s);
  assert.match(section, /\.storylet \.story-body > p:not\(\.story-role\)\s*\{[^}]*font-size:\s*1\.04rem/s);
  assert.match(section, /\.storylet \.go-button\s*\{[^}]*min-height:\s*48px/s);
});

test("locked labels remain readable and keyboard actions have focus outlines", () => {
  assert.match(declaration(".storylet .choice-row.is-locked", "opacity"), /^1\b/);
  assert.match(section, /\.storylet \.go-button:focus-visible/);
  assert.match(section, /outline:\s*3px solid/);
});
