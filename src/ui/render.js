const icon = { nerve: "✦", insight: "◈", poise: "◇" };

// view: { character, phase: "Available"|"In", storylets?|storylet?, outcome?, error? }
export function render(app, view, content, mode, handlers) {
  const { character } = view;
  const area = character.area ?? content.areas[character.areaId];
  const byCategory = (category) => Object.entries(character.qualities)
    .filter(([id]) => content.qualities[id]?.category === category);
  const stats = byCategory("stat");
  const items = byCategory("item");
  const echoes = character.qualities.echoes ?? 0;
  const saveNote = mode === "online" ? "Saved to your account" : "Saved locally";
  const cards = view.phase === "In" ? [view.storylet] : view.storylets;

  app.innerHTML = `
    <div class="shell">
      <header class="masthead">
        <div><p class="eyebrow">A city beneath the world</p><h1>NEATHBOUND</h1></div>
        <div class="header-actions"><span class="save-note" aria-live="polite">${saveNote}</span><button data-action="reset" class="quiet-button">New life</button></div>
      </header>
      <div class="layout">
        <aside class="sidebar" aria-label="Character details">
          <div class="portrait"><span>✶</span></div>
          <h2>${escapeHtml(character.name)}</h2><p class="muted">A visitor without a surface</p>
          <div class="currency"><span>Echoes</span><strong>${echoes}</strong></div>
          <div class="qualities"><h3>Qualities</h3>${stats.map(([id, value]) => `<div class="quality"><span>${icon[id] ?? "•"} ${escapeHtml(content.qualities[id].name)}</span><b>${value}</b></div>`).join("")}</div>
          <div class="satchel"><h3>Satchel</h3><p>${items.length ? items.map(([id]) => `<span class="tag">${escapeHtml(content.qualities[id].name)}</span>`).join("") : `<span class="muted">Empty, for now.</span>`}</p></div>
        </aside>
        <main class="main-column">
          ${view.error ? `<p class="notice" role="alert">${escapeHtml(view.error)}</p>` : ""}
          ${view.outcome ? outcomeCard(view.outcome, content) : ""}
          <section class="location-card"><div><p class="eyebrow">You are here</p><h2>${escapeHtml(area.name)}</h2><p>${escapeHtml(area.subtitle)}</p></div><p class="atmosphere">${escapeHtml(area.atmosphere)}</p></section>
          <section class="stories"><div class="section-heading"><div><p class="eyebrow">Choose your next trouble</p><h2>Stories</h2></div><span class="unlimited">∞ unlimited actions</span></div>
            ${cards.map((storylet) => storyletCard(storylet, content)).join("")}
            ${view.phase === "In" ? `<button class="quiet-button" data-action="back">← Perhaps not</button>` : ""}
          </section>
          <section class="journal"><div class="section-heading"><div><p class="eyebrow">What the city remembers</p><h2>Journal</h2></div></div><ol>${character.journal.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ol></section>
        </main>
      </div>
      <footer><span>Neathbound is original open-source fiction.</span><span>Play at your own pace. No waiting.</span></footer>
    </div>`;

  app.querySelectorAll("[data-branch]").forEach((button) =>
    button.addEventListener("click", () => handlers.choose(button.dataset.storylet, button.dataset.branch)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
  app.querySelector("[data-action=back]")?.addEventListener("click", handlers.back);
}

function storyletCard(storylet, content) {
  const challenge = storylet.branches.find((b) => b.challenge)?.challenge;
  return `<article class="story-card"><p class="kicker">${escapeHtml(storylet.kicker)}</p><h3>${escapeHtml(storylet.title)}</h3><p>${escapeHtml(storylet.text)}</p>${challenge ? `<p class="challenge">${icon[challenge.quality] ?? "•"} ${escapeHtml(content.qualities[challenge.quality]?.name ?? challenge.quality)} challenge · ${challenge.difficulty}</p>` : ""}<div class="choices">${storylet.branches.map((branch) => branchButton(storylet, branch)).join("")}</div></article>`;
}

function branchButton(storylet, branch) {
  const locked = branch.locked ? ` disabled aria-disabled="true" title="${escapeHtml(branch.unmet.join(", "))}"` : "";
  const needs = branch.locked ? `<small class="unmet">Requires: ${escapeHtml(branch.unmet.join(", "))}</small>` : "";
  return `<button class="choice" data-storylet="${escapeHtml(storylet.id)}" data-branch="${escapeHtml(branch.id)}"${locked}>${escapeHtml(branch.label)}${needs}<span>→</span></button>`;
}

function outcomeCard(outcome, content) {
  const changes = outcome.changes.map((c) => `${content.qualities[c.quality]?.name ?? c.quality} ${c.after > c.before ? "+" : ""}${c.after - c.before}`);
  const verdict = outcome.challenge ? `${outcome.success ? "Success" : "Failure"} · rolled ${outcome.roll} vs ${outcome.challenge.difficulty}` : "";
  return `<section class="outcome-card" aria-live="polite"><p class="eyebrow">${verdict || "What happened"}</p><p>${escapeHtml(outcome.text)}</p>${changes.length ? `<p class="changes">${changes.map(escapeHtml).join(" · ")}</p>` : ""}</section>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
