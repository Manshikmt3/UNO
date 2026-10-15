import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';

export interface ChatMsg {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

interface ChatPanelProps {
  messages: ChatMsg[];
  myPlayerId: string;
  unreadCount: number;
  onSend: (msg: string) => void;
  onOpen: () => void; // called when panel is opened (clears unread)
  /** AI mode: show a subtle "AI players don't respond" notice */
  aiMode?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  myPlayerId,
  unreadCount,
  onSend,
  onOpen,
  aiMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      onOpen();
    }
    setIsOpen((v) => !v);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed bottom-20 right-3 sm:right-5 z-40 flex flex-col items-end gap-2">
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-72 sm:w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs text-slate-100 uppercase tracking-wider">
                Live Chat
              </span>
              {aiMode && (
                <span className="text-[9px] text-slate-500 font-medium">(Local)</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 h-56 sm:h-64"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600 text-xs">
                <MessageCircle className="w-8 h-8 opacity-40" />
                <span>No messages yet. Say hello! 👋</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.playerId === myPlayerId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    {!isMine && (
                      <span className="text-[10px] font-bold text-indigo-300 mb-0.5 px-1">
                        {msg.playerName}
                      </span>
                    )}
                    <div
                      className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs leading-relaxed break-words ${
                        msg.isSystem
                          ? 'bg-slate-800/60 text-slate-400 italic rounded-lg text-center w-full text-[11px]'
                          : isMine
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/60'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-slate-600 mt-0.5 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-700/60 bg-slate-800/60"
          >
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={200}
              placeholder="Type a message…"
              className="flex-1 bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-0"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button with Badge */}
      <button
        type="button"
        id="chat-toggle-btn"
        onClick={handleToggle}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl transition-all duration-200 border ${
          isOpen
            ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500/60 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-900/40'
        }`}
      >
        {isOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <MessageCircle className="w-4 h-4" />
        )}
        <span>{isOpen ? 'Close' : 'Chat'}</span>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
