import { buyItem, equipItem, resolveChoice, resetState, sellItem } from "../game/engine.js?v=20260930-9";
import { loadState, saveState } from "../game/state.js?v=20260930-9";

export class LocalGameService {
  mode = "local";

  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = loadState(storage);
  }

  async getState() {
    return this.state;
  }

  async choose(storyId, choiceId) {
    return this.#commit(resolveChoice(this.state, storyId, choiceId));
  }

  async travel(locationId) {
    if (!this.state.unlockedLocations.includes(locationId)) {
      return { error: "That location is not unlocked.", state: this.state, rejected: true };
    }
    this.state = {
      ...this.state,
      revision: Number(this.state.revision ?? 0) + 1,
      flags: { ...this.state.flags, "__revision": Number(this.state.revision ?? 0) + 1 },
      locationId,
      journal: [`Travelled to ${locationId.replaceAll("-", " ")}.`, ...this.state.journal].slice(0, 100)
    };
    saveState(this.state, this.storage);
    return { state: this.state };
  }

  async buy(itemId) {
    return this.#commit(buyItem(this.state, itemId));
  }

  async sell(itemId) {
    return this.#commit(sellItem(this.state, itemId));
  }

  async equip(itemId) {
    return this.#commit(equipItem(this.state, itemId));
  }

  async reset() {
    this.state = resetState();
    saveState(this.state, this.storage);
    return this.state;
  }

  #commit(result) {
    if (result.state) this.state = result.state;
    saveState(this.state, this.storage);
    return result;
  }
}
