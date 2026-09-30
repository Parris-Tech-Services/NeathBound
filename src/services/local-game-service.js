import { resolveChoice, resetState } from "../game/engine.js?v=20260930-13";
import { loadState, saveState } from "../game/state.js?v=20260930-13";

export class LocalGameService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = loadState(storage);
  }

  async getState() {
    return this.state;
  }

  async choose(storyId, choiceId) {
    const outcome = resolveChoice(this.state, storyId, choiceId);
    if (outcome.error) return outcome;
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async travel(locationId) {
    if (!this.state.unlockedLocations.includes(locationId)) return this.state;
    this.state = {
      ...this.state,
      locationId,
      journal: [`Travelled to ${locationId.replaceAll("-", " ")}.`, ...this.state.journal].slice(0, 30)
    };
    saveState(this.state, this.storage);
    return this.state;
  }

  async reset() {
    this.state = resetState();
    saveState(this.state, this.storage);
    return this.state;
  }
}
