import type { NpcDefinition } from './types';

export const NPCS: NpcDefinition[] = [
  {
    id: 'arthur', name: 'Arthur Vale', role: 'General store owner', x: 365, y: 260,
    color: 0xc47b48,
    greeting: 'The shop is open. Whether I am in the mood for company is another matter.',
    fallback: (message, count) => {
      const text = message.toLowerCase();
      if (/(promise|promised|remember|told you)/.test(text)) return 'Aye. I pay attention to what people tell me. Words are easy; keeping them is the interesting part.';
      if (/(herb|forest|woods)/.test(text)) return 'The woods have a habit of giving people exactly what they went looking for. Sometimes that is not what they need.';
      if (/(hello|hi|hey)/.test(text)) return 'Morning. Looking for supplies, or just making the rounds?';
      if (/(thank|thanks)/.test(text)) return 'No need to dress it up. Just make good use of it.';
      return count > 0 ? 'You again. Good. I was beginning to think the village had swallowed you whole. What is on your mind?' : 'Hmm. That is something to think about. Tell me a little more.';
    },
  },
  {
    id: 'elara', name: 'Elara Finch', role: 'Tavern keeper', x: 625, y: 360,
    color: 0xd88a62,
    greeting: 'Come in, come in. You look like someone with a story.',
    fallback: (message, count) => {
      const text = message.toLowerCase();
      if (/(sad|lonely|tired|rough day|hard day)/.test(text)) return 'Then stay a little. You do not have to turn every feeling into a story straight away.';
      if (/(music|song|band)/.test(text)) return 'Oh, now that is a conversation. The best evenings here usually begin with somebody brave enough to play a song.';
      if (/(hello|hi|hey)/.test(text)) return 'There you are! I was just wondering when I would see a new face. How is Everwood treating you?';
      if (/(thank|thanks)/.test(text)) return 'You are very welcome. It is a nicer place when people look out for one another.';
      return count > 0 ? 'I remember our last little chat. There is always another chapter, though. Go on.' : 'That sounds important. What made you think of that today?';
    },
  },
];
