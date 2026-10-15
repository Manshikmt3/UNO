import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, HelpCircle, Settings } from 'lucide-react';
import { useGameSettingsStore } from '../../stores/useGameSettingsStore';

interface NavbarProps {
  onOpenSettings?: () => void;
  onOpenRules?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenRules,
}) => {
  const { soundEnabled, setSoundEnabled } = useGameSettingsStore();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-md transform group-hover:scale-105 transition-transform flex items-center justify-center">
          <span className="font-black text-xs text-slate-950 tracking-tighter italic">UNO</span>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-base tracking-tight text-white flex items-center gap-1">
            UNO ARENA
            <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
          </span>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
            Multiplayer & AI
          </span>
        </div>
      </Link>

      {/* Nav Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {location.pathname !== '/' && (
          <Link
            to="/"
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Lobby
          </Link>
        )}

        {/* Audio Toggle */}
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Rules Modal */}
        {onOpenRules && (
          <button
            type="button"
            onClick={onOpenRules}
            aria-label="View game rules"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>
        )}

        {/* Settings Modal */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>
    </header>
  );
};
