import React from 'react';
import { PublicPlayerState } from '@uno-arena/shared';
import { Bot, Crown, Flame, User, WifiOff } from 'lucide-react';


/* ─────────────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────────────── */
interface PlayerTokenProps {
  player: PublicPlayerState;
  isCurrentTurn: boolean;
  isMe: boolean;
  isThinking?: boolean;
}

interface CircularPlayerLayoutProps {
  players: PublicPlayerState[];
  humanPlayerId: string;
  currentTurnPlayerId: string | undefined;
  isAiThinking?: boolean;
  aiThinkingName?: string | null;
  /** Rendered in the very center (draw pile, discard pile, etc.) */
  children: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────────────────────
   Individual player token
───────────────────────────────────────────────────────────────────────── */
const PlayerToken: React.FC<PlayerTokenProps> = ({ player, isCurrentTurn, isMe, isThinking }) => {

  return (
    <div
      className={`
        relative flex flex-col items-center gap-1 p-2 rounded-2xl
        transition-all duration-300 select-none min-w-[76px]
        ${isCurrentTurn
          ? 'bg-slate-900/95 border-2 border-amber-400/90 shadow-[0_0_18px_3px_rgba(251,191,36,0.35)]'
          : isMe
            ? 'bg-indigo-950/80 border-2 border-indigo-500/60'
            : 'bg-slate-900/70 border border-slate-700/60'}
      `}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black
            ${isMe
              ? 'bg-indigo-600 text-white border-2 border-indigo-400'
              : player.isAi
                ? 'bg-purple-900 text-purple-300 border border-purple-500/50'
                : 'bg-slate-800 text-indigo-300 border border-indigo-500/40'}
          `}
        >
          {player.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {player.isHost && (
          <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-2 -right-1 drop-shadow" />
        )}

        {!player.isConnected && (
          <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5" title="Disconnected">
            <WifiOff className="w-2.5 h-2.5 text-white" />
          </div>
        )}

        {isMe && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black text-indigo-300 leading-none whitespace-nowrap">
            YOU
          </span>
        )}
      </div>

      {/* Name + UNO badge */}
      <div className="flex flex-col items-center gap-0.5 max-w-[72px]">
        <span className="text-[11px] font-bold text-slate-100 truncate w-full text-center leading-tight">
          {player.name}
        </span>
        {player.isUno && (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-600/90 text-white font-black text-[9px] rounded-full animate-bounce shadow">
            <Flame className="w-2 h-2" /> UNO!
          </span>
        )}
      </div>

      {/* Card fan (opponents) or card count (human) */}
      {/* Card count badge */}
      {!isMe ? (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
          {/* Mini stacked card icon */}
          <div className="relative w-5 h-6 flex-shrink-0">
            <div className="absolute inset-0 bg-slate-600 rounded-sm border border-slate-500 translate-x-[2px] translate-y-[-2px]" />
            <div className="absolute inset-0 bg-slate-700 rounded-sm border border-slate-600 translate-x-[1px] translate-y-[-1px]" />
            <div className="absolute inset-0 bg-red-700 rounded-sm border border-red-500 flex items-center justify-center">
              <span className="text-white font-black text-[7px] italic">U</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-200">
            {player.cardCount}
          </span>
          <span className="text-[10px] text-slate-500">
            {player.cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
      ) : (
        <span className="text-[11px] text-slate-400">
          {player.cardCount} {player.cardCount === 1 ? 'card' : 'cards'}
        </span>
      )}

      {/* Active-turn label */}
      {isCurrentTurn && (
        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
          {isThinking ? 'Thinking…' : isMe ? 'Your turn!' : 'Playing'}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Oval formation layout — NO background circle.
   Players are positioned around an ellipse using the same radial math,
   but the green felt circle and decorative rings are gone.
   Human always sits at the bottom (270° = 6 o'clock).
───────────────────────────────────────────────────────────────────────── */
export const CircularPlayerLayout: React.FC<CircularPlayerLayoutProps> = ({
  players,
  humanPlayerId,
  currentTurnPlayerId,
  isAiThinking = false,
  aiThinkingName,
  children,
}) => {
  const totalPlayers = players.length;
  const humanIndex = players.findIndex((p) => p.id === humanPlayerId);

  // Ellipse radii as % of container dimensions
  const rx = totalPlayers <= 2 ? 36 : totalPlayers <= 4 ? 40 : 43; // horizontal radius %
  const ry = totalPlayers <= 2 ? 32 : totalPlayers <= 4 ? 36 : 40; // vertical radius %

  // Human is always at 270° (bottom). Each player gets an equal slice of 360°.
  const step = 360 / totalPlayers;
  const humanAngle = 270;

  const tokens = players.map((player, idx) => {
    const positionOffset = (idx - humanIndex + totalPlayers) % totalPlayers;
    const angleDeg = (humanAngle + positionOffset * step) % 360;
    return { player, angleDeg };
  });

  return (
    // Square container via padding-bottom trick — same as before but NO background
    <div
      className="relative w-full mx-auto"
      style={{ paddingBottom: 'min(88vw, 600px)', maxWidth: 600 }}
    >
      {/* ── NO green felt circle or inner ring here ── */}

      {/* Center content (draw/discard piles + action buttons) */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
        {children}
      </div>

      {/* Player tokens placed around the ellipse */}
      {tokens.map(({ player, angleDeg }) => {
        const isMe = player.id === humanPlayerId;
        const isCurrentTurn = player.id === currentTurnPlayerId;
        const isThinking = isAiThinking && aiThinkingName === player.name;

        const rad = (angleDeg * Math.PI) / 180;
        // Use separate rx/ry for an ellipse instead of a perfect circle
        const leftPct = 50 + rx * Math.cos(rad);
        const topPct  = 50 + ry * Math.sin(rad);

        return (
          <div
            key={player.id}
            className="absolute"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            <PlayerToken
              player={player}
              isCurrentTurn={isCurrentTurn}
              isMe={isMe}
              isThinking={isThinking}
            />
          </div>
        );
      })}
    </div>
  );
};
