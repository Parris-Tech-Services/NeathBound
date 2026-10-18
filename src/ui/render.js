import { availableChoices, availableStories, currentLocation, effectiveChallenge, describeChallenge, effectiveStat } from "../game/engine.js?v=20261016-gloomwing2";
import { locations, cards, decks, refuges, items, equipmentSlots, itemCategories, circles, stories as storyDefinitions, ambitions, destinies } from "../game/content.js?v=20261016-gloomwing2";
import { CITY_ROUTES, getQuestGuide } from "./narrative-guide.js?v=20261016-gloomwing2";
import { loadPreferences } from "./preferences.js?v=20261016-gloomwing2";
import { cmsPublishedStories } from "../game/cms-published.js?v=20261016-gloomwing2";
import { quirkTitle } from "../game/rules.js?v=20261016-gloomwing2";

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
  const previouslyOpen = app.querySelector(".storylet-disclosure[open]")?.dataset?.storyletId;
  const location = currentLocation(state);
  const quest = getQuestGuide(state);
  const stories = availableStories(state);
  const inventory = Object.entries(state.items ?? {}).filter(([, quantity]) => quantity > 0);
  const preferences = loadPreferences();
  const unlockedLocations = (state.unlockedLocations ?? []).map((id) => ({ id, location: locations[id] })).filter((entry) => entry.location);
  const locationNote = preferences.notes[`location:${state.locationId}`] ?? location.atmosphere;
  const glossaryNote = preferences.notes.glossary ?? "A quality is anything the city remembers about you: a talent, a rumour, an item, or a consequence.";

  const qualitiesHtml = Object.entries(state.qualities ?? {}).map(([key, value]) => {
    const effective = effectiveStat(state, key);
    const width = Math.min(100, Math.max(8, effective * 10));
    return [
      '<div class="quality-row quality-', escapeClass(key), '">',
      '<div class="quality-icon"><span>', icon[key] ?? "•", '</span></div>',
      '<div class="quality-main">',
      '<div class="quality-title"><strong>', formatName(key), '</strong><span>', effective !== Number(value) ? effective + ' (' + value + ')' : value, '</span></div>',
      '<div class="quality-track"><span style="width:', width, '%"></span></div>',
      '</div></div>'
    ].join("");
  }).join("");

  const renderStory = (story, isCard = false) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const isAvailable = available.has(choice.id);
      const actionCost = Math.max(0, Math.floor(Number(choice.action_cost ?? story.action_cost ?? (story.autofire ? 0 : 1))));
      const hasActions = Number(state.actions ?? 0) >= actionCost;
      const canGo = isAvailable && hasActions;
      const requirements = requirementList(choice);
      const lockedReason = !isAvailable && requirements.length
        ? '<p class="locked-requirement">Locked: ' + escapeHtml(requirementSummary(state, requirements)) + '</p>'
        : !hasActions && isAvailable
          ? '<p class="locked-requirement" role="status">No actions remaining. One action returns every ten minutes.</p>'
          : '';
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
        '<div class="choice-row', canGo ? '' : ' is-locked', '">',
        '<div class="choice-copy"><strong>', escapeHtml(choice.label), '</strong>', challenge, lockedReason, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" aria-label="', escapeHtml((!isAvailable ? 'LOCKED' : hasActions ? 'GO' : 'WAIT') + ': ' + choice.label + ' — ' + story.title), '" ',
        canGo ? "" : "disabled",
        '>', !isAvailable ? 'LOCKED' : hasActions ? 'GO' : 'WAIT', '</button></div>'
      ].join("");
    }).join("");

    const planned = preferences.bookmarks.includes(story.id);
    const mainStory = quest.storyId === story.id;
    return [
      '<article class="storylet', isCard ? ' opportunity-card' : '', mainStory ? ' main-storylet' : '', '"', mainStory ? ' id="main-story"' : '', '>',
      isCard ? '<div class="card-discard-header"><button class="discard-button" data-action="discard" data-card="' + story.id + '" aria-label="Discard">✗</button></div>' : '',
      '<div class="story-art story-art-', escapeClass(story.id), '" aria-hidden="true">', storyArtMarkup(story.id, state.locationId), '</div>',
      '<div class="story-body">',
      '<button class="bookmark', planned ? ' is-bookmarked' : '', '" type="button" data-action="bookmark" data-story="', story.id, '" aria-label="', escapeHtml((planned ? 'Remove from Plans: ' : 'Add to Plans: ') + story.title), '" title="', planned ? 'Remove from Plans' : 'Add to Plans', '" aria-pressed="', planned, '">◆</button>',
      mainStory ? '<p class="story-role">◆ MAIN STORY · CURRENT LEAD</p>' : '',
      '<h3>', escapeHtml(story.title), '</h3>',
      '<p>', escapeHtml(story.text), '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  };

  const questHere = quest.nextLocation === state.locationId && Boolean(quest.storyId) && stories.some((story) => story.id === quest.storyId);
  const questHtml = [
    '<section class="quest-guide" aria-label="Current story objective">',
    '<div class="quest-label">YOUR JOURNEY · ', escapeHtml(quest.chapter), ' · LEAD ', quest.step, ' OF ', quest.total, '</div>',
    '<h2>', escapeHtml(quest.title), '</h2>',
    '<p><strong>What you know:</strong> ', escapeHtml(quest.knownFact), '</p>',
    '<p class="quest-objective"><strong>What to do next:</strong> ', escapeHtml(quest.objective), '</p>',
    questHere ? '<a class="quest-jump" href="#main-story">Jump to this story ↓</a>' : '',
    quest.storyId && !questHere ? '<p class="quest-direction">Next destination: <strong>' + escapeHtml(locations[quest.nextLocation]?.name ?? quest.nextLocation) + '</strong> <button type="button" class="quest-travel" data-action="open-map" aria-controls="travel-map">Open travel map →</button></p>' : '',
    '</section>'
  ].join("");
  const routeHtml = CITY_ROUTES.map(({ id, hint }) => {
    const place = locations[id];
    const current = id === state.locationId;
    const unlocked = current || (state.unlockedLocations ?? []).includes(id);
    return [
      '<div class="route-card', current ? ' current' : '', unlocked ? '' : ' locked', '">',
      '<div><strong>', escapeHtml(place.name), '</strong><span>', current ? 'You are here' : unlocked ? 'Discovered' : 'Undiscovered', '</span></div>',
      '<p>', escapeHtml(unlocked ? place.subtitle : hint), '</p>',
      unlocked && !current && !location.consequenceOf ? '<button type="button" class="route-travel" data-action="travel-to" data-location="' + escapeHtml(id) + '">Travel here</button>' : '',
      '</div>'
    ].join("");
  }).join("");
  const mapHtml = [
    '<section class="city-route-map" aria-labelledby="travel-map-title">',
    '<div class="travel-map-heading"><div><p class="travel-map-kicker">Where would you like to go?</p><h2 id="travel-map-title" tabindex="-1">Travel around NeathBound</h2><p>', (state.unlockedLocations ?? []).filter(id => CITY_ROUTES.some(route => route.id === id)).length, ' / ', CITY_ROUTES.length, ' locations discovered</p></div><button type="button" class="close-travel-map" data-action="close-map">← Back to stories</button></div>',
    '<p class="route-footnote">Each district has different stories. Choose a road in a story to discover a place; after your first visit it stays unlocked on this map for easy return.</p>',
    '<div class="route-grid">', routeHtml, '</div>',
    location.consequenceOf ? '<p class="route-warning">You must resolve your predicament here before travelling elsewhere.</p>' : '',
    '<p class="route-footnote">Undiscovered locations show clues instead of travel buttons. Other dangerous places may appear through story consequences.</p>',
    '</section>'
  ].join("");

  // Keep one story open at a time. The district is a catalogue of storylets,
  // not an endless list of every available branch and locked requirement.
  // Native <details> preserves keyboard operation even without JavaScript.
  const currentAmbition = stories.find((story) => state.ambition && story.ambition_id === state.ambition);
  const primaryId = stories.some(story => story.id === previouslyOpen) ? previouslyOpen : (questHere ? quest.storyId : (currentAmbition?.id ?? stories[0]?.id));
  const makePreview = (story, open = false, isCard = false) => {
    const availableCount = availableChoices(state, story.id).length;
    const preview = (story.text ?? "").replace(/\s+/g, " ").trim();
    return [
      '<details class="storylet-disclosure', open ? ' is-featured' : '', '" name="neathbound-story-focus" data-storylet-id="', escapeHtml(story.id), '"', open ? ' open' : '', '>',
        '<summary class="storylet-headline">',
          '<span class="storylet-headline-glyph" aria-hidden="true">', storyArtMarkup(story.id, state.locationId), '</span>',
          '<span class="storylet-headline-copy">',
            '<strong>', escapeHtml(story.title), '</strong>',
            '<small>', escapeHtml(preview.length > 105 ? preview.slice(0, 102).trimEnd() + '…' : preview), '</small>',
            '<span class="storylet-headline-count">', availableCount, ' available ', availableCount === 1 ? 'choice' : 'choices',
              ' · ', story.choices.length, ' total</span>',
          '</span>',
          '<span class="storylet-headline-indicator" aria-hidden="true">', open ? '−' : '+', '</span>',
        '</summary>',
        renderStory(story, isCard),
        '<button type="button" class="story-back" data-action="close-story">← Back to stories · Free</button>',
      '</details>'
    ].join("");
  };
  const registryStories = stories.filter((story) => story.id.startsWith("gloomwing-registry-"));
  const priorityStories = stories.filter((story) => !story.id.startsWith("gloomwing-registry-") &&
    (story.id === quest.storyId || (state.ambition && story.ambition_id === state.ambition) ||
      story.id === "qbn-choose-ambition" || preferences.bookmarks.includes(story.id)));
  const remainingStories = stories.filter((story) => !registryStories.includes(story) && !priorityStories.includes(story));
  const storiesHtml = [
    priorityStories.length ? [
      '<section class="storylet-group" aria-label="Your active stories">',
        '<h3 class="storylet-group-heading">Your current stories</h3>',
        priorityStories.map((story) => makePreview(story, story.id === primaryId)).join(""),
      '</section>'
    ].join("") : '',
    remainingStories.length ? [
      '<section class="storylet-group" aria-label="Stories around this district">',
        '<h3 class="storylet-group-heading">Around ', escapeHtml(location.name), '</h3>',
        remainingStories.map((story) => makePreview(story, story.id === primaryId)).join(""),
      '</section>'
    ].join("") : '',
    registryStories.length ? [
      '<details class="storylet-archive">',
        '<summary>◆ The Bureau’s Evidence Registry <span>(', registryStories.length,
        ' volumes) · Open only when you have evidence</span></summary>',
        '<div class="storylet-archive-list">',
          registryStories.map((story) => makePreview(story, story.id === primaryId)).join(""),
        '</div>',
      '</details>'
    ].join("") : '',
  ].join("");

  let deckHtml = "";
  if (state.flags["tutorial.cards"]) {
    const hand = state.hand || [];
    const maxHand = refuges[state.refuge ?? "camp-on-the-docks"]?.handSize ?? 3;
    const drawButton = hand.length < maxHand
      ? `<button class="draw-card-button" data-action="draw-card" data-deck="whispers">Draw a Card (${hand.length}/${maxHand})</button>`
      : `<button class="draw-card-button disabled" disabled>Hand Full (${maxHand}/${maxHand})</button>`;
    const handHtml = hand.map((id) => cards[id] ? makePreview({ id, ...cards[id] }, false, true) : "").join("");
    deckHtml = `<section class="whispers-deck"><div class="deck-controls">${drawButton}</div><div class="deck-hand">${handHtml}</div></section>`;
  }

  const journalHtml = (state.journal ?? []).map((entry) => '<li>' + escapeHtml(entry) + '</li>').join("");
  
  // Categorize inventory
  const categorizedInventory = {};
  for (const [id, amount] of inventory) {
    const item = items[id] || { name: formatName(id), description: "", category: "curiosity" };
    const category = item.category || "curiosity";
    categorizedInventory[category] = categorizedInventory[category] || [];
    categorizedInventory[category].push({ id, amount, item });
  }

  const equipmentHtml = equipmentSlots.map(slot => {
    const equippedId = state.equipment?.[slot];
    const equippedItem = equippedId ? items[equippedId] : null;
    
    return `<div class="equipment-slot">
      <h4>${formatName(slot)}</h4>
      ${equippedItem ? 
        `<p><strong>${escapeHtml(equippedItem.name)}</strong></p>
         <button data-action="unequip-item" data-slot="${slot}">Unequip</button>` : 
        `<p>Empty</p>`}
    </div>`;
  }).join('');
  
const inventoryHtml = inventory.length
    ? inventory.map(([item, quantity]) => '<span>' + formatName(item) + (quantity > 1 ? ' ×' + quantity : '') + '</span>').join("")
    : "<small>Nothing of note.</small>";
  const inventoryCount = inventory.reduce((total, [, quantity]) => total + quantity, 0);
  
  const circlesHtml = Object.entries(circles).map(([id, def]) => {
    const obligations = state.qualities?.[`obligations-${id}`] ?? 0;
    const standing = state.qualities?.[`standing-${id}`] ?? 0;
    if (obligations === 0 && standing === 0) return '';
    return `
      <div class="circle-card">
        <h4>${escapeHtml(def.name)}</h4>
        <p>${escapeHtml(def.description)}</p>
        <div class="circle-stats">
          <span><strong>${standing}</strong> Standing</span>
          <span><strong>${obligations}</strong> Obligations</span>
        </div>
      </div>
    `;
  }).join("");

  
  const activeTradeId = Object.keys(state.qualities ?? {}).find(id => id.startsWith("trade-") && id !== "trade-tier");
  const activeTrade = activeTradeId ? trades[activeTradeId.replace("trade-", "")] : null;
  const tradeHtml = activeTrade ? `
    <div class="trade-card">
      <h4>${escapeHtml(activeTrade.name)} (Tier ${state.qualities["trade-tier"] || 1})</h4>
      <p>${escapeHtml(activeTrade.description)}</p>
      <p><small>Next stipend: ${state.flags?.["last-stipend-claim"] ? (Date.now() - state.flags["last-stipend-claim"] >= 604800000 ? "Ready to claim" : "Wait a week") : "Ready to claim"}</small></p>
    </div>
  ` : `<p><em>Unbound. You have not pledged your labour to any trade.</em></p>`;

  const qualityCardsHtml = Object.entries(state.qualities ?? {}).filter(([id]) => !id.startsWith("obligations-") && !id.startsWith("standing-") && !id.startsWith("trade-")).map(([id, value]) => {


    const details = QUALITY_DETAILS[id] ?? { glyph: "◆", description: "A quality the city has learned to associate with you." };
    const width = Math.min(100, Math.max(4, Number(value) * 10));
    return [
      '<article class="character-stat quality-stat">',
        '<div class="character-stat-glyph" aria-hidden="true">', escapeHtml(details.glyph), '</div>',
        '<div class="character-stat-copy">',
          '<div class="character-stat-heading"><h3>', escapeHtml(formatName(id)), '</h3><strong>',
  (effectiveStat(state, id) !== Number(value) ? `${effectiveStat(state, id)} (${value})` : value),
'</strong></div>',
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

  const possessionCardsHtml = inventory.length === 0 ? '<div class="empty-possessions"><strong>Your pockets are empty.</strong></div>' :
    Object.keys(itemCategories).map(catKey => {
      const itemsInCategory = categorizedInventory[catKey];
      if (!itemsInCategory || itemsInCategory.length === 0) return '';
      return `<div class="inventory-category">
        <h3>${itemCategories[catKey]}</h3>
        <div class="possessions-grid">
          ${itemsInCategory.map(({id, amount, item}) => {
            const isEquippable = !!item.slot;
            const isEquipped = state.equipment?.[item.slot] === id;
            return `<article class="possession-card" data-item="${escapeClass(id)}">
              <div class="possession-copy">
                <div class="possession-heading"><h3>${escapeHtml(item.name)} ${isEquipped ? '(Equipped)' : ''}</h3><strong class="possession-quantity">×${amount}</strong></div>
                <p>${escapeHtml(item.description)}</p>
                ${item.stats ? '<p><strong>' + Object.entries(item.stats).map(([s,v]) => formatName(s) + ' +' + v).join(', ') + '</strong></p>' : ''}
                ${isEquippable && !isEquipped ? `<button data-action="equip-item" data-slot="${item.slot}" data-item="${id}">Equip</button>` : ''}
              </div>
            </article>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');

  const plannedStories = preferences.bookmarks
    .map((id) => ({ id, story: storyDefinitions[id] ?? cards[id] }))
    .filter((entry) => entry.story);
  const plansHtml = plannedStories.length
    ? plannedStories.map(({ id, story }) => [
        '<article class="plan-card">',
          '<div><p class="plans-kicker">Saved story</p><h3>', escapeHtml(story.title), '</h3><p>', escapeHtml(story.text), '</p></div>',
          '<div class="plan-actions"><a href="#stories" data-view="story">Return to stories</a>',
          '<button type="button" data-action="bookmark" data-story="', id, '">Remove</button></div>',
        '</article>'
      ].join("")).join("")
    : '<div class="empty-plans"><strong>No plans yet.</strong><p>Use the ◆ button on a story to keep it here for later.</p></div>';

  let outcomeHtml = "";
  if (outcome) {
    const challengeQuality = outcome.challenge?.quality ?? outcome.challenge?.stat;
    const verdict = outcome.challenge
      ? outcome.success
        ? `You succeeded in ${/^[aeiou]/i.test(formatName(challengeQuality)) ? "an" : "a"} ${formatName(challengeQuality)} challenge! (${outcomeOdds(outcome)}${outcome.usedMomentum ? ", with Momentum" : ""})`
        : `Your ${formatName(challengeQuality)} challenge failed. (${outcomeOdds(outcome)})`
      : "";

    const changesList = (outcome.changes ?? []).map((change) => {
      const name = formatName(change.label ?? change.id);
      if (change.message) return '<li class="outcome-change occurrence">' + escapeHtml(change.message) + '</li>';
      if (change.type === "obols") {
        const verb = change.delta > 0 ? "gained" : "lost";
        return '<li class="outcome-change ' + (change.delta > 0 ? "gain" : "loss") + '">You&apos;ve ' + verb + ' ' + Math.abs(change.delta) + ' x Obols (new total ' + change.after + ').</li>';
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
      '<div class="outcome-screen-overlay"><section class="outcome-panel parchment" role="dialog" aria-modal="true" aria-labelledby="outcome-heading" tabindex="-1" aria-live="polite">',
      '<h2 id="outcome-heading">', escapeHtml(outcome.title ?? "Outcome"), '</h2>',
      verdict ? '<p class="outcome-verdict ' + (outcome.success ? 'success' : 'failure') + '">' + escapeHtml(verdict) + '</p>' : '',
      '<p class="outcome-text">', escapeHtml(outcome.result ?? ""), '</p>',
      changesList ? '<ul class="outcome-changes">' + changesList + '</ul>' : '',
      '<button class="outcome-onwards" type="button" data-action="onwards">Onwards</button>',
      '</section></div>'
    ].join("");
  }

  const pendingLetters=(state.living_stories??[]).filter(entry=>!entry.fired);
  const letterMarkup=[
    '<p class="small">Letters arrive after real-world time passes, even if the game is closed.</p>',
    ...(pendingLetters.length?pendingLetters.map(entry=>{
      const due=Number(entry.trigger_time)+Number(entry.delay_hours)*3600000;
      const minutes=Math.max(0,Math.ceil((due-Date.now())/60000));
      return '<div class="story"><h3>Pending: '+escapeHtml(entry.storylet_id)+'</h3><p>Due in '+minutes+' minutes · '+escapeHtml(new Date(due).toLocaleString())+'</p></div>';
    }):['<p>No letters awaiting delivery.</p>']),
    ...((state.messages??[]).map(message=>'<article class="story"><h3>'+escapeHtml(message.title)+'</h3><p>'+escapeHtml(message.text)+'</p><small>'+escapeHtml(message.at??"")+'</small></article>'))
  ].join("");
  const actionCount=Math.max(0,Number(state.actions??10));
  const actionCap=Math.max(10,Number(state.max_actions??10));
  const nextActionIn=actionCount>=actionCap?null:Math.max(0,Math.ceil((600000-(Date.now()-Number(state.last_action_tick??Date.now())))/60000));
  const quirkHtml = Object.entries(state.quirks??{}).filter(([,level])=>Number(level)>0)
    .map(([id,level])=>'<span class="character-chip"><strong>'+escapeHtml(formatName(id))+'</strong> · '+escapeHtml(quirkTitle(id,Number(level)))+' (Level '+Number(level)+')</span>').join("");
  const ambitionName=ambitions[state.ambition]?.name??"Not yet chosen";
  const ambitionStage=state.ambition_progress?.[state.ambition]??0;
  app.innerHTML = [
        '<div class="game-shell outfit-', escapeClass(preferences.outfit), '">',
      '<header class="topbar">',
        '<div class="brand">NEATH<span>◆</span>BOUND</div>',
        '<div class="action-counter" role="status" aria-live="polite">Actions: ',actionCount,' / ',actionCap, nextActionIn===null?' · Full':' · next in '+nextActionIn+' min','</div>',
        '<nav class="account-nav" aria-label="Account">',
          '<button class="text-link" data-action="reset">New life</button>',
          '<a href="#journal" data-view="story">Journal</a>',
          '<a href="#possessions" data-view="possessions">Possessions</a>',
          '<a href="#plans" data-view="plans">Plans</a>',
          '<a href="#messages" data-view="messages">Messages (', (state.messages??[]).length, ')</a>',
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
        '<button type="button" class="nav-travel" data-action="open-map" aria-controls="travel-map" aria-pressed="false">✥ TRAVEL</button>',
        '<a href="#messages" data-view="messages">MESSAGES</a>',
        state.flags['tutorial.myself'] ? '<a href="#myself" data-view="myself">SELF</a>' : '',
        state.flags['tutorial.possessions'] ? '<a href="#possessions" data-view="possessions">SATCHEL</a>' : '',
        state.flags['tutorial.possessions'] ? '<a href="#possessions">EXCHANGE</a>' : '',
        state.flags['tutorial.story'] ? '<a href="#plans" data-view="plans">PLANS</a>' : '',
      '</nav>',

      '<div class="game-grid">',
        '<aside class="left-rail" id="character" aria-label="Character details">',
          state.flags['tutorial.myself'] ? [
            '<section class="candle-block">',
              '<div class="candle"><span class="wick"></span><span class="wax-line w1"></span><span class="wax-line w2"></span><span class="wax-line w3"></span><span class="wax-line w4"></span></div>',
              '<div class="action-copy"><strong>Actions</strong><div>',actionCount,' / ',actionCap,'</div><small>',nextActionIn===null?'Full':'Next in '+nextActionIn+' min','</small></div>',
            '</section>',

            '<section class="side-section">',
              '<div class="side-icon fate-icon">◇</div>',
              '<div><strong>Fate</strong><div>0</div><small>No payments or paid refills.</small></div>',
            '</section>',

            '<section class="side-section obols-section">',
              '<div class="side-icon obol-icon">₠</div>',
              '<div><strong>Obols</strong><div>', state.obols, '</div></div>',
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
          outcome ? "" : questHtml,
          outcome
            ? outcomeHtml
            : [
                '<section class="story-board">',
                  '<div class="board-inner">',
                    '<section class="featured-story">',
                      '<div class="feature-art feature-art-', escapeClass(state.locationId), '" aria-hidden="true">', locationArtMarkup(state.locationId), '</div>',
                      '<div class="feature-copy">',
                        '<button class="edit-dot" type="button" data-action="edit-note" data-note-key="location:', state.locationId, '" aria-label="Edit location note">✎</button>',
                        '<h2>', escapeHtml(location.name), '</h2>',
                        '<p>', escapeHtml(location.subtitle), '</p>',
                        '<p class="feature-note"><strong>', escapeHtml(locationNote), '</strong></p>',
                      '</div>',
                    '</section>',
                    deckHtml, '<section class="story-stack">', storiesHtml, '</section>',
                  '</div>',
                '</section>'
              ].join(""),

          '<section class="journal parchment" id="journal">',
            '<h3>What the city remembers</h3>',
            '<ol>', journalHtml, '</ol>',
          '</section>',
          '</div>',
          '<div id="travel-map" data-view-panel="map" hidden>', mapHtml, '</div>',
          '<section class="plans-page parchment" id="messages" data-view-panel="messages" hidden>',
            '<header class="plans-header"><h2>Messages</h2></header>',letterMarkup,
          '</section>',
          '<section class="plans-page parchment" id="plans" data-view-panel="plans" hidden>',
            '<p class="small">Personal ambition: ', escapeHtml(ambitionName),' · ',ambitionStage,'/',(ambitions[state.ambition]?.total??0),'</p>',
            '<p class="small">Criminal record: ',Number(state.criminal_record??0),' / 7</p>',
            '<header class="plans-header"><p class="plans-kicker">Things worth returning to</p><h2>Plans</h2><p>Stories you have marked to pursue later. Plans are saved on this device.</p></header>',
            '<div class="plans-list">', plansHtml, '</div>',
          '</section>',
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
                '<span><strong>₠', state.obols, '</strong> Obols</span>',
              '</div>',
            '</div>',
            '<div class="refuges-section">',
  '<h3>Your Refuge</h3>',
  (function() {
    const activeId = state.refuge ?? "camp-on-the-docks";
    const activeRefuge = refuges[activeId];
    
    // Find all owned refuges based on inventory items with 'refuge-' prefix, plus the default camp
    const owned = ["camp-on-the-docks", ...Object.keys(state.items ?? {}).filter(id => id.startsWith("refuge-") && state.items[id] > 0)];
    
    return owned.map(id => {
      const ref = refuges[id] || { name: formatName(id), description: "A place to rest.", handSize: 3 };
      const isActive = id === activeId;
      return `<div class="refuge-card ${isActive ? 'is-active' : ''}">
        <h4>${escapeHtml(ref.name)} ${isActive ? '(Active)' : ''}</h4>
        <p>${escapeHtml(ref.description)}</p>
        <p><strong>Whispers Deck size: ${ref.handSize}</strong></p>
        ${!isActive ? `<button data-action="set-refuge" data-refuge="${id}">Move Here</button>` : ''}
      </div>`;
    }).join('');
  })(),
'</div>',
'<div class="equipment-section">',
  '<h3>Equipped</h3>',
  '<div class="equipment-grid">', equipmentHtml, '</div>',
'</div>',
possessionCardsHtml,
          '</section>',
          '<section class="myself-page parchment" id="myself" data-view-panel="myself" hidden>',
            '<header class="myself-hero">',
              '<div class="myself-portrait" aria-hidden="true"><span>◈</span></div>',
              '<div class="myself-identity">',
                '<p class="myself-kicker">The city knows you as</p>',
                '<h2>', escapeHtml(state.name), '</h2>',
                '<p>Currently in <strong>', escapeHtml(location.name), '</strong>, ', escapeHtml(location.region), '.</p>',
                '<div class="myself-summary">',
                  '<span><strong>₠', state.obols, '</strong> Obols</span>',
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

            (quirkHtml ? '<section class="myself-section"><div class="myself-section-heading"><div><p class="myself-kicker">Character</p><h3>Quirks</h3></div><p>Your choices may strengthen one trait at the expense of its opposite.</p></div><div class="character-chips">'+quirkHtml+'</div></section>' : ''),

            (circlesHtml ? '<section class="myself-section"><div class="myself-section-heading"><div><p class="myself-kicker">Society</p><h3>Circles</h3></div><p>Standing and obligations.</p></div><div class="circles-grid">' + circlesHtml + '</div></section>' : ''),

            '<section class="myself-section">',
              '<div class="myself-section-heading"><div><p class="myself-kicker">Labour</p><h3>Trades</h3></div><p>How you earn your keep.</p></div>',
              '<div class="trade-grid">', tradeHtml, '</div>',
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
          ].join("") : '',
        '</aside>',
      '</div>',

      '<footer class="game-footer">',
        '<span>© NeathBound · Original open-source fiction</span>',
        '<nav><a href="#stories" data-view="story">Story</a><span>|</span><a href="#myself" data-view="myself">Myself</a><span>|</span><a href="#possessions" data-view="possessions">Possessions</a></nav>',
      '</footer>',
    '</div>'
  ].join("");

  // The native name attribute enforces single-open behaviour in modern
  // browsers; this also supports older browsers without that feature.
  app.querySelectorAll(".storylet-disclosure").forEach((section) => {
    section.addEventListener("toggle", () => {
      section.querySelector(".storylet-headline-indicator").textContent = section.open ? "−" : "+";
      if (!section.open) return;
      app.querySelectorAll(".storylet-disclosure").forEach((other) => {
        if (other !== section && other.open) other.open = false;
      });
      section.querySelector(".storylet-headline-indicator").textContent = "−";
    });
    section.querySelector("summary")?.addEventListener("click", () => {
      if (section.open) section.querySelector(".storylet-headline-indicator").textContent = "+";
      else section.querySelector(".storylet-headline-indicator").textContent = "−";
    });
  });
  app.querySelectorAll('[data-action="close-story"]').forEach(button => {
    button.addEventListener("click", () => {
      const section = button.closest("details");
      section.open = false;
      section.querySelector(".storylet-headline-indicator").textContent = "+";
      section.querySelector("summary")?.focus();
    });
  });
  app.querySelectorAll("[data-choice]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => {
      const useLesson = app.querySelector(`input[data-lesson-for="${button.dataset.choice}"]`)?.checked ?? false;
      handlers.choose(button.dataset.story, button.dataset.choice, { useLesson });
    });
  });
  app.querySelector("[data-action=onwards]")?.addEventListener("click", handlers.onwards);
  // A modal result must retain keyboard focus until the reader leaves it.
  app.querySelector('.outcome-panel[role="dialog"]')?.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      app.querySelector("[data-action=onwards]")?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      handlers.onwards();
    }
  });
  app.querySelectorAll("[data-action=draw-card]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.drawCard(button.dataset.deck));
  });
  app.querySelectorAll("[data-action=equip-item]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.equipItem(button.dataset.slot, button.dataset.item));
  });
  app.querySelectorAll("[data-action=unequip-item]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.equipItem(button.dataset.slot, null));
  });
  app.querySelectorAll("[data-action=set-refuge]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.setRefuge(button.dataset.refuge));
  });
  app.querySelectorAll("[data-action=discard]").forEach((button) => {
    button.dataset.originallyDisabled = String(button.disabled);
    button.addEventListener("click", () => handlers.discardCard(button.dataset.card));
  });
  app.querySelectorAll("[data-action=bookmark]").forEach((button) => button.addEventListener("click", () => handlers.bookmark(button.dataset.story)));
  app.querySelectorAll("[data-action=outfit]").forEach((select) => select.addEventListener("change", (event) => handlers.outfit(event.target.value)));
  app.querySelector("[data-action=travel]")?.addEventListener("click", () => handlers.travel(app.querySelector("#travel-location")?.value));
  app.querySelectorAll("[data-action=travel-to]").forEach((button) => button.addEventListener("click", () => handlers.travel(button.dataset.location)));
  // Like Fallen London's Travel control, the city map is a separate view.
  // Opening it never changes the player state or spends an action.
  app.querySelectorAll("[data-action=open-map]").forEach((button) => button.addEventListener("click", () => {
    setView("map");
    app.querySelector("#travel-map-title")?.focus({ preventScroll: true });
    app.querySelector("#travel-map")?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  }));
  app.querySelector("[data-action=close-map]")?.addEventListener("click", () => {
    setView("story");
    app.querySelector("#stories")?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  });
  app.querySelectorAll("[data-action=edit-note]").forEach((button) => button.addEventListener("click", () => handlers.editNote(button.dataset.noteKey)));
  app.querySelector("[data-action=reset]").addEventListener("click", handlers.reset);

  const setView = (view) => {
    const activeView = ["possessions", "myself", "plans", "messages", "map"].includes(view) ? view : "story";
    app.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.viewPanel !== activeView;
    });
    app.querySelectorAll(".main-tabs [data-view]").forEach((link) => {
      link.classList.toggle("active", link.dataset.view === activeView);
    });
    const travelControl = app.querySelector(".nav-travel");
    travelControl?.classList.toggle("active", activeView === "map");
    travelControl?.setAttribute("aria-pressed", String(activeView === "map"));
  };
  const viewFromHash = () => {
    if (globalThis.location?.hash === "#possessions") return "possessions";
    if (globalThis.location?.hash === "#myself") return "myself";
    if (globalThis.location?.hash === "#plans") return "plans";
    if (globalThis.location?.hash === "#messages") return "messages";
    return "story";
  };
  app.querySelectorAll("[data-view]").forEach((link) => link.addEventListener("click", () => setView(link.dataset.view)));
  globalThis.onhashchange = () => setView(viewFromHash());
  setView(viewFromHash());
}


const STORY_IMAGE_ART = {
  "gloomwing-claims-desk": "./assets/art/archive.webp",
  "gloomwing-salt-and-wick": "./assets/art/waterway.webp",
  "gloomwing-price-of-a-claim": "./assets/art/chamber.webp",
  "gloomwing-lamp-cupboard": "./assets/art/neath-hero.webp",
  "gloomwing-bureau-counterfoil": "./assets/art/archive.webp",
  "bell-under-water": "./assets/art/waterway.webp",
  "cartographer-at-dusk": "./assets/art/market.webp",
  "tea-for-the-tide": "./assets/art/waterway.webp",
  "index-of-lost-things": "./assets/art/archive.webp",
  "the-quiet-librarian": "./assets/art/archive.webp",
  "salt-on-the-map": "./assets/art/market.webp"
};

const LOCATION_IMAGE_ART = {
  "ashrail-station": "./assets/art/foundry.webp",
  "cinder-ward": "./assets/art/foundry.webp",
  "registry-of-hours": "./assets/art/archive.webp",
  "the-lair": "./assets/art/chamber.webp",
  "lantern-quay": "./assets/art/waterway.webp",
  "velvet-market": "./assets/art/market.webp",
  "hollow-archive": "./assets/art/archive.webp",
  "clockwork-gardens": "./assets/art/garden.webp",
  "glass-observatory": "./assets/art/garden.webp",
  "the-holding-vaults": "./assets/art/chamber.webp",
  "the-pale-rooms": "./assets/art/chamber.webp",
  "the-stitchery": "./assets/art/chamber.webp",
  "the-whisper-court": "./assets/art/archive.webp",
  "duskwater": "./assets/art/waterway.webp",
  "black-spire": "./assets/art/neath-hero.webp",
  "bureau-hall": "./assets/art/archive.webp"
};

function pictureMarkup(src, label, priority = false) {
  if (!src) return "";
  return '<img class="narrative-picture" src="' + escapeHtml(src) + '" alt="" referrerpolicy="no-referrer" decoding="async" ' +
    (priority ? 'fetchpriority="high"' : 'loading="lazy"') +
    ' data-art-label="' + escapeHtml(label) + '">';
}

function storyArtMarkup(storyId, locationId) {
  const picture = STORY_IMAGE_ART[storyId] || LOCATION_IMAGE_ART[locationId];
  return picture ? pictureMarkup(picture, storyId) : storyArtSvg(storyId, locationId);
}

function locationArtMarkup(locationId) {
  const picture = LOCATION_IMAGE_ART[locationId];
  return picture ? pictureMarkup(picture, locationId, true) : locationArtSvg(locationId);
}

const STORY_ART = {
  "gloomwing-claims-desk": ["✒","the claims desk","#182321","#ab9468"],
  "gloomwing-salt-and-wick": ["♜","salt and wick","#132a2b","#c9b68a"],
  "gloomwing-price-of-a-claim": ["◈","the price of a claim","#30212b","#bba47d"],
  "gloomwing-lamp-cupboard": ["⚿","the lamp cupboard","#172129","#b5a071"],
  "gloomwing-bureau-counterfoil": ["✉","the counterfoil","#2c2922","#b9ac87"],
  "gloomwing-registry-1": ["♢","evidence registry 1","#25323a","#9db6c0"],
  "gloomwing-registry-2": ["▤","evidence registry 2","#342c37","#c3a3b4"],
  "gloomwing-registry-3": ["♧","evidence registry 3","#2e382d","#b6c495"],
  "gloomwing-registry-4": ["✦","evidence registry 4","#3a3025","#d5ad86"],
  "qbn-choose-ambition": ["✒","four promises","#192c3b","#98bfc9"],
  "qbn-missing-name-1": ["◈","the candle census","#39312b","#d0af83"],
  "qbn-missing-name-2": ["◇","the debt written sideways","#26382f","#99c2a2"],
  "qbn-missing-name-3": ["✧","the keeper's empty chair","#3b2938","#c5a1bd"],
  "qbn-missing-name-4": ["⌖","a ticket for yesterday","#33314a","#b5a8da"],
  "qbn-missing-name-5": ["▣","the green wax seal","#192c3b","#98bfc9"],
  "qbn-missing-name-6": ["✦","the child who knows the bell","#39312b","#d0af83"],
  "qbn-missing-name-7": ["⌛","a witness behind glass","#26382f","#99c2a2"],
  "qbn-missing-name-8": ["✉","the surgeon of memories","#3b2938","#c5a1bd"],
  "qbn-missing-name-9": ["⚿","a letter without ink","#33314a","#b5a8da"],
  "qbn-missing-name-10": ["☾","an oath beneath the bridge","#192c3b","#98bfc9"],
  "qbn-missing-name-11": ["◈","the clock with no noon","#39312b","#d0af83"],
  "qbn-missing-name-12": ["◇","three contradictory maps","#26382f","#99c2a2"],
  "qbn-missing-name-13": ["✧","the brass union's offer","#3b2938","#c5a1bd"],
  "qbn-missing-name-14": ["⌖","the quietest auction","#33314a","#b5a8da"],
  "qbn-missing-name-15": ["▣","the archivist's unwritten index","#192c3b","#98bfc9"],
  "qbn-missing-name-16": ["✦","the ledger's torn margin","#39312b","#d0af83"],
  "qbn-missing-name-17": ["⌛","a choir of two voices","#26382f","#99c2a2"],
  "qbn-missing-name-18": ["✉","the watchman's hesitation","#3b2938","#c5a1bd"],
  "qbn-missing-name-19": ["⚿","the luminous smuggler","#33314a","#b5a8da"],
  "qbn-missing-name-20": ["☾","the promise in red thread","#192c3b","#98bfc9"],
  "qbn-missing-name-21": ["◈","the night clerk's bargain","#39312b","#d0af83"],
  "qbn-missing-name-22": ["◇","the first false bell","#26382f","#99c2a2"],
  "qbn-missing-name-23": ["✧","the unpaid ferryman","#3b2938","#c5a1bd"],
  "qbn-missing-name-24": ["⌖","the witness in the river","#33314a","#b5a8da"],
  "qbn-missing-name-25": ["▣","the second name","#192c3b","#98bfc9"],
  "qbn-missing-name-26": ["✦","the room above the registry","#39312b","#d0af83"],
  "qbn-missing-name-27": ["⌛","the trial of evidence","#26382f","#99c2a2"],
  "qbn-missing-name-28": ["✉","the price of restoration","#3b2938","#c5a1bd"],
  "qbn-missing-name-29": ["⚿","a petition with two endings","#33314a","#b5a8da"],
  "qbn-missing-name-30": ["☾","the last entry","#192c3b","#98bfc9"],
  "qbn-last-light-1": ["▣","the last light 1","#39312b","#d0af83"],
  "qbn-last-light-2": ["✦","the last light 2","#26382f","#99c2a2"],
  "qbn-last-light-3": ["⌛","the last light 3","#3b2938","#c5a1bd"],
  "qbn-last-light-4": ["✉","the last light 4","#33314a","#b5a8da"],
  "qbn-last-light-5": ["⚿","the last light 5","#192c3b","#98bfc9"],
  "qbn-river-debt-1": ["▣","the river debt 1","#39312b","#d0af83"],
  "qbn-river-debt-2": ["✦","the river debt 2","#26382f","#99c2a2"],
  "qbn-river-debt-3": ["⌛","the river debt 3","#3b2938","#c5a1bd"],
  "qbn-river-debt-4": ["✉","the river debt 4","#33314a","#b5a8da"],
  "qbn-river-debt-5": ["⚿","the river debt 5","#192c3b","#98bfc9"],
  "qbn-stolen-hour-1": ["▣","the stolen hour 1","#39312b","#d0af83"],
  "qbn-stolen-hour-2": ["✦","the stolen hour 2","#26382f","#99c2a2"],
  "qbn-stolen-hour-3": ["⌛","the stolen hour 3","#3b2938","#c5a1bd"],
  "qbn-stolen-hour-4": ["✉","the stolen hour 4","#33314a","#b5a8da"],
  "qbn-stolen-hour-5": ["⚿","the stolen hour 5","#192c3b","#98bfc9"],
  "qbn-arrival-suspicion": ["⛓","arrival · suspicion","#39312b","#d0af83"],
  "qbn-arrival-dread": ["⛓","arrival · dread","#26382f","#99c2a2"],
  "qbn-arrival-wounds": ["⛓","arrival · wounds","#3b2938","#c5a1bd"],
  "qbn-arrival-scandal": ["⛓","arrival · scandal","#33314a","#b5a8da"],
  "qbn-festival-lanternfall": ["✴","lanternfall","#192c3b","#98bfc9"],
  "qbn-festival-clockmas": ["✴","clockmas","#39312b","#d0af83"],
  "qbn-festival-tidewake": ["✴","tidewake","#26382f","#99c2a2"],
  "qbn-festival-first-bloom": ["✴","first bloom","#3b2938","#c5a1bd"],
  "qbn-festival-cinder-fair": ["✴","cinder fair","#33314a","#b5a8da"],
  "qbn-festival-winter-names": ["✴","winter names","#192c3b","#98bfc9"],
  "qbn-investigate-read": ["⌖","registry evidence · read","#39312b","#d0af83"],
  "qbn-investigate-shadow": ["⌖","registry evidence · shadow","#26382f","#99c2a2"],
  "qbn-investigate-plead": ["⌖","registry evidence · plead","#3b2938","#c5a1bd"],
  "qbn-card-1": ["◇","invisible visitor 1","#33314a","#b5a8da"],
  "qbn-card-2": ["✧","paper boats 2","#192c3b","#98bfc9"],
  "qbn-card-3": ["⌖","copper memory 3","#39312b","#d0af83"],
  "qbn-card-4": ["▣","night printer 4","#26382f","#99c2a2"],
  "qbn-card-5": ["✦","borrowed lantern 5","#3b2938","#c5a1bd"],
  "qbn-card-6": ["⌛","invisible visitor 6","#33314a","#b5a8da"],
  "qbn-card-7": ["✉","paper boats 7","#192c3b","#98bfc9"],
  "qbn-card-8": ["⚿","copper memory 8","#39312b","#d0af83"],
  "qbn-card-9": ["☾","night printer 9","#26382f","#99c2a2"],
  "qbn-card-10": ["◈","borrowed lantern 10","#3b2938","#c5a1bd"],
  "qbn-card-11": ["◇","invisible visitor 11","#33314a","#b5a8da"],
  "qbn-card-12": ["✧","paper boats 12","#192c3b","#98bfc9"],
  "qbn-card-13": ["⌖","copper memory 13","#39312b","#d0af83"],
  "qbn-card-14": ["▣","night printer 14","#26382f","#99c2a2"],
  "qbn-card-15": ["✦","borrowed lantern 15","#3b2938","#c5a1bd"],
  "qbn-card-16": ["⌛","invisible visitor 16","#33314a","#b5a8da"],
  "qbn-card-17": ["✉","paper boats 17","#192c3b","#98bfc9"],
  "qbn-card-18": ["⚿","copper memory 18","#39312b","#d0af83"],
  "qbn-card-19": ["☾","night printer 19","#26382f","#99c2a2"],
  "qbn-card-20": ["◈","borrowed lantern 20","#3b2938","#c5a1bd"],
  "quay-roads": ["⚓", "three roads from the quay", "#20343b", "#a7a173"],
  "ashrail-cancelled-platform": ["⌛", "the cancelled platform", "#333036", "#a69a83"],
  "ashrail-last-train": ["🚂", "midnight freight train", "#262a30", "#a99472"],
  "ashrail-ticket-office": ["✉", "a ticket for nowhere", "#363431", "#aca087"],
  "cinder-communal-stove": ["♨", "supper in cinder ward", "#3f2e29", "#b89976"],
  "cinder-choir": ["♫", "choir of missing names", "#3e2d32", "#a98c9c"],
  "cinder-blue-door": ["▣", "the blue door", "#213947", "#83a5ad"],
  "registry-counter": ["▤", "the corrections counter", "#34313c", "#a7a3a0"],
  "registry-thirteenth-correction": ["◷", "the thirteenth hour", "#302e42", "#ad9cad"],
  "registry-last-decision": ["⚖", "whose names survive", "#36302c", "#bbb09c"],
  "registry-afterword": ["✒", "the clerk's last note", "#292e34", "#a1a69f"],
  "lair-escape": ["⚿", "the sealed iron door", "#171b1d", "#6f6049"],
  "lair-inspect-door": ["⌘", "rusted hinges and old scratches", "#202427", "#867154"],
  "lair-listen": ["◖", "a black tunnel beyond the wall", "#11171b", "#52626a"],
  "bell-under-water": ["♢", "submerged bell", "#173842", "#8ca49e"],
  "cartographer-at-dusk": ["⌖", "living map", "#473227", "#b68b5a"],
  "borrowed-face": ["◐", "silken mask", "#4b253f", "#c79bb7"],
  "red-thread": ["∞", "red thread", "#4d2227", "#c35c62"],
  "index-of-lost-things": ["▤", "remembering index", "#343128", "#b8aa7d"],
  "archive-paper-trail": ["▤", "a missing registry page", "#34332d", "#b6a685"],
  "a-name-sold": ["◑", "the masked broker", "#3b2a37", "#b58f9e"],
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
  "the-loose-end": ["⌁", "loose red knot", "#47272c", "#bd6d73"],
  "smuggling-operations": ["⚓", "contraband beneath tarpaulin", "#1d3336", "#8c7855"],
  "guild-hall": ["⚒", "guild ledgers and brass badges", "#342d28", "#9c825c"],
  "circle-diplomacy": ["◎", "a table of sealed favours", "#352a3a", "#9c789f"],
  "market-exchange": ["⚖", "the silent exchange", "#362c31", "#a88772"],
  "vaults-release": ["▥", "numbered prison doors", "#20282c", "#6c777d"],
  "pale-rooms-recovery": ["✧", "low lamps and white sheets", "#30383b", "#a9b1aa"],
  "stitchery-mending": ["✚", "needle thread and lamplight", "#3e2d2d", "#a77b6d"],
  "whisper-court-appeal": ["♢", "fans raised like evidence", "#362b39", "#9d7b9c"],
  "the-clerks-file": ["▤", "a clerk's impossible file", "#293239", "#87969a"],
  "a-fellow-detainee": ["⌁", "a voice through iron bars", "#242b30", "#768186"],
  "the-dreaming-patient": ["☾", "a sleeper beneath pale linen", "#293036", "#8fa0aa"],
  "the-night-nurse": ["✦", "a lamp carried after midnight", "#2b3337", "#a6a184"],
  "the-surgeons-apprentice": ["✚", "bright instruments on cloth", "#382c2c", "#a98277"],
  "the-back-stair": ["↟", "a narrow stair behind the ward", "#252c2b", "#74867b"],
  "the-fan-maker": ["❧", "paper fans and hidden verdicts", "#382d39", "#a27c98"],
  "a-rivals-brief": ["¶", "a folded rival's brief", "#3a3034", "#9d8586"],
  "lie-low-on-the-barges": ["≋", "dark barges under the quay", "#173238", "#708f91"],
  "a-fresher-scandal": ["♢", "fresh gossip behind velvet", "#432d3e", "#b17a98"],
  "the-quiet-carrel": ["⌑", "a desk between endless shelves", "#2a302c", "#8f927b"],
  "the-gardeners-salve": ["✿", "a brass flower and green salve", "#31402e", "#9cad75"],
  "card-a-stranger-approaches": ["♟", "a stranger with a rusted lamp", "#283239", "#a88765"],
  "card-lost-obols": ["¤", "coins glinting in black muck", "#2e302b", "#a59665"],
  "qbn-gloomwing-hunt-1": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "qbn-gloomwing-hunt-2": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
  "qbn-gloomwing-hunt-3": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "qbn-gloomwing-hunt-4": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "qbn-gloomwing-hunt-5": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "qbn-last-light-6": ["▤","last light","#3a2d34","#c49ca7"],
  "qbn-last-light-7": ["◈","last light","#293638","#b0a77f"],
  "qbn-last-light-8": ["◇","last light","#332c41","#b8a5c8"],
  "qbn-last-light-9": ["✦","last light","#283b37","#9bbaac"],
  "qbn-last-light-10": ["⌖","last light","#3e3430","#d5a891"],
  "qbn-last-light-11": ["☾","last light","#283449","#9eaac5"],
  "qbn-last-light-12": ["▤","last light","#3a2d34","#c49ca7"],
  "qbn-last-light-13": ["◈","last light","#293638","#b0a77f"],
  "qbn-last-light-14": ["◇","last light","#332c41","#b8a5c8"],
  "qbn-last-light-15": ["✦","last light","#283b37","#9bbaac"],
  "qbn-last-light-16": ["⌖","last light","#3e3430","#d5a891"],
  "qbn-last-light-17": ["☾","last light","#283449","#9eaac5"],
  "qbn-last-light-18": ["▤","last light","#3a2d34","#c49ca7"],
  "qbn-last-light-19": ["◈","last light","#293638","#b0a77f"],
  "qbn-last-light-20": ["◇","last light","#332c41","#b8a5c8"],
  "qbn-last-light-21": ["✦","last light","#283b37","#9bbaac"],
  "qbn-last-light-22": ["⌖","last light","#3e3430","#d5a891"],
  "qbn-last-light-23": ["☾","last light","#283449","#9eaac5"],
  "qbn-last-light-24": ["▤","last light","#3a2d34","#c49ca7"],
  "qbn-last-light-25": ["◈","last light","#293638","#b0a77f"],
  "qbn-last-light-26": ["◇","last light","#332c41","#b8a5c8"],
  "qbn-last-light-27": ["✦","last light","#283b37","#9bbaac"],
  "qbn-last-light-28": ["⌖","last light","#3e3430","#d5a891"],
  "qbn-last-light-29": ["☾","last light","#283449","#9eaac5"],
  "qbn-last-light-30": ["▤","last light","#3a2d34","#c49ca7"],
  "qbn-river-debt-6": ["◈","river debt","#293638","#b0a77f"],
  "qbn-river-debt-7": ["◇","river debt","#332c41","#b8a5c8"],
  "qbn-river-debt-8": ["✦","river debt","#283b37","#9bbaac"],
  "qbn-river-debt-9": ["⌖","river debt","#3e3430","#d5a891"],
  "qbn-river-debt-10": ["☾","river debt","#283449","#9eaac5"],
  "qbn-river-debt-11": ["▤","river debt","#3a2d34","#c49ca7"],
  "qbn-river-debt-12": ["◈","river debt","#293638","#b0a77f"],
  "qbn-river-debt-13": ["◇","river debt","#332c41","#b8a5c8"],
  "qbn-river-debt-14": ["✦","river debt","#283b37","#9bbaac"],
  "qbn-river-debt-15": ["⌖","river debt","#3e3430","#d5a891"],
  "qbn-river-debt-16": ["☾","river debt","#283449","#9eaac5"],
  "qbn-river-debt-17": ["▤","river debt","#3a2d34","#c49ca7"],
  "qbn-river-debt-18": ["◈","river debt","#293638","#b0a77f"],
  "qbn-river-debt-19": ["◇","river debt","#332c41","#b8a5c8"],
  "qbn-river-debt-20": ["✦","river debt","#283b37","#9bbaac"],
  "qbn-river-debt-21": ["⌖","river debt","#3e3430","#d5a891"],
  "qbn-river-debt-22": ["☾","river debt","#283449","#9eaac5"],
  "qbn-river-debt-23": ["▤","river debt","#3a2d34","#c49ca7"],
  "qbn-river-debt-24": ["◈","river debt","#293638","#b0a77f"],
  "qbn-river-debt-25": ["◇","river debt","#332c41","#b8a5c8"],
  "qbn-river-debt-26": ["✦","river debt","#283b37","#9bbaac"],
  "qbn-river-debt-27": ["⌖","river debt","#3e3430","#d5a891"],
  "qbn-river-debt-28": ["☾","river debt","#283449","#9eaac5"],
  "qbn-river-debt-29": ["▤","river debt","#3a2d34","#c49ca7"],
  "qbn-river-debt-30": ["◈","river debt","#293638","#b0a77f"],
  "qbn-stolen-hour-6": ["◇","stolen hour","#332c41","#b8a5c8"],
  "qbn-stolen-hour-7": ["✦","stolen hour","#283b37","#9bbaac"],
  "qbn-stolen-hour-8": ["⌖","stolen hour","#3e3430","#d5a891"],
  "qbn-stolen-hour-9": ["☾","stolen hour","#283449","#9eaac5"],
  "qbn-stolen-hour-10": ["▤","stolen hour","#3a2d34","#c49ca7"],
  "qbn-stolen-hour-11": ["◈","stolen hour","#293638","#b0a77f"],
  "qbn-stolen-hour-12": ["◇","stolen hour","#332c41","#b8a5c8"],
  "qbn-stolen-hour-13": ["✦","stolen hour","#283b37","#9bbaac"],
  "qbn-stolen-hour-14": ["⌖","stolen hour","#3e3430","#d5a891"],
  "qbn-stolen-hour-15": ["☾","stolen hour","#283449","#9eaac5"],
  "qbn-stolen-hour-16": ["▤","stolen hour","#3a2d34","#c49ca7"],
  "qbn-stolen-hour-17": ["◈","stolen hour","#293638","#b0a77f"],
  "qbn-stolen-hour-18": ["◇","stolen hour","#332c41","#b8a5c8"],
  "qbn-stolen-hour-19": ["✦","stolen hour","#283b37","#9bbaac"],
  "qbn-stolen-hour-20": ["⌖","stolen hour","#3e3430","#d5a891"],
  "qbn-stolen-hour-21": ["☾","stolen hour","#283449","#9eaac5"],
  "qbn-stolen-hour-22": ["▤","stolen hour","#3a2d34","#c49ca7"],
  "qbn-stolen-hour-23": ["◈","stolen hour","#293638","#b0a77f"],
  "qbn-stolen-hour-24": ["◇","stolen hour","#332c41","#b8a5c8"],
  "qbn-stolen-hour-25": ["✦","stolen hour","#283b37","#9bbaac"],
  "qbn-stolen-hour-26": ["⌖","stolen hour","#3e3430","#d5a891"],
  "qbn-stolen-hour-27": ["☾","stolen hour","#283449","#9eaac5"],
  "qbn-stolen-hour-28": ["▤","stolen hour","#3a2d34","#c49ca7"],
  "qbn-stolen-hour-29": ["◈","stolen hour","#293638","#b0a77f"],
  "qbn-stolen-hour-30": ["◇","stolen hour","#332c41","#b8a5c8"],
  "gloomwing_hunt_00": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "gloomwing_hunt_01": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "gloomwing_hunt_02": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "gloomwing_hunt_03": ["▤","gloomwing hunt","#3a2d34","#c49ca7"],
  "gloomwing_hunt_04": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "gloomwing_hunt_05": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
  "gloomwing_hunt_06": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "gloomwing_hunt_07": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "gloomwing_hunt_08": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "gloomwing_hunt_09": ["▤","gloomwing hunt","#3a2d34","#c49ca7"],
  "gloomwing_hunt_10": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "gloomwing_hunt_11": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
  "gloomwing_hunt_12": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "gloomwing_hunt_13": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "gloomwing_hunt_14": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "gloomwing_hunt_15": ["▤","gloomwing hunt","#3a2d34","#c49ca7"],
  "gloomwing_hunt_16": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "gloomwing_hunt_17": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
  "gloomwing_hunt_18": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "gloomwing_hunt_19": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "gloomwing_hunt_20": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "gloomwing_hunt_21": ["▤","gloomwing hunt","#3a2d34","#c49ca7"],
  "gloomwing_hunt_22": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "gloomwing_hunt_23": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
  "gloomwing_hunt_24": ["✦","gloomwing hunt","#283b37","#9bbaac"],
  "gloomwing_hunt_25": ["⌖","gloomwing hunt","#3e3430","#d5a891"],
  "gloomwing_hunt_26": ["☾","gloomwing hunt","#283449","#9eaac5"],
  "gloomwing_hunt_27": ["▤","gloomwing hunt","#3a2d34","#c49ca7"],
  "gloomwing_hunt_28": ["◈","gloomwing hunt","#293638","#b0a77f"],
  "gloomwing_hunt_29": ["◇","gloomwing hunt","#332c41","#b8a5c8"],
};

// Studio storylets use deterministic title-specific artwork until individual art is commissioned.
for (const [storyId,story] of Object.entries(cmsPublishedStories)) {
  const title=(story.kicker||story.title||storyId).slice(0,40);
  const hash=[...storyId].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,17);
  const palettes=[["#292f3a","#a4adc4"],["#3c2e34","#c1a6af"],["#283b36","#a3c6b3"],["#44382d","#d0b488"]];
  const [dark,light]=palettes[hash%palettes.length];
  STORY_ART[storyId] ??= ["✒",title,dark,light];
}

const LOCATION_ART = {
  "ashrail-station": ["⌛","⚙","Ashrail Station","#252d32","#a18b70"],
  "cinder-ward": ["♨","♫","Cinder Ward","#3c2d2b","#ae8778"],
  "registry-of-hours": ["◷","▤","Registry of Hours","#2c3242","#9ca3ab"],
  "the-lair": ["▣", "⚿", "The Lair", "#14191c", "#75664e"],
  "lantern-quay": ["⚓", "♢", "Lantern Quay", "#143740", "#6d8f91"],
  "velvet-market": ["◐", "✦", "Velvet Market", "#47293f", "#9d6f8f"],
  "hollow-archive": ["▤", "⌑", "Hollow Archive", "#2e342e", "#8d947b"],
  "clockwork-gardens": ["✿", "⚙", "Clockwork Gardens", "#344128", "#9ca45c"],
  "glass-observatory": ["⌕", "✧", "Glass Observatory", "#263743", "#758fa3"],
  "the-holding-vaults": ["▥", "⚿", "The Holding Vaults", "#1e272c", "#6b777e"],
  "the-pale-rooms": ["✧", "☾", "The Pale Rooms", "#31383b", "#aab2ad"],
  "the-stitchery": ["✚", "✂", "The Stitchery", "#3a2c2d", "#9f786e"],
  "the-whisper-court": ["❧", "♢", "The Whisper Court", "#352b38", "#967995"],
  "duskwater": ["♒","◇","Duskwater","#1d3840","#7ca8a8"],
  "black-spire": ["♜","✦","Black Spire","#26293c","#8f9ca9"],
  "bureau-hall": ["▣","▤","Bureau Hall","#32302b","#b59e7a"],
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

function requirementList(entry) {
  const requirements = entry?.requirements;
  if (Array.isArray(requirements)) return requirements;
  if (!requirements) return [];
  const normalized = [];
  if (requirements.item) normalized.push({ type: "item", id: requirements.item, op: ">=", value: 1 });
  if (requirements.quality) normalized.push({ type: "quality", id: requirements.quality[0], op: ">=", value: requirements.quality[1] });
  return normalized;
}

function requirementSummary(state, requirements) {
  return requirements.map((requirement) => {
    const expected = requirement.value;
    const op = requirement.op ?? "==";
    let actual;
    let label = formatName(requirement.id ?? requirement.type);
    if (requirement.type === "quality") actual = effectiveStat(state, requirement.id);
    else if (requirement.type === "menace") actual = state.menaces?.[requirement.id] ?? 0;
    else if (requirement.type === "item") actual = state.items?.[requirement.id] ?? 0;
    else if (requirement.type === "obols" || requirement.type === "echoes") { actual = state.obols ?? state.echoes ?? 0; label = "Obols"; }
    else if (requirement.type === "flag") actual = state.flags?.[requirement.id] ?? false;
    else if (requirement.type === "location") { actual = state.locationId; label = "Location"; }
    if (requirement.type === "time-since-flag") {
      const elapsed=Date.now()-Number(state.flags?.[requirement.id]??0);
      const remaining=Math.max(0,Math.ceil((Number(expected)-elapsed)/3600000));
      return `${label}: ${remaining ? "available in "+remaining+" hours" : "ready"}`;
    }
    if (requirement.type === "flag") return `${label} must be ${op === "!=" ? "not " : ""}${String(expected)}`;
    if (requirement.type === "location") return `${label} must be ${formatName(expected)}`;
    return `${label} ${op} ${expected} (you have ${actual})`;
  }).join(" · ");
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
