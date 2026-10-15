import React from 'react';
import { Card } from '@uno-arena/shared';
import { UnoCard } from './UnoCard';

interface DiscardPileProps {
  topCard: Card | null;
  count: number;
}

export const DiscardPile: React.FC<DiscardPileProps> = ({ topCard, count }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        {/* Shadow placeholder base card */}
        <div className="absolute inset-0 bg-slate-900 rounded-xl transform rotate-6 border border-slate-700/50 shadow-md" />
        <div className="absolute inset-0 bg-slate-800 rounded-xl transform -rotate-3 border border-slate-700/50 shadow-md" />

        {/* Top discard card */}
        {topCard ? (
          <div className="relative transform rotate-1">
            <UnoCard card={topCard} size="md" isPlayable={false} />
          </div>
        ) : (
          <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs">
            Empty
          </div>
        )}
      </div>

      <span className="mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Discard ({count})
      </span>
    </div>
  );
};
