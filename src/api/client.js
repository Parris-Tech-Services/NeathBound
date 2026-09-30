// Two interchangeable game "servers" with the same interface:
//  - OnlineGame talks to the Supabase `api` Edge Function (authoritative,
//    progress follows the player's anonymous account across reloads);
//  - OfflineGame runs the same QBN engine in the browser with a local save.
// connect() prefers online and falls back to offline if anything fails.
import {
  availableStorylets,
  beginStorylet,
  chooseBranch,
  currentStorylet,
  goBack,
  newCharacter
} from "../game/engine.js";
import { loadState, saveState } from "../game/state.js";

const SESSION_KEY = "neathbound.session.v1";

export async function connect(content, config, storage = globalThis.localStorage) {
  if (config.supabaseUrl) {
    try {
      const online = new OnlineGame(config, storage);
      online.initialView = await online.load(); // reused by the first draw
      return online;
    } catch (error) {
      console.info("Neathbound: playing offline.", error.message);
    }
  }
  return new OfflineGame(content, storage);
}

export class OfflineGame {
  mode = "offline";

  constructor(content, storage) {
    this.content = content;
    this.storage = storage;
    this.state = loadState(content, storage);
  }

  async load() {
    return this.#view();
  }

  async begin(storyletId) {
    return this.#apply(beginStorylet(this.content, this.state, storyletId));
  }

  async choose(branchId) {
    return this.#apply(chooseBranch(this.content, this.state, branchId));
  }

  async goBack() {
    return this.#apply(goBack(this.state));
  }

  async reset() {
    return this.#apply({ state: newCharacter(this.content) });
  }

  #apply(result) {
    if (result.error) return { ...this.#view(), error: result.error };
    this.state = result.state;
    saveState(this.state, this.storage);
    return { ...this.#view(), outcome: result.outcome };
  }

  #view() {
    const inProgress = currentStorylet(this.content, this.state);
    return {
      character: { ...this.state, area: this.content.areas[this.state.areaId] },
      ...(inProgress ? { phase: "In", storylet: inProgress } : { phase: "Available", storylets: availableStorylets(this.content, this.state) })
    };
  }
}

export class OnlineGame {
  mode = "online";

  constructor(config, storage) {
    this.config = config;
    this.storage = storage;
  }

  load() {
    return this.#call("GET", "storylet");
  }

  begin(storyletId) {
    return this.#call("POST", "storylet/begin", { storyletId });
  }

  choose(branchId) {
    return this.#call("POST", "storylet/choosebranch", { branchId });
  }

  goBack() {
    return this.#call("POST", "storylet/goback");
  }

  reset() {
    return this.#call("POST", "character/reset");
  }

  async #call(method, route, body) {
    const session = await this.#session();
    const response = await fetch(`${this.config.supabaseUrl}/functions/v1/api/${route}`, {
      method,
      headers: {
        apikey: this.config.publishableKey,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    // 409 = a game rule refused the action; the body still carries fresh state.
    if (response.ok || response.status === 409) return data;
    throw new Error(data.error ?? `API ${response.status}`);
  }

  // Anonymous Supabase Auth session: an account without a sign-up form.
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
    const response = await fetch(`${this.config.supabaseUrl}/auth/v1/${path}`, {
      method: "POST",
      headers: { apikey: this.config.publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.msg ?? data.error_description ?? `Auth ${response.status}`);
    return data;
  }
}

function readJson(storage, key) {
  try {
    return JSON.parse(storage?.getItem(key) ?? "null");
  } catch {
    return null;
  }
}
