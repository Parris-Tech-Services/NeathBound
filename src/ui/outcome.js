// Result screen shown after choosing an action, in the style of a storylet
// RPG: the outcome text, the challenge result, then one line per change
// ("You've gained 8 x Echoes (new total 20).", "You have moved to a new
// area."), and an Onwards button back to the stories.
import { locations, stories } from "../game/content.js?v=20260930-11";

const STYLE_ID = "neathbound-outcome-style";
const STYLE = `
.outcome-panel{padding:28px 32px;font-family:inherit}
.outcome-panel h2{margin:0 0 6px;font-size:1.5rem}
.outcome-panel .outcome-verdict{margin:0 0 16px;font-weight:700}
.outcome-panel .outcome-verdict.success{color:#2f6b3a}
.outcome-panel .outcome-verdict.failure{color:#8a2d2d}
.outcome-panel .outcome-text{font-size:1.05rem;line-height:1.6;margin:0 0 20px}
.outcome-panel .outcome-changes{list-style:none;margin:0 0 24px;padding:14px 0 0;border-top:1px solid rgba(0,0,0,.18)}
.outcome-panel .outcome-changes li{display:flex;gap:10px;align-items:baseline;margin:0 0 8px;line-height:1.45}
.outcome-panel .outcome-changes li::before{content:"✦";flex:none;opacity:.7}
.outcome-panel .outcome-changes li.gain::before{content:"▲";color:#2f6b3a;opacity:1}
.outcome-panel .outcome-changes li.loss::before{content:"▼";color:#8a2d2d;opacity:1}
.outcome-panel .outcome-changes li.occurrence{font-weight:700}
.outcome-panel .outcome-onwards{font:inherit;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:10px 26px;cursor:pointer;border:0;border-radius:3px;background:#2f6f78;color:#fff}
.outcome-panel .outcome-onwards:focus-visible{outline:3px solid #d9b45a;outline-offset:2px}
.runtime-notice{margin:10px auto;max-width:960px;padding:10px 16px;border-radius:4px;background:#f3e3b5;color:#3b2b10;font-weight:600}
`;

export function formatName(value) {
  return String(value ?? "").split("-").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ") || "Unknown";
}

const locationName = (id) => locations[id]?.name ?? formatName(id);
const count = (map, id) => Number(map?.[id] ?? 0);
const keys = (...maps) => [...new Set(maps.flatMap((map) => Object.keys(map ?? {})))];

// Pure: turn a before/after state pair into player-facing change lines.
export function describeChanges(before, after) {
  const lines = [];
  const quantity = (label, id, from, to) => {
    const diff = to - from;
    if (diff > 0) lines.push({ kind: "gain", text: `You've gained ${diff} x ${label} (new total ${to}).` });
    if (diff < 0) lines.push({ kind: "loss", text: `You've lost ${-diff} x ${label} (new total ${to}).` });
  };

  quantity("Echoes", "echoes", Number(before.echoes ?? 0), Number(after.echoes ?? 0));
  for (const id of keys(before.items, after.items)) quantity(formatName(id), id, count(before.items, id), count(after.items, id));

  for (const id of keys(before.qualities, after.qualities)) {
    const from = count(before.qualities, id);
    const to = count(after.qualities, id);
    const name = formatName(id);
    if (from === to) continue;
    if (from === 0) lines.push({ kind: "occurrence", text: `An occurrence! Your '${name}' quality is now ${to}!` });
    else if (to > from) lines.push({ kind: "gain", text: `Your '${name}' quality has increased by ${to - from} to ${to}.` });
    else lines.push({ kind: "loss", text: `Your '${name}' quality has dropped by ${from - to} to ${to}.` });
  }

  for (const id of keys(before.menaces, after.menaces)) {
    const from = count(before.menaces, id);
    const to = count(after.menaces, id);
    if (to > from) lines.push({ kind: "loss", text: `Your '${formatName(id)}' menace has increased to ${to}.` });
    if (to < from) lines.push({ kind: "gain", text: `Your '${formatName(id)}' menace has decreased to ${to}.` });
  }

  for (const id of after.unlockedLocations ?? []) {
    if (!(before.unlockedLocations ?? []).includes(id)) lines.push({ kind: "occurrence", text: `A new area is open to you: ${locationName(id)}.` });
  }
  for (const id of after.acquaintances ?? []) {
    if (!(before.acquaintances ?? []).includes(id)) lines.push({ kind: "occurrence", text: `You have made an acquaintance: ${formatName(id)}.` });
  }
  if (after.locationId && after.locationId !== before.locationId) {
    lines.push({ kind: "move", text: `You have moved to a new area: ${locationName(after.locationId)}.` });
  }
  return lines;
}

// Replaces the story board with the result panel. Returns the panel element.
export function showOutcome(app, { storyId, outcome, before, after }, onOnwards) {
  ensureStyle(app.ownerDocument);
  const board = app.querySelector(".board-inner") ?? app.querySelector("#stories") ?? app;
  const challenge = outcome.challenge;
  const verdict = challenge
    ? outcome.success
      ? `You succeeded in a ${formatName(challenge.quality)} challenge! (${outcome.total} vs ${challenge.difficulty})`
      : `Your ${formatName(challenge.quality)} challenge failed. (${outcome.total} vs ${challenge.difficulty})`
    : "";
  const changes = describeChanges(before, after);

  board.innerHTML = `
    <section class="outcome-panel" aria-live="polite">
      <h2 tabindex="-1">${escapeHtml(stories[storyId]?.title ?? formatName(storyId))}</h2>
      ${verdict ? `<p class="outcome-verdict ${outcome.success ? "success" : "failure"}">${escapeHtml(verdict)}</p>` : ""}
      <p class="outcome-text">${escapeHtml(outcome.result ?? "")}</p>
      ${changes.length ? `<ul class="outcome-changes">${changes.map((c) => `<li class="${c.kind}">${escapeHtml(c.text)}</li>`).join("")}</ul>` : ""}
      <button type="button" class="outcome-onwards" data-action="onwards">Onwards</button>
    </section>`;
  board.querySelector("[data-action=onwards]").addEventListener("click", onOnwards);
  board.querySelector("h2").focus({ preventScroll: true });
  return board.querySelector(".outcome-panel");
}

export function showNotice(app, message) {
  ensureStyle(app.ownerDocument);
  app.querySelector(".runtime-notice")?.remove();
  const notice = app.ownerDocument.createElement("p");
  notice.className = "runtime-notice";
  notice.setAttribute("role", "status");
  notice.textContent = message;
  app.prepend(notice);
}

function ensureStyle(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = STYLE;
  doc.head.append(style);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
