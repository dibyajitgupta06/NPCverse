CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS npc_profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  personality TEXT NOT NULL DEFAULT ''
);

INSERT INTO npc_profiles (id, display_name, role, personality) VALUES
  ('arthur', 'Arthur Vale', 'General store owner', 'Practical, observant, dry-witted and slow to trust.'),
  ('elara', 'Elara Finch', 'Tavern keeper', 'Warm, playful and emotionally perceptive.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  npc_id TEXT NOT NULL REFERENCES npc_profiles(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_player_npc_idx
  ON conversations(player_id, npc_id, last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('player', 'npc')),
  content TEXT NOT NULL CHECK (length(content) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx
  ON messages(conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS npc_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  npc_id TEXT NOT NULL REFERENCES npc_profiles(id),
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  importance REAL NOT NULL DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  source_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, npc_id, content)
);

CREATE INDEX IF NOT EXISTS npc_memories_recall_idx
  ON npc_memories(player_id, npc_id, importance DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS relationships (
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  npc_id TEXT NOT NULL REFERENCES npc_profiles(id),
  affinity INTEGER NOT NULL DEFAULT 0 CHECK (affinity BETWEEN -100 AND 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (player_id, npc_id)
);
