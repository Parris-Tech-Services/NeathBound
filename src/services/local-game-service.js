import { resolveChoice, resetState } from "../game/engine.js";
import { loadState, saveState } from "../game/state.js";

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

  async reset() {
    this.state = resetState();
    saveState(this.state, this.storage);
    return this.state;
  }
}
