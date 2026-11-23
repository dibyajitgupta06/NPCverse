export type NpcId = 'arthur' | 'elara';
export interface NpcDefinition {
  id: NpcId; name: string; role: string; x: number; y: number;
  color: number; greeting: string; fallback: (message: string, memoryCount: number) => string;
}
export interface StoredMemory {
  id: string; npcId: NpcId; content: string; createdAt: string; importance: number;
}
export interface DialogueMessage {
  role: 'player' | 'npc'; text: string; createdAt: string;
}
export interface NpcSave {
  memories: StoredMemory[]; relationship: number; history: DialogueMessage[];
}
