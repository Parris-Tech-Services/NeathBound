import { resolveChoice, resetState } from "./game/engine.js";
import { loadState, saveState } from "./game/state.js";
import { render } from "./ui/render.js";

let state = loadState();
const app = document.querySelector("#app");

function draw() {
  saveState(state);
  render(app, state, {
    choose(storyId, choiceId) {
      const outcome = resolveChoice(state, storyId, choiceId);
      if (outcome.error) return;
      state = outcome.state;
      draw();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    reset() {
      if (window.confirm("Begin a new life? Your local story will be replaced.")) {
        state = resetState();
        draw();
      }
    }
  });
}

draw();
