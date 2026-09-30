import { availableStories, currentLocation } from "../game/engine.js";

const icon = { nerve: "✦", insight: "◈", poise: "◇" };

export function render(app, state, handlers) {
  const location = currentLocation(state);
  const stories = availableStories(state);
  app.innerHTML = `
    <div class="shell">
      <header class="masthead">
        <div><p class="eyebrow">A city beneath the world</p><h1>NEATHBOUND</h1></div>
        <div class="header-actions"><span class="save-note" aria-live="polite">Saved locally</span><button data-action="reset" class="quiet-button">New life</button></div>
      </header>
      <div class="layout">
        <aside class="sidebar" aria-label="Character details">
          <div class="portrait"><span>✶</span></div>
          <h2>${escapeHtml(state.name)}</h2><p class="muted">A visitor without a surface</p>
          <div class="currency"><span>Echoes</span><strong>${state.echoes}</strong></div>
          <div class="qualities"><h3>Qualities</h3>${Object.entries(state.qualities).map(([key, value]) => `<div class="quality"><span>${icon[key]} ${key}</span><b>${value}</b></div>`).join("")}</div>
          <div class="satchel"><h3>Satchel</h3><p>${state.items.length ? state.items.map((item) => `<span class="tag">${formatName(item)}</span>`).join("") : `<span class="muted">Empty, for now.</span>`}</p></div>
        </aside>
        <main class="main-column">
          <section class="location-card"><div><p class="eyebrow">You are here</p><h2>${location.name}</h2><p>${location.subtitle}</p></div><p class="atmosphere">${location.atmosphere}</p></section>
          <section class="stories"><div class="section-heading"><div><p class="eyebrow">Choose your next trouble</p><h2>Stories</h2></div><span class="unlimited">∞ unlimited actions</span></div>
            ${stories.map((story) => `<article class="story-card"><p class="kicker">${story.kicker}</p><h3>${story.title}</h3><p>${story.text}</p>${story.challenge ? `<p class="challenge">${icon[story.challenge.stat]} ${story.challenge.stat} challenge · ${story.challenge.difficulty}</p>` : ""}<div class="choices">${story.choices.map((choice) => `<button class="choice" data-story="${story.id}" data-choice="${choice.id}">${choice.label}<span>→</span></button>`).join("")}</div></article>`).join("")}
          </section>
          <section class="journal"><div class="section-heading"><div><p class="eyebrow">What the city remembers</p><h2>Journal</h2></div></div><ol>${state.journal.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ol></section>
        </main>
      </div>
      <footer><span>Neathbound is original open-source fiction.</span><span>Play at your own pace. No waiting.</span></footer>
    </div>`;
  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
}

function formatName(value) { return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]); }
