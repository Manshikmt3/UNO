import React, { useState } from 'react';
import { RoomDetails } from '@uno-arena/shared';
import { Copy, Check, Share2, Play, Bot, Crown, User, LogOut, Plus, Trash2 } from 'lucide-react';

interface RoomLobbyProps {
  room: RoomDetails;
  currentUserId: string;
  onSetReady: (isReady: boolean) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onAddAi: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onRemoveAi: (aiId: string) => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  currentUserId,
  onSetReady,
  onStartGame,
  onLeaveRoom,
  onAddAi,
  onRemoveAi,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedAiDifficulty, setSelectedAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const me = room.players.find((p) => p.id === currentUserId);
  const isHost = me?.isHost ?? false;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShareLink = async () => {
    const inviteUrl = `${window.location.origin}/join/${room.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my UNO Arena Room!',
          text: `Join my UNO game room with code ${room.code}!`,
          url: inviteUrl,
        });
        return;
      } catch {}
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const allPlayersReady =
    room.players.length >= room.settings.minPlayers &&
    room.players.every((p) => (p.isHost ? true : p.isReady));

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* Header: Room Code & Share */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Private Game Room
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider font-mono">
              {room.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy Room Code"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              title="Share Invite Link"
              className="p-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Leave Room
        </button>
      </div>

      {/* Players Slots List */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Connected Players ({room.players.length} / {room.settings.maxPlayers})
          </span>
          <span className="text-xs text-slate-500">
            Min {room.settings.minPlayers} players to begin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
          {room.players.map((p) => {
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                  isMe
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      p.isAi
                        ? 'bg-purple-950 text-purple-400 border border-purple-500/50'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-500/50'
                    }`}
                  >
                    {p.isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                      <span className="max-w-[120px] truncate">{p.name}</span>
                      {p.isHost && (
                        <span title="Room Host">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                      {isMe && <span className="text-[10px] text-amber-400">(You)</span>}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {p.isHost ? 'Host' : p.isReady ? 'Ready' : 'Waiting'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.isHost ? (
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-lg text-[10px] font-black uppercase">
                      Host
                    </span>
                  ) : p.isReady ? (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-medium uppercase">
                      Not Ready
                    </span>
                  )}

                  {/* Host can kick AI bots */}
                  {isHost && p.isAi && (
                    <button
                      type="button"
                      onClick={() => onRemoveAi(p.id)}
                      title="Remove Bot"
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add AI Bot (Host Only) — no hard cap */}
        {isHost && room.players.length < 10 && (
          <div className="mt-4 p-3 bg-slate-950/50 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Fill slot with Computer Bot:
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedAiDifficulty}
                onChange={(e) => setSelectedAiDifficulty(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                type="button"
                onClick={() => onAddAi(selectedAiDifficulty)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Bot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lobby Actions Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        {!isHost && me && (
          <button
            type="button"
            onClick={() => onSetReady(!me.isReady)}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              me.isReady
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {me.isReady ? 'Cancel Ready' : 'I am Ready!'}
          </button>
        )}

        {isHost && (
          <button
            type="button"
            onClick={onStartGame}
            disabled={!allPlayersReady}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
              allPlayersReady
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-glow-yellow transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            {room.players.length < room.settings.minPlayers
              ? `Waiting for Players (Min ${room.settings.minPlayers})`
              : allPlayersReady
              ? 'Start Game'
              : 'Waiting for Players to Ready Up'}
          </button>
        )}
      </div>
    </div>
  );
};
