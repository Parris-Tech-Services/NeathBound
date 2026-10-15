import { resolveChoice, resetState, travelBlockedReason, drawCard, discard, setRefuge, equipItem, tickLivingStories, chooseAmbition, chooseDestiny, refreshActions } from "../game/engine.js?v=20261016-gloomwing2";
import { loadState, saveState } from "../game/state.js?v=20261016-gloomwing2";
import { locations } from "../game/content.js?v=20261016-gloomwing2";

export class LocalGameService {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.state = loadState(storage);
  }

  async getState() {
    const regenerated=refreshActions(this.state);
    const result=tickLivingStories(regenerated);
    if(result.fired || regenerated.actions!==this.state.actions){
      this.state=result.state;saveState(this.state,this.storage);
    }
    return this.state;
  }
  async chooseAmbition(id){
    const result=chooseAmbition(this.state,id);
    if(!result.error){this.state=result.state;saveState(this.state,this.storage);}
    return result;
  }
  async chooseDestiny(id){
    const result=chooseDestiny(this.state,id);
    if(!result.error){this.state=result.state;saveState(this.state,this.storage);}
    return result;
  }

  async choose(storyId, choiceId, { expectedRevision, useLesson } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = resolveChoice(this.state, storyId, choiceId, Math.random, {}, { useLesson });
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
    if (!locations[locationId] || !this.state.unlockedLocations.includes(locationId)) return { error: "This destination has not been discovered.", state: this.state };
    const revision = Number(this.state.revision ?? 0) + 1;
    this.state = {
      ...this.state,
      revision,
      flags: { ...this.state.flags, __revision: revision },
      locationId,
      journal: [`Travelled to ${locations[locationId].name}.`, ...this.state.journal].slice(0, 100)
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

  async equipItem(slot, itemId, { expectedRevision } = {}) {
    if (Number.isInteger(expectedRevision) && expectedRevision !== Number(this.state.revision ?? 0)) {
      return { error: "This save changed in another tab.", state: this.state };
    }
    const outcome = equipItem(this.state, slot, itemId);
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
