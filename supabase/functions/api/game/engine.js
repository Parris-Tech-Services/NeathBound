import { locations, menaceAreas, stories, decks, cards, refuges, equipmentSlots, items, ambitions, festivals, destinies } from "./content.js";
import { drawCardToHand, discardCard as removeCardFromHand } from "./decks.js";
import { cloneState, initialState } from "./state.js";
import { applyEffects, awardProgress, cpAward, describeChallenge, requirementsMet, resolveChallenge } from "./rules.js";

import { effectiveStat } from "./rules.js";
export { describeChallenge, effectiveStat };

export const MENACE_WARNING_LEVEL = 5;
export const menace_penalty_locations=menaceAreas;
export function festivalActive(festival,now=new Date()){
 if(!festival)return false;
 const current=(now.getMonth()+1)*100+now.getDate();
 const start=festival.start[0]*100+festival.start[1],end=festival.end[0]*100+festival.end[1];
 return start<=end?(current>=start&&current<=end):(current>=start||current<=end);
}
export function chooseAmbition(state,id){
 const next=cloneState(state);
 if(next.ambition||!ambitions[id]||next.locationId==="the-lair")
   return {state:next,error:"Choose one ambition after leaving the opening chamber."};
 next.ambition=id;next.ambition_progress??={};next.ambition_progress[id]=0;
 if(id==="gloomwing-hunt")next.qualities.gloomwing_hunt_progress=0;
 next.flags["qbn-ambition-chosen"]=true;bumpRevision(next);
 return {state:next};
}
export function chooseDestiny(state,id,now=new Date()){
 const next=cloneState(state);
 if(next.destinies?.length||!destinies[id]||destinies[id].fate_locked||!Object.values(festivals).some(f=>festivalActive(f,now)))
   return {state:next,error:"This destiny is unavailable outside a festival, or one was already chosen."};
 next.destinies=[id];next.flags["destiny-chosen"]=true;next.destiny_bonus={...destinies[id].stat_bonus};
 bumpRevision(next);return {state:next};
}
export function tickLivingStories(state,now=Date.now()){
 const next=cloneState(state);
 let fired=0;next.messages??=[];next.living_stories??=[];
 for(const event of next.living_stories){
   if(event.fired||now<Number(event.trigger_time)+Number(event.delay_hours)*3600000)continue;
   event.fired=true;fired++;
   if(Array.isArray(event.on_arrival) && event.on_arrival.length) applyEffects(next,event.on_arrival);
   next.flags??={};
   next.flags["living-story-fired:"+event.storylet_id]=true;
   next.messages.unshift({id:event.storylet_id,at:new Date(now).toISOString(),title:event.title??"A delayed letter arrives",
      text:event.text??("The city has answered your earlier decision: "+event.storylet_id)});
 }
 if(fired)bumpRevision(next);
 return {state:next,fired};
}
export const ACTION_REGEN_MS=10*60*1000;
export function refreshActions(state,now=Date.now()){
 const next=cloneState(state);
 const cap=Math.max(10,Math.min(20,Number(next.max_actions??10)));
 next.max_actions=cap;
 next.actions=Math.max(0,Math.min(cap,Number(next.actions??cap)));
 const last=Number(next.last_action_tick);
 if(!Number.isFinite(last)||last>now){next.last_action_tick=now;return next;}
 if(next.actions>=cap){next.last_action_tick=now;return next;}
 const earned=Math.max(0,Math.floor((now-last)/ACTION_REGEN_MS));
 if(earned>0){next.actions=Math.min(cap,next.actions+earned);
 next.last_action_tick=next.actions>=cap?now:last+earned*ACTION_REGEN_MS;}
 return next;
}
export const MENACE_CONSEQUENCE_LEVEL = 8;

function bumpRevision(state) {
  state.revision = Number(state.revision ?? 0) + 1;
  state.flags ??= {};
  state.flags.__revision = state.revision;
}

export function currentLocation(state) {
  return locations[state.locationId] ?? locations["lantern-quay"];
}

function asRequirements(requirements) {
  if (Array.isArray(requirements)) return requirements;
  if (!requirements) return [];
  const normalized = [];
  if (requirements.item) normalized.push({ type: "item", id: requirements.item, op: ">=", value: 1 });
  if (requirements.quality) normalized.push({ type: "quality", id: requirements.quality[0], op: ">=", value: requirements.quality[1] });
  return normalized;
}

function requirementsFor(entry) {
  return asRequirements(entry?.requirements);
}

export function effectiveChallenge(story, choice) {
  if (!story || !choice) return null;
  if (choice.challenge === false || choice.challenge === null) return null;
  const challenge = choice.challenge ?? story.challenge ?? null;
  // Original hand-authored stories were tuned for d10. Keep their odds intact
  // while new QBN stories default to broad unless authors override mode.
  if (!challenge || !story.id || story.id.startsWith("qbn-") || challenge.mode) return challenge;
  return { ...challenge, mode: "classic" };
}

// While in a menace consequence area the only way out is its storylets.
export function travelBlockedReason(state) {
  const here = locations[state.locationId];
  return here?.consequenceOf && Number(state.menaces?.[here.consequenceOf] ?? 0) >= MENACE_CONSEQUENCE_LEVEL ? `You cannot leave ${here.name} until ${here.consequenceOf} is below 8.` : null;
}

export function storyAvailable(state, storyId, context = {}) {
  const story = (stories[storyId] ?? cards[storyId]);
  if (!story) return false;
  if (!currentLocation(state).stories.includes(storyId) && !state.hand?.includes(storyId)) return false;
  if (story.once && state.flags[`story-complete:${storyId}`]) return false;
  if(story.ambition_id && (state.ambition!==story.ambition_id || Number(state.ambition_progress?.[story.ambition_id]??0)!==Number(story.requires_progress?.value??0)))return false;
  if(story.festival_id && !festivalActive(festivals[story.festival_id]))return false;
  return requirementsMet(state, requirementsFor(story), context);
}

export function canPlay(state, story, context = {}) {
  return Boolean(story && requirementsMet(state, requirementsFor(story), context));
}

export function availableStories(state, context = {}) {
  return currentLocation(state).stories
    .filter((id) => storyAvailable(state, id, context))
    .map((id) => ({ id, ...stories[id] }));
}

export function choiceAvailable(state, storyId, choiceId, context = {}) {
  if (!storyAvailable(state, storyId, context)) return false;
  const choice =  (stories[storyId] ?? cards[storyId])?.choices.find((candidate) => candidate.id === choiceId);
  return Boolean(choice && requirementsMet(state, requirementsFor(choice), context));
}

export function availableChoices(state, storyId, context = {}) {
  const story =  (stories[storyId] ?? cards[storyId]);
  if (!storyAvailable(state, storyId, context) || !story) return [];
  return story.choices.filter((choice) => requirementsMet(state, requirementsFor(choice), context));
}

export function resolveChoice(state, storyId, choiceId, random = Math.random, context = {}, options = {}) {
  const before=refreshActions(state);
  const next=cloneState(before);
  const story = (stories[storyId] ?? cards[storyId]);

  if (!storyAvailable(next, storyId, context)) {
    return { state: next, error: "That story is no longer available. Your current state has been refreshed." };
  }

  const choice = story.choices.find((candidate) => candidate.id === choiceId);
  if (!choice || !requirementsMet(next, requirementsFor(choice), context)) {
    return { state: next, error: "That choice is no longer available. Your current state has been refreshed." };
  }

  const actionCost=Math.max(0,Math.floor(Number(choice.action_cost ?? story.action_cost ?? (story.autofire?0:1))));
  if(next.actions<actionCost)return {state:next,error:"Not enough actions. One action returns every ten minutes."};
  next.actions-=actionCost;
  const challenge = effectiveChallenge({ ...story, id: storyId }, choice);
  let check = resolveChallenge(next, challenge, random);
  let success = check.success;
  let usedLesson = false;
  if (options.useLesson && challenge && (next.items[`lesson-${challenge.quality}`] > 0)) {
    next.items[`lesson-${challenge.quality}`] -= 1;
    usedLesson = true;
    if (!success) {
      const secondCheck = resolveChallenge(next, challenge, random);
      if (secondCheck.success || secondCheck.total > check.total) {
        check = secondCheck;
      }
      success = check.success;
    }
  }

  // Momentum: a near miss (within 3) can be turned into a success by
  // spending one point of momentum.
  let usedMomentum = false;
  if (challenge && !success && (challenge.mode ?? "broad") === "classic" && Number.isFinite(check.total) && (next.momentum ?? 0) > 0 && check.total + 3 >= challenge.difficulty) {
    next.momentum -= 1;
    check.total += 3;
    check.success = success = true;
    check.outcome = "success";
    check.cpAwarded = cpAward(check.percent, true);
    usedMomentum = true;
  }
  // The rules resolver has already performed the single rare roll after success.
  const rare = Boolean(success && check.rare);
  const resultText = success
    ? (rare ? (choice.rare_success ?? choice.rareSuccess ?? choice.success) : choice.success)
    : (choice.failure ?? "The city refuses to explain itself.");
  // A branch with no special rare reward keeps ordinary success rewards.
  const effects = !success ? (choice.failureEffects ?? [])
    : rare ? (choice.rareSuccessEffects ?? choice.successEffects ?? [])
    : (choice.successEffects ?? []);
  applyEffects(next, effects);

  // Progress on success AND failure using the canonical 2/1 CP award.
  const progress = challenge?.quality
    ? awardProgress(next, challenge.quality, check.cpAwarded)
    : null;

  // Menaces: a warning at 5; at 8 the player is taken to that menace's area.
  const menaceNotes = [];
  for (const [menace, areaId] of Object.entries(menaceAreas ?? {})) {
    const from = Number(before.menaces?.[menace] ?? 0);
    const to = Number(next.menaces?.[menace] ?? 0);
    if (to >= MENACE_CONSEQUENCE_LEVEL && from < MENACE_CONSEQUENCE_LEVEL && locations[areaId]) {
      next.locationId = areaId;
      next.flags[`menace-consequence:${menace}`] = true;
      next.flags[`qbn-arrived-${menace}`] = true;
      if(menace==="suspicion")next.criminal_record=Math.min(7,Number(next.criminal_record??0)+1);
      next.messages??=[];
      next.messages.unshift({id:"arrival-"+menace,at:new Date().toISOString(),title:"Taken to "+locations[areaId].name,text:"Your "+menace+" reached 8. Recover before you can leave."});
      menaceNotes.push({ type: "menace-consequence", id: menace, message: `Your ${title(menace)} has reached ${to}. You have been taken to ${locations[areaId].name}.` });
    } else if (to >= MENACE_WARNING_LEVEL && from < MENACE_WARNING_LEVEL) {
      menaceNotes.push({ type: "menace-warning", id: menace, message: `Take care: your ${title(menace)} is ${to}. At ${MENACE_CONSEQUENCE_LEVEL} there will be consequences.` });
    }
  }
  next.flags[`${storyId}:${choiceId}`] = true;
  // Failed checks must remain retryable; do not permanently consume a chapter.
  if (story.once && success) next.flags[`story-complete:${storyId}`] = true;
  if (next.hand?.includes(storyId)) {
    next.hand.splice(next.hand.indexOf(storyId), 1);
    next.discard = [...(next.discard ?? []), storyId];
  }
  next.revision = Number(next.revision ?? 0) + 1;
  next.flags.__revision = next.revision;

  const changes = describeChanges(before, next);
  if (usedLesson) {
    changes.push({ type: "item", id: `lesson-${challenge.quality}`, change: -1, message: `You spent a Recalled Lesson: ${title(challenge.quality)} for a second chance.` });
  }

  if (progress?.points) {
    const name = title(challenge.quality);
    changes.push({
      type: "progress",
      id: challenge.quality,
      message: `Your ${name} is increasing: +${progress.points} progress (${progress.progress} of ${progress.nextLevelCost} towards level ${progress.level + 1}).`
    });
  }
  changes.push(...menaceNotes);
  const challengeText = challenge
    ? check.total !== null
      ? ` (${success ? "success" : "failure"}: ${check.total} vs ${challenge.difficulty}${usedMomentum ? " with momentum" : ""})`
      : ` (${success ? "success" : "failure"}: ${check.label}, ${check.percent}% chance)`
    : "";
  const journalText = `${story.title}: ${resultText}${challengeText}`;
  next.journal = [journalText, ...next.journal].slice(0, 100);
  next.events = [{
    id: `${Date.now()}-${storyId}-${choiceId}-${next.revision}`,
    at: new Date().toISOString(),
    storyId,
    choiceId,
    title: story.title,
    outcome: rare ? "rare_success" : (success ? "success" : "failure"),
    text: resultText,
    changes
  }, ...(next.events ?? [])].slice(0, 250);

  return {
    state: next,
    storyId,
    choiceId,
    title: story.title,
    result: resultText,
    success,
    rare,
    roll: check.roll,
    total: check.total,
    challenge,
    chance: check.chance,
    percent: check.percent,
    label: check.label,
    progress,
    usedMomentum,
    changes
  };
}

export function resetState() {
  return initialState();
}

export function describeChanges(before, after) {
  const changes = [];
  const numeric = (group, key, label) => {
    const from = Number(before[group]?.[key] ?? 0);
    const to = Number(after[group]?.[key] ?? 0);
    if (to !== from) changes.push({ type: group, id: key, label, before: from, after: to, delta: to - from });
  };

  if (Number(before.momentum ?? 0) !== Number(after.momentum ?? 0)) {
    changes.push({ type: "momentum", id: "momentum", label: "Momentum", before: Number(before.momentum ?? 0), after: Number(after.momentum ?? 0), delta: Number(after.momentum ?? 0) - Number(before.momentum ?? 0) });
  }

  if (Number(before.obols ?? 0) !== Number(after.obols ?? 0)) {
    changes.push({ type: "obols", id: "obols", label: "Obols", before: Number(before.obols ?? 0), after: Number(after.obols ?? 0), delta: Number(after.obols ?? 0) - Number(before.obols ?? 0) });
  }

  for (const key of new Set([...Object.keys(before.qualities ?? {}), ...Object.keys(after.qualities ?? {})])) numeric("qualities", key, title(key));
  for (const key of new Set([...Object.keys(before.menaces ?? {}), ...Object.keys(after.menaces ?? {})])) numeric("menaces", key, title(key));
  for (const key of new Set([...Object.keys(before.items ?? {}), ...Object.keys(after.items ?? {})])) numeric("items", key, title(key));

  if (before.locationId !== after.locationId) {
    changes.push({ type: "location", id: after.locationId, label: "Location", before: before.locationId, after: after.locationId, message: `You are now at ${locations[after.locationId]?.name ?? title(after.locationId)}.` });
  }
  return changes;
}

function title(value) {
  return String(value).split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}

export function drawCard(state, deckId = "whispers", random = Math.random) {
  const next = cloneState(state);
  const deck = decks[deckId];
  if (!deck) return { state: next, error: "Deck not found." };
  const maxHand = 6; // Fixed six-card ceiling
  if ((next.hand?.length ?? 0) >= maxHand) return { state: next, error: "Your hand is full." };
  
  const card = drawCardToHand(next, deck, cards, random);
  if (card) bumpRevision(next);
  return { state: next, drawn: card ? card.id : null };
}

export function equipItem(state, slot, itemId) {
  const next = cloneState(state);
  if (!equipmentSlots.includes(slot)) return { state: next, error: "Unknown equipment slot." };
  if (itemId !== null && (items[itemId]?.slot !== slot || Number(next.items?.[itemId] ?? 0) < 1)) {
    return { state: next, error: "You do not own an item that fits this slot." };
  }
  next.equipment ??= {};
  if ((next.equipment[slot] ?? null) === itemId) return { state: next };
  if (itemId === null) delete next.equipment[slot];
  else next.equipment[slot] = itemId;
  bumpRevision(next);
  return { state: next };
}

export function setRefuge(state, refugeId) {
  const next = cloneState(state);
  next.refuge = refugeId;
  bumpRevision(next);
  return { state: next };
}

export function discard(state, cardId) {
  const next = cloneState(state);
  if (!next.hand?.includes(cardId)) return { state: next, error: "That card is not in your hand." };
  removeCardFromHand(next, cardId);
  bumpRevision(next);
  return { state: next };
}
