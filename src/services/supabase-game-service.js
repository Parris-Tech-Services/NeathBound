const SESSION_KEY = "neathbound.session.v1";

export class SupabaseGameService {
  mode = "online";

  constructor(config, storage = globalThis.localStorage, fetchImpl = globalThis.fetch?.bind(globalThis)) {
    this.config = config;
    this.storage = storage;
    this.fetch = fetchImpl;
  }

  getState() { return this.#call("GET", "player"); }
  choose(storyId, choiceId, revision = 0) {
    return this.#call("POST", `storylets/${encodeURIComponent(storyId)}/branches/${encodeURIComponent(choiceId)}/choose`, actionBody(revision));
  }
  travel(locationId, revision = 0) { return this.#call("POST", `travel/${encodeURIComponent(locationId)}`, actionBody(revision)); }
  buy(itemId, revision = 0) { return this.#call("POST", `bazaar/buy/${encodeURIComponent(itemId)}`, actionBody(revision)); }
  sell(itemId, revision = 0) { return this.#call("POST", `bazaar/sell/${encodeURIComponent(itemId)}`, actionBody(revision)); }
  equip(itemId, revision = 0) { return this.#call("POST", `equipment/toggle/${encodeURIComponent(itemId)}`, actionBody(revision)); }
  recover(menaceId, revision = 0) { return this.#call("POST", `menaces/${encodeURIComponent(menaceId)}/recover`, actionBody(revision)); }
  drawOpportunity(revision = 0) { return this.#call("POST", "opportunities/draw", actionBody(revision)); }
  discardOpportunity(storyId, revision = 0) { return this.#call("POST", `opportunities/discard/${encodeURIComponent(storyId)}`, actionBody(revision)); }
  reset() { return this.#call("POST", "reset", { requestId: crypto.randomUUID() }); }

  async #call(method, route, requestBody = {}) {
    const session = await this.#session();
    const response = await this.fetch(`${this.config.supabaseUrl}/functions/v1/api/${route}`, {
      method,
      headers: {
        apikey: this.config.publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: method === "POST" ? JSON.stringify(requestBody) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) return payload;
    throw new Error(payload.error ?? `Request failed: ${response.status}`);
  }

  async #session() {
    let session = readJson(this.storage, SESSION_KEY);
    if (session && session.expires_at * 1000 > Date.now() + 60_000) return session;
    session = session?.refresh_token
      ? await this.#auth("token?grant_type=refresh_token", { refresh_token: session.refresh_token }).catch(() => null)
      : null;
    session ??= await this.#auth("signup", {});
    this.storage?.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  async #auth(path, body) {
    const response = await this.fetch(`${this.config.supabaseUrl}/auth/v1/${path}`, {
      method: "POST",
      headers: { apikey: this.config.publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.msg ?? data.error_description ?? `Auth failed: ${response.status}`);
    return data;
  }
}

function actionBody(expectedRevision) {
  return { requestId: crypto.randomUUID(), expectedRevision: Number(expectedRevision ?? 0) };
}

function readJson(storage, key) {
  try { return JSON.parse(storage?.getItem(key) ?? "null"); }
  catch { return null; }
}
