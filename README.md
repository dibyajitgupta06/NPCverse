# NPCverse

**A living world where every character remembers.**

NPCverse is an AI-powered, top-down 2D RPG prototype. Explore Everwood, meet its residents, talk naturally, and build relationships that persist between visits.

## Current prototype

- React + TypeScript interface with Phaser 3 game world.
- Keyboard movement (WASD / arrow keys), camera follow and world boundaries.
- Two residents: Arthur Vale (general store owner) and Elara Finch (tavern keeper).
- Contextual NPC interaction with the E key.
- Persistent local conversation memories and relationship values.
- Optional OpenAI-powered dialogue server; deterministic local fallback works without an API key.
- Original art direction using a restrained, handcrafted pixel-inspired palette.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

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

This is an early playable vertical slice, not a complete RPG. The current local memory store is intentionally lightweight. A later milestone will migrate memory, relationships and world state to PostgreSQL + pgvector.

## License

No license has been selected yet. All original NPCverse code and art direction in this repository are project work; do not assume third-party assets are included.
