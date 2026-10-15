import { create } from 'zustand';
import {
  Card,
  CardColor,
  DEFAULT_GAME_RULES,
  PlayerInfo,
  PrivatePlayerView,
  ServerAuthoritativeGameState,
} from '@uno-arena/shared';
import {
  chooseAIMove,
  createInitialGameState,
  executeCallUno,
  executeCatchUno,
  executeChallengeWd4,
  executeChooseColor,
  executeDrawCard,
  executePlayCard,
  executePlayDrawnCard,
  projectPlayerView,
} from '@uno-arena/game-engine';

interface AIGameState {
  internalState: ServerAuthoritativeGameState | null;
  playerView: PrivatePlayerView | null;
  humanPlayerId: string;
  isAiThinking: boolean;
  aiThinkingName: string | null;
  errorToast: string | null;

  startNewGame: (
    humanName: string,
    humanAvatar: string,
    aiCount: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => void;
  playCard: (cardId: string, chosenColor?: CardColor) => void;
  drawCard: () => void;
  playDrawnCard: (play: boolean, chosenColor?: CardColor) => void;
  chooseColor: (color: CardColor) => void;
  callUno: () => void;
  catchUno: (targetPlayerId: string) => void;
  challengeWd4: (challenge: boolean) => void;
  rematch: () => void;
  clearError: () => void;
}

export const useAIGameStore = create<AIGameState>((set, get) => {
  const runAiTurnLoop = async () => {
    let { internalState, humanPlayerId } = get();
    if (!internalState || internalState.status !== 'in_progress') return;

    let currentTurnIndex = internalState.currentTurnIndex;
    let activePlayer = internalState.players[currentTurnIndex];

    while (
      internalState &&
      internalState.status === 'in_progress' &&
      ((activePlayer && activePlayer.isAi) ||
        (internalState.pendingAction &&
          internalState.players.find((p) => p.id === internalState!.pendingAction?.playerId)?.isAi))
    ) {
      const actingAi =
        internalState.pendingAction &&
        internalState.players.find((p) => p.id === internalState!.pendingAction?.playerId)?.isAi
          ? internalState.players.find((p) => p.id === internalState!.pendingAction?.playerId)!
          : activePlayer;

      set({ isAiThinking: true, aiThinkingName: actingAi.name });

      // Realistic thinking delay between 700ms - 1100ms
      await new Promise((resolve) => setTimeout(resolve, 850));

      // Re-fetch state in case something changed
      internalState = get().internalState;
      if (!internalState || internalState.status !== 'in_progress') break;

      const aiHand = internalState.hands[actingAi.id] ?? [];
      const publicState = projectPlayerView(internalState, humanPlayerId);
      const decision = chooseAIMove(
        publicState,
        actingAi.id,
        aiHand,
        actingAi.aiDifficulty ?? 'medium'
      );

      if (decision.callUno) {
        executeCallUno(internalState, actingAi.id);
      }

      if (decision.type === 'catch_uno' && decision.targetPlayerId) {
        executeCatchUno(internalState, actingAi.id, decision.targetPlayerId);
      } else if (decision.type === 'color' && decision.chosenColor) {
        executeChooseColor(internalState, actingAi.id, decision.chosenColor);
      } else if (decision.type === 'challenge' && decision.challenge !== undefined) {
        executeChallengeWd4(internalState, actingAi.id, decision.challenge);
      } else if (decision.type === 'drawn_choice') {
        executePlayDrawnCard(internalState, actingAi.id, !!decision.play, decision.chosenColor);
      } else if (decision.type === 'play' && decision.cardId) {
        executePlayCard(internalState, actingAi.id, decision.cardId, decision.chosenColor);
      } else if (decision.type === 'draw') {
        executeDrawCard(internalState, actingAi.id);
      }

      const updatedView = projectPlayerView(internalState, humanPlayerId);
      set({
        internalState: { ...internalState },
        playerView: updatedView,
      });

      if ((internalState.status as string) === 'ended') break;

      currentTurnIndex = internalState.currentTurnIndex;
      activePlayer = internalState.players[currentTurnIndex];
    }

    set({ isAiThinking: false, aiThinkingName: null });
  };

  return {
    internalState: null,
    playerView: null,
    humanPlayerId: 'human_player',
    isAiThinking: false,
    aiThinkingName: null,
    errorToast: null,

    startNewGame: (humanName, humanAvatar, aiCount, difficulty) => {
      const humanId = 'human_player';
      const aiBots: PlayerInfo[] = [];
      const botNames = ['ByteBot', 'CyberAce', 'NeoUno', 'PixelPro', 'AlphaBot', 'TurboMind', 'CardShark', 'ZeroBot', 'HyperAce'];
      const botAvatars = ['robot', 'fox', 'bear', 'wolf', 'lion', 'tiger', 'owl', 'snake', 'eagle'];

      for (let i = 0; i < aiCount; i++) {
        aiBots.push({
          id: `ai_${i + 1}`,
          name: `${botNames[i] || `Bot ${i + 1}`} (${difficulty.toUpperCase()})`,
          avatar: botAvatars[i] || 'robot',
          isHost: false,
          isReady: true,
          isConnected: true,
          isAi: true,
          aiDifficulty: difficulty,
        });
      }

      const players: PlayerInfo[] = [
        {
          id: humanId,
          name: humanName.trim() || 'Player 1',
          avatar: humanAvatar,
          isHost: true,
          isReady: true,
          isConnected: true,
          isAi: false,
        },
        ...aiBots,
      ];

      const internalState = createInitialGameState(players, DEFAULT_GAME_RULES);
      const playerView = projectPlayerView(internalState, humanId);

      set({
        internalState,
        playerView,
        humanPlayerId: humanId,
        isAiThinking: false,
        aiThinkingName: null,
        errorToast: null,
      });

      // If initial card made an AI move first, trigger loop
      runAiTurnLoop();
    },

    playCard: (cardId, chosenColor) => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executePlayCard(internalState, humanPlayerId, cardId, chosenColor);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Invalid card play.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView, errorToast: null });

      runAiTurnLoop();
    },

    drawCard: () => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executeDrawCard(internalState, humanPlayerId);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Cannot draw card.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView, errorToast: null });

      runAiTurnLoop();
    },

    playDrawnCard: (play, chosenColor) => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executePlayDrawnCard(internalState, humanPlayerId, play, chosenColor);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Action rejected.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView, errorToast: null });

      runAiTurnLoop();
    },

    chooseColor: (color) => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executeChooseColor(internalState, humanPlayerId, color);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Cannot choose color.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView, errorToast: null });

      runAiTurnLoop();
    },

    callUno: () => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executeCallUno(internalState, humanPlayerId);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Cannot call UNO now.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView });
    },

    catchUno: (targetPlayerId) => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executeCatchUno(internalState, humanPlayerId, targetPlayerId);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Catch UNO failed.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView });
    },

    challengeWd4: (challenge) => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const result = executeChallengeWd4(internalState, humanPlayerId, challenge);
      if (!result.success) {
        set({ errorToast: result.error ?? 'Challenge failed.' });
        return;
      }

      const playerView = projectPlayerView(internalState, humanPlayerId);
      set({ internalState: { ...internalState }, playerView, errorToast: null });

      runAiTurnLoop();
    },

    rematch: () => {
      const { internalState, humanPlayerId } = get();
      if (!internalState) return;

      const players = internalState.players.map(({ reconnectToken, ...info }) => info);
      const newState = createInitialGameState(players, internalState.rules);
      const playerView = projectPlayerView(newState, humanPlayerId);

      set({ internalState: newState, playerView, errorToast: null });
      runAiTurnLoop();
    },

    clearError: () => set({ errorToast: null }),
  };
});
