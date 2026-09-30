// NeathBound game API on Supabase: same routes as the former Cloudflare Worker
// (the former Cloudflare worker/index.js), now authenticated by Supabase Auth. Pure JavaScript with
// the repository injected, so Node tests run exactly what Deno deploys.
//
//   POST /api/player                                        create (idempotent)
//   GET  /api/player                                        player state
//   GET  /api/world                                         world qualities
//   GET  /api/location                                      location + storylets
//   GET  /api/storylets                                     storylets here
//   GET  /api/journal                                       journal
//   POST /api/reset                                         new life
//   POST /api/storylets/:storyId/branches/:choiceId/choose  resolve a choice
import { availableChoices, availableStories, currentLocation, effectiveChallenge, resolveChoice, travelBlockedReason , drawCard, discard, setRefuge } from "./game/engine.js";
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
    const stories = availableStories(state, ctx).map((story) => publicStory(story, state, ctx));
    return ok(route === "/api/location" ? { location: currentLocation(state), stories } : stories);
  }

  if (method === "POST" && route === "/api/reset") {
    const state = initialState();
    await repo.savePlayer(userId, state);
    return ok(state);
  }

  const draw = route.match(/^\/api\/deck\/([^/]+)\/draw$/);
  const discardMatch = route.match(/^\/api\/deck\/([^/]+)\/discard$/);
  const refugeMatch = route.match(/^\/api\/refuge\/([^/]+)$/);
  const travel = route.match(/^\/api\/travel\/([^/]+)$/);
  if (method === "POST" && draw) {
    const deckId = draw[1];
    const outcome = drawCard(await loadOrCreate(), deckId, random);
    if (outcome.error) return conflict({ error: outcome.error, state: outcome.state });
    await repo.savePlayer(userId, outcome.state);
    return ok(outcome);
  }

  if (method === "POST" && refugeMatch) {
    const refugeId = refugeMatch[1];
    const outcome = setRefuge(await loadOrCreate(), refugeId);
    await repo.savePlayer(userId, outcome.state);
    return ok(outcome);
  }

  if (method === "POST" && discardMatch) {
    const cardId = discardMatch[1];
    const outcome = discard(await loadOrCreate(), cardId);
    await repo.savePlayer(userId, outcome.state);
    return ok(outcome);
  }

  if (method === "POST" && travel) {
    const state = await loadOrCreate();
    const expectedRevision = Number(body?.expectedRevision);
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(state.revision ?? 0)) {
      return { status: 409, body: { error: "This save changed in another tab.", state } };
    }
    const locationId = decodeURIComponent(travel[1]);
    const blocked = travelBlockedReason(state);
    if (blocked) return { status: 409, body: { error: blocked, state } };
    if (!state.unlockedLocations.includes(locationId) || !locations[locationId]) {
      return { status: 409, body: { error: "That location is not unlocked.", state } };
    }
    const revision = Number(state.revision ?? 0) + 1;
    const next = {
      ...state,
      revision,
      flags: { ...state.flags, __revision: revision },
      locationId,
      journal: [`Travelled to ${locationId.replaceAll("-", " ")}.`, ...state.journal].slice(0, 100)
    };
    await repo.savePlayer(userId, next);
    return ok(next);
  }

  const choose = route.match(/^\/api\/storylets\/([^/]+)\/branches\/([^/]+)\/choose$/);
  if (method === "POST" && choose) {
    const [state, ctx] = await Promise.all([loadOrCreate(), context()]);
    const expectedRevision = Number(body?.expectedRevision);
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(state.revision ?? 0)) {
      return { status: 409, body: { error: "This save changed in another tab.", state } };
    }

    const outcome = resolveChoice(state, decodeURIComponent(choose[1]), decodeURIComponent(choose[2]), random, ctx);
    if (outcome.error) return { status: 409, body: { error: outcome.error, state } };

    if (Number.isInteger(expectedRevision)) {
      const latest = normaliseState(await repo.loadPlayer(userId));
      if (Number(latest.revision ?? 0) !== expectedRevision) {
        return { status: 409, body: { error: "This save changed while that action was resolving.", state: latest } };
      }
    }

    await repo.savePlayer(userId, outcome.state);
    return ok(outcome);
  }

  return { status: 404, body: { error: "API route not found." } };
}

// Supabase delivers "/api/..." in production and "/functions/v1/api/..." locally.
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

function ok(body) {
  return { status: 200, body };
}
