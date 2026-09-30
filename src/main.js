import { createGameService } from "./services/index.js?v=20260930-14";
import { render } from "./ui/render.js?v=20260930-14";
import { loadPreferences, savePreferences } from "./ui/preferences.js?v=20260930-14";

const app = document.querySelector("#app");
const service = createGameService();

let currentState = null;
let lastOutcome = null;
let pending = false;

async function draw(state) {
  const resolvedState = state ?? await service.getState();
  currentState = resolvedState;

  render(app, resolvedState, {
    async choose(storyId, choiceId) {
      if (pending) return;
      pending = true;
      setPending(true);
      const before = currentState;

      try {
        const outcome = await service.choose(storyId, choiceId, {
          expectedRevision: Number(before?.revision ?? 0)
        });

        if (outcome.error) {
          lastOutcome = null;
          const fresh = outcome.state ?? await service.getState();
          await draw(fresh);
          showNotice(`${outcome.error} The page has been refreshed to your current position.`);
          return;
        }

        lastOutcome = outcome;
        await draw(outcome.state ?? outcome);
        window.scrollTo({ top: 0, behavior: "smooth" });
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

    onwards() {
      lastOutcome = null;
      draw(currentState).catch(showError);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
}

function setPending(isPending) {
  app.setAttribute("aria-busy", String(isPending));
  app.querySelectorAll("[data-choice], [data-action=travel], [data-action=reset]").forEach((button) => {
    if (!button.dataset.originallyDisabled) button.dataset.originallyDisabled = String(button.disabled);
    button.disabled = isPending || button.dataset.originallyDisabled === "true";
  });
}

function showNotice(message) {
  app.querySelector(".runtime-notice")?.remove();
  const notice = document.createElement("p");
  notice.className = "runtime-notice";
  notice.setAttribute("role", "status");
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

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !pending && !lastOutcome) {
    draw().catch(showError);
  }
});

draw().catch(showError);
