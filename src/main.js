import { createGameService } from "./services/index.js?v=20260930-9";
import { render } from "./ui/render.js?v=20260930-9";
import { loadPreferences, savePreferences } from "./ui/preferences.js?v=20260930-9";

const app = document.querySelector("#app");
const service = createGameService();

let currentState = null;
let pending = false;
let outcome = null;
let notice = null;

function currentView() {
  const value = (globalThis.location?.hash ?? "#story").replace(/^#/, "");
  return ["story", "messages", "myself", "possessions", "bazaar", "plans"].includes(value) ? value : "story";
}

async function draw(state = currentState) {
  currentState = state ?? await service.getState();
  render(app, currentState, {
    async choose(storyId, choiceId) {
      if (pending) return;
      pending = true;
      notice = null;
      outcome = null;
      await draw(currentState);
      try {
        const response = await service.choose(storyId, choiceId, currentState.revision ?? 0);
        currentState = response.state ?? currentState;
        if (response.error) {
          notice = response.error;
          outcome = {
            title: "That choice could not be played",
            result: response.error,
            success: false,
            rejected: true,
            changes: []
          };
        } else {
          outcome = response;
        }
      } catch (error) {
        notice = error.message;
      } finally {
        pending = false;
        await draw(currentState);
        queueMicrotask(() => app.querySelector("#action-result")?.focus());
      }
    },
    async travel(locationId) {
      if (pending) return;
      pending = true;
      notice = null;
      await draw(currentState);
      try {
        const response = await service.travel(locationId, currentState.revision ?? 0);
        currentState = response.state ?? response;
        if (response.error) notice = response.error;
      } catch (error) {
        notice = error.message;
      } finally {
        pending = false;
        await draw(currentState);
      }
    },
    continue() {
      outcome = null;
      notice = null;
      draw(currentState);
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
    navigate(view) {
      globalThis.location.hash = view;
    },
    async transact(kind, itemId) {
      if (pending) return;
      pending = true;
      outcome = null;
      notice = null;
      await draw(currentState);
      try {
        const response = await service[kind](itemId, currentState.revision ?? 0);
        currentState = response.state ?? currentState;
        if (response.error) {
          outcome = { title: "Transaction refused", result: response.error, rejected: true, success: false, changes: [] };
        } else {
          outcome = response;
        }
      } catch (error) {
        notice = error.message;
      } finally {
        pending = false;
        await draw(currentState);
        queueMicrotask(() => app.querySelector("#action-result")?.focus());
      }
    },
    async reset() {
      if (pending || !window.confirm("Begin a new life? Your story will be replaced.")) return;
      pending = true;
      await draw(currentState);
      try {
        currentState = await service.reset();
        outcome = null;
        notice = "A new life has begun.";
      } catch (error) {
        notice = error.message;
      } finally {
        pending = false;
        await draw(currentState);
      }
    }
  }, {
    view: currentView(),
    pending,
    outcome,
    notice,
    mode: service.mode ?? "local"
  });
}

function showError(error) {
  console.error(error);
  notice = error.message;
  if (currentState) draw(currentState);
  else {
    const message = document.createElement("p");
    message.className = "runtime-error";
    message.setAttribute("role", "alert");
    message.textContent = `The city is temporarily unreachable: ${error.message}`;
    app.prepend(message);
  }
}

globalThis.addEventListener?.("hashchange", () => draw(currentState));
draw().catch(showError);
