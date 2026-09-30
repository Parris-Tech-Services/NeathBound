import { randomUUID } from "node:crypto";
import { defaultPlayer, eligibleStorylets, resolveBranch } from "./domain.mjs";
import { getPlayer, putPlayer } from "./db.mjs";
import { storylet, storylets } from "./content.mjs";

export function createApi(db) {
  return async function api(method, url, body = {}) {
    const parsed = new URL(url, "http://localhost");
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (method === "GET" && parsed.pathname === "/api/health") return { status: 200, body: { ok: true, service: "neathbound-api", actions: "unlimited" } };
    if (method === "POST" && parsed.pathname === "/api/players") {
      const player = defaultPlayer(randomUUID());
      if (body.name) player.name = String(body.name).slice(0, 80);
      putPlayer(db, player, "player.created");
      return { status: 201, body: player };
    }
    const playerId = segments[1] === "players" ? segments[2] : null;
    if (!playerId) return { status: 404, body: { error: "not_found" } };
    const player = getPlayer(db, playerId);
    if (!player) return { status: 404, body: { error: "player_not_found" } };
    if (method === "GET" && segments.length === 4 && segments[3] === "storylets") return { status: 200, body: { storylets: eligibleStorylets(player, await storylets()), actions: "unlimited" } };
    if (method === "POST" && segments.length === 4 && segments[3] === "resolve") {
      const story = await storylet(body.storyletId);
      const branch = story?.branches.find((candidate) => candidate.id === body.branchId);
      try {
        const result = resolveBranch(player, story, branch);
        putPlayer(db, result.player, "branch.resolved", { storyletId: body.storyletId, branchId: body.branchId, success: result.success });
        return { status: 200, body: result };
      } catch (error) { return { status: 409, body: { error: error.message } }; }
    }
    if (method === "POST" && segments.length === 4 && segments[3] === "travel") {
      if (!player.unlockedLocations.includes(body.locationId)) return { status: 409, body: { error: "location_locked" } };
      const next = { ...player, locationId: body.locationId, journal: [`Travelled to ${body.locationId}.`, ...player.journal].slice(0, 50) };
      putPlayer(db, next, "travelled", { locationId: body.locationId });
      return { status: 200, body: next };
    }
    if (method === "GET" && segments.length === 3) return { status: 200, body: player };
    return { status: 404, body: { error: "not_found" } };
  };
}
