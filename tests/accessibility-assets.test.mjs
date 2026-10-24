import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('landing page exposes exactly one semantic h1', () => {
  const headings = html.match(/<h1(?:\s|>)/gi) ?? [];
  assert.equal(headings.length, 1, 'Exactly one h1 is expected on the landing page');
  assert.match(html, /<h1\b[^>]*>[^]*?<\/h1>/i);
});

test('styles never hotlink Wikimedia upload servers', () => {
  assert.doesNotMatch(css, /(?:https?:)?\/\/upload\.wikimedia\.org\//i);
});

test('landing page has a language, viewport and document title', () => {
  assert.match(html, /<html\b[^>]*\blang\s*=\s*["']en["']/i);
  assert.match(html, /<meta\b[^>]*\bname\s*=\s*["']viewport["']/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
});
