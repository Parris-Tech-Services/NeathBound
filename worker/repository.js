import { initialState, normaliseState } from "../src/game/state.js";

function isoNow() {
  return new Date().toISOString();
}

export async function loadPlayer(db, playerId) {
  const player = await db.prepare(
    "SELECT id, display_name, location_id, echoes FROM players WHERE id = ?"
  ).bind(playerId).first();

  if (!player) return null;

  const [qualityRows, itemRows, flagRows, journalRows] = await Promise.all([
    db.prepare("SELECT quality_id, value FROM player_qualities WHERE player_id = ?").bind(playerId).all(),
    db.prepare("SELECT item_id, quantity FROM player_items WHERE player_id = ? AND quantity > 0").bind(playerId).all(),
    db.prepare("SELECT flag_id, value_json FROM player_flags WHERE player_id = ?").bind(playerId).all(),
    db.prepare("SELECT text FROM journal_entries WHERE player_id = ? ORDER BY id DESC LIMIT 30").bind(playerId).all()
  ]);

  return normaliseState({
    version: 2,
    name: player.display_name,
    locationId: player.location_id,
    echoes: Number(player.echoes),
    qualities: Object.fromEntries(qualityRows.results.map((row) => [row.quality_id, Number(row.value)])),
    items: Object.fromEntries(itemRows.results.map((row) => [row.item_id, Number(row.quantity)])),
    flags: Object.fromEntries(flagRows.results.map((row) => {
      try {
        return [row.flag_id, JSON.parse(row.value_json)];
      } catch {
        return [row.flag_id, true];
      }
    })),
    journal: journalRows.results.map((row) => row.text)
  });
}

export async function createPlayer(db, playerId, state = initialState()) {
  const existing = await loadPlayer(db, playerId);
  if (existing) return existing;

  const next = normaliseState(state);
  const now = isoNow();
  const statements = [
    db.prepare(
      "INSERT OR IGNORE INTO players (id, display_name, location_id, echoes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(playerId, next.name, next.locationId, next.echoes, now, now),
    ...Object.entries(next.qualities).map(([id, value]) =>
      db.prepare("INSERT OR REPLACE INTO player_qualities (player_id, quality_id, value) VALUES (?, ?, ?)")
        .bind(playerId, id, value)
    ),
    ...Object.entries(next.items).map(([id, quantity]) =>
      db.prepare("INSERT OR REPLACE INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)")
        .bind(playerId, id, quantity)
    ),
    ...Object.entries(next.flags).map(([id, value]) =>
      db.prepare("INSERT OR REPLACE INTO player_flags (player_id, flag_id, value_json) VALUES (?, ?, ?)")
        .bind(playerId, id, JSON.stringify(value))
    ),
    ...next.journal.slice().reverse().map((text) =>
      db.prepare("INSERT INTO journal_entries (player_id, created_at, text) VALUES (?, ?, ?)")
        .bind(playerId, now, text)
    )
  ];

  await db.batch(statements);
  return loadPlayer(db, playerId);
}

export async function ensurePlayer(db, playerId) {
  return (await loadPlayer(db, playerId)) ?? createPlayer(db, playerId);
}

export async function savePlayer(db, playerId, state) {
  const next = normaliseState(state);
  const now = isoNow();
  const existingJournal = await db.prepare(
    "SELECT text FROM journal_entries WHERE player_id = ? ORDER BY id DESC LIMIT 1"
  ).bind(playerId).first();

  const statements = [
    db.prepare(
      "UPDATE players SET display_name = ?, location_id = ?, echoes = ?, updated_at = ? WHERE id = ?"
    ).bind(next.name, next.locationId, next.echoes, now, playerId),
    db.prepare("DELETE FROM player_qualities WHERE player_id = ?").bind(playerId),
    db.prepare("DELETE FROM player_items WHERE player_id = ?").bind(playerId),
    db.prepare("DELETE FROM player_flags WHERE player_id = ?").bind(playerId),
    ...Object.entries(next.qualities).map(([id, value]) =>
      db.prepare("INSERT INTO player_qualities (player_id, quality_id, value) VALUES (?, ?, ?)")
        .bind(playerId, id, value)
    ),
    ...Object.entries(next.items).filter(([, quantity]) => quantity > 0).map(([id, quantity]) =>
      db.prepare("INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)")
        .bind(playerId, id, quantity)
    ),
    ...Object.entries(next.flags).map(([id, value]) =>
      db.prepare("INSERT INTO player_flags (player_id, flag_id, value_json) VALUES (?, ?, ?)")
        .bind(playerId, id, JSON.stringify(value))
    )
  ];

  if (next.journal[0] && existingJournal?.text !== next.journal[0]) {
    statements.push(
      db.prepare("INSERT INTO journal_entries (player_id, created_at, text) VALUES (?, ?, ?)")
        .bind(playerId, now, next.journal[0])
    );
  }

  await db.batch(statements);
  return loadPlayer(db, playerId);
}

export async function resetPlayer(db, playerId) {
  await db.batch([
    db.prepare("DELETE FROM players WHERE id = ?").bind(playerId)
  ]);
  return createPlayer(db, playerId, initialState());
}
