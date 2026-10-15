import React from 'react';
import { PublicPlayerState } from '@uno-arena/shared';
import { Bot, Crown, Flame, User, WifiOff } from 'lucide-react';
import { UnoCard } from './UnoCard';

interface OpponentSlotProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
  isThinking?: boolean;
}

export const OpponentSlot: React.FC<OpponentSlotProps> = ({
  player,
  isCurrentTurn,
  isThinking = false,
}) => {
  const dummyCard = { id: `opp_${player.id}`, type: 'number' as const };

  return (
    <div
      className={`relative flex flex-col items-center p-2.5 sm:p-3 rounded-2xl transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-slate-900/90 border-2 border-amber-400/80 shadow-glow'
          : 'bg-slate-900/60 border border-slate-800'
      }`}
    >
      {/* Player Header with Avatar & Name */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
              player.isAi
                ? 'bg-purple-950/80 text-purple-400 border border-purple-500/50'
                : 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/50'
            }`}
          >
            {player.isAi ? (
              <Bot className="w-5 h-5" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          {player.isHost && (
            <Crown className="w-4 h-4 text-amber-400 absolute -top-1.5 -right-1 drop-shadow" />
          )}
          {!player.isConnected && (
            <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5" title="Disconnected">
              <WifiOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-slate-100 max-w-[100px] truncate">
              {player.name}
            </span>
            {player.isUno && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-600/90 text-white font-black text-[10px] rounded animate-bounce shadow">
                <Flame className="w-2.5 h-2.5" /> UNO!
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
      </div>

      {/* Opponent mini card fan */}
      <div className="flex items-center -space-x-3 overflow-hidden py-1">
        {Array.from({ length: Math.min(player.cardCount, 5) }).map((_, i) => (
          <div
            key={i}
            className="transform transition-transform"
            style={{ transform: `rotate(${(i - 2) * 5}deg)` }}
          >
            <UnoCard card={dummyCard} isFaceDown size="sm" />
          </div>
        ))}
        {player.cardCount > 5 && (
          <div className="z-10 ml-1 px-1.5 py-0.5 bg-slate-800 text-[10px] text-slate-300 font-bold rounded-full border border-slate-700">
            +{player.cardCount - 5}
          </div>
        )}
      </div>

      {/* Thinking indicator bubble */}
      {isCurrentTurn && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          {isThinking ? 'Thinking move...' : 'Playing turn'}
        </div>
      )}
    </div>
  );
};
