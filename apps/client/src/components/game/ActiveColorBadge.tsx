import React from 'react';
import { CardColor, COLOR_HEX_MAP, COLOR_LABEL_MAP } from '@uno-arena/shared';

interface ActiveColorBadgeProps {
  color: CardColor;
}

export const ActiveColorBadge: React.FC<ActiveColorBadgeProps> = ({ color }) => {
  const hex = COLOR_HEX_MAP[color] || '#3b82f6';
  const label = COLOR_LABEL_MAP[color] || 'Active';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
      <span
        className="w-3.5 h-3.5 rounded-full animate-pulse shadow"
        style={{
          backgroundColor: hex,
          boxShadow: `0 0 10px ${hex}`,
        }}
      />
      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
        Current Color: <span style={{ color: hex }}>{label}</span>
      </span>
    </div>
  );
};
