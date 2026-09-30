import { locations } from "../game/content.js";
import { availableStories, currentLocation } from "../game/engine.js";

const icon = { nerve: "✦", insight: "◈", poise: "◇", shadow: "◌" };
const menaceIcon = { dread: "☽", scandal: "♢", wounds: "†", suspicion: "!" };

export function render(app, state, handlers) {
  const location = currentLocation(state);
  const stories = availableStories(state);
  const unlocked = Object.entries(locations).filter(([id]) => state.unlockedLocations.includes(id));
  app.innerHTML = `
    <div class="shell">
      <header class="masthead">
        <div><p class="eyebrow">A city beneath the world</p><h1>NEATHBOUND</h1></div>
        <div class="header-actions"><span class="save-note" aria-live="polite">Saved locally · actions never run out</span><button data-action="reset" class="quiet-button">New life</button></div>
      </header>
      <nav class="top-nav" aria-label="Game sections"><button class="nav-tab active">Story</button><button class="nav-tab" data-action="map">Map</button><button class="nav-tab" data-action="journal">Journal</button><span class="nav-spacer"></span><span class="free-actions">∞ Free actions</span></nav>
      <div class="layout">
        <aside class="sidebar" aria-label="Character details">
          <div class="portrait"><span>✶</span></div>
          <h2>${escapeHtml(state.name)}</h2><p class="muted">A visitor without a surface</p>
          <div class="currency"><span>Echoes</span><strong>${state.echoes}</strong></div>
          <div class="qualities"><h3>Qualities</h3>${Object.entries(state.qualities).map(([key, value]) => `<div class="quality"><span>${icon[key] ?? "·"} ${key}</span><b>${value}</b></div>`).join("")}</div>
          <div class="menaces"><h3>Menaces</h3>${Object.entries(state.menaces).map(([key, value]) => `<div class="quality menace"><span>${menaceIcon[key]} ${key}</span><b>${value}</b></div>`).join("")}</div>
          <div class="satchel"><h3>Possessions</h3><p>${state.items.length ? state.items.map((item) => `<span class="tag">${formatName(item)}</span>`).join("") : `<span class="muted">Empty, for now.</span>`}</p></div>
        </aside>
        <main class="main-column">
          <section class="location-card"><div><p class="eyebrow">${location.region} · You are here</p><h2>${location.name}</h2><p>${location.subtitle}</p></div><p class="atmosphere">${location.atmosphere}</p></section>
          <section class="stories"><div class="section-heading"><div><p class="eyebrow">Storylets and opportunities</p><h2>Stories</h2></div><span class="unlimited">∞ play without waiting</span></div>
            ${stories.map((story) => storyCard(story)).join("")}
          </section>
          <section class="map-panel" data-panel="map" hidden><div class="section-heading"><div><p class="eyebrow">Travel</p><h2>The city</h2></div></div><div class="location-list">${unlocked.map(([id, place]) => `<button class="location-button ${id === state.locationId ? "current" : ""}" data-location="${id}"><span><b>${place.name}</b><small>${place.region}</small></span><span>→</span></button>`).join("")}</div></section>
          <section class="journal" data-panel="journal"><div class="section-heading"><div><p class="eyebrow">Your history</p><h2>Journal</h2></div></div><ol>${state.journal.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ol></section>
        </main>
      </div>
      <footer><span>Neathbound is original open-source fiction.</span><span>Play at your own pace. No waiting.</span></footer>
    </div>`;
  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
  app.querySelector("[data-action=map]").addEventListener("click", () => togglePanel(app, "map"));
  app.querySelector("[data-action=journal]").addEventListener("click", () => togglePanel(app, "journal"));
  app.querySelectorAll("[data-location]").forEach((button) => button.addEventListener("click", () => handlers.travel(button.dataset.location)));
}

function storyCard(story) {
  const locked = !story.available;
  const requirement = story.requirements?.item ? `Requires: ${formatName(story.requirements.item)}` : "Requires a discovery";
  return `<article class="story-card ${locked ? "locked" : ""}"><p class="kicker">${story.kicker}${story.tags?.includes("opportunity") ? " · opportunity" : ""}</p><h3>${story.title}</h3><p>${story.text}</p>${locked ? `<p class="challenge locked-text">▣ ${requirement}</p>` : story.challenge ? `<p class="challenge">${icon[story.challenge.stat]} ${story.challenge.stat} challenge · target ${story.challenge.difficulty}</p>` : ""}<div class="choices">${story.choices.map((choice) => `<button class="choice" ${locked ? "disabled" : ""} data-story="${story.id}" data-choice="${choice.id}">${choice.label}<span>→</span></button>`).join("")}</div></article>`;
}

function togglePanel(app, panel) {
  app.querySelectorAll("[data-panel]").forEach((node) => { node.hidden = panel !== node.dataset.panel; });
  app.querySelector(".stories").hidden = panel !== "story";
  app.querySelectorAll(".nav-tab").forEach((tab) => tab.classList.toggle("active", tab.textContent.toLowerCase() === panel));
}

function formatName(value) { return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]); }
