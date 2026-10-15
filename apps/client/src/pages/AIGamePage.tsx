import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardColor } from '@uno-arena/shared';
import { ActiveColorBadge } from '../components/game/ActiveColorBadge';
import { CatchUnoButton } from '../components/game/CatchUnoButton';
import { ChallengeModal } from '../components/game/ChallengeModal';
import { ChatPanel } from '../components/game/ChatPanel';
import { ColorPickerModal } from '../components/game/ColorPickerModal';
import { DiscardPile } from '../components/game/DiscardPile';
import { DrawnCardChoiceModal } from '../components/game/DrawnCardChoiceModal';
import { DrawPile } from '../components/game/DrawPile';
import { GameOverModal } from '../components/game/GameOverModal';
import { Hand } from '../components/game/Hand';
import { CircularPlayerLayout } from '../components/game/CircularPlayerLayout';
import { UnoButton } from '../components/game/UnoButton';
import { useAIChat } from '../hooks/useAIChat';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useAIGameStore } from '../stores/useAIGameStore';
import { useGameSettingsStore } from '../stores/useGameSettingsStore';
import { RotateCw, ArrowLeft, AlertCircle } from 'lucide-react';

export const AIGamePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    playerView,
    humanPlayerId,
    isAiThinking,
    aiThinkingName,
    errorToast,
    startNewGame,
    playCard,
    drawCard,
    playDrawnCard,
    chooseColor,
    callUno,
    catchUno,
    challengeWd4,
    rematch,
    clearError,
  } = useAIGameStore();

  const { playerName, avatar, aiOpponentCount, preferredDifficulty } = useGameSettingsStore();
  const sfx = useSoundEffects();

  const [pendingCardForColor, setPendingCardForColor] = useState<Card | null>(null);

  // Derive bot names for AI chat
  const botNames = useMemo(() => {
    if (!playerView) return [];
    return playerView.players
      .filter((p) => p.id !== humanPlayerId)
      .map((p) => p.name);
  }, [playerView, humanPlayerId]);

  const { messages: chatMessages, unreadCount: chatUnread, sendMessage: sendChat, clearUnread: clearChatUnread } =
    useAIChat(humanPlayerId, playerName, botNames);

  // If no game is active on load, initialize one
  useEffect(() => {
    if (!playerView) {
      startNewGame(playerName, avatar, aiOpponentCount, preferredDifficulty);
    }
  }, [playerView, startNewGame, playerName, avatar, aiOpponentCount, preferredDifficulty]);

  // Audio triggers based on game over
  useEffect(() => {
    if (playerView?.winner) {
      sfx.playWinSound();
    }
  }, [playerView?.winner]);

  if (!playerView) {
    return (
      <div className="min-h-screen felt-radial flex items-center justify-center text-slate-300">
        Loading Arena...
      </div>
    );
  }

  const {
    players,
    currentTurnIndex,
    direction,
    topDiscard,
    activeColor,
    drawPileCount,
    discardPileCount,
    myHand,
    canCallUno,
    canCatchUnoTargetId,
    pendingAction,
  } = playerView;

  const currentTurnPlayer = players[currentTurnIndex];
  const isMyTurn = currentTurnPlayer?.id === humanPlayerId;
  const myPlayerObj = players.find((p) => p.id === humanPlayerId);


  const handlePlayCard = (card: Card) => {
    if (card.type === 'wild' || card.type === 'wild4') {
      setPendingCardForColor(card);
      sfx.playWildSound();
    } else {
      if (card.type === 'skip' || card.type === 'reverse' || card.type === 'draw2') {
        sfx.playSpecialCardSound();
      } else {
        sfx.playCardSound();
      }
      playCard(card.id);
    }
  };

  const handleSelectColor = (color: CardColor) => {
    if (pendingCardForColor) {
      playCard(pendingCardForColor.id, color);
      setPendingCardForColor(null);
    } else if (pendingAction?.type === 'color_selection') {
      chooseColor(color);
    }
  };

  const handleDraw = () => {
    sfx.playDrawSound();
    drawCard();
  };

  const handleCallUno = () => {
    sfx.playUnoSound();
    callUno();
  };

  const handleCatchUno = (targetId: string) => {
    sfx.playSpecialCardSound();
    catchUno(targetId);
  };

  const showChallengeModal =
    pendingAction?.type === 'wd4_challenge' && pendingAction.playerId === humanPlayerId;

  const showDrawnCardModal =
    pendingAction?.type === 'drawn_card_choice' && pendingAction.playerId === humanPlayerId;

  const showColorPicker =
    !!pendingCardForColor ||
    (pendingAction?.type === 'color_selection' && pendingAction.playerId === humanPlayerId);

  return (
    <div className="relative min-h-[calc(100vh-60px)] felt-radial flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden">
      {/* Top Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-2 pt-1 pb-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-bold transition-all shadow"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>

        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-full shadow"
            title={`Direction: ${direction === 1 ? 'Clockwise' : 'Counter-Clockwise'}`}
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-amber-400 transform transition-transform ${
                direction === -1 ? '-scale-x-100' : ''
              }`}
            />
            <span className="text-[11px] font-semibold hidden sm:inline">
              {direction === 1 ? 'Clockwise' : 'Counter-Clockwise'}
            </span>
          </div>
          <ActiveColorBadge color={activeColor} />
        </div>
      </div>

      {/* Error Toast */}
      {errorToast && (
        <div className="max-w-md mx-auto mb-2 px-4 py-2 bg-red-950/90 border border-red-500/60 rounded-xl text-red-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button type="button" onClick={clearError} className="ml-3 text-red-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Player table */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex items-center justify-center py-2">
        <CircularPlayerLayout
          players={players}
          humanPlayerId={humanPlayerId}
          currentTurnPlayerId={currentTurnPlayer?.id}
          isAiThinking={isAiThinking}
          aiThinkingName={aiThinkingName}
        >
          {/* Center Table — Draw/Discard Piles + UNO actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 sm:gap-8 p-4 sm:p-6 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-2xl">
              <DrawPile
                count={drawPileCount}
                isMyTurn={isMyTurn}
                onDraw={handleDraw}
                disabled={isAiThinking}
              />
              <DiscardPile topCard={topDiscard} count={discardPileCount} />
            </div>
            <div className="flex items-center gap-2">
              <UnoButton
                canCallUno={canCallUno}
                onCallUno={handleCallUno}
                hasCalledUno={myPlayerObj?.hasCalledUno}
              />
              <CatchUnoButton
                targetPlayerId={canCatchUnoTargetId ?? null}
                onCatch={handleCatchUno}
              />
            </div>
          </div>
        </CircularPlayerLayout>
      </div>

      {/* Human Player Hand */}
      <div className="w-full">
        <Hand
          cards={myHand}
          topDiscard={topDiscard}
          activeColor={activeColor}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard}
          disabled={isAiThinking}
        />
      </div>

      {/* Modals */}
      <ColorPickerModal isOpen={showColorPicker} onSelectColor={handleSelectColor} />

      <ChallengeModal
        isOpen={showChallengeModal}
        onDecision={(challenge) => challengeWd4(challenge)}
        offenderName={players.find((p) => p.id === pendingAction?.sourcePlayerId)?.name}
      />

      <DrawnCardChoiceModal
        isOpen={showDrawnCardModal}
        drawnCard={pendingAction?.drawnCard ?? null}
        onPlay={() => playDrawnCard(true)}
        onPass={() => playDrawnCard(false)}
      />

      <GameOverModal
        isOpen={playerView.status === 'ended'}
        gameState={playerView}
        onRematch={rematch}
        onReturnHome={() => navigate('/')}
      />

      {/* Live Chat */}
      <ChatPanel
        messages={chatMessages}
        myPlayerId={humanPlayerId}
        unreadCount={chatUnread}
        onSend={sendChat}
        onOpen={clearChatUnread}
        aiMode
      />
    </div>
  );
};
