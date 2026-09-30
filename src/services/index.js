import { config } from "../config.js?v=20260930-12";
import { LocalGameService } from "./local-game-service.js?v=20260930-12";
import { SupabaseGameService } from "./supabase-game-service.js?v=20260930-12";

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

  choose(storyId, choiceId, revision) { return this.active.choose(storyId, choiceId, revision); }
  travel(locationId, revision) { return this.active.travel(locationId, revision); }
  buy(itemId, revision) { return this.active.buy(itemId, revision); }
  sell(itemId, revision) { return this.active.sell(itemId, revision); }
  equip(itemId, revision) { return this.active.equip(itemId, revision); }
  recover(menaceId, revision) { return this.active.recover(menaceId, revision); }
  drawOpportunity(revision) { return this.active.drawOpportunity(revision); }
  discardOpportunity(storyId, revision) { return this.active.discardOpportunity(storyId, revision); }
  reset() { return this.active.reset(); }
}
