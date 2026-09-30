import { stories } from "../game/content.js?v=20260930-15";
import { ITEM_CATALOG, SHOP_CATALOG, EQUIPMENT_SLOTS, itemInfo, qualityModifier } from "../game/systems.js?v=20260930-15";
import { OPPORTUNITY_CARDS } from "../game/opportunities.js?v=20260930-15";

export function renderOpportunityPanel(state) {
  const hand = state.hand ?? [];
  const cards = hand.map((id) => {
    const card = OPPORTUNITY_CARDS[id];
    if (!card) return "";
    const choices = card.choices.map((choice) => [
      '<button class="card-choice" data-system-action="play-card" data-card-id="', esc(id), '" data-choice-id="', esc(choice.id), '">',
      esc(choice.label), challengeLabel(choice.challenge), '</button>'
    ].join("")).join("");
    return [
      '<article class="opportunity-card parchment"><div class="opportunity-mark">✦</div><div>',
      '<h3>', esc(card.title), '</h3><p>', esc(card.text), '</p><div class="card-actions">', choices,
      '<button class="minor-button" data-system-action="discard-card" data-card-id="', esc(id), '">Discard</button></div></div></article>'
    ].join("");
  }).join("");
  return [
    '<section class="opportunity-hand"><div class="section-heading compact"><div><p class="eyebrow">Chance favours the curious</p><h2>Opportunities</h2></div>',
    '<button class="go-button draw-card" data-system-action="draw-card" ', hand.length >= 3 ? "disabled" : "", '>DRAW (', String(hand.length), '/3)</button></div>',
    cards || '<p class="empty-state">Your hand is empty. Draw an opportunity when you want a diversion from the streets.</p>',
    '</section>'
  ].join("");
}

export function renderScreen(tab, state, preferences) {
  switch (tab) {
    case "messages": return messagesScreen(state);
    case "myself": return myselfScreen(state);
    case "possessions": return possessionsScreen(state);
    case "bazaar": return bazaarScreen(state);
    case "fate": return fateScreen(state);
    case "plans": return plansScreen(preferences);
    default: return "";
  }
}

function messagesScreen(state) {
  const events = (state.events ?? []).slice(0, 30).map((event) => [
    '<article class="screen-card"><h3>', esc(event.title ?? "An event"), '</h3><p>', esc(event.text ?? ""), '</p>',
    '<small>', esc(event.at ? new Date(event.at).toLocaleString() : ""), '</small></article>'
  ].join("")).join("");
  const journal = (state.journal ?? []).slice(0, 40).map((entry) => '<li>' + esc(entry) + '</li>').join("");
  return panel("Messages", "What the city remembers", events + '<section class="screen-card"><h3>Journal</h3><ol class="message-journal">' + journal + '</ol></section>');
}

function myselfScreen(state) {
  const qualities = Object.entries(state.qualities ?? {}).map(([id,value]) => {
    const modifier = qualityModifier(state,id);
    const total = Number(value) + modifier;
    return '<div class="stat-card"><strong>' + name(id) + '</strong><span>' + value + (modifier ? " + " + modifier + " = " + total : "") + '</span></div>';
  }).join("");
  const menaces = Object.entries(state.menaces ?? {}).map(([id,value]) => {
    const level = value >= 5 ? "Dangerous" : value >= 3 ? "Rising" : "Low";
    return [
      '<article class="menace-card menace-', level.toLowerCase(), '"><div><strong>', name(id), '</strong><span>', String(value), ' · ', level, '</span></div>',
      value > 0 ? '<button class="minor-button" data-system-action="recover" data-menace-id="' + esc(id) + '">Recover</button>' : "",
      '</article>'
    ].join("");
  }).join("");
  const acquaintances = (state.acquaintances ?? []).map((id) => '<span class="tag">' + name(id) + '</span>').join("") || '<span class="muted">No formal acquaintances yet.</span>';
  return panel("Myself", "Qualities, menaces and connections",
    '<section class="screen-card"><h3>Qualities</h3><div class="stats-grid">' + qualities + '</div></section>' +
    '<section class="screen-card"><h3>Menaces</h3><p>At 5 or more a menace is dangerous. Recovery costs Echoes, or you can seek consequence stories.</p><div class="menace-list">' + menaces + '</div></section>' +
    '<section class="screen-card"><h3>Acquaintances</h3><div class="tag-list">' + acquaintances + '</div></section>'
  );
}

function possessionsScreen(state) {
  const equipped = state.equipped ?? {};
  const slots = EQUIPMENT_SLOTS.map((slot) => {
    const id = equipped[slot];
    return '<div class="equipment-slot"><strong>' + name(slot) + '</strong><span>' + (id ? esc(itemInfo(id).name) : "Empty") + '</span>' +
      (id ? '<button class="minor-button" data-system-action="unequip" data-slot="' + esc(slot) + '">Unequip</button>' : "") + '</div>';
  }).join("");
  const items = Object.entries(state.items ?? {}).filter(([,qty]) => qty > 0).map(([id,qty]) => {
    const item = itemInfo(id);
    const buttons=[];
    if (item.slot) buttons.push('<button class="minor-button" data-system-action="equip" data-item-id="' + esc(id) + '">Equip</button>');
    if (item.useEffects?.length) buttons.push('<button class="minor-button" data-system-action="use" data-item-id="' + esc(id) + '">Use</button>');
    if (item.sellable || item.category === "equipment" || item.category === "consumable") buttons.push('<button class="minor-button" data-system-action="sell" data-item-id="' + esc(id) + '">Sell</button>');
    const mods = item.modifiers ? " · " + Object.entries(item.modifiers).map(([q,v]) => "+" + v + " " + name(q)).join(", ") : "";
    return '<article class="item-card"><div><h3>' + esc(item.name) + ' <small>×' + qty + '</small></h3><p>' + esc(item.description) + '<em>' + esc(mods) + '</em></p></div><div class="item-actions">' + buttons.join("") + '</div></article>';
  }).join("");
  const outfitButtons = ["morning-outfit","working-outfit","dangerous-outfit"].map((id) => [
    '<div class="saved-outfit"><strong>', name(id), '</strong><div><button class="minor-button" data-system-action="apply-outfit" data-outfit-id="', id, '">Wear</button> ',
    '<button class="minor-button" data-system-action="save-outfit" data-outfit-id="', id, '">Save current</button></div></div>'
  ].join("")).join("");
  return panel("Possessions", "Things you carry, wear and spend",
    '<section class="screen-card"><h3>Equipped</h3><div class="equipment-grid">' + slots + '</div></section>' +
    '<section class="screen-card"><h3>Saved outfits</h3><div class="outfit-grid">' + outfitButtons + '</div></section>' +
    '<section class="screen-card"><h3>Inventory</h3><div class="inventory-grid">' + (items || '<p>Nothing of note.</p>') + '</div></section>'
  );
}

function bazaarScreen(state) {
  const stock = SHOP_CATALOG.map((id) => {
    const item = itemInfo(id);
    const owned = state.items?.[id] ?? 0;
    const mods = item.modifiers ? Object.entries(item.modifiers).map(([q,v]) => "+" + v + " " + name(q)).join(", ") : "";
    return [
      '<article class="shop-card"><div><h3>', esc(item.name), '</h3><p>', esc(item.description), '</p><small>', esc(mods), owned ? " · Owned " + owned : "", '</small></div>',
      '<div class="shop-price"><strong>', String(item.price), ' Echoes</strong><button class="go-button" data-system-action="buy" data-item-id="', id, '" ', state.echoes < item.price ? "disabled" : "", '>BUY</button></div></article>'
    ].join("");
  }).join("");
  return panel("Bazaar", "Useful things at unreasonable prices", '<p class="balance-line">You have <strong>' + state.echoes + ' Echoes</strong>.</p><div class="shop-grid">' + stock + '</div>');
}

function fateScreen(state) {
  return panel("Fate", "No premium currency here",
    '<section class="screen-card"><h3>Fate remains 0</h3><p>NeathBound keeps unlimited actions and free access. There are no paid action refills or premium story gates.</p></section>' +
    '<section class="screen-card"><h3>Momentum: ' + String(state.momentum ?? 0) + '</h3><p>Momentum is earned in play. A point is spent automatically when a challenge misses by no more than 3, turning the near miss into a success.</p></section>'
  );
}

function plansScreen(preferences) {
  const bookmarked = preferences.bookmarks.map((id) => stories[id]).filter(Boolean).map((story) => '<li><strong>' + esc(story.title) + '</strong></li>').join("") || '<li>No bookmarked stories yet.</li>';
  const goals = preferences.goals.map((goal,index) => '<li>' + esc(goal) + ' <button class="text-link" data-action="remove-goal" data-goal-index="' + index + '">remove</button></li>').join("") || '<li>No goals yet.</li>';
  return panel("Plans", "Bookmarks, notes and things you mean to do",
    '<section class="screen-card"><h3>Goals</h3><ul class="plans-list">' + goals + '</ul><button class="go-button" data-action="add-goal">ADD GOAL</button></section>' +
    '<section class="screen-card"><h3>Bookmarked stories</h3><ul class="plans-list">' + bookmarked + '</ul></section>'
  );
}

function panel(titleText, subtitle, body) {
  return '<section class="secondary-screen parchment"><p class="eyebrow">NeathBound</p><h1>' + esc(titleText) + '</h1><p class="screen-subtitle">' + esc(subtitle) + '</p>' + body + '</section>';
}

function challengeLabel(challenge) {
  if (!challenge || challenge === false) return '<small>No challenge</small>';
  return '<small>' + name(challenge.quality) + " · Difficulty " + challenge.difficulty + '</small>';
}

function name(value) { return String(value ?? "").split("-").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" "); }
function esc(value) { return String(value ?? "").replace(/[&<>"\']/g, (char) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#039;" })[char]); }