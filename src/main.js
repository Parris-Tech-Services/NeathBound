import { createGameService } from "./services/index.js?v=20261016-gloomwing2";
import { render } from "./ui/render.js?v=20261016-gloomwing2";
import { loadPreferences, savePreferences } from "./ui/preferences.js?v=20261016-gloomwing2";

const app = document.querySelector("#app");
const bootScreen = document.querySelector("#boot-screen");
const bootStatus = bootScreen?.querySelector(".boot-status");
const service = createGameService();

if (bootStatus) {
  bootStatus.textContent = service.mode === "online"
    ? "Remembering your place beneath the city…"
    : "Opening the city from this device…";
}

let bootFinished = false;

let currentState = null;
let lastOutcome = null;
let pending = false;
let started = false;

async function draw(state) {
  const resolvedState = state ?? await service.getState();
  currentState = resolvedState;

  render(app, resolvedState, {
    async choose(storyId, choiceId, { useLesson } = {}) {
      if (pending) return;
      pending = true;
      setPending(true);
      // Mobile players often activate a branch far below the top of the page.
      // Give immediate, in-place feedback before any network request starts.
      app.querySelectorAll("[data-choice]").forEach((button) => {
        if (button.dataset.story === storyId && button.dataset.choice === choiceId) {
          button.textContent = "RESOLVING…";
          button.setAttribute("aria-busy", "true");
        }
      });
      const before = currentState;

      try {
        const outcome = await service.choose(storyId, choiceId, {
          expectedRevision: Number(before?.revision ?? 0),
          useLesson
        });

        if (outcome.error) {
          lastOutcome = null;
          const fresh = outcome.state ?? await service.getState();
          await draw(fresh);
          showNotice(`${outcome.error} The page has been refreshed to your current position.`, { action: true });
          return;
        }

        lastOutcome = outcome;
        await draw(outcome.state ?? outcome);
        // The result is now a viewport-level dialog; never require scrolling
        // back past the entire mobile story stack to discover what happened.
        app.querySelector(".outcome-panel[role=dialog]")?.focus({ preventScroll: true });
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async travel(locationId) {
      if (pending) return;
      pending = true;
      setPending(true);

      try {
        const nextState = await service.travel(locationId, {
          expectedRevision: Number(currentState?.revision ?? 0)
        });

        if (nextState.error) {
          lastOutcome = null;
          await draw(nextState.state ?? await service.getState());
          showNotice(`${nextState.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = null;
        await draw(nextState.state ?? nextState);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async drawCard(deckId) {
      if (pending) return;
      pending = true;
      setPending(true);
      try {
        const nextState = await service.drawCard(deckId, {
          expectedRevision: Number(currentState?.revision ?? 0)
        });

        if (nextState.error) {
          lastOutcome = null;
          await draw(nextState.state ?? await service.getState());
          showNotice(`${nextState.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = null; // Maybe we don't treat drawing as an outcome screen?
        await draw(nextState.state ?? nextState);
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async equipItem(slot, itemId) {
      if (pending) return;
      pending = true;
      setPending(true);
      try {
        const nextState = await service.equipItem(slot, itemId, {
          expectedRevision: Number(currentState?.revision ?? 0)
        });

        if (nextState.error) {
          lastOutcome = null;
          await draw(nextState.state ?? await service.getState());
          showNotice(`${nextState.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = null;
        await draw(nextState.state ?? nextState);
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async setRefuge(refugeId) {
      if (pending) return;
      pending = true;
      setPending(true);
      try {
        const nextState = await service.setRefuge(refugeId, {
          expectedRevision: Number(currentState?.revision ?? 0)
        });

        if (nextState.error) {
          lastOutcome = null;
          await draw(nextState.state ?? await service.getState());
          showNotice(`${nextState.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = null;
        await draw(nextState.state ?? nextState);
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async discardCard(cardId) {
      if (pending) return;
      pending = true;
      setPending(true);
      try {
        const nextState = await service.discard(cardId, {
          expectedRevision: Number(currentState?.revision ?? 0)
        });

        if (nextState.error) {
          lastOutcome = null;
          await draw(nextState.state ?? await service.getState());
          showNotice(`${nextState.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = null;
        await draw(nextState.state ?? nextState);
      } catch (error) {
        await draw(currentState).catch(() => {});
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    },

    async onwards() {
      lastOutcome = null;
      try {
        await draw(currentState);
        const heading = app.querySelector(".main-storylet h3") ?? app.querySelector("#stories h2");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
          heading.scrollIntoView({ block: "center", behavior: "instant" });
        }
      } catch (error) { showError(error); }
    },

    bookmark(storyId) {
      const preferences = loadPreferences();
      preferences.bookmarks = preferences.bookmarks.includes(storyId)
        ? preferences.bookmarks.filter((id) => id !== storyId)
        : [...preferences.bookmarks, storyId];
      savePreferences(preferences);
      draw(currentState);
    },

    outfit(outfitId) {
      savePreferences({ ...loadPreferences(), outfit: outfitId });
      draw(currentState);
    },

    editNote(noteKey) {
      const preferences = loadPreferences();
      const current = preferences.notes[noteKey] ?? "";
      const next = window.prompt("Edit this note", current);
      if (next === null) return;
      preferences.notes[noteKey] = next.trim();
      savePreferences(preferences);
      draw(currentState);
    },

    async reset() {
      if (pending || !window.confirm("Begin a new life? Your story will be replaced.")) return;
      pending = true;
      setPending(true);
      try {
        const nextState = await service.reset();
        lastOutcome = null;
        await draw(nextState.state ?? nextState);
      } catch (error) {
        showError(error);
      } finally {
        pending = false;
        setPending(false);
      }
    }
  }, lastOutcome);

  finishBoot();
  if (service.mode === "offline") {
    showNotice("Playing offline: progress is saved on this device only. Online saving is currently unavailable. Your existing local progress is preserved.");
  }
}

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;
  app.setAttribute("aria-busy", "false");

  if (!bootScreen) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bootScreen.classList.add("is-ready");
    window.setTimeout(() => bootScreen.remove(), 360);
  }));
}

function setPending(isPending) {
  app.setAttribute("aria-busy", String(isPending));
  app.querySelectorAll("[data-choice], [data-action=travel], [data-action=reset], [data-action=draw-card], [data-action=discard], [data-action=set-refuge], [data-action=equip-item], [data-action=unequip-item]").forEach((button) => {
    if (!button.dataset.originallyDisabled) button.dataset.originallyDisabled = String(button.disabled);
    button.disabled = isPending || button.dataset.originallyDisabled === "true";
  });
}

function showNotice(message, { action = false } = {}) {
  app.querySelector(".runtime-notice")?.remove();
  const notice = document.createElement("p");
  notice.className = action ? "runtime-notice action-notice" : "runtime-notice";
  notice.setAttribute("role", action ? "alert" : "status");
  notice.textContent = message;
  app.prepend(notice);
}

function showError(error) {
  console.error(error);
  app.querySelector(".runtime-error")?.remove();
  const message = document.createElement("p");
  message.className = "runtime-error";
  message.setAttribute("role", "alert");
  message.textContent = `The city is temporarily unreachable: ${error.message}`;
  app.prepend(message);
}

async function startGame() {
  if (started) return;
  started = true;
  try {
    await draw();
  } catch (error) {
    showError(error);
    finishBoot();
  }
}

window.addEventListener("neathbound:enter", () => {
  startGame();
});

if (window.__neathboundEntered || new URLSearchParams(window.location.search).get("autoplay") === "1") {
  startGame();
}

document.addEventListener("visibilitychange", () => {
  if (started && document.visibilityState === "visible" && !pending && !lastOutcome) {
    draw().catch(showError);
  }
});

// Refresh pending Living Stories while the tab is open.
setInterval(()=>{if(started&&!pending&&!lastOutcome)draw().catch(showError);},60000);
