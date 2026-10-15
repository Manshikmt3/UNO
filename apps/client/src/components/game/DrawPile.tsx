import React from 'react';
import { Layers } from 'lucide-react';
import { UnoCard } from './UnoCard';

interface DrawPileProps {
  count: number;
  isMyTurn: boolean;
  onDraw: () => void;
  disabled?: boolean;
}

export const DrawPile: React.FC<DrawPileProps> = ({
  count,
  isMyTurn,
  onDraw,
  disabled = false,
}) => {
  const dummyBackCard = { id: 'deck_back', type: 'number' as const };

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={isMyTurn && !disabled ? onDraw : undefined}
        disabled={disabled || !isMyTurn}
        aria-label="Draw card from pile"
        className={`relative group focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-xl transition-transform ${
          isMyTurn && !disabled
            ? 'cursor-pointer hover:scale-105 active:scale-95'
            : 'cursor-default opacity-85'
        }`}
      >
        {/* Visual stack depth simulation */}
        <div className="absolute top-1.5 left-1.5 w-full h-full bg-slate-900 rounded-xl border border-slate-700/60 shadow" />
        <div className="absolute top-0.5 left-0.5 w-full h-full bg-slate-800 rounded-xl border border-slate-700/80 shadow" />

        {/* Top face down card */}
        <div
          className={`relative ${
            isMyTurn && !disabled
              ? 'ring-2 ring-amber-400/80 shadow-glow'
              : ''
          } rounded-xl`}
        >
          <UnoCard card={dummyBackCard} isFaceDown size="md" />
        </div>

        {/* Prompt badge on hover when it's your turn */}
        {isMyTurn && !disabled && (
          <div className="absolute inset-0 bg-amber-500/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-slate-950/90 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full shadow border border-amber-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Draw Card
            </span>
          </div>
        )}
      </button>

      <span className="mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Draw ({count})
      </span>
    </div>
  );
};
