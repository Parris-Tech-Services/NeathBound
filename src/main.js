import { createGameService } from "./services/index.js";
import { render } from "./ui/render.js?v=20260930-4";

const app = document.querySelector("#app");
const service = createGameService();

async function draw(state) {
  const resolvedState = state ?? await service.getState();

  render(app, resolvedState, {
    async choose(storyId, choiceId) {
      try {
        const outcome = await service.choose(storyId, choiceId);
        if (outcome.error) return;
        await draw(outcome.state ?? outcome);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        showError(error);
      }
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

draw().catch(showError);
