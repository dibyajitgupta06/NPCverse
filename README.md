# NPCverse

**A living world where every character remembers.**

NPCverse is an AI-powered, top-down 2D RPG prototype. Explore Everwood, meet its residents, talk naturally, and build relationships that persist between visits.

## Current prototype

- React + TypeScript interface with Phaser 3 game world.
- Keyboard movement (WASD / arrow keys), camera follow and world boundaries.
- Two residents: Arthur Vale (general store owner) and Elara Finch (tavern keeper).
- Contextual NPC interaction with the E key.
- Persistent local conversation memories and relationship values, with optional PostgreSQL sync.
- Optional OpenAI-powered dialogue server; deterministic local fallback works without an API key.
- Original art direction using a restrained, handcrafted pixel-inspired palette.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

### PostgreSQL persistence (optional)

Start a local PostgreSQL 16 database with Docker:

```bash
docker compose up -d db
```

Apply the schema once:

```bash
psql "postgresql://npcverse:npcverse@localhost:5432/npcverse" -f db/migrations/001_initial_schema.sql
```

Copy `.env.example` to `.env` and set `DATABASE_URL`. Conversation turns continue to save in browser localStorage; when PostgreSQL is available, the backend also stores conversations, memories and relationship affinity. Check `http://localhost:8787/health` for backend/database status.

### Optional AI backend

Copy `.env.example` to `.env`, add your OpenAI API key, then run the API in a second terminal:

```bash
npm run server
```

The frontend will use the API at http://localhost:8787. Never put an API key in frontend code or commit your `.env` file.

## Controls

- **WASD / arrow keys:** move
- **E:** talk to a nearby resident
- **Escape:** close the conversation

## Project docs

- [Product requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [NPC character bible](docs/CHARACTERS.md)

## Prototype status

This is an early playable vertical slice, not a complete RPG. The browser local memory store remains the offline fallback. PostgreSQL now stores player/NPC conversations, memories and relationship affinity. Semantic retrieval with pgvector is a later milestone.

## License

No license has been selected yet. All original NPCverse code and art direction in this repository are project work; do not assume third-party assets are included.
