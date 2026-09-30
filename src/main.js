import { connect } from "./api/client.js";
import { config } from "./config.js";
import { browserJsonReader, loadContent } from "./game/content.js";
import { render } from "./ui/render.js";

const app = document.querySelector("#app");
const content = await loadContent(browserJsonReader());
const game = await connect(content, config);
let busy = false;

function draw(view) {
  render(app, view, content, game.mode, {
    // One click plays a whole storylet: begin it, then choose the branch,
    // mirroring the server's begin -> choosebranch flow.
    async choose(storyletId, branchId) {
      await act(async () => {
        const begun = await game.begin(storyletId);
        return begun.error ? begun : game.choose(branchId);
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    back: () => act(() => game.goBack()),
    reset() {
      if (window.confirm("Begin a new life? Your story so far will be replaced.")) act(() => game.reset());
    }
  });
}

async function act(step) {
  if (busy) return;
  busy = true;
  try {
    draw(await step());
  } catch (error) {
    draw({ ...(await game.load().catch(() => ({}))), error: `Something went wrong: ${error.message}` });
  } finally {
    busy = false;
  }
}

draw(await game.load());
