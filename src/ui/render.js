import { availableChoices, availableStories, currentLocation, effectiveChallenge } from "../game/engine.js?v=20260930-9";
import { locations, stories as storyDefinitions } from "../game/content.js?v=20260930-9";
import { bazaarStock, equipmentBonuses, itemDefinition } from "../game/items.js?v=20260930-9";
import { loadPreferences } from "./preferences.js?v=20260930-9";

const icon = { nerve: "◉", insight: "◆", poise: "✦", shadow: "◒" };

export function render(app, state, handlers, ui = {}) {
  const location = currentLocation(state);
  const view = ui.view ?? "story";
  const pending = Boolean(ui.pending);
  const visibleStories = availableStories(state);
  const preferences = loadPreferences();
  const bonuses = equipmentBonuses(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => Number(quantity) > 0);
  const unlockedLocations = (state.unlockedLocations ?? [])
    .map((id) => ({ id, location: locations[id] }))
    .filter((entry) => entry.location);

  const qualitiesHtml = Object.entries(state.qualities ?? {}).map(([key, value]) => {
    const bonus = Number(bonuses[key] ?? 0);
    const effective = Number(value) + bonus;
    return [
      '<div class="quality-row quality-', escapeClass(key), '">',
      '<div class="quality-icon"><span>', icon[key] ?? "•", '</span></div>',
      '<div class="quality-main">',
      '<div class="quality-title"><strong>', formatName(key), '</strong><span>', value, bonus ? '<em>+', bonus, '</em>' : '', '</span></div>',
      '<small class="quality-rating">Effective ', effective, bonus ? ' · equipment +' + bonus : '', '</small>',
      '</div></div>'
    ].join("");
  }).join("");

  const menaceHtml = Object.entries(state.menaces ?? {}).map(([key, value]) => {
    const severity = menaceSeverity(Number(value));
    return [
      '<div class="menace-card menace-', severity.className, '">',
      '<div><strong>', formatName(key), '</strong><small>', severity.label, '</small></div>',
      '<span>', value, '</span>',
      Number(value) > 0
        ? '<button data-recover="' + key + '"' + (pending || Number(state.echoes ?? 0) < 3 ? ' disabled' : '') + '>RECOVER · 3 ECHOES</button>'
        : '',
      '</div>'
    ].join("");
  }).join("");

  const storiesHtml = visibleStories.map((story) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const challenge = effectiveChallenge(story, choice);
      const challengeHtml = challenge
        ? renderChallenge(state, challenge, bonuses)
        : '<div class="challenge-line simple"><span class="challenge-icon">◆</span><span><strong>A straightforward choice</strong><small>No challenge roll</small></span></div>';
      return [
        '<div class="choice-row">',
        '<div class="choice-copy"><strong>', escapeHtml(choice.label), '</strong>', challengeHtml, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" ',
        available.has(choice.id) && !pending ? '' : 'disabled',
        '>', pending ? 'WAIT…' : 'GO', '</button>',
        '</div>'
      ].join("");
    }).join("");

    return [
      '<article class="storylet story-', escapeClass(story.id), '">',
      '<div class="story-art story-art-', escapeClass(story.id), '" aria-hidden="true"><span></span></div>',
      '<div class="story-body">',
      '<button class="bookmark', preferences.bookmarks.includes(story.id) ? ' is-bookmarked' : '', '" type="button" data-action="bookmark" data-story="', story.id, '" aria-label="', preferences.bookmarks.includes(story.id) ? 'Remove bookmark' : 'Bookmark story', '" aria-pressed="', preferences.bookmarks.includes(story.id), '">◆</button>',
      '<h3>', escapeHtml(story.title), '</h3>',
      '<p>', escapeHtml(story.text), '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  }).join("");

  const opportunityHtml = renderOpportunities(state, pending);
  const goalHtml = renderMainGoal(state);
  const resultHtml = ui.outcome
    ? renderOutcome(ui.outcome)
    : (ui.notice ? renderNotice(ui.notice) : "");

  const inventoryHtml = inventory.length
    ? inventory.map(([itemId, quantity]) => renderInventoryCard(state, itemId, quantity, pending)).join("")
    : '<p class="empty-state">You are carrying nothing of note.</p>';

  const bazaarHtml = bazaarStock.map((itemId) => {
    const item = itemDefinition(itemId);
    const canBuy = Number(state.echoes ?? 0) >= Number(item.price ?? 0) && !pending;
    return [
      '<article class="inventory-card shop-card">',
      '<h3>', escapeHtml(item.name), '</h3>',
      '<p>', escapeHtml(item.description), '</p>',
      '<small>', escapeHtml(modifierText(item.modifiers ?? {})), '</small>',
      '<button data-transaction="buy" data-item="', itemId, '"', canBuy ? '' : ' disabled', '>BUY · ', item.price, ' ECHOES</button>',
      '</article>'
    ].join("");
  }).join("");

  const events = (state.events ?? []).length
    ? state.events.map(renderEvent).join("")
    : (state.journal ?? []).map((entry) => '<li>' + escapeHtml(entry) + '</li>').join("");

  const plans = preferences.bookmarks
    .map((id) => storyDefinitions[id] ? ({ id, ...storyDefinitions[id] }) : null)
    .filter(Boolean);
  const plansHtml = plans.length
    ? plans.map((story) => [
        '<article class="plan-card parchment">',
        '<h3>', escapeHtml(story.title), '</h3>',
        '<p>', escapeHtml(story.kicker ?? story.text), '</p>',
        '<button data-action="bookmark" data-story="', story.id, '">REMOVE PLAN</button>',
        '</article>'
      ].join("")).join("")
    : '<p class="empty-state">Bookmark a story to pin it here as a plan.</p>';

  const equipmentHtml = Object.entries(state.equipment ?? {}).map(([slot, itemId]) => [
    '<div class="equipment-slot"><strong>', formatName(slot), '</strong><span>',
    itemId ? escapeHtml(itemDefinition(itemId).name) : 'Empty',
    '</span></div>'
  ].join("")).join("");

  const viewHtml = {
    story: [
      '<section class="story-board"><div class="board-inner">',
      '<section class="featured-story">',
      '<div class="feature-art" aria-hidden="true"><span>⌕</span></div>',
      '<div class="feature-copy">',
      '<button class="edit-dot" type="button" data-action="edit-note" data-note-key="location:', state.locationId, '" aria-label="Edit location note">✎</button>',
      '<h2>', escapeHtml(location.name), '</h2>',
      '<p>', escapeHtml(location.subtitle), '</p>',
      '<p class="feature-note"><strong>', escapeHtml(preferences.notes[`location:${state.locationId}`] ?? location.atmosphere), '</strong></p>',
      '</div></section>',
      goalHtml,
      opportunityHtml,
      '<section class="story-stack">', storiesHtml || '<p class="empty-state">No stories are currently available here. Try travelling or checking your plans.</p>', '</section>',
      '</div></section>'
    ].join(""),
    messages: [
      '<section class="screen-panel parchment"><h2>Messages & Journal</h2>',
      '<p class="screen-intro">A structured record of choices, outcomes and changes.</p>',
      '<ol class="journal-list">', events, '</ol>',
      '<button class="secondary-action" data-action="export-journal">EXPORT JOURNAL</button>',
      '</section>'
    ].join(""),
    myself: [
      '<section class="screen-panel parchment"><h2>Myself</h2>',
      '<p class="screen-intro">Your actual qualities, equipment and menaces.</p>',
      '<div class="profile-grid"><div><h3>Qualities</h3>', qualitiesHtml,
      '<h3>Equipment</h3><div class="equipment-list">', equipmentHtml, '</div></div>',
      '<div><h3>Menaces</h3><div class="menace-list">', menaceHtml, '</div></div></div>',
      '</section>'
    ].join(""),
    possessions: [
      '<section class="screen-panel parchment"><h2>Possessions</h2>',
      '<p class="screen-intro">Equip possessions for real challenge bonuses, or sell things you no longer need.</p>',
      '<div class="inventory-grid">', inventoryHtml, '</div></section>'
    ].join(""),
    bazaar: [
      '<section class="screen-panel parchment"><h2>The Exchange</h2>',
      '<p class="screen-intro">Current balance: <strong>', state.echoes, ' Echoes</strong>. These purchases have real equipment effects.</p>',
      '<div class="inventory-grid">', bazaarHtml, '</div></section>'
    ].join(""),
    plans: [
      '<section class="screen-panel parchment"><h2>Plans</h2>',
      '<p class="screen-intro">Bookmarked stories and goals you want to return to.</p>',
      '<div class="plans-grid">', plansHtml, '</div></section>'
    ].join("")
  }[view];

  app.innerHTML = [
    '<div class="game-shell">',
    '<header class="topbar">',
    '<h1 class="brand">NEATH<span>◆</span>BOUND</h1>',
    '<nav class="account-nav" aria-label="Account">',
    '<button class="text-link" data-action="reset"', pending ? ' disabled' : '', '>New life</button>',
    '<span class="save-mode">', ui.mode === "online" ? 'Online save' : 'Local save', '</span>',
    '</nav></header>',

    '<section class="city-banner" aria-label="NeathBound cavern panorama">',
    '<div class="cave-ceiling"></div><div class="mist mist-back"></div><div class="distant-ridges"></div>',
    '<div class="distant-city"></div><div class="mist mist-front"></div><div class="water"></div>',
    '<div class="central-spire"></div><div class="near-rocks"></div><div class="city-lamp left"></div><div class="city-lamp right"></div>',
    '</section>',

    '<nav class="main-tabs" aria-label="Game sections">',
    tab("story", "STORY", view),
    tab("messages", "MESSAGES", view),
    tab("myself", "MYSELF", view),
    tab("possessions", "POSSESSIONS", view),
    tab("bazaar", "BAZAAR", view),
    tab("plans", "PLANS", view),
    '</nav>',

    '<div class="game-grid">',
    '<aside class="left-rail" id="character" aria-label="Character details">',
    '<section class="candle-block"><div class="candle"><span class="wick"></span><span class="wax-line w1"></span><span class="wax-line w2"></span><span class="wax-line w3"></span><span class="wax-line w4"></span></div>',
    '<div class="action-copy"><strong>Actions</strong><div>∞</div><small>', pending ? 'Resolving…' : 'Unlimited', '</small></div></section>',
    '<section class="side-section echoes-section"><div class="side-icon echo-icon">₠</div><div><strong>Echoes</strong><div>', state.echoes, '</div></div></section>',
    '<section class="qualities-list">', qualitiesHtml, '</section>',
    '</aside>',

    '<main class="story-column" id="main-content">', resultHtml, viewHtml, '</main>',

    '<aside class="right-rail">',
    '<section class="welcome-panel"><p>It&apos;s <strong class="user-name">', escapeHtml(state.name), '</strong>!</p>',
    '<h2>Welcome to</h2><h3>', escapeHtml(location.name), '.</h3><p class="welcome-tail">delicious stranger!</p>',
    '<label class="travel-label" for="travel-location">Travel to</label>',
    '<select id="travel-location" aria-label="Travel destination">',
    unlockedLocations.map(({ id, location: destination }) => '<option value="' + id + '"' + (id === state.locationId ? ' selected' : '') + '>' + escapeHtml(destination.name) + '</option>').join(""),
    '</select>',
    '<button class="travel-button" data-action="travel"', pending || unlockedLocations.length <= 1 ? ' disabled' : '', '>', pending ? 'WAIT…' : 'TRAVEL', '</button>',
    '</section>',
    '<section class="glossary parchment"><button class="edit-dot" type="button" data-action="edit-note" data-note-key="glossary" aria-label="Edit quality note">✎</button>',
    '<h3>What is a quality?</h3><p>', escapeHtml(preferences.notes.glossary ?? "A quality is something the city remembers about you. Equipment can modify it without changing its base value."), '</p></section>',
    '</aside>',

    '</div>',
    '<footer class="game-footer"><span>© NeathBound · Original open-source fiction</span>',
    '<nav><a href="#story" data-view="story">Story</a><span>|</span><a href="#messages" data-view="messages">Journal</a><span>|</span><a href="#possessions" data-view="possessions">Possessions</a></nav>',
    '</footer></div>'
  ].join("");

  bind(app, handlers);
}

function bind(app, handlers) {
  app.querySelectorAll("[data-choice]").forEach((button) =>
    button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
  app.querySelectorAll("[data-view]").forEach((link) =>
    link.addEventListener("click", (event) => { event.preventDefault(); handlers.navigate(link.dataset.view); }));
  app.querySelectorAll("[data-transaction]").forEach((button) =>
    button.addEventListener("click", () => handlers.transact(button.dataset.transaction, button.dataset.item)));
  app.querySelectorAll("[data-recover]").forEach((button) =>
    button.addEventListener("click", () => handlers.recover(button.dataset.recover)));
  app.querySelector("[data-action=draw-opportunity]")?.addEventListener("click", handlers.drawOpportunity);
  app.querySelectorAll("[data-discard-opportunity]").forEach((button) =>
    button.addEventListener("click", () => handlers.discardOpportunity(button.dataset.discardOpportunity)));
  app.querySelectorAll("[data-action=bookmark]").forEach((button) =>
    button.addEventListener("click", () => handlers.bookmark(button.dataset.story)));
  app.querySelectorAll("[data-action=edit-note]").forEach((button) =>
    button.addEventListener("click", () => handlers.editNote(button.dataset.noteKey)));
  app.querySelector("[data-action=continue]")?.addEventListener("click", handlers.continue);
  app.querySelector("[data-action=travel]")?.addEventListener("click", () =>
    handlers.travel(app.querySelector("#travel-location")?.value));
  app.querySelector("[data-action=reset]")?.addEventListener("click", handlers.reset);
  app.querySelector("[data-action=export-journal]")?.addEventListener("click", () => exportJournal(app));
}

function renderChallenge(state, challenge, bonuses) {
  const base = Number(state.qualities?.[challenge.quality] ?? 0);
  const bonus = Number(bonuses[challenge.quality] ?? 0);
  const effective = base + bonus;
  const minimumRoll = Math.max(1, Number(challenge.difficulty) - effective);
  const successes = minimumRoll > 10 ? 0 : Math.max(0, 11 - minimumRoll);
  const chance = Math.min(100, successes * 10);
  return [
    '<div class="challenge-line"><span class="challenge-icon">', icon[challenge.quality] ?? "•", '</span>',
    '<span><strong>', formatName(challenge.quality), ' challenge</strong>',
    '<small>Effective ', effective, ' · ', chance, '% chance of success</small></span></div>'
  ].join("");
}

function renderInventoryCard(state, itemId, quantity, pending) {
  const item = itemDefinition(itemId);
  const equipped = Object.values(state.equipment ?? {}).includes(itemId);
  return [
    '<article class="inventory-card">',
    '<h3>', escapeHtml(item.name), quantity > 1 ? ' ×' + quantity : '', '</h3>',
    '<p>', escapeHtml(item.description), '</p>',
    '<small>', escapeHtml(item.category), item.modifiers ? ' · ' + escapeHtml(modifierText(item.modifiers)) : '', '</small>',
    '<div class="item-actions">',
    item.equipSlot ? '<button data-transaction="equip" data-item="' + itemId + '"' + (pending ? ' disabled' : '') + '>' + (equipped ? 'UNEQUIP' : 'EQUIP') + '</button>' : '',
    Number(item.sellValue ?? 0) > 0 ? '<button data-transaction="sell" data-item="' + itemId + '"' + (pending ? ' disabled' : '') + '>SELL · ' + item.sellValue + '</button>' : '',
    '</div></article>'
  ].join("");
}

function renderOutcome(outcome) {
  const changes = (outcome.changes ?? []).map((change) => {
    if (change.type === "location") return '<li><strong>Location:</strong> ' + escapeHtml(formatName(change.after)) + '</li>';
    const sign = Number(change.delta) > 0 ? "+" : "";
    return '<li><strong>' + escapeHtml(change.label ?? formatName(change.id)) + ':</strong> ' + sign + change.delta + ' (' + change.after + ')</li>';
  }).join("");
  const challenge = outcome.challenge
    ? '<p class="result-challenge">' + (outcome.success ? "You succeeded" : "You failed") + ' in a ' + escapeHtml(formatName(outcome.challenge.quality)) + ' challenge' + (outcome.total != null ? ' (' + outcome.total + ' vs ' + outcome.challenge.difficulty + ')' : '') + '.</p>'
    : '';
  return [
    '<section class="action-result ', outcome.rejected ? 'rejected' : outcome.success ? 'success' : 'failure',
    '" id="action-result" tabindex="-1" aria-live="assertive">',
    '<p class="eyebrow">', outcome.rejected ? 'THE CITY HAS MOVED ON' : outcome.success ? 'SUCCESS' : 'FAILURE', '</p>',
    '<h2>', escapeHtml(outcome.title ?? "Result"), '</h2>',
    '<p>', escapeHtml(outcome.result ?? outcome.error ?? ""), '</p>',
    challenge,
    changes ? '<ul class="result-changes">' + changes + '</ul>' : '',
    '<button data-action="continue">CONTINUE</button></section>'
  ].join("");
}

function renderNotice(message) {
  return '<section class="action-result rejected" id="action-result" tabindex="-1" role="status"><h2>Notice</h2><p>' + escapeHtml(message) + '</p><button data-action="continue">CONTINUE</button></section>';
}

function renderEvent(event) {
  const when = event.at ? new Date(event.at).toLocaleString() : "";
  const changes = (event.changes ?? []).map((change) => {
    const sign = Number(change.delta) > 0 ? "+" : "";
    return escapeHtml(change.label ?? formatName(change.id)) + " " + sign + (change.delta ?? "");
  }).join(", ");
  return '<li><strong>' + escapeHtml(event.title ?? "Event") + '</strong><p>' + escapeHtml(event.text ?? "") + '</p><small>' + escapeHtml(when) + (changes ? ' · ' + changes : '') + '</small></li>';
}

function menaceSeverity(value) {
  if (value >= 8) return { label: "Critical", className: "critical" };
  if (value >= 5) return { label: "Serious", className: "serious" };
  if (value >= 2) return { label: "Rising", className: "rising" };
  return { label: value > 0 ? "Minor" : "Clear", className: "clear" };
}

function modifierText(modifiers) {
  const parts = Object.entries(modifiers ?? {}).map(([key, value]) => `${formatName(key)} +${value}`);
  return parts.length ? parts.join(" · ") : "No quality modifier";
}

function tab(id, label, active) {
  return '<a href="#' + id + '" data-view="' + id + '" class="' + (active === id ? 'active' : '') + '" aria-current="' + (active === id ? 'page' : 'false') + '">' + label + '</a>';
}

function exportJournal(app) {
  const lines = [...app.querySelectorAll(".journal-list li")].map((li) => li.innerText.trim()).filter(Boolean);
  const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "neathbound-journal.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function formatName(value) {
  if (value === undefined || value === null || value === "") return "Unknown";
  return String(value).split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").filter(Boolean).join(" ");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeClass(value) {
  return String(value ?? "unknown").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}


function renderOpportunities(state, pending) {
  const hand = state.hand ?? [];
  const cards = hand.map((id) => {
    const story = storyDefinitions[id];
    if (!story) return "";
    return '<article class="opportunity-card"><strong>' + escapeHtml(story.title) + '</strong><small>' + escapeHtml(story.kicker ?? "") + '</small><button data-discard-opportunity="' + id + '"' + (pending ? ' disabled' : '') + '>DISCARD</button></article>';
  }).join("");
  return '<section class="opportunity-hand"><div class="section-heading"><div><p class="eyebrow">Opportunities</p><h3>Hand ' + hand.length + '/3</h3></div><button data-action="draw-opportunity"' + (pending || hand.length >= 3 ? ' disabled' : '') + '>DRAW</button></div><div class="opportunity-cards">' + (cards || '<p class="empty-state">Your hand is empty. Draw an opportunity in this district.</p>') + '</div></section>';
}

function renderMainGoal(state) {
  const goal = mainGoal(state);
  return '<section class="main-goal"><p class="eyebrow">Current objective</p><h3>' + escapeHtml(goal.title) + '</h3><p>' + escapeHtml(goal.text) + '</p></section>';
}

function mainGoal(state) {
  const flags = state.flags ?? {};
  if (!flags["bell-under-water:descend"]) return { title: "Follow the brass key", text: "Investigate the bell beneath Lantern Quay and learn why the key you woke with responds to it." };
  if (!flags["story-complete:red-thread"]) return { title: "Follow what was lost", text: "The Velvet Market is full of routes that do not appear on maps. Find the child with the red thread." };
  if ((state.items?.["archive-key"] ?? 0) > 0) return { title: "Find the key's door", text: "Take the archive key to the Hollow Archive and discover what it unlocks." };
  if (!(state.unlockedLocations ?? []).includes("clockwork-gardens")) return { title: "Reach the Clockwork Gardens", text: "Find a route upward into the glasshouses above the Lower City." };
  if ((state.items?.["small-sun"] ?? 0) > 0) return { title: "Return the borrowed darkness", text: "The small sun came with a promise. Carry its displaced darkness back to the Gardens." };
  if (flags["bound-into-the-index"] && !flags["read-own-entry"]) return { title: "Look yourself up", text: "You have become an entry in the Archive. Find out what the Index says about you." };
  return { title: "Decide what the city remembers", text: "Follow your plans, reduce your menaces, and pursue the consequences of the choices you have made." };
}
