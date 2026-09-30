CREATE TABLE IF NOT EXISTS decks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1 CHECK (weight >= 0)
);

CREATE TABLE IF NOT EXISTS player_cards (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  deck_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('hand', 'discard')),
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, deck_id, card_id, zone)
);

CREATE INDEX IF NOT EXISTS idx_cards_deck ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_player_cards_player_deck ON player_cards(player_id, deck_id, zone);
