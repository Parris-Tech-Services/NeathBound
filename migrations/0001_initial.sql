PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  location_id TEXT NOT NULL,
  echoes INTEGER NOT NULL DEFAULT 0 CHECK (echoes >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qualities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS player_qualities (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  quality_id TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  PRIMARY KEY (player_id, quality_id)
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS player_items (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (player_id, item_id)
);

CREATE TABLE IF NOT EXISTS player_flags (
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  flag_id TEXT NOT NULL,
  value_json TEXT NOT NULL,
  PRIMARY KEY (player_id, flag_id)
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  text TEXT NOT NULL
);

-- Narrative tables are included now so a future writer-facing CMS can migrate
-- content out of source-controlled modules without changing the domain model.
CREATE TABLE IF NOT EXISTS storylets (
  id TEXT PRIMARY KEY,
  location_id TEXT,
  title TEXT NOT NULL,
  kicker TEXT,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  storylet_id TEXT NOT NULL REFERENCES storylets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  success_text TEXT,
  failure_text TEXT
);

CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  target_id TEXT,
  operator TEXT NOT NULL,
  compare_value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS effects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure')),
  effect_type TEXT NOT NULL,
  target_id TEXT,
  amount REAL,
  value_json TEXT
);

CREATE TABLE IF NOT EXISTS world_qualities (
  id TEXT PRIMARY KEY,
  value REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_player_qualities_player ON player_qualities(player_id);
CREATE INDEX IF NOT EXISTS idx_player_items_player ON player_items(player_id);
CREATE INDEX IF NOT EXISTS idx_player_flags_player ON player_flags(player_id);
CREATE INDEX IF NOT EXISTS idx_journal_player_created ON journal_entries(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_storylets_location ON storylets(location_id);
CREATE INDEX IF NOT EXISTS idx_requirements_owner ON requirements(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_effects_branch_outcome ON effects(branch_id, outcome);
