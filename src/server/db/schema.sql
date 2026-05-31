CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  summary       TEXT NOT NULL,
  description   TEXT,
  tech_stack    TEXT NOT NULL DEFAULT '[]',
  challenges    TEXT,
  solutions     TEXT,
  features      TEXT DEFAULT '[]',
  live_url      TEXT,
  repo_url      TEXT,
  thumbnail_url          TEXT,
  original_thumbnail_url TEXT,
  thumbnail_frame        TEXT,
  screenshots            TEXT DEFAULT '[]',
  status        TEXT DEFAULT 'live' CHECK (status IN ('live','in-progress','archived')),
  featured      INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fm_challenges (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  difficulty     TEXT NOT NULL CHECK (difficulty IN ('Newbie','Junior','Intermediate','Advanced','Guru')),
  tech_stack     TEXT NOT NULL DEFAULT '[]',
  solution_url   TEXT,
  repo_url       TEXT,
  fm_url         TEXT,
  screenshot_url TEXT,
  notes          TEXT,
  featured       INTEGER DEFAULT 0,
  completed_at   TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT,
  body         TEXT,
  tags         TEXT DEFAULT '[]',
  published    INTEGER DEFAULT 0,
  published_at TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
