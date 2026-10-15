import { useState, useCallback } from 'react';
import type { ChatMsg } from '../components/game/ChatPanel';

// Fun AI bot auto-replies
const BOT_REPLIES: string[] = [
  '🤖 Beep boop! Nice card.',
  'ANALYZING YOUR HAND... 🔍',
  'Did you just play that? Bold strategy.',
  '⚡ My circuits are tingling.',
  'I see your move. Interesting.',
  'You underestimate my algorithms! 😤',
  '🃏 UNO is 90% luck anyway.',
  'My neural net approves of that.',
  'Watch out — I\'m warming up.',
  '🔥 The heat is on!',
  'I\'ve seen better. JK, that was great.',
  'Calculating optimal revenge strategy...',
  '🎯 Good play, human.',
  'My random number generator is primed!',
  'Did someone say... Wild Draw 4? 😈',
  'Processing... Processing... GG!',
];

const SYSTEM_JOINED = '💬 Chat is active! Say hi to your opponents.';

let msgCounter = 0;
const makeId = () => `local_${++msgCounter}_${Date.now()}`;

export function useAIChat(humanPlayerId: string, humanName: string, botNames: string[]) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: makeId(),
      playerId: 'system',
      playerName: 'System',
      message: SYSTEM_JOINED,
      timestamp: Date.now(),
      isSystem: true,
    },
  ]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const myMsg: ChatMsg = {
        id: makeId(),
        playerId: humanPlayerId,
        playerName: humanName,
        message: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, myMsg]);

      // Random bot replies after a short delay
      const replyChance = Math.random();
      if (replyChance > 0.25 && botNames.length > 0) {
        const delay = 800 + Math.random() * 1200;
        const responderName = botNames[Math.floor(Math.random() * botNames.length)];
        const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];

        setTimeout(() => {
          const botMsg: ChatMsg = {
            id: makeId(),
            playerId: `bot_${responderName}`,
            playerName: responderName,
            message: reply,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, botMsg]);
          setUnreadCount((c) => c + 1);
        }, delay);
      }
    },
    [humanPlayerId, humanName, botNames]
  );

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return { messages, unreadCount, sendMessage, clearUnread };
}
