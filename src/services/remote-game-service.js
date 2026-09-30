const PLAYER_KEY = "neathbound.remote.player.v1";

function ensurePlayerId(storage = globalThis.localStorage) {
  let id = storage?.getItem(PLAYER_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    storage?.setItem(PLAYER_KEY, id);
  }
  return id;
}

export class RemoteGameService {
  constructor(baseUrl = "", storage = globalThis.localStorage) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.playerId = ensurePlayerId(storage);
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "content-type": "application/json",
        "x-neathbound-player": this.playerId,
        ...(options.headers ?? {})
      }
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.error ?? `Request failed: ${response.status}`);
    }
    return body;
  }

  async getState() {
    return this.request("/api/player");
  }

  async choose(storyId, choiceId) {
    return this.request(
      `/api/storylets/${encodeURIComponent(storyId)}/branches/${encodeURIComponent(choiceId)}/choose`,
      { method: "POST", body: "{}" }
    );
  }

  async reset() {
    return this.request("/api/reset", { method: "POST", body: "{}" });
  }
}
