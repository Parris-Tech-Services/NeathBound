import { createGameService } from "./services/index.js?v=20260930-12";
import { render } from "./ui/render.js?v=20260930-12";
import { loadPreferences, savePreferences } from "./ui/preferences.js?v=20260930-12";

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
    choose: (storyId, choiceId) => runAction(() => service.choose(storyId, choiceId, currentState.revision ?? 0)),
    travel: (locationId) => runAction(() => service.travel(locationId, currentState.revision ?? 0), { focusResult: false }),
    transact: (kind, itemId) => runAction(() => service[kind](itemId, currentState.revision ?? 0)),
    recover: (menaceId) => runAction(() => service.recover(menaceId, currentState.revision ?? 0)),
    drawOpportunity: () => runAction(() => service.drawOpportunity(currentState.revision ?? 0)),
    discardOpportunity: (storyId) => runAction(() => service.discardOpportunity(storyId, currentState.revision ?? 0)),
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

async function runAction(action, { focusResult = true } = {}) {
  if (pending) return;
  pending = true;
  notice = null;
  outcome = null;
  await draw(currentState);

  try {
    const response = await action();
    currentState = response?.state ?? currentState;
    if (response?.error) {
      outcome = {
        title: "That action could not be completed",
        result: response.error,
        success: false,
        rejected: true,
        changes: []
      };
    } else if (response?.result || response?.title) {
      outcome = response;
    }
  } catch (error) {
    notice = error.message;
  } finally {
    pending = false;
    await draw(currentState);
    if (focusResult) queueMicrotask(() => app.querySelector("#action-result")?.focus());
  }
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
globalThis.addEventListener?.("focus", async () => {
  if (service.mode !== "online" || pending) return;
  try {
    currentState = await service.getState();
    await draw(currentState);
  } catch {}
});
draw().catch(showError);
