import React, { useEffect, useRef } from 'react';
import { GameLogEntry } from '@uno-arena/shared';
import { MessageSquare } from 'lucide-react';

interface GameLogProps {
  history: GameLogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const getBadgeClass = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'play':
        return 'text-sky-300';
      case 'uno':
        return 'text-amber-300 font-bold';
      case 'challenge':
        return 'text-purple-300 font-bold';
      case 'win':
        return 'text-emerald-400 font-extrabold';
      case 'color':
        return 'text-indigo-300';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col h-40 sm:h-48 shadow-lg">
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <MessageSquare className="w-3.5 h-3.5" />
        Game Feed
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 pt-2 text-xs font-mono pr-1"
      >
        {history.length === 0 ? (
          <div className="text-slate-600 text-center py-4">No events yet</div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="leading-tight">
              <span className="text-slate-500 text-[10px] mr-1.5">
                {new Date(entry.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span className={getBadgeClass(entry.type)}>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
