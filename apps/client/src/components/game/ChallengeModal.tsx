import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onDecision: (challenge: boolean) => void;
  offenderName?: string;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onDecision,
  offenderName = 'Opponent',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
          Wild Draw Four Challenge!
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          <span className="font-bold text-amber-300">{offenderName}</span> played a Wild Draw 4.
          Under official UNO rules, WD4 is only legal if they had no cards matching the previous active color.
        </p>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-left mb-6 space-y-1.5 text-slate-400">
          <div><strong className="text-emerald-400">If you Challenge & they are Guilty:</strong> They draw 4 penalty cards and you don't draw!</div>
          <div><strong className="text-red-400">If you Challenge & they are Innocent:</strong> You draw 6 cards (4 + 2 penalty) and are skipped!</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDecision(false)}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Accept (+4)
          </button>

          <button
            type="button"
            onClick={() => onDecision(true)}
            className="py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <ShieldAlert className="w-4 h-4" />
            Challenge!
          </button>
        </div>
      </div>
    </div>
  );
};
