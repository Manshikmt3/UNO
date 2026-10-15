import React from 'react';
import { X, Volume2, Sparkles, User, Bot } from 'lucide-react';
import { useGameSettingsStore } from '../../stores/useGameSettingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    playerName,
    setPlayerName,
    preferredDifficulty,
    setPreferredDifficulty,
    avatar,
    setAvatar,
  } = useGameSettingsStore();

  if (!isOpen) return null;

  const avatars = ['cat', 'dog', 'fox', 'bear', 'robot'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-left">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">
            Game Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Player Name
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={20}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Choose Avatar
            </label>
            <div className="flex gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                    avatar === av
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {av === 'robot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Default AI Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setPreferredDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                    preferredDifficulty === diff
                      ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Sound Effects
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Animations
              </span>
              <button
                type="button"
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 ${
                  animationsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    animationsEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
