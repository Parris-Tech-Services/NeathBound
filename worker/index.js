import { availableStories, currentLocation, resolveChoice } from "../src/game/engine.js";
import { createPlayer, ensurePlayer, resetPlayer, savePlayer } from "./repository.js";

const PLAYER_HEADER = "x-neathbound-player";
const PLAYER_ID_PATTERN = /^[A-Za-z0-9-]{8,100}$/;

function json(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { ...init, headers });
}

function playerIdFrom(request) {
  const value = request.headers.get(PLAYER_HEADER) ?? "";
  return PLAYER_ID_PATTERN.test(value) ? value : null;
}

function publicStory(story, state) {
  return {
    id: story.id,
    title: story.title,
    kicker: story.kicker,
    text: story.text,
    choices: story.choices.map((choice) => ({
      id: choice.id,
      label: choice.label,
      challenge: choice.challenge ?? null
    }))
  };
}

async function getState(env, playerId) {
  return ensurePlayer(env.DB, playerId);
}

async function handleApi(request, env, url) {
  let playerId = playerIdFrom(request);

  if (!playerId && request.method === "POST" && url.pathname === "/api/player") {
    playerId = crypto.randomUUID();
    const state = await createPlayer(env.DB, playerId);
    return json({ playerId, state }, { status: 201 });
  }

  if (!playerId) {
    return json({ error: "Missing or invalid anonymous player ID." }, { status: 400 });
  }

  if (request.method === "GET" && url.pathname === "/api/player") {
    return json(await getState(env, playerId));
  }

  if (request.method === "GET" && url.pathname === "/api/location") {
    const state = await getState(env, playerId);
    return json({
      location: currentLocation(state),
      stories: availableStories(state).map((story) => publicStory(story, state))
    });
  }

  if (request.method === "GET" && url.pathname === "/api/storylets") {
    const state = await getState(env, playerId);
    return json(availableStories(state).map((story) => publicStory(story, state)));
  }

  if (request.method === "GET" && url.pathname === "/api/journal") {
    const state = await getState(env, playerId);
    return json({ journal: state.journal });
  }

  if (request.method === "POST" && url.pathname === "/api/reset") {
    return json(await resetPlayer(env.DB, playerId));
  }

  const chooseMatch = url.pathname.match(
    /^\/api\/storylets\/([^/]+)\/branches\/([^/]+)\/choose$/
  );

  if (request.method === "POST" && chooseMatch) {
    const storyId = decodeURIComponent(chooseMatch[1]);
    const choiceId = decodeURIComponent(chooseMatch[2]);
    const state = await getState(env, playerId);
    const outcome = resolveChoice(state, storyId, choiceId);

    if (outcome.error) {
      return json({ error: outcome.error }, { status: 409 });
    }

    outcome.state = await savePlayer(env.DB, playerId, outcome.state);
    return json(outcome);
  }

  return json({ error: "API route not found." }, { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) {
        return await handleApi(request, env, url);
      }

      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("NeathBound API", { status: 200 });
    } catch (error) {
      console.error("NeathBound Worker error", error);
      return json({ error: "The city is temporarily unreachable." }, { status: 500 });
    }
  }
};
