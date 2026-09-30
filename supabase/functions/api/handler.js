import {
  availableChoices,
  availableStories,
  buyItem,
  currentLocation,
  effectiveChallenge,
  equipItem,
  recoverMenace,
  resolveChoice,
  sellItem
} from "./game/engine.js";
import { locations } from "./game/content.js";
import { initialState, normaliseState } from "./game/state.js";

export async function handle({ method, path, userId, body = {} }, { repo, random = Math.random }) {
  const route = normalise(path);

  const loadOrCreate = async () => {
    const existing = await repo.loadPlayer(userId);
    if (existing) return normaliseState(existing);
    const fresh = initialState();
    await repo.savePlayer(userId, fresh);
    return fresh;
  };
  const context = async () => ({ worldQualities: await repo.loadWorldQualities() });

  if (method === "POST" && route === "/api/player") {
    const existing = await repo.loadPlayer(userId);
    if (existing) return ok({ playerId: userId, state: normaliseState(existing) });
    const state = initialState();
    await repo.savePlayer(userId, state);
    return { status: 201, body: { playerId: userId, state } };
  }
  if (method === "GET" && route === "/api/player") return ok(await loadOrCreate());
  if (method === "GET" && route === "/api/world") return ok(await context());
  if (method === "GET" && route === "/api/journal") return ok({ journal: (await loadOrCreate()).journal });

  if (method === "GET" && (route === "/api/location" || route === "/api/storylets")) {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const storylets = availableStories(state, ctx).map((story) => publicStory(story, state, ctx));
    return ok(route === "/api/location" ? { location: currentLocation(state), stories: storylets } : storylets);
  }

  if (method === "POST" && route === "/api/reset") {
    const state = initialState();
    await repo.savePlayer(userId, state);
    return ok(state);
  }

  const travel = route.match(/^\/api\/travel\/([^/]+)$/);
  if (method === "POST" && travel) {
    const state = await loadOrCreate();
    const stale = revisionMismatch(body, state);
    if (stale) return ok({ error: stale, state, rejected: true });

    const locationId = decodeURIComponent(travel[1]);
    if (!state.unlockedLocations.includes(locationId) || !locations[locationId]) {
      return ok({ error: "That location is not unlocked.", state, rejected: true });
    }
    const revision = Number(state.revision ?? 0) + 1;
    const next = {
      ...state,
      revision,
      flags: { ...state.flags, "__revision": revision },
      locationId,
      journal: [`Travelled to ${locationId.replaceAll("-", " ")}.`, ...state.journal].slice(0, 100)
    };
    await repo.savePlayer(userId, next);
    return ok({ state: next });
  }

  const transaction = route.match(/^\/api\/(bazaar\/(buy|sell)|equipment\/toggle)\/([^/]+)$/);
  if (method === "POST" && transaction) {
    const state = await loadOrCreate();
    const stale = revisionMismatch(body, state);
    if (stale) return ok({ error: stale, state, rejected: true });
    const itemId = decodeURIComponent(transaction[3]);
    const result = transaction[1] === "bazaar/buy"
      ? buyItem(state, itemId)
      : transaction[1] === "bazaar/sell"
        ? sellItem(state, itemId)
        : equipItem(state, itemId);
    if (result.error) return ok({ ...result, rejected: true });
    await repo.savePlayer(userId, result.state);
    return ok(result);
  }

  const recover = route.match(/^\/api\/menaces\/([^/]+)\/recover$/);
  if (method === "POST" && recover) {
    const state = await loadOrCreate();
    const stale = revisionMismatch(body, state);
    if (stale) return ok({ error: stale, state, rejected: true });
    const result = recoverMenace(state, decodeURIComponent(recover[1]));
    if (result.error) return ok({ ...result, rejected: true });
    await repo.savePlayer(userId, result.state);
    return ok(result);
  }

  const choose = route.match(/^\/api\/storylets\/([^/]+)\/branches\/([^/]+)\/choose$/);
  if (method === "POST" && choose) {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const stale = revisionMismatch(body, state);
    if (stale) return ok({ error: stale, state, rejected: true });

    const result = resolveChoice(
      state,
      decodeURIComponent(choose[1]),
      decodeURIComponent(choose[2]),
      random,
      ctx
    );
    if (result.error) return ok({ ...result, rejected: true });
    await repo.savePlayer(userId, result.state);
    return ok(result);
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

function revisionMismatch(body, state) {
  if (!Number.isInteger(body?.expectedRevision)) return null;
  if (body.expectedRevision === Number(state.revision ?? 0)) return null;
  return "Your character changed before that action completed. The latest state has been loaded; please choose again.";
}

function ok(body) {
  return { status: 200, body };
}
