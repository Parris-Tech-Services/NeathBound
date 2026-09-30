import { availableChoices, availableStories, currentLocation, effectiveChallenge, describeChallenge } from "../game/engine.js?v=20260930-19";
import { locations } from "../game/content.js?v=20260930-19";
import { loadPreferences } from "./preferences.js?v=20260930-19";

const icon = { nerve: "◉", insight: "◆", poise: "✦", shadow: "◒", dread: "▲" };

const QUALITY_DETAILS = {
  nerve: { glyph: "◉", description: "Courage, steadiness and the willingness to go where sensible people stop." },
  insight: { glyph: "◆", description: "Attention, deduction and a talent for noticing what the city hoped you would miss." },
  poise: { glyph: "✦", description: "Grace under scrutiny: charm, composure and knowing when not to flinch." },
  shadow: { glyph: "◒", description: "Subtlety, secrecy and the useful art of being elsewhere when questions are asked." }
};

const MENACE_DETAILS = {
  dread: { glyph: "▲", description: "How heavily the city's darker truths are pressing on you." },
  scandal: { glyph: "♢", description: "How loudly respectable people are whispering your name." },
  wounds: { glyph: "✚", description: "The price your body has paid for your curiosity." },
  suspicion: { glyph: "⌁", description: "How much attention you have attracted from people best left uninterested." }
};

const MILESTONE_DETAILS = {
  "acquaintance-dockworker": "Won the trust of a Lantern Quay dockworker.",
  "bell-under-water:descend": "Descended the drowned stair beneath Lantern Quay.",
  "bound-into-the-index": "Allowed the Hollow Archive to bind you into its index.",
  "cartographer-reckoned": "Settled matters with the one-eyed cartographer.",
  "collector-answered": "Answered the Velvet Market's debt collector.",
  "far-crack-answered": "Resolved the mystery of the far crack in the stone sky.",
  "found-the-far-crack": "Discovered an uncharted crack in the cavern ceiling.",
  "garden-appointment:attend": "Kept the Clockwork Garden's impossible appointment.",
  "gardener-thanked": "Earned the gardener's gratitude.",
  "kept-the-sun-promise": "Kept your promise concerning borrowed sunlight.",
  "map-route-known": "Revealed a hidden route in the salted map.",
  "plant-the-sun-seed:plant": "Planted a seed that remembered the sun.",
  "read-own-entry": "Read your own entry in the Hollow Archive.",
  "read-the-debt-ledgers": "Read what the market's ledgers say you owe.",
  "returned-the-brass-key": "Returned the brass key to the submerged door.",
  "salt-on-the-map:soak": "Washed the salt from the map and exposed its secret.",
  "signalled-the-surface": "Sent a signal through the stone sky toward the surface."
};

const ITEM_DETAILS = {
  "salted-map": { glyph: "≋", category: "Documents", description: "A salt-stiffened map whose hidden routes emerge when the city decides you are ready to see them." },
  "brass-key": { glyph: "⚿", category: "Keys & Tools", description: "The warm brass key you woke holding. Near deep water, it seems to remember a lock." },
  "black-sand": { glyph: "⌛", category: "Curiosities", description: "Heavy black grains gathered below the drowned stair. They settle into shapes when nobody is breathing." },
  "archive-key": { glyph: "⌑", category: "Keys & Tools", description: "A narrow iron key from the Velvet Market. It pulls faintly toward the locked stacks of the Hollow Archive." },
  "silver-thimble": { glyph: "◉", category: "Keys & Tools", description: "A tailor's silver thimble, bright enough to catch the light in places where there should be none." },
  "red-thread-end": { glyph: "∞", category: "Curiosities", description: "The cut end of a red thread. It refuses to lie still and curls toward unfinished business." },
  "bright-memory": { glyph: "✦", category: "Memories", description: "A recovered memory sharpened until it can be carried like an object. Looking at it too long feels like remembering twice." },
  "unfinished-page": { glyph: "¶", category: "Documents", description: "A page in your own handwriting that stops halfway through a sentence you do not remember beginning." },
  "tide-cup": { glyph: "♨", category: "Curiosities", description: "A porcelain cup returned by the tide. It smells faintly of a shore that has never existed." },
  "ink-of-absence": { glyph: "✒", category: "Curiosities", description: "Ink made from catalogued darkness. On paper, it writes around a thing rather than naming it." },
  "sun-seed": { glyph: "✿", category: "Garden & Light", description: "A clockwork seed that remembers sunlight. It is warm even under a stone sky." },
  "small-sun": { glyph: "☼", category: "Garden & Light", description: "A thumb-sized borrowed sun in glass. Its light makes the Neath look briefly less certain of itself." }
};

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
      const resolvedChallenge = effectiveChallenge(story, choice);
      const challengeQuality = resolvedChallenge?.quality ?? resolvedChallenge?.stat;
      const challenge = resolvedChallenge
        ? [
            '<div class="challenge-line">',
            '<span class="challenge-icon">', icon[challengeQuality] ?? "•", '</span>',
            '<span><strong>', formatName(challengeQuality), ' challenge</strong>',
            '<small>', escapeHtml(challengeSummary(state, resolvedChallenge)), '</small></span></div>'
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
  const inventoryCount = inventory.reduce((total, [, quantity]) => total + quantity, 0);
  const qualityCardsHtml = Object.entries(state.qualities ?? {}).map(([id, value]) => {
    const details = QUALITY_DETAILS[id] ?? { glyph: "◆", description: "A quality the city has learned to associate with you." };
    const width = Math.min(100, Math.max(4, Number(value) * 10));
    return [
      '<article class="character-stat quality-stat">',
        '<div class="character-stat-glyph" aria-hidden="true">', escapeHtml(details.glyph), '</div>',
        '<div class="character-stat-copy">',
          '<div class="character-stat-heading"><h3>', escapeHtml(formatName(id)), '</h3><strong>', value, '</strong></div>',
          '<div class="character-stat-track"><span style="width:', width, '%"></span></div>',
          '<p>', escapeHtml(details.description), '</p>',
        '</div>',
      '</article>'
    ].join("");
  }).join("");

  const menaceCardsHtml = Object.entries(state.menaces ?? {}).map(([id, value]) => {
    const details = MENACE_DETAILS[id] ?? { glyph: "▲", description: "A danger gathering around you." };
    const width = Math.min(100, Math.max(0, Number(value) * 12.5));
    return [
      '<article class="character-stat menace-stat', Number(value) > 0 ? ' is-active' : '', '">',
        '<div class="character-stat-glyph" aria-hidden="true">', escapeHtml(details.glyph), '</div>',
        '<div class="character-stat-copy">',
          '<div class="character-stat-heading"><h3>', escapeHtml(formatName(id)), '</h3><strong>', value, '</strong></div>',
          '<div class="character-stat-track"><span style="width:', width, '%"></span></div>',
          '<p>', escapeHtml(details.description), '</p>',
        '</div>',
      '</article>'
    ].join("");
  }).join("");

  const acquaintances = (state.acquaintances ?? []).filter(Boolean);
  const acquaintancesHtml = acquaintances.length
    ? acquaintances.map((name) => '<span class="character-chip">' + escapeHtml(formatName(name)) + '</span>').join("")
    : '<p class="character-empty">No one has admitted to knowing you yet.</p>';

  const milestones = Object.entries(state.flags ?? {})
    .filter(([id, value]) => id !== "__revision" && value === true && MILESTONE_DETAILS[id])
    .map(([id]) => MILESTONE_DETAILS[id]);
  const milestoneHtml = milestones.length
    ? milestones.map((text) => '<li>' + escapeHtml(text) + '</li>').join("")
    : '<li class="character-empty">Your more consequential choices are still ahead of you.</li>';

  const exploredCount = (state.unlockedLocations ?? []).length;

  const possessionCardsHtml = inventory.length
    ? inventory.map(([item, quantity]) => {
        const details = ITEM_DETAILS[item] ?? { glyph: "◆", category: "Curiosity", description: "Something the city has placed in your keeping. Its significance is not yet clear." };
        return [
          '<article class="possession-card" data-item="', escapeClass(item), '">',
            '<div class="possession-glyph" aria-hidden="true">', escapeHtml(details.glyph), '</div>',
            '<div class="possession-copy">',
              '<div class="possession-heading"><h3>', escapeHtml(formatName(item)), '</h3><strong class="possession-quantity">×', quantity, '</strong></div>',
              '<p class="possession-category">', escapeHtml(details.category), '</p>',
              '<p>', escapeHtml(details.description), '</p>',
            '</div>',
          '</article>'
        ].join("");
      }).join("")
    : '<div class="empty-possessions"><strong>Your pockets are empty.</strong><p>The city will remedy that soon enough.</p></div>';

  let outcomeHtml = "";
  if (outcome) {
    const challengeQuality = outcome.challenge?.quality ?? outcome.challenge?.stat;
    const verdict = outcome.challenge
      ? outcome.success
        ? `You succeeded in a ${formatName(challengeQuality)} challenge! (${outcomeOdds(outcome)}${outcome.usedMomentum ? ", with Momentum" : ""})`
        : `Your ${formatName(challengeQuality)} challenge failed. (${outcomeOdds(outcome)})`
      : "";

    const changesList = (outcome.changes ?? []).map((change) => {
      const name = formatName(change.label ?? change.id);
      if (change.message) return '<li class="outcome-change occurrence">' + escapeHtml(change.message) + '</li>';
      if (change.type === "echoes") {
        const verb = change.delta > 0 ? "gained" : "lost";
        return '<li class="outcome-change ' + (change.delta > 0 ? "gain" : "loss") + '">You&apos;ve ' + verb + ' ' + Math.abs(change.delta) + ' x Echoes (new total ' + change.after + ').</li>';
      }
      if (change.type === "items") {
        const verb = change.delta > 0 ? "gained" : "lost";
        return '<li class="outcome-change ' + (change.delta > 0 ? "gain" : "loss") + '">You&apos;ve ' + verb + ' ' + Math.abs(change.delta) + ' x ' + escapeHtml(name) + ' (new total ' + change.after + ').</li>';
      }
      if (change.type === "qualities") {
        const direction = change.delta > 0 ? "increased" : "decreased";
        return '<li class="outcome-change ' + (change.delta > 0 ? "gain" : "loss") + '">Your ' + escapeHtml(name) + ' quality has ' + direction + ' to ' + change.after + '.</li>';
      }
      if (change.type === "menaces") {
        const direction = change.delta > 0 ? "increased" : "decreased";
        return '<li class="outcome-change ' + (change.delta > 0 ? "loss" : "gain") + '">Your ' + escapeHtml(name) + ' menace has ' + direction + ' to ' + change.after + '.</li>';
      }
      if (change.type === "momentum") return '<li class="outcome-change">Momentum is now ' + change.after + '.</li>';
      return '<li class="outcome-change">' + escapeHtml(name) + ' changed.</li>';
    }).join("");

    outcomeHtml = [
      '<section class="outcome-panel parchment" aria-live="polite">',
      '<h2>', escapeHtml(outcome.title ?? "Outcome"), '</h2>',
      verdict ? '<p class="outcome-verdict ' + (outcome.success ? 'success' : 'failure') + '">' + escapeHtml(verdict) + '</p>' : '',
      '<p class="outcome-text">', escapeHtml(outcome.result ?? ""), '</p>',
      changesList ? '<ul class="outcome-changes">' + changesList + '</ul>' : '',
      '<button class="outcome-onwards" type="button" data-action="onwards">Onwards</button>',
      '</section>'
    ].join("");
  }

  app.innerHTML = [
        '<div class="game-shell outfit-', escapeClass(preferences.outfit), '">',
      '<header class="topbar">',
        '<div class="brand">NEATH<span>◆</span>BOUND</div>',
        '<nav class="account-nav" aria-label="Account">',
          '<button class="text-link" data-action="reset">New life</button>',
          '<a href="#journal" data-view="story">Journal</a>',
          '<a href="#possessions" data-view="possessions">Possessions</a>',
          '<a href="#stories" data-view="story">Stories</a>',
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
        '<a class="active" href="#stories" data-view="story">TALES</a>',
        state.flags['tutorial.story'] ? '<a href="#journal" data-view="story">LETTERS</a>' : '',
        state.flags['tutorial.myself'] ? '<a href="#myself" data-view="myself">SELF</a>' : '',
        state.flags['tutorial.possessions'] ? '<a href="#possessions" data-view="possessions">SATCHEL</a>' : '',
        state.flags['tutorial.possessions'] ? '<a href="#possessions">EXCHANGE</a>' : '',
        state.flags['tutorial.story'] ? '<a href="#journal">PLANS</a>' : '',
      '</nav>',

      '<div class="game-grid">',
        '<aside class="left-rail" id="character" aria-label="Character details">',
          state.flags['tutorial.myself'] ? [
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

            '<section class="qualities-list">', qualitiesHtml, '</section>'
          ].join("") : '',
        '</aside>',

        '<main class="story-column" id="stories">',
          '<div data-view-panel="story">',
          outcome
            ? outcomeHtml
            : [
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
                '</section>'
              ].join(""),

          '<section class="journal parchment" id="journal">',
            '<h3>What the city remembers</h3>',
            '<ol>', journalHtml, '</ol>',
          '</section>',
          '</div>',
          '<section class="possessions-page parchment" id="possessions" data-view-panel="possessions" hidden>',
            '<div class="possessions-header">',
              '<div>',
                '<p class="possessions-kicker">Your belongings</p>',
                '<h2>Possessions</h2>',
                '<p>Things you have found, earned, borrowed, or failed to get rid of.</p>',
              '</div>',
              '<div class="possessions-totals">',
                '<span><strong>', inventoryCount, '</strong> item', inventoryCount === 1 ? '' : 's', '</span>',
                '<span><strong>', inventory.length, '</strong> kind', inventory.length === 1 ? '' : 's', '</span>',
                '<span><strong>₠', state.echoes, '</strong> Echoes</span>',
              '</div>',
            '</div>',
            '<div class="possessions-grid">', possessionCardsHtml, '</div>',
          '</section>',
          '<section class="myself-page parchment" id="myself" data-view-panel="myself" hidden>',
            '<header class="myself-hero">',
              '<div class="myself-portrait" aria-hidden="true"><span>◈</span></div>',
              '<div class="myself-identity">',
                '<p class="myself-kicker">The city knows you as</p>',
                '<h2>', escapeHtml(state.name), '</h2>',
                '<p>Currently in <strong>', escapeHtml(location.name), '</strong>, ', escapeHtml(location.region), '.</p>',
                '<div class="myself-summary">',
                  '<span><strong>₠', state.echoes, '</strong> Echoes</span>',
                  '<span><strong>', state.momentum ?? 0, '</strong> Momentum</span>',
                  '<span><strong>', exploredCount, '</strong> places known</span>',
                  '<span><strong>', state.journal?.length ?? 0, '</strong> memories recorded</span>',
                '</div>',
              '</div>',
            '</header>',

            '<section class="myself-section">',
              '<div class="myself-section-heading"><div><p class="myself-kicker">Capabilities</p><h3>Qualities</h3></div><p>What the city has learned you can do.</p></div>',
              '<div class="character-stat-grid">', qualityCardsHtml, '</div>',
            '</section>',

            '<section class="myself-section">',
              '<div class="myself-section-heading"><div><p class="myself-kicker">Consequences</p><h3>Menaces</h3></div><p>Trouble has a way of keeping its own accounts.</p></div>',
              '<div class="character-stat-grid menace-grid">', menaceCardsHtml, '</div>',
            '</section>',

            '<section class="myself-two-column">',
              '<div class="myself-section character-panel">',
                '<p class="myself-kicker">Presentation</p>',
                '<h3>Outfit</h3>',
                '<p>Change how you present yourself. The same outfit is reflected in the sidebar.</p>',
                '<label for="myself-outfit">Current outfit</label>',
                '<select id="myself-outfit" aria-label="Character outfit" data-action="outfit">',
                  '<option value="morning-outfit"', preferences.outfit === "morning-outfit" ? ' selected' : '', '>Morning Outfit</option>',
                  '<option value="dock-coat"', preferences.outfit === "dock-coat" ? ' selected' : '', '>Dockworker&apos;s Coat</option>',
                  '<option value="archive-linen"', preferences.outfit === "archive-linen" ? ' selected' : '', '>Archive Linen</option>',
                '</select>',
              '</div>',
              '<div class="myself-section character-panel">',
                '<p class="myself-kicker">People</p>',
                '<h3>Acquaintances</h3>',
                '<div class="character-chips">', acquaintancesHtml, '</div>',
              '</div>',
            '</section>',

            '<section class="myself-section">',
              '<div class="myself-section-heading"><div><p class="myself-kicker">History</p><h3>Marks left on the city</h3></div><p>Choices important enough that the Neath still remembers them.</p></div>',
              '<ol class="character-milestones">', milestoneHtml, '</ol>',
            '</section>',
          '</section>',
        '</main>',

        '<aside class="right-rail">',
          '<section class="welcome-panel">',
            '<p>It&apos;s <strong class="user-name">', escapeHtml(state.name), '</strong>!</p>',
            '<h2>Welcome to</h2>',
            '<h3>', escapeHtml(location.name), '.</h3>',
            '<p class="welcome-tail">delicious stranger!</p>',
            state.flags['tutorial.travel'] ? [
              '<label class="travel-label" for="travel-location">Travel to</label>',
              '<select id="travel-location" aria-label="Travel destination">',
                unlockedLocations.map(({ id, location: destination }) => ['<option value="', id, '"', id === state.locationId ? ' selected' : '', '>', escapeHtml(destination.name), '</option>'].join('')).join(""),
              '</select>',
              '<button class="travel-button" data-action="travel"', unlockedLocations.length <= 1 ? ' disabled' : '', '>TRAVEL</button>'
            ].join("") : '',
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

          state.flags['tutorial.possessions'] ? [
            '<section class="satchel" id="possessions-summary">',
              '<h3>Possessions</h3>',
              '<div class="satchel-list">', inventoryHtml, '</div>',
            '</section>'
          ].join("") : ''
        '</aside>',
      '</div>',

      '<footer class="game-footer">',
        '<span>© NeathBound · Original open-source fiction</span>',
        '<nav><a href="#stories" data-view="story">Story</a><span>|</span><a href="#myself" data-view="myself">Myself</a><span>|</span><a href="#possessions" data-view="possessions">Possessions</a></nav>',
      '</footer>',
    '</div>'
  ].join("");

  app.querySelectorAll("[data-choice]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.choose(button.dataset.story, button.dataset.choice));
  });
  app.querySelector("[data-action=onwards]")?.addEventListener("click", handlers.onwards);
  app.querySelectorAll("[data-action=bookmark]").forEach((button) => button.addEventListener("click", () => handlers.bookmark(button.dataset.story)));
  app.querySelectorAll("[data-action=outfit]").forEach((select) => select.addEventListener("change", (event) => handlers.outfit(event.target.value)));
  app.querySelector("[data-action=travel]").addEventListener("click", () => handlers.travel(app.querySelector("#travel-location").value));
  app.querySelectorAll("[data-action=edit-note]").forEach((button) => button.addEventListener("click", () => handlers.editNote(button.dataset.noteKey)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);

  const setView = (view) => {
    const activeView = ["possessions", "myself"].includes(view) ? view : "story";
    app.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== activeView;
    });
    app.querySelectorAll(".main-tabs [data-view]").forEach((link) => {
      link.classList.toggle("active", link.dataset.view === activeView);
    });
  };
  const viewFromHash = () => {
    if (globalThis.location?.hash === "#possessions") return "possessions";
    if (globalThis.location?.hash === "#myself") return "myself";
    return "story";
  };
  app.querySelectorAll("[data-view]").forEach((link) => link.addEventListener("click", () => setView(link.dataset.view)));
  globalThis.onhashchange = () => setView(viewFromHash());
  setView(viewFromHash());
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

// "Very modest · 80% chance (difficulty 5)"
function challengeSummary(state, challenge) {
  const info = describeChallenge(state, challenge);
  return `${info.label} · ${info.percent}% chance (difficulty ${challenge.difficulty})`;
}

function outcomeOdds(outcome) {
  const odds = outcome.percent !== undefined ? `${outcome.label}, ${outcome.percent}% chance` : "";
  const roll = outcome.total !== null && outcome.total !== undefined ? `${outcome.total} vs ${outcome.challenge.difficulty}` : "";
  return [roll, odds].filter(Boolean).join("; ");
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
