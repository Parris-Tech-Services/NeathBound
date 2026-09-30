import { config } from "../config.js?v=20260930-7";
import { LocalGameService } from "./local-game-service.js?v=20260930-5";
import { SupabaseGameService } from "./supabase-game-service.js?v=20260930-7";

// Online (Supabase) by default; ?api=local forces offline play.
export function createGameService({ settings = config, search = globalThis.location?.search ?? "", storage = globalThis.localStorage } = {}) {
  const forceLocal = new URLSearchParams(search).get("api") === "local" || !settings.supabaseUrl;
  if (forceLocal) return new LocalGameService(storage);
  return new FallbackGameService(new SupabaseGameService(settings, storage), () => new LocalGameService(storage));
}

// Tries the online service on first contact; if the backend is unreachable
// (or paused), the whole session switches to offline play with a local save.
// Once online, later errors are shown to the player rather than silently
// switching saves mid-story.
export class FallbackGameService {
  constructor(online, makeOffline) {
    this.active = online;
    this.makeOffline = makeOffline;
    this.mode = "online";
  }

  async getState() {
    if (this.mode === "online" && !this.connected) {
      try {
        const state = await this.active.getState();
        this.connected = true;
        return state;
      } catch (error) {
        console.info("NeathBound: backend unavailable, playing offline.", error.message);
        this.active = this.makeOffline();
        this.mode = "offline";
      }
    }
    return this.active.getState();
  }

  choose(storyId, choiceId) {
    return this.active.choose(storyId, choiceId);
  }

  reset() {
    return this.active.reset();
  }
}
