import { createGameService } from "./services/index.js";
import { render } from "./ui/render.js";

const app = document.querySelector("#app");
const service = createGameService();

async function draw(state = await service.getState()) {
  render(app, state, {
    async choose(storyId, choiceId) {
      try {
        const outcome = await service.choose(storyId, choiceId);
        if (outcome.error) return;
        await draw(outcome.state ?? outcome);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) { showError(error); }
    },
    async travel(locationId) {
      if (typeof service.travel !== "function") return;
      try { await draw(await service.travel(locationId)); } catch (error) { showError(error); }
    },
    async reset() {
      if (!window.confirm("Begin a new life? Your story will be replaced.")) return;
      try { await draw((await service.reset()).state ?? await service.getState()); } catch (error) { showError(error); }
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
