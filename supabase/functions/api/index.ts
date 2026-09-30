// Supabase Edge Function entry point: auth, CORS and the Postgres repository.
// Game rules live in handler.js and ./game/ (a copy of src/game, kept in sync
// by `npm run sync:engine`; tests fail if the copies drift).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handle } from "./handler.js";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false }
});

const ALLOWED_ORIGINS = new Set([
  "https://parris-tech-services.github.io",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://parris-tech-services.github.io",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin"
  };
}

const repo = {
  async loadPlayer(userId: string) {
    const { data, error } = await admin.rpc("load_player", { p_user_id: userId });
    if (error) throw error;
    return data;
  },
  async savePlayer(userId: string, state: unknown) {
    const { error } = await admin.rpc("save_player", { p_user_id: userId, p_state: state });
    if (error) throw error;
  },
  async savePlayerIfRevision(userId: string, state: unknown, expectedRevision: number) {
    const { data, error } = await admin.rpc("save_player_if_revision", {
      p_user_id: userId,
      p_state: state,
      p_expected_revision: expectedRevision
    });
    if (error) throw error;
    return Boolean(data);
  },
  async loadWorldQualities() {
    const { data, error } = await admin.from("world_qualities").select("id, value");
    if (error) throw error;
    return Object.fromEntries(data!.map((row) => [row.id, Number(row.value)]));
  }
};

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("Origin")), "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) {
    return new Response(JSON.stringify({ error: "Sign in to play online." }), { status: 401, headers });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const result = await handle(
      { method: req.method, path: new URL(req.url).pathname, userId: auth.user.id, body },
      { repo }
    );
    return new Response(JSON.stringify(result.body), { status: result.status, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "The city is temporarily unreachable." }), { status: 500, headers });
  }
});
