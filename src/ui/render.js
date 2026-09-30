import { availableChoices, availableStories, currentLocation, effectiveChallenge } from "../game/engine.js?v=20260930-9";
import { locations } from "../game/content.js?v=20260930-9";\nimport { bazaarStock, equipmentBonuses, itemDefinition } from "../game/items.js?v=20260930-9";
import { loadPreferences } from "./preferences.js?v=20260930-9";

const icon = { nerve: "◉", insight: "◆", poise: "✦", shadow: "◒", dread: "▲" };

export function render(app, state, handlers, ui = {}) {
  const location = currentLocation(state);\n  const view = ui.view ?? "story";\n  const pending = Boolean(ui.pending);
  const stories = availableStories(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => quantity > 0);
  const preferences = loadPreferences();
  const unlockedLocations = (state.unlockedLocations ?? []).map((id) => ({ id, location: locations[id] })).filter((entry) => entry.location);
  const locationNote = preferences.notes[`location:${state.locationId}`] ?? location.atmosphere;
  const glossaryNote = preferences.notes.glossary ?? "A quality is anything the city remembers about you: a talent, a rumour, an item, or a consequence.";

  const bonuses = equipmentBonuses(state);
  const qualitiesHtml = Object.entries(state.qualities).map(([key, value]) => {
    const bonus = Number(bonuses[key] ?? 0);
    return [
      '<div class="quality-row quality-', escapeClass(key), '">',
      '<div class="quality-icon"><span>', icon[key] ?? "•", '</span></div>',
      '<div class="quality-main">',
      '<div class="quality-title"><strong>', formatName(key), '</strong><span>', value, bonus ? '<em>+', bonus, '</em>' : '', '</span></div>',
      '<small class="quality-rating">Base ', value, bonus ? ' · equipment +' + bonus + ' · effective ' + (Number(value) + bonus) : '', '</small>',
      '</div></div>'
    ].join("");
  }).join("");

  const storiesHtml = stories.map((story, storyIndex) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const challengeQuality = choice.challenge?.quality ?? choice.challenge?.stat;
      const challenge = choice.challenge
        ? [
            '<div class="challenge-line">',
            '<span class="challenge-icon">', icon[challengeQuality] ?? "•", '</span>',
            '<span><strong>', formatName(challengeQuality), ' challenge</strong>',
            '<small>Difficulty ', effective.difficulty, '</small></span></div>'
          ].join("")
        : '<div class="challenge-line simple"><span class="challenge-icon">◆</span><span><strong>A straightforward choice</strong><small>No challenge roll</small></span></div>';

      return [
        '<div class="choice-row">',
        '<div class="choice-copy"><strong>', escapeHtml(choice.label), '</strong>', challenge, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" ',
        available.has(choice.id) && !pending ? "" : "disabled",
        '>', pending ? "WAIT…" : "GO", '</button></div>'
      ].join("");
    }).join("");

    return [
      '<article class="storylet">',
      '<div class="story-art art-', (storyIndex % 5) + 1, '" aria-hidden="true"><span></span></div>',
      '<div class="story-body">',
      '<button class="bookmark', preferences.bookmarks.includes(story.id) ? ' is-bookmarked' : '', '" type="button" data-action="bookmark" data-story="', story.id, '" aria-label="', preferences.bookmarks.includes(story.id) ? 'Remove bookmark' : 'Bookmark story', '" aria-pressed="', preferences.bookmarks.includes(story.id), '">◆</button>',
      '<h3>', escapeHtml(story.title), '</h3>',
      '<p>', escapeHtml(story.text), '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  }).join("");

  const journalHtml = state.journal.map((entry) => '<li>' + escapeHtml(entry) + '</li>').join("");
  const menaceHtml = Object.entries(state.menaces ?? {}).map(([key, value]) =>
    '<div class="menace-row"><strong>' + formatName(key) + '</strong><span>' + value + '</span></div>'
  ).join("");
  const resultHtml = ui.outcome ? renderOutcome(ui.outcome) : (ui.notice ? '<section class="action-result rejected" id="action-result" tabindex="-1" role="status"><h2>Notice</h2><p>' + escapeHtml(ui.notice) + '</p><button data-action="continue">CONTINUE</button></section>' : "");
  const preferencesView = loadPreferences();
  const bookmarked = preferencesView.bookmarks
    .map((id) => stories.find((story) => story.id === id))
    .filter(Boolean);
  const plansHtml = bookmarked.length
    ? bookmarked.map((story) => '<article class="plan-card parchment"><h3>' + escapeHtml(story.title) + '</h3><p>' + escapeHtml(story.kicker ?? story.text) + '</p></article>').join("")
    : '<p class="empty-state">Bookmark a story to pin it here as a plan.</p>';
  const inventoryHtml = inventory.length
    ? inventory.map(([itemId, quantity]) => {
        const item = itemDefinition(itemId);
        const equipped = Object.values(state.equipment ?? {}).includes(itemId);
        return '<article class="inventory-card"><h3>' + escapeHtml(item.name) + (quantity > 1 ? ' ×' + quantity : '') + '</h3><p>' + escapeHtml(item.description) + '</p><small>' + escapeHtml(item.category) + (item.modifiers ? ' · ' + modifierText(item.modifiers) : '') + '</small><div class="item-actions">' + (item.equipSlot ? '<button data-transaction="equip" data-item="' + itemId + '"' + (pending ? ' disabled' : '') + '>' + (equipped ? 'UNEQUIP' : 'EQUIP') + '</button>' : '') + (item.sellValue > 0 ? '<button data-transaction="sell" data-item="' + itemId + '"' + (pending ? ' disabled' : '') + '>SELL ' + item.sellValue + '</button>' : '') + '</div></article>';
      }).join("")
    : "<small>Nothing of note.</small>";
  const bazaarHtml = bazaarStock.map((itemId) => {
    const item = itemDefinition(itemId);
    return '<article class="inventory-card shop-card"><h3>' + escapeHtml(item.name) + '</h3><p>' + escapeHtml(item.description) + '</p><small>' + modifierText(item.modifiers ?? {}) + '</small><button data-transaction="buy" data-item="' + itemId + '"' + ((state.echoes ?? 0) < item.price || pending ? ' disabled' : '') + '>BUY · ' + item.price + ' ECHOES</button></article>';
  }).join("");

  app.innerHTML = [
        '<div class="game-shell outfit-', escapeClass(preferences.outfit), '">',
      '<header class="topbar">',
        '<div class="brand">NEATH<span>◆</span>BOUND</div>',
        '<nav class="account-nav" aria-label="Account">',
          '<button class="text-link" data-action="reset">New life</button>',
          '<a href="#journal">Journal</a>',
          '<a href="#possessions">Possessions</a>',
          '<a href="#stories">Stories</a>',
        '</nav>',
      '</header>',

      '<section class="city-banner" aria-label="NeathBound cavern panorama">',
        '<div class="cave-ceiling"></div>',
        '<div class="mist mist-back"></div>',
        '<div class="distant-ridges"></div>',
        '<div class="distant-city"></div>',
        '<div class="mist mist-front"></div>',
        '<div class="water"></div>',
        '<div class="central-spire"></div>',
        '<div class="near-rocks"></div>',
        '<div class="city-lamp left"></div>',
        '<div class="city-lamp right"></div>',
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
          '<section class="candle-block">',
            '<div class="candle"><span class="wick"></span><span class="wax-line w1"></span><span class="wax-line w2"></span><span class="wax-line w3"></span><span class="wax-line w4"></span></div>',
            '<div class="action-copy"><strong>Actions</strong><div>∞</div><small>Unlimited</small></div>',
          '</section>',

          '<section class="side-section">',
            '<div class="side-icon fate-icon">◇</div>',
            '<div><strong>Fate</strong><div>0</div><small>No waiting or payment gates.</small></div>',
          '</section>',

          '<section class="side-section echoes-section">',
            '<div class="side-icon echo-icon">₠</div>',
            '<div><strong>Echoes</strong><div>', state.echoes, '</div></div>',
          '</section>',

          '<section class="outfit">',
            '<label for="outfit">Outfit</label>',
            '<select id="outfit" aria-label="Outfit" data-action="outfit">',
              '<option value="morning-outfit"', preferences.outfit === "morning-outfit" ? ' selected' : '', '>Morning Outfit</option>',
              '<option value="dock-coat"', preferences.outfit === "dock-coat" ? ' selected' : '', '>Dockworker&apos;s Coat</option>',
              '<option value="archive-linen"', preferences.outfit === "archive-linen" ? ' selected' : '', '>Archive Linen</option>',
            '</select>',
          '</section>',

          '<section class="qualities-list">', qualitiesHtml, '</section>',
        '</aside>',

        '<main class="story-column" id="stories">',
          resultHtml,
          view === "story" ? '<section class="story-board">' : '',
            '<div class="board-inner">',
              '<section class="featured-story">',
                '<div class="feature-art" aria-hidden="true"><span>⌕</span></div>',
                '<div class="feature-copy">',
                  '<button class="edit-dot" type="button" data-action="edit-note" data-note-key="location:', state.locationId, '" aria-label="Edit location note">✎</button>',
                  '<h2>', escapeHtml(location.name), '</h2>',
                  '<p>', escapeHtml(location.subtitle), '</p>',
                  '<p class="feature-note"><strong>', escapeHtml(locationNote), '</strong></p>',
                '</div>',
              '</section>',
              '<section class="story-stack">', storiesHtml, '</section>',
            '</div>',
          view === "story" ? '</section>' : '',
          view === "messages" ? '<section class="screen-panel parchment"><h2>Messages & Journal</h2><p class="screen-intro">A record of what the city remembers.</p><ol class="journal-list">' + journalHtml + '</ol></section>' : '',
          view === "myself" ? '<section class="screen-panel parchment"><h2>Myself</h2><p class="screen-intro">Your qualities and the dangers following you.</p><div class="profile-grid"><div><h3>Qualities</h3>' + qualitiesHtml + '</div><div><h3>Menaces</h3><div class="menace-list">' + menaceHtml + '</div></div></div></section>' : '',
          view === "possessions" ? '<section class="screen-panel parchment"><h2>Possessions</h2><p class="screen-intro">Equip useful possessions or sell things you no longer need.</p><div class="inventory-grid">' + inventoryHtml + '</div></section>' : '',
          view === "bazaar" ? '<section class="screen-panel parchment"><h2>The Exchange</h2><p class="screen-intro">Current balance: <strong>' + state.echoes + ' Echoes</strong>. Purchases change your effective qualities when equipped.</p><div class="inventory-grid">' + bazaarHtml + '</div></section>' : '',
          view === "plans" ? '<section class="screen-panel parchment"><h2>Plans</h2><p class="screen-intro">Stories you have bookmarked for later.</p><div class="plans-grid">' + plansHtml + '</div></section>' : '',
        '</main>',

        '<aside class="right-rail">',
          '<section class="welcome-panel">',
            '<p>It&apos;s <strong class="user-name">', escapeHtml(state.name), '</strong>!</p>',
            '<h2>Welcome to</h2>',
            '<h3>', escapeHtml(location.name), '.</h3>',
            '<p class="welcome-tail">delicious stranger!</p>',
            '<label class="travel-label" for="travel-location">Travel to</label>',
            '<select id="travel-location" aria-label="Travel destination">',
              unlockedLocations.map(({ id, location: destination }) => ['<option value="', id, '"', id === state.locationId ? ' selected' : '', '>', escapeHtml(destination.name), '</option>'].join('')).join(""),
            '</select>',
            '<button class="travel-button" data-action="travel"', unlockedLocations.length <= 1 || pending ? ' disabled' : '', '>', pending ? 'WAIT…' : 'TRAVEL', '</button>',
          '</section>',

          '<section class="promo-card">',
            '<div class="promo-scene" aria-hidden="true"><span>✦</span></div>',
            '<div class="promo-title">NEATHBOUND</div>',
            '<div class="promo-sub">DESCEND DEEPER</div>',
          '</section>',

          '<section class="glossary parchment">',
            '<button class="edit-dot" type="button" data-action="edit-note" data-note-key="glossary" aria-label="Edit quality note">✎</button>',
            '<h3>What is a quality?</h3>',
            '<p>', escapeHtml(glossaryNote), '</p>',
          '</section>',

          '<section class="satchel" id="possessions">',
            '<h3>Possessions</h3>',
            '<div class="satchel-list">', inventoryHtml, '</div>',
          '</section>',
        '</aside>',
      '</div>',

      '<footer class="game-footer">',
        '<span>© NeathBound · Original open-source fiction</span>',
        '<nav><a href="#stories">Story</a><span>|</span><a href="#journal">Journal</a><span>|</span><a href="#possessions">Possessions</a></nav>',
      '</footer>',
    '</div>'
  ].join("");

  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));\n  app.querySelectorAll("[data-view]").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); handlers.navigate(link.dataset.view); }));\n  app.querySelectorAll("[data-transaction]").forEach((button) => button.addEventListener("click", () => handlers.transact(button.dataset.transaction, button.dataset.item)));\n  app.querySelector("[data-action=continue]")?.addEventListener("click", handlers.continue);
  app.querySelectorAll("[data-action=bookmark]").forEach((button) => button.addEventListener("click", () => handlers.bookmark(button.dataset.story)));
  app.querySelector("[data-action=outfit]").addEventListener("change", (event) => handlers.outfit(event.target.value));
  app.querySelector("[data-action=travel]").addEventListener("click", () => handlers.travel(app.querySelector("#travel-location").value));
  app.querySelectorAll("[data-action=edit-note]").forEach((button) => button.addEventListener("click", () => handlers.editNote(button.dataset.noteKey)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
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


function tab(id, label, active) {
  return '<a href="#' + id + '" data-view="' + id + '" class="' + (active === id ? 'active' : '') + '" aria-current="' + (active === id ? 'page' : 'false') + '">' + label + '</a>';
}

function renderOutcome(outcome) {
  const changeHtml = (outcome.changes ?? []).map((change) => {
    if (change.type === "location") return '<li><strong>Location:</strong> ' + escapeHtml(formatName(change.after)) + '</li>';
    const sign = change.delta > 0 ? "+" : "";
    return '<li><strong>' + escapeHtml(change.label ?? formatName(change.id)) + ':</strong> ' + sign + change.delta + ' (' + change.after + ')</li>';
  }).join("");
  const challenge = outcome.challenge
    ? '<p class="result-challenge">' + (outcome.success ? "You succeeded" : "You failed") + ' in a ' + escapeHtml(formatName(outcome.challenge.quality)) + ' challenge' + (outcome.total != null ? ' (' + outcome.total + ' vs ' + outcome.challenge.difficulty + ')' : '') + '.</p>'
    : '';
  return '<section class="action-result ' + (outcome.rejected ? 'rejected' : outcome.success ? 'success' : 'failure') + '" id="action-result" tabindex="-1" aria-live="assertive"><p class="eyebrow">' + (outcome.rejected ? 'THE CITY HAS MOVED ON' : outcome.success ? 'SUCCESS' : 'FAILURE') + '</p><h2>' + escapeHtml(outcome.title ?? "Result") + '</h2><p>' + escapeHtml(outcome.result ?? outcome.error ?? "") + '</p>' + challenge + (changeHtml ? '<ul class="result-changes">' + changeHtml + '</ul>' : '') + '<button data-action="continue">CONTINUE</button></section>';
}


function modifierText(modifiers) {
  const parts = Object.entries(modifiers ?? {}).map(([key, value]) => `${formatName(key)} +${value}`);
  return parts.length ? parts.join(" · ") : "No quality modifier";
}
