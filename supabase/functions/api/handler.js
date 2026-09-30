import {
  availableChoices,
  availableStories,
  buyItem,
  currentLocation,
  discardOpportunity,
  drawOpportunity,
  effectiveChallenge,
  equipItem,
  recoverMenace,
  resolveChoice,
  sellItem
} from "./game/engine.js";
import { locations } from "./game/content.js";
import { initialState, normaliseState, syncDerivedState } from "./game/state.js";

export async function handle({ method, path, userId, body = {} }, { repo, random = Math.random }) {
  const route = normalise(path);

  const loadOrCreate = async () => {
    const existing = await repo.loadPlayer(userId);
    if (existing) return normaliseState(existing);
    const fresh = initialState();
    await repo.savePlayer(userId, syncDerivedState(fresh));
    return fresh;
  };
  const context = async () => ({ worldQualities: await repo.loadWorldQualities() });

  if (method === "POST" && route === "/api/player") {
    const existing = await repo.loadPlayer(userId);
    if (existing) return ok({ playerId: userId, state: normaliseState(existing) });
    const state = initialState();
    await repo.savePlayer(userId, syncDerivedState(state));
    return { status: 201, body: { playerId: userId, state } };
  }

  if (method === "GET" && route === "/api/player") return ok(await loadOrCreate());
  if (method === "GET" && route === "/api/world") return ok(await context());
  if (method === "GET" && route === "/api/journal") {
    const state = await loadOrCreate();
    return ok({ journal: state.journal, events: state.events });
  }

  if (method === "GET" && (route === "/api/location" || route === "/api/storylets")) {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const storylets = availableStories(state, ctx).map((story) => publicStory(story, state, ctx));
    return ok(route === "/api/location" ? { location: currentLocation(state), stories: storylets } : storylets);
  }

  if (method === "POST" && route === "/api/reset") {
    const state = initialState();
    await repo.savePlayer(userId, syncDerivedState(state));
    return ok(state);
  }

  const travel = route.match(/^\/api\/travel\/([^/]+)$/);
  if (method === "POST" && travel) {
    const state = await loadOrCreate();
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);

    const locationId = decodeURIComponent(travel[1]);
    if (!state.unlockedLocations.includes(locationId) || !locations[locationId]) {
      return ok({ error: "That location is not unlocked.", state, rejected: true });
    }
    const next = structuredClone(state);
    next.locationId = locationId;
    next.revision += 1;
    next.journal = [`Travelled to ${locationId.replaceAll("-", " ")}.`, ...next.journal].slice(0, 100);
    syncDerivedState(next);
    return commit(repo, userId, expected, { state: next });
  }

  const transaction = route.match(/^\/api\/(bazaar\/(buy|sell)|equipment\/toggle)\/([^/]+)$/);
  if (method === "POST" && transaction) {
    const state = await loadOrCreate();
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);
    const itemId = decodeURIComponent(transaction[3]);
    const result = transaction[1] === "bazaar/buy"
      ? buyItem(state, itemId)
      : transaction[1] === "bazaar/sell"
        ? sellItem(state, itemId)
        : equipItem(state, itemId);
    return result.error ? ok({ ...result, rejected: true }) : commit(repo, userId, expected, result);
  }

  const recover = route.match(/^\/api\/menaces\/([^/]+)\/recover$/);
  if (method === "POST" && recover) {
    const state = await loadOrCreate();
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);
    const result = recoverMenace(state, decodeURIComponent(recover[1]));
    return result.error ? ok({ ...result, rejected: true }) : commit(repo, userId, expected, result);
  }

  if (method === "POST" && route === "/api/opportunities/draw") {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);
    const result = drawOpportunity(state, random, ctx);
    return result.error ? ok({ ...result, rejected: true }) : commit(repo, userId, expected, result);
  }

  const discard = route.match(/^\/api\/opportunities\/discard\/([^/]+)$/);
  if (method === "POST" && discard) {
    const state = await loadOrCreate();
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);
    const result = discardOpportunity(state, decodeURIComponent(discard[1]));
    return result.error ? ok({ ...result, rejected: true }) : commit(repo, userId, expected, result);
  }

  const choose = route.match(/^\/api\/storylets\/([^/]+)\/branches\/([^/]+)\/choose$/);
  if (method === "POST" && choose) {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const expected = expectedRevision(body, state);
    if (expected !== state.revision) return refreshed(state);

    const result = resolveChoice(state, decodeURIComponent(choose[1]), decodeURIComponent(choose[2]), random, ctx);
    return result.error ? ok({ ...result, rejected: true }) : commit(repo, userId, expected, result);
  }

  return { status: 404, body: { error: "API route not found." } };
}

export function normalise(path) {
  const at = path.indexOf("/api");
  return (at >= 0 ? path.slice(at) : path).replace(/\/+$/, "");
}

function publicStory(story, state, context) {
  const available = new Set(availableChoices(state, story.id, context).map((choice) => choice.id));
  return {
    id: story.id,
    title: story.title,
    kicker: story.kicker,
    text: story.text,
    choices: story.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      available: available.has(choice.id),
      challenge: effectiveChallenge(story, choice)
    }))
  };
}

async function commit(repo, userId, expected, result) {
  syncDerivedState(result.state);
  if (!repo.savePlayerIfRevision) {
    await repo.savePlayer(userId, result.state);
    return ok(result);
  }
  const saved = await repo.savePlayerIfRevision(userId, result.state, expected);
  if (saved) return ok(result);
  const latest = normaliseState(await repo.loadPlayer(userId));
  return refreshed(latest);
}

function expectedRevision(body, state) {
  return Number.isInteger(body?.expectedRevision) ? body.expectedRevision : Number(state.revision ?? 0);
}

function refreshed(state) {
  return ok({
    error: "Your character changed before that action completed. The latest state has been loaded; please choose again.",
    state,
    rejected: true
  });
}

function ok(body) {
  return { status: 200, body };
}
