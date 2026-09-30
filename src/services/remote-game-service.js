const PLAYER_KEY = "neathbound.remote.player.v1";

export class RemoteGameService {
  constructor(baseUrl = "", storage = globalThis.localStorage) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.storage = storage;
    this.playerId = storage?.getItem(PLAYER_KEY) ?? null;
  }

  async request(path, options = {}, includePlayer = true) {
    const headers = { "content-type": "application/json", ...(options.headers ?? {}) };
    if (includePlayer && this.playerId) headers["x-neathbound-player"] = this.playerId;

    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error ?? `Request failed: ${response.status}`);
    }
    return body;
  }

  async createPlayer() {
    const created = await this.request("/api/player", { method: "POST", body: "{}" }, false);
    this.playerId = created.playerId;
    this.storage?.setItem(PLAYER_KEY, this.playerId);
    return created.state;
  }

  async ensurePlayer() {
    if (!this.playerId) return this.createPlayer();
    return null;
  }

  async getState() {
    const created = await this.ensurePlayer();
    return created ?? this.request("/api/player");
  }

  async choose(storyId, choiceId) {
    await this.ensurePlayer();
    return this.request(
      `/api/storylets/${encodeURIComponent(storyId)}/branches/${encodeURIComponent(choiceId)}/choose`,
      { method: "POST", body: "{}" }
    );
  }

  async reset() {
    await this.ensurePlayer();
    return this.request("/api/reset", { method: "POST", body: "{}" });
  }
}
