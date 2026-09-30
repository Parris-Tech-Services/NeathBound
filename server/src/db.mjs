import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function openDatabase(filename = process.env.NEATHBOUND_DB ?? path.resolve("data/neathbound.sqlite")) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, state_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id TEXT NOT NULL, event_type TEXT NOT NULL, payload_json TEXT NOT NULL, created_at TEXT NOT NULL);`);
  return db;
}

export function getPlayer(db, id) {
  const row = db.prepare("SELECT state_json FROM players WHERE id = ?").get(id);
  return row ? JSON.parse(row.state_json) : null;
}

export function putPlayer(db, player, eventType, payload = {}) {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO players (id, state_json, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at").run(player.id, JSON.stringify(player), now, now);
  db.prepare("INSERT INTO events (player_id, event_type, payload_json, created_at) VALUES (?, ?, ?, ?)").run(player.id, eventType, JSON.stringify(payload), now);
  return player;
}
