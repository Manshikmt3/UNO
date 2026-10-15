import React from 'react';
import { Card } from '@uno-arena/shared';
import { UnoCard } from './UnoCard';
import { Check, X } from 'lucide-react';

interface DrawnCardChoiceModalProps {
  isOpen: boolean;
  drawnCard: Card | null;
  onPlay: () => void;
  onPass: () => void;
}

export const DrawnCardChoiceModal: React.FC<DrawnCardChoiceModalProps> = ({
  isOpen,
  drawnCard,
  onPlay,
  onPass,
}) => {
  if (!isOpen || !drawnCard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-center flex flex-col items-center">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
          Card is Playable!
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          You drew a card that matches the current discard. Would you like to play it now or keep it?
        </p>

        {/* Card preview */}
        <div className="my-2 transform scale-110">
          <UnoCard card={drawnCard} isPlayable={false} />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onPass}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <X className="w-4 h-4 text-slate-400" />
            Keep & Pass
          </button>

          <button
            type="button"
            onClick={onPlay}
            className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <Check className="w-4 h-4" />
            Play Card
          </button>
        </div>
      </div>
    </div>
  );
};
