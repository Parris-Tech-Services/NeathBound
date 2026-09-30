import { createServer } from "node:http";
import { createApi } from "./src/api.mjs";
import { openDatabase } from "./src/db.mjs";

export function createNeathboundServer({ dbFile } = {}) {
  const api = createApi(openDatabase(dbFile));
  return createServer(async (request, response) => {
    if (request.method === "OPTIONS") { response.writeHead(204, cors()); return response.end(); }
    let raw = "";
    for await (const chunk of request) raw += chunk;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { response.writeHead(400, { ...cors(), "content-type": "application/json" }); return response.end(JSON.stringify({ error: "invalid_json" })); }
    try { const result = await api(request.method, request.url, body); response.writeHead(result.status, { ...cors(), "content-type": "application/json" }); response.end(JSON.stringify(result.body)); } catch (error) { response.writeHead(500, { ...cors(), "content-type": "application/json" }); response.end(JSON.stringify({ error: "internal_error", detail: error.message })); }
  });
}

function cors() { return { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" }; }

if (import.meta.url === `file://${process.argv[1]}`) createNeathboundServer().listen(process.env.PORT ?? 8787, () => console.log(`Neathbound API listening on http://localhost:${process.env.PORT ?? 8787}`));
