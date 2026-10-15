import React from 'react';
import { X, BookOpen, Ban, RotateCw, Plus, Sparkles, ShieldAlert } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-left flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            UNO Arena Rules & Gameplay
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs sm:text-sm text-slate-300">
          <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider">
              Objective
            </h4>
            <p className="leading-relaxed">
              Be the first player to play all cards in your hand. Points are scored based on all cards remaining in opponents' hands.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider">
              Card Compatibility
            </h4>
            <p className="leading-relaxed">
              On your turn, match the card on top of the discard pile by <strong className="text-white">Color</strong>, <strong className="text-white">Number</strong>, or <strong className="text-white">Symbol</strong>. Wild cards can be played on any card.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 text-sm uppercase tracking-wider">
              Special Action Cards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-red-400 flex items-center gap-1 mb-1">
                  <Ban className="w-3.5 h-3.5" /> Skip
                </span>
                Skips the next player's turn.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-blue-400 flex items-center gap-1 mb-1">
                  <RotateCw className="w-3.5 h-3.5" /> Reverse
                </span>
                Reverses play direction. In a 2-player game, behaves identically to a Skip!
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <Plus className="w-3.5 h-3.5" /> Draw Two (+2)
                </span>
                Next player draws 2 cards and forfeits their turn.
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="font-bold text-yellow-400 flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Wild
                </span>
                Playable on any card. You pick the next active color.
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-orange-400" /> Wild Draw Four (+4) & Challenge
            </h4>
            <p className="leading-relaxed text-xs">
              Changes color and forces next player to draw 4 and skip. <strong className="text-white">Challenge Rule:</strong> A player may only legally play Wild Draw 4 if they hold NO cards of the active color. The victim can challenge! If guilty, the player draws 4; if innocent, the challenger draws 6!
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider">
              Calling UNO & Penalties
            </h4>
            <p className="leading-relaxed text-xs">
              When you play your second-to-last card, you must click <strong className="text-red-400">Call UNO</strong>. If another player catches you before the next player takes a turn, you must draw 2 penalty cards!
            </p>
          </div>

          <div>
            <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider">
              Scoring Points
            </h4>
            <p className="leading-relaxed text-xs">
              Numbers 0-9: Face value | Action cards (Skip, Reverse, +2): 20 pts | Wild & Wild +4: 50 pts.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all text-xs sm:text-sm"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
