import React from 'react';
import { CardColor } from '@uno-arena/shared';

interface ColorPickerModalProps {
  isOpen: boolean;
  onSelectColor: (color: CardColor) => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onSelectColor,
}) => {
  if (!isOpen) return null;

  const colors: { id: CardColor; label: string; bg: string; hoverBg: string; border: string }[] = [
    { id: 'red', label: 'Red', bg: 'bg-red-600', hoverBg: 'hover:bg-red-500', border: 'border-red-400' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-500', border: 'border-blue-400' },
    { id: 'green', label: 'Green', bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-500', border: 'border-emerald-400' },
    { id: 'yellow', label: 'Yellow', bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-400', border: 'border-amber-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-center">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
          Choose Active Color
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          You played a Wild card! Select the color for subsequent turns.
        </p>

        <div className="grid grid-cols-2 gap-3.5">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.id)}
              className={`h-20 ${c.bg} ${c.hoverBg} ${c.border} border-2 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold text-base sm:text-lg shadow-lg transform transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/40`}
            >
              <span className="drop-shadow">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
