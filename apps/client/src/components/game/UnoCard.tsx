import React from 'react';
import { Card, CardColor } from '@uno-arena/shared';
import { Ban, RotateCw, Plus } from 'lucide-react';

interface UnoCardProps {
  card: Card;
  isPlayable?: boolean;
  onClick?: () => void;
  isFaceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rotation?: number;
  className?: string;
  disabled?: boolean;
}

export const UnoCard: React.FC<UnoCardProps> = ({
  card,
  isPlayable = false,
  onClick,
  isFaceDown = false,
  size = 'md',
  rotation = 0,
  className = '',
  disabled = false,
}) => {
  const sizeClasses = {
    sm: 'w-14 h-20 text-xs rounded-lg',
    md: 'w-20 h-28 sm:w-24 sm:h-36 text-sm sm:text-base rounded-xl',
    lg: 'w-28 h-40 sm:w-32 sm:h-48 text-base sm:text-lg rounded-2xl',
  };

  const getCardBg = (color?: CardColor, type?: string) => {
    if (type === 'wild' || type === 'wild4') {
      return 'bg-gradient-to-br from-slate-900 via-zinc-900 to-black border-zinc-700';
    }
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-red-400';
      case 'blue':
        return 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-blue-400';
      case 'green':
        return 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-emerald-400';
      case 'yellow':
        return 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-300';
      default:
        return 'bg-gradient-to-br from-slate-700 to-slate-900 border-slate-600';
    }
  };

  const renderSymbol = (isCorner: boolean = false) => {
    if (card.type === 'number') {
      return <span className={`font-black tracking-tighter ${isCorner ? 'text-xs sm:text-sm' : 'text-3xl sm:text-5xl drop-shadow-md'}`}>{card.value}</span>;
    }
    if (card.type === 'skip') {
      return <Ban className={isCorner ? 'w-3 h-3' : 'w-7 h-7 sm:w-10 sm:h-10 stroke-[2.5]'} />;
    }
    if (card.type === 'reverse') {
      return <RotateCw className={isCorner ? 'w-3 h-3' : 'w-7 h-7 sm:w-10 sm:h-10 stroke-[2.5]'} />;
    }
    if (card.type === 'draw2') {
      return (
        <span className={`font-black flex items-center justify-center ${isCorner ? 'text-xs' : 'text-2xl sm:text-4xl'}`}>
          <Plus className="w-3 h-3 sm:w-5 sm:h-5 inline -mr-1" />2
        </span>
      );
    }
    if (card.type === 'wild') {
      if (isCorner) {
        return <div className="w-3 h-3 rounded-full wild-gradient border border-white/50" />;
      }
      return (
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full wild-gradient border-2 border-white/80 shadow-lg flex items-center justify-center">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-white drop-shadow">WILD</span>
        </div>
      );
    }
    if (card.type === 'wild4') {
      if (isCorner) {
        return (
          <span className="font-black text-xs text-amber-300 flex items-center">
            +4
          </span>
        );
      }
      return (
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full wild-gradient border-2 border-white/80 shadow-lg flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-black text-white drop-shadow">+4</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Card back face
  if (isFaceDown) {
    return (
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`relative ${sizeClasses[size]} bg-gradient-to-br from-slate-900 via-neutral-900 to-black border-2 border-slate-700/80 shadow-card flex items-center justify-center select-none overflow-hidden ${className}`}
      >
        <div className="absolute inset-1 rounded-lg border border-red-500/40 bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-6 sm:w-14 sm:h-9 bg-red-600 rounded-full transform -rotate-25 flex items-center justify-center shadow-inner border border-amber-300">
            <span className="text-white font-black text-xs sm:text-sm tracking-tighter italic">UNO</span>
          </div>
        </div>
      </div>
    );
  }

  const bgClasses = getCardBg(card.color, card.type);

  return (
    <button
      type="button"
      onClick={isPlayable && !disabled ? onClick : undefined}
      disabled={disabled || !isPlayable}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-label={`${card.color || 'Wild'} ${card.type} ${card.value ?? ''}`}
      className={`relative ${sizeClasses[size]} ${bgClasses} border-2 shadow-card select-none overflow-hidden transition-all duration-200 text-white flex flex-col justify-between p-1.5 sm:p-2.5 ${
        isPlayable && !disabled
          ? 'cursor-pointer hover:-translate-y-3 hover:shadow-card-hover ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950'
          : 'opacity-85 cursor-default'
      } ${className}`}
    >
      {/* Top Left Symbol */}
      <div className="flex flex-col items-start leading-none pointer-events-none">
        {renderSymbol(true)}
      </div>

      {/* Center Graphic with stylized white ellipse */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[82%] h-[68%] border-[3px] border-white/20 bg-white/10 card-inner-oval flex items-center justify-center shadow-inner">
          <div className="transform rotate-[25deg]">{renderSymbol(false)}</div>
        </div>
      </div>

      {/* Glossy top-left highlight */}
      <div className="absolute inset-0 card-gloss pointer-events-none rounded-xl" />

      {/* Bottom Right Symbol (inverted) */}
      <div className="flex flex-col items-end leading-none transform rotate-180 pointer-events-none">
        {renderSymbol(true)}
      </div>
    </button>
  );
};
