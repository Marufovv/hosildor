CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  risk TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS recommendations_owner_status_idx
  ON recommendations(owner_id, status);
