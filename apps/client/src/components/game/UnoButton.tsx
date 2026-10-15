import React from 'react';
import { Flame } from 'lucide-react';

interface UnoButtonProps {
  canCallUno: boolean;
  onCallUno: () => void;
  hasCalledUno?: boolean;
}

export const UnoButton: React.FC<UnoButtonProps> = ({
  canCallUno,
  onCallUno,
  hasCalledUno = false,
}) => {
  if (hasCalledUno) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-300 text-xs font-black tracking-wider uppercase shadow">
        <Flame className="w-4 h-4 text-red-400" />
        UNO Called!
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={canCallUno ? onCallUno : undefined}
      disabled={!canCallUno}
      aria-label="Call UNO"
      className={`relative group px-5 py-2.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-4 ${
        canCallUno
          ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-glow-red hover:scale-105 active:scale-95 animate-pulse focus:ring-red-400 cursor-pointer border border-amber-300'
          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
      }`}
    >
      <Flame
        className={`w-4 h-4 ${
          canCallUno ? 'text-amber-300 group-hover:scale-125 transition-transform' : 'text-slate-500'
        }`}
      />
      <span>Call UNO</span>
    </button>
  );
};
