import { resolveChoice, resetState, travelBlockedReason, drawCard, discard, setRefuge } from "../game/engine.js?v=20260930-21";
import { loadState, saveState } from "../game/state.js?v=20260930-21";

export class LocalGameService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = loadState(storage);
  }

  async getState() {
    return this.state;
  }

  async choose(storyId, choiceId, { expectedRevision, useLesson } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = resolveChoice(this.state, storyId, choiceId);
    if (outcome.error) return outcome;
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async travel(locationId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const blocked = travelBlockedReason(this.state);
    if (blocked) return { error: blocked, state: this.state };
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

    async drawCard(deckId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = drawCard(this.state, deckId);
    if (outcome.error) return outcome;
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async setRefuge(refugeId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = setRefuge(this.state, refugeId);
    this.state = outcome.state;
    saveState(this.state, this.storage);
    return outcome;
  }

  async discard(cardId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = discard(this.state, cardId);
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
