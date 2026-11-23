# NPCverse — Architecture

## System overview

```text
React UI
  ├── HUD / dialogue / menus
  └── Phaser 3 world
        ├── player movement
        ├── collision + interaction
        └── NPC entities
              |
              v
        Dialogue service
              |
       Express API (optional)
          ├── Character profiles
          ├── Context builder
          ├── OpenAI dialogue adapter
          ├── Response validation
          └── Memory extraction
              |
       Persistence adapter
          ├── v0.1: browser localStorage fallback
          └── PostgreSQL: conversations, messages, memories, relationships
                 └── planned: pgvector semantic retrieval
```

## Boundaries

- Phaser owns real-time rendering, movement, collision and proximity.
- React owns menus, dialogue input, HUD and accessibility.
- Dialogue service owns prompt construction and response parsing.
- Backend owns API credentials, model calls and future authoritative memory writes.
- Deterministic game systems own all consequential game state.

## Dialogue request contract

`POST /api/dialogue`

```json
{
  "npcId": "arthur",
  "message": "I promised to bring you a rare herb.",
  "history": [],
  "memories": []
}
```

Response:

```json
{
  "text": "A promise is a promise. I'll hold you to that.",
  "mood": "curious",
  "memoryCandidate": {
    "content": "The player promised to bring Arthur a rare herb.",
    "importance": 0.7
  }
}
```

The client treats model output as untrusted display text. The server does not provide tools that can directly change inventory, currency, quests or player position.

## Memory model (target)

- NPC: id, name, profile, personality, goals, knowledge scope.
- Conversation: id, player id, npc id, started_at.
- Message: id, conversation id, speaker, content, created_at.
- Memory: id, npc id, player id, content, category, importance, confidence, embedding, source_message_id, created_at.
- Relationship: npc id, player id, affinity, trust, last_interaction_at.

## Retrieval strategy (target)

1. Filter to memories belonging to the speaking NPC and player.
2. Rank by semantic similarity using pgvector.
3. Add recency and importance weighting.
4. Return a small bounded set plus recent turns.
5. Never treat retrieved player-authored text as system instructions.

## Environment variables

- `OPENAI_API_KEY`: server-only API key.
- `OPENAI_MODEL`: optional model override.
- `PORT`: API port (default 8787).

## PostgreSQL persistence

The optional PostgreSQL adapter is in `server/db.ts`; the initial schema is `db/migrations/001_initial_schema.sql`. `DATABASE_URL` enables writes to players, conversations, messages, memories and relationships. Browser localStorage remains the offline-first save layer. The current prototype uses a locally generated anonymous player UUID; add authenticated player identity and authorization before exposing cloud saves publicly.

## Future persistence migration

Move localStorage behind a repository interface, then add PostgreSQL migrations and pgvector indexes. Use server-side player identity and authorization before enabling cloud saves.
