import type { DialogueMessage, NpcId, NpcSave, StoredMemory } from './types';

const key = (npcId: NpcId) => `npcverse.save.${npcId}`;
const empty = (): NpcSave => ({ memories: [], relationship: 0, history: [] });

export class MemoryStore {
  read(npcId: NpcId): NpcSave {
    try {
      const raw = localStorage.getItem(key(npcId));
      return raw ? { ...empty(), ...JSON.parse(raw) as NpcSave } : empty();
    } catch { return empty(); }
  }
  write(npcId: NpcId, save: NpcSave): void {
    localStorage.setItem(key(npcId), JSON.stringify(save));
  }
  addTurn(npcId: NpcId, playerText: string, npcText: string): NpcSave {
    const save = this.read(npcId);
    const now = new Date().toISOString();
    const history: DialogueMessage[] = [
      ...save.history,
      { role: 'player', text: playerText, createdAt: now },
      { role: 'npc', text: npcText, createdAt: now },
    ].slice(-30);
    const candidate = playerText.trim();
    const meaningful = candidate.length >= 18 && /(i am|i'm|i like|i love|i prefer|i promised|i will|my name|remember|because)/i.test(candidate);
    const memories: StoredMemory[] = meaningful
      ? [{ id: crypto.randomUUID(), npcId, content: candidate, createdAt: now, importance: 0.6 }, ...save.memories].slice(0, 30)
      : save.memories;
    const relationshipDelta = /(thank|please|help|sorry|promise|kind)/i.test(playerText) ? 2 : -1;
    const next = { memories, relationship: Math.max(-100, Math.min(100, save.relationship + relationshipDelta)), history };
    this.write(npcId, next);
    return next;
  }
  recall(npcId: NpcId): NpcSave { return this.read(npcId); }
  reset(npcId: NpcId): void { localStorage.removeItem(key(npcId)); }
}
