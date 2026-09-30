import { resolveChoice, resolveGameAction, resetState } from "../game/engine.js?v=20260930-15";
import { loadState, saveState } from "../game/state.js?v=20260930-15";

export class LocalGameService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = loadState(storage);
  }

  async getState() {
    return this.state;
  }

  async choose(storyId, choiceId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = resolveChoice(this.state, storyId, choiceId);
    if (outcome.error) return outcome;
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async act(action, payload = {}, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = resolveGameAction(this.state, action, payload);
    if (outcome.error) return outcome;
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async travel(locationId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    if (!this.state.unlockedLocations.includes(locationId)) return this.state;
    const revision = Number(this.state.revision ?? 0) + 1;
    this.state = {
      ...this.state,
      revision,
      flags: { ...this.state.flags, __revision: revision },
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
