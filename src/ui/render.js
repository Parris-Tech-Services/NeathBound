import { availableChoices, availableStories, currentLocation } from "../game/engine.js?v=20260930-7";

const icon = { nerve: "◉", insight: "◆", poise: "✦", shadow: "◒", dread: "▲" };

export function render(app, state, handlers) {
  const location = currentLocation(state);
  const stories = availableStories(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => quantity > 0);

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

  const storiesHtml = stories.map((story, storyIndex) => {
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
      '<div class="story-art art-', (storyIndex % 5) + 1, '" aria-hidden="true"><span></span></div>',
      '<div class="story-body">',
      '<button class="bookmark" type="button" aria-label="Bookmark story">◆</button>',
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
        '<a href="#stories">BAZAAR</a>',
        '<a href="#stories">FATE</a>',
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
            '<select id="outfit" aria-label="Outfit"><option>Morning Outfit</option></select>',
          '</section>',

          '<section class="qualities-list">', qualitiesHtml, '</section>',
        '</aside>',

        '<main class="story-column" id="stories">',
          '<section class="story-board">',
            '<div class="board-inner">',
              '<section class="featured-story">',
                '<div class="feature-art" aria-hidden="true"><span>⌕</span></div>',
                '<div class="feature-copy">',
                  '<button class="edit-dot" type="button" aria-label="Edit location note">✎</button>',
                  '<h2>', escapeHtml(location.name), '</h2>',
                  '<p>', escapeHtml(location.subtitle), '</p>',
                  '<p class="feature-note"><strong>', escapeHtml(location.atmosphere), '</strong></p>',
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
            '<button class="travel-button" disabled>TRAVEL</button>',
          '</section>',

          '<section class="promo-card">',
            '<div class="promo-scene" aria-hidden="true"><span>✦</span></div>',
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

      '<footer class="game-footer">',
        '<span>© NeathBound · Original open-source fiction</span>',
        '<nav><a href="#stories">Story</a><span>|</span><a href="#journal">Journal</a><span>|</span><a href="#possessions">Possessions</a></nav>',
      '</footer>',
    '</div>'
  ].join("");

  app.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice)));
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
