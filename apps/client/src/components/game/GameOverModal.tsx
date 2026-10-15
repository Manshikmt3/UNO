import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Award } from 'lucide-react';
import { PublicGameState } from '@uno-arena/shared';

interface GameOverModalProps {
  isOpen: boolean;
  gameState: PublicGameState | null;
  onRematch: () => void;
  onReturnHome: () => void;
  isRematchRequested?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  gameState,
  onRematch,
  onReturnHome,
  isRematchRequested = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen || !gameState?.winner) return null;

  const { winner, scores, players } = gameState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl text-center flex flex-col items-center">
        {/* Glowing Trophy Icon */}
        <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-glow-yellow border-2 border-yellow-200 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase tracking-widest font-black text-amber-400 mb-1">
          Victory!
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
          {winner.name} Wins!
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Emptied their hand and earned <span className="text-amber-400 font-bold">+{winner.score} points</span> this round!
        </p>

        {/* Scoreboard table */}
        <div className="w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Current Scoreboard
          </h4>
          <div className="space-y-2">
            {players.map((p) => {
              const score = scores[p.id] ?? 0;
              const isWinner = p.id === winner.playerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm ${
                    isWinner
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{p.name}</span>
                  <span>{score} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onReturnHome}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>

          <button
            type="button"
            onClick={onRematch}
            disabled={isRematchRequested}
            className="py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
          >
            <RotateCcw className="w-4 h-4" />
            {isRematchRequested ? 'Waiting...' : 'Play Again'}
          </button>
        </div>
      </div>
    </div>
  );
};
