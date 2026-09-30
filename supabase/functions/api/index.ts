// Supabase Edge Function entry point: auth, CORS and the database adapter.
// All game rules live in handler.js + engine.js (shared with the browser).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handle } from "./handler.js";
import { indexContent } from "./engine.js";

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

// Content changes only when CI syncs the CMS, so cache it briefly per instance.
let contentCache: { at: number; value: unknown } | null = null;
async function loadContent() {
  if (contentCache && Date.now() - contentCache.at < 60_000) return contentCache.value;
  const [world, qualities, areas, storylets, branches] = await Promise.all([
    admin.from("world").select("settings").single(),
    admin.from("qualities").select("id, name, category, description"),
    admin.from("areas").select("id, name, subtitle, atmosphere, sort"),
    admin.from("storylets").select("id, area_id, title, kicker, body, requirements, sort"),
    admin.from("branches").select("id, storylet_id, label, requirements, challenge, success, failure, sort")
  ]);
  for (const r of [world, qualities, areas, storylets, branches]) if (r.error) throw r.error;
  const value = indexContent({
    world: world.data!.settings,
    qualities: qualities.data!,
    areas: areas.data!,
    storylets: storylets.data!.map((s) => ({
      id: s.id, area: s.area_id, title: s.title, kicker: s.kicker, text: s.body, requirements: s.requirements, sort: s.sort,
      branches: branches.data!.filter((b) => b.storylet_id === s.id)
    }))
  });
  contentCache = { at: Date.now(), value };
  return value;
}

async function loadCharacter(userId: string) {
  const { data: character, error } = await admin.from("characters").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!character) return null;
  const { data: rows, error: qError } = await admin.from("character_qualities").select("quality_id, level").eq("user_id", userId);
  if (qError) throw qError;
  return {
    version: 2,
    name: character.name,
    areaId: character.area_id,
    currentStoryletId: character.current_storylet_id,
    journal: character.journal,
    qualities: Object.fromEntries(rows!.map((r) => [r.quality_id, r.level]))
  };
}

async function saveCharacter(userId: string, state: unknown) {
  const { error } = await admin.rpc("save_character", { p_user_id: userId, p_state: state });
  if (error) throw error;
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("Origin")), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) {
    return new Response(JSON.stringify({ error: "Sign in to play online." }), { status: 401, headers });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : undefined;
    const result = await handle(
      { method: req.method, path: new URL(req.url).pathname, body },
      { db: { loadContent, loadCharacter, saveCharacter }, userId: auth.user.id }
    );
    return new Response(JSON.stringify(result.body), { status: result.status, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "The city is not answering. Try again shortly." }), { status: 500, headers });
  }
});
