import React from 'react';
import { Siren } from 'lucide-react';

interface CatchUnoButtonProps {
  targetPlayerId: string | null;
  onCatch: (targetId: string) => void;
}

export const CatchUnoButton: React.FC<CatchUnoButtonProps> = ({
  targetPlayerId,
  onCatch,
}) => {
  if (!targetPlayerId) return null;

  return (
    <button
      type="button"
      onClick={() => onCatch(targetPlayerId)}
      aria-label="Catch opponent who forgot to call UNO"
      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg border border-amber-300 flex items-center gap-1.5 animate-bounce focus:outline-none focus:ring-4 focus:ring-amber-400"
    >
      <Siren className="w-4 h-4 text-yellow-200" />
      <span>Catch UNO Penalty!</span>
    </button>
  );
};
