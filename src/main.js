import { createGameService } from "./services/index.js?v=20260930-11";
import { render } from "./ui/render.js?v=20260930-11";
import { loadPreferences, savePreferences } from "./ui/preferences.js?v=20260930-11";
import { showNotice, showOutcome } from "./ui/outcome.js?v=20260930-11";

const app = document.querySelector("#app");
const service = createGameService();
let currentState = null;

async function draw(state) {
  const resolvedState = state ?? await service.getState();
  currentState = resolvedState;

  render(app, resolvedState, {
    async choose(storyId, choiceId) {
      try {
        const before = currentState;
        const outcome = await service.choose(storyId, choiceId);
        if (outcome.error) {
          // The server is authoritative: redraw from the state it sent back
          // (e.g. this page was out of date after playing in another tab).
          await draw(outcome.state);
          showNotice(app, `${outcome.error} The page has been refreshed to where you are now.`);
          return;
        }
        const after = outcome.state ?? outcome;
        await draw(after);
        showOutcome(app, { storyId, outcome, before, after }, async () => {
          await draw(after);
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        showError(error);
      }
    },
    async travel(locationId) {
      try {
        const nextState = await service.travel(locationId);
        await draw(nextState.state ?? nextState);
        if (nextState.error) showNotice(app, `${nextState.error} The page has been refreshed to where you are now.`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        showError(error);
      }
    },
    bookmark(storyId) {
      const preferences = loadPreferences();
      preferences.bookmarks = preferences.bookmarks.includes(storyId)
        ? preferences.bookmarks.filter((id) => id !== storyId)
        : [...preferences.bookmarks, storyId];
      savePreferences(preferences);
      draw();
    },
    outfit(outfitId) {
      savePreferences({ ...loadPreferences(), outfit: outfitId });
      draw();
    },
    editNote(noteKey) {
      const preferences = loadPreferences();
      const current = preferences.notes[noteKey] ?? "";
      const next = window.prompt("Edit this note", current);
      if (next === null) return;
      preferences.notes[noteKey] = next.trim();
      savePreferences(preferences);
      draw();
    },
    async reset() {
      if (!window.confirm("Begin a new life? Your story will be replaced.")) return;
      try {
        const nextState = await service.reset();
        await draw(nextState.state ?? nextState);
      } catch (error) {
        showError(error);
      }
    }
  });
}

function showError(error) {
  console.error(error);
  const message = document.createElement("p");
  message.className = "runtime-error";
  message.setAttribute("role", "alert");
  message.textContent = `The city is temporarily unreachable: ${error.message}`;
  app.prepend(message);
}

// Coming back to this tab: pick up anything played elsewhere, unless a result
// screen is open.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !app.querySelector(".outcome-panel")) draw().catch(showError);
});

draw().catch(showError);
