CREATE TABLE trip_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER REFERENCES conversations(id),
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  tags TEXT NOT NULL,
  days TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
