import { availableChoices, availableStories, currentLocation } from "../game/engine.js";

const icon = { nerve: "◉", insight: "◆", poise: "✦" };

export function render(app, state, handlers) {
  const location = currentLocation(state);
  const stories = availableStories(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => quantity > 0);

  const qualitiesHtml = Object.entries(state.qualities).map(([key, value]) => {
    const width = Math.min(100, Math.max(8, value * 10));
    return [
      '<div class="quality-row">',
      '<div class="quality-icon">', icon[key] ?? "•", '</div>',
      '<div class="quality-main">',
      '<div class="quality-title"><strong>', formatName(key), '</strong><span>', value, '</span></div>',
      '<div class="quality-track"><span style="width:', width, '%"></span></div>',
      '</div></div>'
    ].join("");
  }).join("");

  const storiesHtml = stories.map((story) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const challenge = choice.challenge
        ? [
            '<div class="challenge-line">',
            '<span class="challenge-icon">', icon[choice.challenge.quality] ?? "•", '</span>',
            '<span><strong>', formatName(choice.challenge.quality), ' challenge</strong><br>',
            '<small>Difficulty ', choice.challenge.difficulty, '</small></span></div>'
          ].join("")
        : '<div class="challenge-line simple"><span class="challenge-icon">◆</span><span><strong>A straightforward choice</strong><br><small>No challenge roll</small></span></div>';

      return [
        '<div class="choice-row">',
        '<div class="choice-copy"><strong>', choice.label, '</strong>', challenge, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" ',
        available.has(choice.id) ? "" : "disabled",
        '>GO</button></div>'
      ].join("");
    }).join("");

    return [
      '<article class="storylet parchment">',
      '<div class="story-art" aria-hidden="true"></div>',
      '<div class="story-body">',
      '<button class="bookmark" type="button" aria-label="Bookmark story">◆</button>',
      '<h3>', story.title, '</h3>',
      '<p>', story.text, '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  }).join("");

  const journalHtml = state.journal.map((entry) => '<li>' + escapeHtml(entry) + '</li>').join("");
  const inventoryHtml = inventory.length
    ? inventory.map(([item, quantity]) => '<span>' + formatName(item) + (quantity > 1 ? ' ×' + quantity : '') + '</span>').join("")
    : "<small>Nothing of note.</small>";

  app.innerHTML = [
    '<div class="game-shell">',
      '<header class="topbar">',
        '<div class="brand">NEATH<span>◆</span>BOUND</div>',
        '<nav class="account-nav" aria-label="Account">',
          '<button class="text-link" data-action="reset">New life</button>',
          '<a href="#journal">Journal</a>',
          '<a href="#possessions">Possessions</a>',
          '<a href="#stories">Stories</a>',
        '</nav>',
      '</header>',

      '<section class="city-banner" aria-label="NeathBound city skyline">',
        '<div class="cavern-ceiling"></div>',
        '<div class="skyline-far"></div>',
        '<div class="skyline-near"></div>',
        '<div class="distant-towers"></div>',
        '<div class="mist-layer"></div>',
        '<div class="waterline"></div>',
        '<div class="city-arch"></div>',
        '<div class="scene-focus" aria-hidden="true">✦</div>',
        '<div class="city-lamp left"></div>',
        '<div class="city-lamp right"></div>',
      '</section>',

      '<nav class="main-tabs" aria-label="Game sections">',
        '<a class="active" href="#stories">STORY</a>',
        '<a href="#journal">MESSAGES</a>',
        '<a href="#character">MYSELF</a>',
        '<a href="#possessions">POSSESSIONS</a>',
        '<a href="#stories">BAZAAR</a>',
        '<a href="#stories">FATE</a>',
        '<a href="#journal">PLANS</a>',
      '</nav>',

      '<div class="game-grid">',
        '<aside class="left-rail" id="character" aria-label="Character details">',
          '<section class="candle-block">',
            '<div class="candle"></div>',
            '<div><strong>Actions</strong><div>∞</div><small>Unlimited</small></div>',
          '</section>',

          '<section class="side-section">',
            '<div class="side-icon">◇</div>',
            '<div><strong>Fate</strong><div>0</div><small>No waiting or payment gates.</small></div>',
          '</section>',

          '<section class="side-section">',
            '<div class="side-icon">₠</div>',
            '<div><strong>Echoes</strong><div>', state.echoes, '</div></div>',
          '</section>',

          '<section class="outfit">',
            '<label for="outfit">Outfit</label>',
            '<select id="outfit" aria-label="Outfit"><option>Morning Outfit</option></select>',
          '</section>',

          '<section class="qualities-list">', qualitiesHtml, '</section>',
        '</aside>',

        '<main class="story-column" id="stories">',
          '<div class="parchment-board">',
          '<section class="featured-story parchment">',
            '<div class="feature-art" aria-hidden="true"><span>⌕</span></div>',
            '<div>',
              '<h2>', location.name, '</h2>',
              '<p>', location.subtitle, '</p>',
              '<p class="feature-note"><strong>', location.atmosphere, '</strong></p>',
            '</div>',
          '</section>',

          '<section class="story-stack">', storiesHtml, '</section>',

          '<section class="journal parchment" id="journal">',
            '<h3>What the city remembers</h3>',
            '<ol>', journalHtml, '</ol>',
          '</section>',
          '</div>',
        '</main>',

        '<aside class="right-rail">',
          '<section class="welcome-panel">',
            '<p>It&apos;s <strong class="user-name">', escapeHtml(state.name), '</strong>!</p>',
            '<h2>Welcome to</h2>',
            '<h3>', location.name, '.</h3>',
            '<p class="welcome-tail">delicious stranger!</p>',
            '<button class="travel-button" disabled>TRAVEL</button>',
          '</section>',

          '<section class="promo-card">',
            '<div class="promo-symbol" aria-hidden="true">✦</div>',
            '<div class="promo-title">NEATHBOUND</div>',
            '<div class="promo-sub">DESCEND DEEPER</div>',
          '</section>',

          '<section class="glossary parchment">',
            '<button class="edit-dot" type="button" aria-label="Edit note">✎</button>',
            '<h3>What is a quality?</h3>',
            '<p>A quality is anything the city remembers about you: a talent, a rumour, an item, or a consequence.</p>',
          '</section>',

          '<section class="satchel" id="possessions">',
            '<h3>Possessions</h3>',
            '<div class="satchel-list">', inventoryHtml, '</div>',
          '</section>',
        '</aside>',
      '</div>',
      '<footer class="site-footer"><span>NeathBound is original open-source fiction.</span><span>Play at your own pace · No waiting</span><nav aria-label="Footer"><a href="#stories">Help</a><a href="#journal">Journal</a><a href="#stories">Terms</a></nav></footer>',
    '</div>'
  ].join("");

  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);
}

function formatName(value) {
  return value.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
