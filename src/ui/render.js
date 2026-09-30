import { availableChoices, availableStories, currentLocation } from "../game/engine.js?v=20260930-13";
import { locations } from "../game/content.js?v=20260930-13";
import { loadPreferences } from "./preferences.js?v=20260930-13";

const icon = { nerve: "◉", insight: "◆", poise: "✦", shadow: "◒", dread: "▲" };

export function render(app, state, handlers, outcome = null) {
  const location = currentLocation(state);
  const stories = availableStories(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => quantity > 0);
  const preferences = loadPreferences();
  const unlockedLocations = (state.unlockedLocations ?? []).map((id) => ({ id, location: locations[id] })).filter((entry) => entry.location);
  const locationNote = preferences.notes[`location:${state.locationId}`] ?? location.atmosphere;
  const glossaryNote = preferences.notes.glossary ?? "A quality is anything the city remembers about you: a talent, a rumour, an item, or a consequence.";

  const qualitiesHtml = Object.entries(state.qualities).map(([key, value]) => {
    const width = Math.min(100, Math.max(8, value * 10));
    return [
      '<div class="quality-row quality-', escapeClass(key), '">',
      '<div class="quality-icon"><span>', icon[key] ?? "•", '</span></div>',
      '<div class="quality-main">',
      '<div class="quality-title"><strong>', formatName(key), '</strong><span>', value, '</span></div>',
      '<div class="quality-track"><span style="width:', width, '%"></span></div>',
      '</div></div>'
    ].join("");
  }).join("");

  const storiesHtml = stories.map((story) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const challengeQuality = choice.challenge?.quality ?? choice.challenge?.stat;
      const challenge = choice.challenge
        ? [
            '<div class="challenge-line">',
            '<span class="challenge-icon">', icon[challengeQuality] ?? "•", '</span>',
            '<span><strong>', formatName(challengeQuality), ' challenge</strong>',
            '<small>Difficulty ', choice.challenge.difficulty, '</small></span></div>'
          ].join("")
        : '<div class="challenge-line simple"><span class="challenge-icon">◆</span><span><strong>A straightforward choice</strong><small>No challenge roll</small></span></div>';

      return [
        '<div class="choice-row">',
        '<div class="choice-copy"><strong>', escapeHtml(choice.label), '</strong>', challenge, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" ',
        available.has(choice.id) ? "" : "disabled",
        '>GO</button></div>'
      ].join("");
    }).join("");

    return [
      '<article class="storylet">',
      '<div class="story-art story-art-', escapeClass(story.id), '" aria-hidden="true">', storyArtSvg(story.id, state.locationId), '</div>',
      '<div class="story-body">',
      '<button class="bookmark', preferences.bookmarks.includes(story.id) ? ' is-bookmarked' : '', '" type="button" data-action="bookmark" data-story="', story.id, '" aria-label="', preferences.bookmarks.includes(story.id) ? 'Remove bookmark' : 'Bookmark story', '" aria-pressed="', preferences.bookmarks.includes(story.id), '">◆</button>',
      '<h3>', escapeHtml(story.title), '</h3>',
      '<p>', escapeHtml(story.text), '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  }).join("");

  const journalHtml = state.journal.map((entry) => '<li>' + escapeHtml(entry) + '</li>').join("");
  const inventoryHtml = inventory.length
    ? inventory.map(([item, quantity]) => '<span>' + formatName(item) + (quantity > 1 ? ' ×' + quantity : '') + '</span>').join("")
    : "<small>Nothing of note.</small>";

  let outcomeHtml = "";
  if (outcome) {
    const successText = outcome.challenge ? 
      (outcome.success ? '<p style="color: var(--teal-deep); font-weight: bold; margin-bottom: 0.5rem;">You succeeded in a ' + formatName(outcome.challenge.quality) + ' challenge!</p>' 
                       : '<p style="color: var(--purple); font-weight: bold; margin-bottom: 0.5rem;">You failed a ' + formatName(outcome.challenge.quality) + ' challenge...</p>')
      : "";

    const changesList = (outcome.changes || []).map(change => {
      if (typeof change === "string") return '<li>' + escapeHtml(change) + '</li>';
      if (change.message) return '<li>' + escapeHtml(change.message) + '</li>';
      const name = formatName(change.id || change.quality || change.item);
      const amount = change.amount || change.delta || 1;
      if (amount > 0) return '<li>' + name + ' is increasing... You&apos;ve gained ' + amount + ' &times; ' + name + '</li>';
      if (amount < 0) return '<li>' + name + ' is dropping... You&apos;ve lost ' + Math.abs(amount) + ' &times; ' + name + '</li>';
      return '<li>' + name + ' has updated.</li>';
    }).join("");

    outcomeHtml = [
      '<section class="parchment" style="margin-bottom: 2rem; padding: 1.5rem; border: 2px solid var(--paper-edge);">',
      '<h3 style="margin-top: 0;">Outcome</h3>',
      successText,
      '<p>', escapeHtml(outcome.result || ""), '</p>',
      changesList ? '<ul style="margin-top: 1rem; padding-left: 1.5rem; margin-bottom: 0;">' + changesList + '</ul>' : '',
      '</section>'
    ].join("");
  }

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
        '<a class="active" href="#stories">STORY</a>',
        '<a href="#journal">MESSAGES</a>',
        '<a href="#character">MYSELF</a>',
        '<a href="#possessions">POSSESSIONS</a>',
        '<a href="#possessions">BAZAAR</a>',
        '<a href="#character">FATE</a>',
        '<a href="#journal">PLANS</a>',
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
          outcomeHtml,
          '<section class="story-board">',
            '<div class="board-inner">',
              '<section class="featured-story">',
                '<div class="feature-art feature-art-', escapeClass(state.locationId), '" aria-hidden="true">', locationArtSvg(state.locationId), '</div>',
                '<div class="feature-copy">',
                  '<button class="edit-dot" type="button" data-action="edit-note" data-note-key="location:', state.locationId, '" aria-label="Edit location note">✎</button>',
                  '<h2>', escapeHtml(location.name), '</h2>',
                  '<p>', escapeHtml(location.subtitle), '</p>',
                  '<p class="feature-note"><strong>', escapeHtml(locationNote), '</strong></p>',
                '</div>',
              '</section>',
              '<section class="story-stack">', storiesHtml, '</section>',
            '</div>',
          '</section>',

          '<section class="journal parchment" id="journal">',
            '<h3>What the city remembers</h3>',
            '<ol>', journalHtml, '</ol>',
          '</section>',
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
            '<button class="travel-button" data-action="travel"', unlockedLocations.length <= 1 ? ' disabled' : '', '>TRAVEL</button>',
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

  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
  app.querySelectorAll("[data-action=bookmark]").forEach((button) => button.addEventListener("click", () => handlers.bookmark(button.dataset.story)));
  app.querySelector("[data-action=outfit]").addEventListener("change", (event) => handlers.outfit(event.target.value));
  app.querySelector("[data-action=travel]").addEventListener("click", () => handlers.travel(app.querySelector("#travel-location").value));
  app.querySelectorAll("[data-action=edit-note]").forEach((button) => button.addEventListener("click", () => handlers.editNote(button.dataset.noteKey)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
}


const STORY_ART = {
  "bell-under-water": ["♢", "submerged bell", "#173842", "#8ca49e"],
  "cartographer-at-dusk": ["⌖", "living map", "#473227", "#b68b5a"],
  "borrowed-face": ["◐", "silken mask", "#4b253f", "#c79bb7"],
  "red-thread": ["∞", "red thread", "#4d2227", "#c35c62"],
  "index-of-lost-things": ["▤", "remembering index", "#343128", "#b8aa7d"],
  "the-quiet-librarian": ["⌑", "silent librarian", "#29352f", "#9aa88f"],
  "tea-for-the-tide": ["♨", "tide tea", "#1e4148", "#c9b48a"],
  "market-gossip": ["◌", "whispering stalls", "#432d3e", "#b58b9f"],
  "catalogue-the-dark": ["▥", "shelf of darkness", "#17191b", "#72777c"],
  "garden-appointment": ["✿", "clockwork flower", "#35402b", "#c2a85c"],
  "borrowed-sunlight": ["☼", "bottled sun", "#554018", "#e1c76b"],
  "salt-on-the-map": ["≋", "salted map", "#3a4038", "#c0b49a"],
  "the-sand-reader": ["⌛", "black sand", "#332e2a", "#a99574"],
  "the-locked-stacks": ["⚿", "locked stacks", "#282b2d", "#97866f"],
  "finish-the-page": ["¶", "unfinished page", "#43392d", "#c8b58c"],
  "return-the-darkness": ["◒", "returned darkness", "#161b20", "#657685"],
  "plant-the-sun-seed": ["✦", "sun seed", "#3e4328", "#d0b958"],
  "the-seedling-dawn": ["♧", "dawn seedling", "#31432e", "#9fbb78"],
  "the-memory-graft": ["⌁", "memory graft", "#3a332d", "#b49d7e"],
  "unwritten-ink": ["✒", "unwritten ink", "#20272d", "#8799a4"],
  "the-cartographer-returns": ["⌘", "returning cartographer", "#3f3028", "#b58561"],
  "the-debt-collector": ["¤", "debt collector", "#422f2b", "#b79570"],
  "an-entry-in-the-index": ["☷", "index entry", "#33362f", "#a9a37f"],
  "the-gardeners-thanks": ["❧", "gardener's thanks", "#30402c", "#a9bb7d"],
  "the-margin-note": ["※", "margin note", "#43382d", "#b9aa8c"],
  "survey-the-stone-sky": ["⌕", "stone-sky telescope", "#27343d", "#91a8b8"],
  "the-lamp-that-fell-upward": ["♢", "ascending lamp", "#3b3426", "#d2b86d"],
  "the-far-crack": ["ϟ", "far crack", "#242c34", "#9ba7af"],
  "the-submerged-door": ["▣", "submerged door", "#18343e", "#779a9f"],
  "the-loose-end": ["⌁", "loose red knot", "#47272c", "#bd6d73"]
};

const LOCATION_ART = {
  "lantern-quay": ["⚓", "♢", "Lantern Quay", "#143740", "#6d8f91"],
  "velvet-market": ["◐", "✦", "Velvet Market", "#47293f", "#9d6f8f"],
  "hollow-archive": ["▤", "⌑", "Hollow Archive", "#2e342e", "#8d947b"],
  "clockwork-gardens": ["✿", "⚙", "Clockwork Gardens", "#344128", "#9ca45c"],
  "glass-observatory": ["⌕", "✧", "Glass Observatory", "#263743", "#758fa3"]
};

function storyArtSvg(storyId, locationId) {
  const art = STORY_ART[storyId] ?? ["◆", "unknown story", "#343434", "#888"];
  const location = LOCATION_ART[locationId] ?? LOCATION_ART["lantern-quay"];
  const [symbol, label, dark, light] = art;
  const locationMark = location[0];
  return [
    '<svg viewBox="0 0 320 150" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg">',
      '<defs><linearGradient id="g-', escapeClass(storyId), '" x1="0" y1="0" x2="1" y2="1">',
        '<stop offset="0" stop-color="', dark, '"/><stop offset="1" stop-color="', light, '"/>',
      '</linearGradient></defs>',
      '<rect width="320" height="150" fill="url(#g-', escapeClass(storyId), ')"/>',
      '<circle cx="252" cy="42" r="58" fill="rgba(235,218,175,.09)"/>',
      '<path d="M0 116 C56 91 92 135 148 111 S248 87 320 114 V150 H0Z" fill="rgba(8,12,13,.34)"/>',
      '<path d="M0 126 C62 106 118 143 178 120 S266 105 320 128" fill="none" stroke="rgba(230,216,180,.22)" stroke-width="2"/>',
      '<text x="34" y="90" font-size="58" fill="rgba(246,232,196,.9)" font-family="Georgia,serif">', escapeHtml(symbol), '</text>',
      '<text x="276" y="126" text-anchor="middle" font-size="23" fill="rgba(246,232,196,.48)" font-family="Georgia,serif">', escapeHtml(locationMark), '</text>',
      '<text x="34" y="126" font-size="15" letter-spacing="2.2" fill="rgba(247,237,211,.78)" font-family="Georgia,serif">', escapeHtml(label.toUpperCase()), '</text>',
    '</svg>'
  ].join("");
}

function locationArtSvg(locationId) {
  const [symbol, accent, label, dark, light] = LOCATION_ART[locationId] ?? LOCATION_ART["lantern-quay"];
  return [
    '<svg viewBox="0 0 360 190" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg">',
      '<defs><linearGradient id="loc-', escapeClass(locationId), '" x1="0" y1="0" x2="1" y2="1">',
        '<stop offset="0" stop-color="', dark, '"/><stop offset="1" stop-color="', light, '"/>',
      '</linearGradient></defs>',
      '<rect width="360" height="190" fill="url(#loc-', escapeClass(locationId), ')"/>',
      '<circle cx="287" cy="52" r="74" fill="rgba(241,224,181,.10)"/>',
      '<path d="M0 137 C52 113 90 145 139 129 C194 111 225 151 278 126 C309 111 332 112 360 123 V190 H0Z" fill="rgba(9,13,14,.38)"/>',
      '<path d="M0 151 C54 128 105 158 155 143 S250 132 360 151" fill="none" stroke="rgba(239,223,184,.25)" stroke-width="3"/>',
      '<text x="54" y="111" font-size="72" fill="rgba(249,236,201,.9)" font-family="Georgia,serif">', escapeHtml(symbol), '</text>',
      '<text x="280" y="84" text-anchor="middle" font-size="42" fill="rgba(249,236,201,.5)" font-family="Georgia,serif">', escapeHtml(accent), '</text>',
      '<text x="52" y="157" font-size="17" letter-spacing="2.4" fill="rgba(249,238,211,.82)" font-family="Georgia,serif">', escapeHtml(label.toUpperCase()), '</text>',
    '</svg>'
  ].join("");
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
