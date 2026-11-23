import { useCallback, useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { NPCverseScene } from '../game/NPCverseScene';
import { NPCS } from '../game/npcs';
import { MemoryStore } from '../game/MemoryStore';
import type { NpcId, StoredMemory } from '../game/types';

const memoryStore = new MemoryStore();
const playerStorageKey = 'npcverse.playerId';
function getPlayerId(): string {
  let id = localStorage.getItem(playerStorageKey);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(playerStorageKey, id); }
  return id;
}

export default function App() {
  const gameHost = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState<NpcId | null>(null);
  const [activeNpc, setActiveNpc] = useState<NpcId | null>(null);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [memories, setMemories] = useState<StoredMemory[]>([]);
  const [relationship, setRelationship] = useState(0);
  const npc = NPCS.find((item) => item.id === activeNpc);

  const openNpc = useCallback((id: NpcId) => {
    const def = NPCS.find((item) => item.id === id)!;
    const save = memoryStore.recall(id);
    setActiveNpc(id); setMemories(save.memories); setRelationship(save.relationship);
    const remembered = save.memories[0];
    setReply(remembered
      ? `I remember you told me: “${remembered.content}”. How has that been going?`
      : save.history.length ? `Welcome back. ${def.fallback('hello', save.memories.length)}` : def.greeting);
    setMessage('');
  }, []);

  useEffect(() => {
    if (!gameHost.current) return;
    const scene = new NPCverseScene({ onNearbyNpc: setNearby, onWorldReady: () => undefined });
    const game = new Phaser.Game({
      type: Phaser.AUTO, parent: gameHost.current, width: 960, height: 640,
      backgroundColor: '#6d875c', pixelArt: true, antialias: false,
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: [scene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    });
    const onInteract = (id: NpcId) => openNpc(id);
    game.events.on('npc-interact', onInteract);
    return () => { game.events.off('npc-interact', onInteract); game.destroy(true); };
  }, [openNpc]);

  const send = async () => {
    if (!activeNpc || !message.trim() || busy) return;
    const current = message.trim(); setMessage(''); setBusy(true);
    try {
      const save = memoryStore.recall(activeNpc);
      let text = '';
      try {
        const response = await fetch('/api/dialogue', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ npcId: activeNpc, message: current, history: save.history.slice(-8), memories: save.memories.slice(0, 5) }),
        });
        if (!response.ok) throw new Error('AI service unavailable');
        const data = await response.json() as { text?: string }; text = data.text || '';
      } catch {
        const def = NPCS.find((item) => item.id === activeNpc)!;
        text = def.fallback(current, save.memories.length);
      }
      const next = memoryStore.addTurn(activeNpc, current, text);
      setReply(text); setMemories(next.memories); setRelationship(next.relationship);
      void fetch('/api/save-turn', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: getPlayerId(), npcId: activeNpc, playerText: current, npcText: text, memories: next.memories.slice(0, 5), relationship: next.relationship }),
      }).catch(() => undefined);
    } finally { setBusy(false); }
  };

  const closeDialogue = useCallback(() => setActiveNpc(null), []);

  useEffect(() => {
    if (!activeNpc) return;
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDialogue(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeNpc, closeDialogue]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#"><span className="mark">N</span> NPCVERSE</a>
        <div className="top-meta"><span className="live-dot" /> EVERWOOD <span className="meta-divider">/</span> DAY 01</div>
        <div className="top-right"><span className="weather">☀ CLEAR SKIES</span><span className="save-indicator">● AUTO-SAVED</span></div>
      </header>
      <section className="intro">
        <div><p className="eyebrow">A WORLD THAT REMEMBERS</p><h1>Somewhere, life<br/><em>goes on.</em></h1></div>
        <p className="intro-copy">A quiet afternoon in Everwood. The residents have their own lives, their own stories — and a memory for yours.</p>
      </section>
      <section className="game-layout">
        <div className="world-column">
          <div className="world-frame">
            <div className="world-label"><span>✳</span> EVERWOOD VILLAGE <small>FIELD NOTES · 001</small></div>
            <div className="game-host" ref={gameHost} />
            <div className="world-controls"><span>MOVE <kbd>W A S D</kbd> / <kbd>↑ ↓ ← →</kbd></span><span>INTERACT <kbd>E</kbd></span></div>
          </div>
          <div className="world-caption"><span>THE OLD VILLAGE ROAD</span><span>EST. BEFORE ANYONE CAN REMEMBER</span></div>
        </div>
        <aside className="side-panel">
          <div className="panel-heading"><span>01 / THE NEIGHBOURS</span><span className="panel-count">02 RESIDENTS</span></div>
          {NPCS.map((person) => {
            const saved = memoryStore.recall(person.id);
            return <button className={`resident-card ${nearby === person.id ? 'is-nearby' : ''}`} key={person.id} onClick={() => openNpc(person.id)}>
              <span className={`portrait portrait-${person.id}`}><span>{person.id === 'arthur' ? 'AV' : 'EF'}</span></span>
              <span className="resident-info"><strong>{person.name}</strong><small>{person.role}</small><small className="resident-status">{nearby === person.id ? '✳ CLOSE BY · PRESS E' : saved.memories.length ? `◷ ${saved.memories.length} MEMORIES` : '● AROUND TOWN'}</small></span>
              <span className="resident-arrow">↗</span>
            </button>;
          })}
          <div className="memory-card"><p className="eyebrow">A NOTE ON MEMORY</p><p>People here remember the little things. A promise. A passing thought. The things you might not expect them to keep.</p><span className="memory-spark">✳</span></div>
          <div className="relationship-card"><div className="panel-heading"><span>YOUR FOOTPRINT</span><span>LOCAL SAVE</span></div><p>Conversations save locally first, with optional PostgreSQL sync when the backend is configured.</p></div>
        </aside>
      </section>
      <footer className="footer"><span>NPCVERSE © 2026</span><span>BUILT FOR THE STORIES BETWEEN THE QUESTS.</span><span>PROTOTYPE 0.1.0</span></footer>
      {activeNpc && npc && <div className="dialogue-overlay" role="dialog" aria-modal="true" aria-label={`Conversation with ${npc.name}`}>
        <div className="dialogue-window">
          <div className="dialogue-top"><div><span className="eyebrow">A CONVERSATION IN EVERWOOD</span><h2>{npc.name}</h2><p>{npc.role}</p></div><button className="close-button" onClick={closeDialogue} aria-label="Close dialogue">×</button></div>
          <div className="dialogue-body"><div className={`dialogue-avatar portrait portrait-${npc.id}`}>{npc.id === 'arthur' ? 'AV' : 'EF'}</div><div className="speech"><span className="speaker">{npc.name.toUpperCase()}</span><p>{reply}</p>{busy && <span className="thinking">THINKING · · ·</span>}</div></div>
          {memories.length > 0 && <div className="memory-recall"><span>✳ REMEMBERS</span><p>{memories[0].content}</p></div>}
          <div className="dialogue-bottom"><div className="relationship-line"><span>RELATIONSHIP</span><strong>{relationship > 0 ? '+' : ''}{relationship}</strong></div><form onSubmit={(e) => { e.preventDefault(); void send(); }}><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something..." autoFocus /><button disabled={busy || !message.trim()} type="submit">{busy ? '...' : 'SEND ↗'}</button></form><span className="dialogue-hint">PRESS ESC TO CLOSE · YOUR WORDS SHAPE WHAT THEY REMEMBER</span></div>
        </div>
      </div>}
    </main>
  );
}
