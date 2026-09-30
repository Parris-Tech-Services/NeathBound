import { LocalGameService } from "./local-game-service.js?v=20260930-5";
import { RemoteGameService } from "./remote-game-service.js?v=20260930-5";

export function createGameService() {
  const params = new URLSearchParams(globalThis.location?.search ?? "");
  const remote = params.get("api") === "remote" || globalThis.NEATHBOUND_API_MODE === "remote";
  const baseUrl = globalThis.NEATHBOUND_API_BASE ?? "";
  return remote ? new RemoteGameService(baseUrl) : new LocalGameService();
}
