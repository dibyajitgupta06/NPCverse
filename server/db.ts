import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null;

export async function persistTurn(input: {
  playerId: string;
  npcId: 'arthur' | 'elara';
  playerText: string;
  npcText: string;
  memories: Array<{ content: string; importance?: number }>;
  relationship: number;
}) {
  if (!pool) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO players (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [input.playerId]);
    const existing = await client.query(
      `SELECT id FROM conversations
       WHERE player_id = $1 AND npc_id = $2
       ORDER BY last_message_at DESC LIMIT 1`,
      [input.playerId, input.npcId],
    );
    const conversation = existing.rows[0]?.id
      ? existing
      : await client.query(
          'INSERT INTO conversations (player_id, npc_id) VALUES ($1, $2) RETURNING id',
          [input.playerId, input.npcId],
        );
    const conversationId = conversation.rows[0].id as string;
    const playerMessage = await client.query(
      'INSERT INTO messages (conversation_id, speaker, content) VALUES ($1, $2, $3) RETURNING id',
      [conversationId, 'player', input.playerText.slice(0, 4000)],
    );
    await client.query(
      'INSERT INTO messages (conversation_id, speaker, content) VALUES ($1, $2, $3)',
      [conversationId, 'npc', input.npcText.slice(0, 4000)],
    );
    for (const memory of input.memories.slice(0, 5)) {
      const content = String(memory.content ?? '').trim().slice(0, 1000);
      if (!content) continue;
      await client.query(
        `INSERT INTO npc_memories (player_id, npc_id, content, importance, source_message_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (player_id, npc_id, content) DO NOTHING`,
        [input.playerId, input.npcId, content, Math.max(0, Math.min(1, Number(memory.importance ?? 0.5))), playerMessage.rows[0].id],
      );
    }
    await client.query(
      `INSERT INTO relationships (player_id, npc_id, affinity)
       VALUES ($1, $2, $3)
       ON CONFLICT (player_id, npc_id)
       DO UPDATE SET affinity = EXCLUDED.affinity, updated_at = NOW()`,
      [input.playerId, input.npcId, Math.max(-100, Math.min(100, Math.round(input.relationship)))],
    );
    await client.query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
