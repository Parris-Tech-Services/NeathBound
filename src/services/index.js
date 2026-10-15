import { config } from "../config.js?v=20261016-gloomwing2";
import { LocalGameService } from "./local-game-service.js?v=20261016-gloomwing2";
import { SupabaseGameService } from "./supabase-game-service.js?v=20261016-gloomwing2";
import { CloudflareGameService } from "./cloudflare-game-service.js?v=20261016-gloomwing2";

// Verified Cloudflare Workers + D1 is online by default; ?api=local always stays offline.
export function createGameService({ settings = config, search = globalThis.location?.search ?? "", storage = globalThis.localStorage } = {}) {
  const provider = new URLSearchParams(search).get("api");
  if (provider === "local") return new LocalGameService(storage);
  if (provider === "supabase") return new FallbackGameService(new SupabaseGameService(settings, storage), () => new LocalGameService(storage));
  return new FallbackGameService(new CloudflareGameService(settings, storage), () => new LocalGameService(storage));
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

  choose(storyId, choiceId, options) {
    return this.active.choose(storyId, choiceId, options);
  }

  travel(locationId, options) {
    return this.active.travel(locationId, options);
  }

  drawCard(deckId, options) {
    return this.active.drawCard(deckId, options);
  }

  equipItem(slot, itemId, options) {
    return this.active.equipItem(slot, itemId, options);
  }

  setRefuge(refugeId, options) {
    return this.active.setRefuge(refugeId, options);
  }

  discard(cardId, options) {
    return this.active.discard(cardId, options);
  }

  reset() {
    return this.active.reset();
  }
}
