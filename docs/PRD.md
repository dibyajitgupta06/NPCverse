# NPCverse — Product Requirements Document

**Version:** 0.1 · **Status:** Prototype brief

## 1. Product vision

NPCverse is a top-down role-playing game built around believable AI-driven characters. Every resident has a stable identity, personality, goals, knowledge boundaries and a memory of meaningful encounters. The player should feel that they are participating in a world rather than querying a chatbot.

**Core promise:** NPCs remember what matters and behave differently because of it.

## 2. Target experience

A player explores a quiet village, meets residents, talks in their own words, and discovers that conversations have consequences. A shopkeeper may remember a promise; a friend may bring up a previous conversation; a resident may become guarded after repeated disrespect.

## 3. Design pillars

1. **Character before chatbot:** every response must sound like the same individual.
2. **Continuity:** relevant memories persist across sessions.
3. **World integrity:** AI may suggest dialogue and narrative beats, but deterministic game code owns inventory, quests, economy, movement and progression.
4. **Player agency:** the player can speak naturally without being forced through fixed dialogue trees.
5. **Handcrafted atmosphere:** original pixel-inspired art, deliberate sound and readable interfaces.

## 4. Prototype audience

Players who enjoy narrative RPGs, cozy exploration, emergent storytelling and character-driven worlds. The prototype should also demonstrate full-stack engineering and practical LLM integration to a technical portfolio audience.

## 5. v0.1 scope

### Must have
- Browser-based desktop prototype.
- Top-down controllable player and a compact Everwood village.
- Two fully profiled NPCs: Arthur Vale and Elara Finch.
- Proximity interaction and natural-language dialogue input.
- NPC-specific voice, backstory and goals.
- Conversation history and a small persistent memory store.
- Relationship score with transparent, bounded updates.
- Local fallback dialogue when the AI service is unavailable.
- Responsive dialogue UI, loading and error states.

### Not in v0.1
- Multiplayer, combat, crafting, procedural world generation.
- Autonomous NPC schedules and NPC-to-NPC conversations.
- Full quest engine, inventory economy or branching cinematic cutscenes.
- Voice input, speech synthesis or mobile controls.

## 6. Core user journey

1. Start the game and enter Everwood.
2. Walk to Arthur outside the general store.
3. Press E and introduce yourself.
4. Tell Arthur a meaningful detail or make a promise.
5. End the conversation and speak with Elara.
6. Refresh the page or return later.
7. Speak to Arthur again and observe a relevant memory being recalled.

## 7. Functional requirements

### World and movement
- FR-01: Player moves with WASD and arrow keys.
- FR-02: Camera follows the player inside world bounds.
- FR-03: NPCs are interactable only within a defined radius.
- FR-04: Interaction prompt identifies the nearest resident.

### Character intelligence
- FR-05: Each NPC has a distinct system prompt and structured character profile.
- FR-06: Dialogue receives only relevant memories and recent conversation context.
- FR-07: AI output is validated before display.
- FR-08: NPCs must not claim knowledge they could not have acquired.
- FR-09: AI output cannot directly mutate game state.

### Memory and relationships
- FR-10: Significant facts, promises, preferences and emotional events can become memories.
- FR-11: Memories include source, timestamp, confidence and importance.
- FR-12: Memory retrieval prioritizes relevance, recency and importance.
- FR-13: Relationship changes are bounded and applied by deterministic server logic.
- FR-14: Memory and relationship state survive a browser refresh.

### Reliability and safety
- FR-15: The game remains playable without an API key.
- FR-16: API timeouts and invalid responses produce graceful fallback dialogue.
- FR-17: Secrets remain server-side.
- FR-18: Player text is treated as untrusted input; NPC instructions and world rules cannot be overridden by player messages.

## 8. Non-functional requirements

- Smooth desktop play at a target 60 FPS on ordinary modern hardware.
- Pixel-art rendering with nearest-neighbour scaling.
- Clear separation between rendering, simulation, dialogue and persistence.
- TypeScript strict mode.
- No secrets committed to source control.
- Clear setup instructions and reproducible build.

## 9. Success criteria

The vertical slice is successful when a new player can move around Everwood, talk to both NPCs, see distinct character voices, save a meaningful interaction, refresh the page and observe the relevant character recall it. The game must continue working when the AI backend is offline.

## 10. Product risks

- **Hallucinated memories:** only store extracted facts with confidence and provenance; allow correction.
- **Latency:** show a thoughtful loading state and use a fast fallback.
- **Token cost:** summarize older dialogue and retrieve a small memory set.
- **Prompt injection:** separate trusted character instructions from player content; never expose tools for arbitrary game mutations.
- **Repetitive dialogue:** combine recent turns, long-term memories, mood and scene context.

## 11. Later evaluation

Measure memory recall accuracy, character voice consistency, median dialogue latency, fallback rate, player return rate and the percentage of conversations that produce a useful persistent memory.
