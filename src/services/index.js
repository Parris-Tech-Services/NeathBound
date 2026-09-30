import { config } from "../config.js?v=20260930-9";
import { LocalGameService } from "./local-game-service.js?v=20260930-9";
import { SupabaseGameService } from "./supabase-game-service.js?v=20260930-9";

export function createGameService({ settings = config, search = globalThis.location?.search ?? "", storage = globalThis.localStorage } = {}) {
  const forceLocal = new URLSearchParams(search).get("api") === "local" || !settings.supabaseUrl;
  if (forceLocal) return new LocalGameService(storage);
  return new FallbackGameService(new SupabaseGameService(settings, storage), () => new LocalGameService(storage));
}

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

  choose(storyId, choiceId, expectedRevision) {
    return this.active.choose(storyId, choiceId, expectedRevision);
  }

  travel(locationId, expectedRevision) {
    return this.active.travel(locationId, expectedRevision);
  }

  buy(itemId, expectedRevision) {
    return this.active.buy(itemId, expectedRevision);
  }

  sell(itemId, expectedRevision) {
    return this.active.sell(itemId, expectedRevision);
  }

  equip(itemId, expectedRevision) {
    return this.active.equip(itemId, expectedRevision);
  }

  recover(menaceId, expectedRevision) {
    return this.active.recover(menaceId, expectedRevision);
  }

  reset() {
    return this.active.reset();
  }
}
