// NeathBound game API: the authoritative server, shaped like Fallen London's
// JSON API (begin a storylet, choose a branch, go back). Pure JavaScript with
// the database injected, so Node tests exercise exactly what Deno deploys.
//
//   GET  /api/character/myself        -> character sheet
//   GET  /api/storylet                -> storylets here, or the one in progress
//   POST /api/storylet/begin          {storyletId}
//   POST /api/storylet/choosebranch   {branchId}
//   POST /api/storylet/goback
//   POST /api/character/reset
import {
  availableStorylets,
  beginStorylet,
  chooseBranch,
  currentStorylet,
  goBack,
  newCharacter
} from "./engine.js";

export async function handle({ method, path, body }, { db, userId, random = Math.random }) {
  const route = `${method} ${normalise(path)}`;
  const content = await db.loadContent();
  let state = (await db.loadCharacter(userId)) ?? null;
  if (!state) {
    state = newCharacter(content);
    await db.saveCharacter(userId, state);
  }

  const view = (extra = {}) => ok({ ...extra, character: sheet(content, state), ...storyletView(content, state) });

  switch (route) {
    case "GET /api/character/myself":
    case "GET /api/storylet":
      return view();

    case "POST /api/storylet/begin": {
      const result = beginStorylet(content, state, body?.storyletId);
      if (result.error) return fail(409, result.error, content, state);
      state = result.state;
      await db.saveCharacter(userId, state);
      return view();
    }

    case "POST /api/storylet/choosebranch": {
      const result = chooseBranch(content, state, body?.branchId, random);
      if (result.error) return fail(409, result.error, content, state);
      state = result.state;
      await db.saveCharacter(userId, state);
      return view({ outcome: result.outcome });
    }

    case "POST /api/storylet/goback": {
      state = goBack(state).state;
      await db.saveCharacter(userId, state);
      return view();
    }

    case "POST /api/character/reset": {
      state = newCharacter(content);
      await db.saveCharacter(userId, state);
      return view();
    }

    default:
      return { status: 404, body: { error: `No route for ${route}` } };
  }
}

// Supabase delivers "/api/storylet" (or "/functions/v1/api/storylet" locally).
export function normalise(path) {
  const at = path.indexOf("/api");
  const trimmed = (at >= 0 ? path.slice(at) : path).replace(/\/+$/, "");
  return trimmed.toLowerCase();
}

function sheet(content, state) {
  return {
    name: state.name,
    areaId: state.areaId,
    area: content.areas[state.areaId],
    qualities: state.qualities,
    journal: state.journal,
    currentStoryletId: state.currentStoryletId
  };
}

function storyletView(content, state) {
  const inProgress = currentStorylet(content, state);
  return inProgress
    ? { phase: "In", storylet: inProgress }
    : { phase: "Available", storylets: availableStorylets(content, state) };
}

function ok(body) {
  return { status: 200, body };
}

function fail(status, error, content, state) {
  return { status, body: { error, character: sheet(content, state), ...storyletView(content, state) } };
}
