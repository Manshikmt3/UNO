import {
  Card,
  CardColor,
  CARD_COLORS,
  GameLogEntry,
  ServerAuthoritativeGameState,
} from '@uno-arena/shared';
import { shuffleDeck } from '../deck/deck';
import { isValidMove, isWildDrawFourPlayLegal } from '../rules/rules';
import { calculateRoundScores } from '../scoring/scoring';
import { getNextPlayerIndex } from '../state/state';

export interface ActionResult {
  success: boolean;
  state: ServerAuthoritativeGameState;
  error?: string;
  events?: GameLogEntry[];
}

/**
 * Ensures draw pile has enough cards by shuffling discard pile (excluding top card) if necessary.
 */
export function recycleDrawPileIfNeeded(
  state: ServerAuthoritativeGameState,
  neededCount: number = 1
): void {
  if (state.drawPile.length >= neededCount) {
    return;
  }

  // Preserve the current top discard
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  const cardsToRecycle = state.discardPile.slice(0, state.discardPile.length - 1);

  if (cardsToRecycle.length > 0) {
    const shuffled = shuffleDeck(cardsToRecycle);
    state.drawPile = [...state.drawPile, ...shuffled];
    state.discardPile = [topDiscard];
    state.drawPileCount = state.drawPile.length;
    state.discardPileCount = state.discardPile.length;

    state.history.push({
      id: `log_recycle_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      message: 'Draw pile was replenished from the discard pile.',
      type: 'system',
    });
  }
}

/**
 * Advance turn to the next player.
 */
export function advanceTurn(
  state: ServerAuthoritativeGameState,
  steps: number = 1
): void {
  state.currentTurnIndex = getNextPlayerIndex(
    state.currentTurnIndex,
    state.direction,
    state.players.length,
    steps
  );
  // Clear any temporary drawn-card pending actions
  if (state.pendingAction?.type === 'drawn_card_choice') {
    state.pendingAction = null;
  }
}

/**
 * Execute a play card action.
 */
export function executePlayCard(
  state: ServerAuthoritativeGameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor
): ActionResult {
  // Check if it's the player's turn
  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { success: false, state, error: 'It is not your turn.' };
  }

  // Check if game is in progress
  if (state.status !== 'in_progress') {
    return { success: false, state, error: 'Game is not in progress.' };
  }

  // Check if pending action blocks play
  if (state.pendingAction && state.pendingAction.type !== 'drawn_card_choice') {
    return {
      success: false,
      state,
      error: `Action blocked: awaiting ${state.pendingAction.type}.`,
    };
  }

  // Check player hand
  const playerHand = state.hands[playerId];
  if (!playerHand) {
    return { success: false, state, error: 'Player hand not found.' };
  }

  const cardIndex = playerHand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, state, error: 'Card not found in your hand.' };
  }

  const cardToPlay = playerHand[cardIndex];

  // Validate move legality
  const validation = isValidMove(cardToPlay, state.topDiscard, state.activeColor);
  if (!validation.valid) {
    return { success: false, state, error: validation.reason };
  }

  const previousActiveColor = state.activeColor;

  // If card is wild or wild4, require valid chosen color or enter color_selection pending action
  const isWildType = cardToPlay.type === 'wild' || cardToPlay.type === 'wild4';
  if (isWildType && !chosenColor) {
    // Put into pending action for color selection
    state.pendingAction = {
      type: 'color_selection',
      playerId,
      card: cardToPlay,
      previousActiveColor,
    };
    return { success: true, state };
  }

  if (chosenColor && !CARD_COLORS.includes(chosenColor)) {
    return { success: false, state, error: 'Invalid color chosen.' };
  }

  // Snapshot hand before removing card (useful for WD4 challenge legality check)
  const handBeforePlay = [...playerHand];

  // Remove card from player hand and push to discard pile
  playerHand.splice(cardIndex, 1);
  state.discardPile.push(cardToPlay);
  state.topDiscard = cardToPlay;
  state.discardPileCount = state.discardPile.length;

  const playerObj = state.players.find((p) => p.id === playerId);
  if (playerObj) {
    playerObj.cardCount = playerHand.length;
    // Check UNO state: if hand count is not 1, reset hasCalledUno
    if (playerHand.length !== 1) {
      playerObj.hasCalledUno = false;
      playerObj.isUno = false;
    } else {
      playerObj.isUno = true;
    }
  }

  // Update active color
  if (isWildType && chosenColor) {
    state.activeColor = chosenColor;
  } else if (cardToPlay.color) {
    state.activeColor = cardToPlay.color;
  }

  // Log play
  const colorStr = chosenColor ? ` (Color: ${chosenColor})` : '';
  state.history.push({
    id: `log_play_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    playerId,
    playerName: playerObj?.name ?? 'Player',
    message: `${playerObj?.name ?? 'Player'} played ${cardToPlay.color ?? ''} ${cardToPlay.type}${cardToPlay.value !== undefined ? ' ' + cardToPlay.value : ''}${colorStr}.`,
    type: 'play',
  });

  // Check Win condition
  if (playerHand.length === 0) {
    state.status = 'ended';
    const { roundScore, newScores } = calculateRoundScores(
      playerId,
      state.hands,
      state.scores
    );
    state.scores = newScores;
    state.winner = {
      playerId,
      name: playerObj?.name ?? 'Player',
      score: roundScore,
    };
    state.history.push({
      id: `log_win_${Date.now()}`,
      timestamp: Date.now(),
      playerId,
      playerName: playerObj?.name ?? 'Player',
      message: `${playerObj?.name ?? 'Player'} won the game with ${roundScore} points!`,
      type: 'win',
    });
    return { success: true, state };
  }

  // Apply card special effects
  const playerCount = state.players.length;

  if (cardToPlay.type === 'skip') {
    const skippedIndex = getNextPlayerIndex(state.currentTurnIndex, state.direction, playerCount, 1);
    const skippedPlayer = state.players[skippedIndex];
    state.history.push({
      id: `log_skip_${Date.now()}`,
      timestamp: Date.now(),
      message: `${skippedPlayer?.name ?? 'Next player'} was skipped.`,
      type: 'system',
    });
    advanceTurn(state, 2);
  } else if (cardToPlay.type === 'reverse') {
    if (playerCount === 2) {
      // In 2-player UNO, Reverse acts identically to Skip
      const skippedIndex = getNextPlayerIndex(state.currentTurnIndex, state.direction, playerCount, 1);
      const skippedPlayer = state.players[skippedIndex];
      state.history.push({
        id: `log_rev_skip_${Date.now()}`,
        timestamp: Date.now(),
        message: `${skippedPlayer?.name ?? 'Opponent'} was skipped by Reverse card.`,
        type: 'system',
      });
      advanceTurn(state, 2);
    } else {
      state.direction = (state.direction * -1) as 1 | -1;
      state.history.push({
        id: `log_rev_${Date.now()}`,
        timestamp: Date.now(),
        message: `Play direction reversed to ${state.direction === 1 ? 'clockwise' : 'counter-clockwise'}.`,
        type: 'system',
      });
      advanceTurn(state, 1);
    }
  } else if (cardToPlay.type === 'draw2') {
    const targetIndex = getNextPlayerIndex(state.currentTurnIndex, state.direction, playerCount, 1);
    const targetPlayer = state.players[targetIndex];
    recycleDrawPileIfNeeded(state, 2);
    const drawn = state.drawPile.splice(0, 2);
    state.drawPileCount = state.drawPile.length;
    state.hands[targetPlayer.id].push(...drawn);
    targetPlayer.cardCount = state.hands[targetPlayer.id].length;

    state.history.push({
      id: `log_draw2_${Date.now()}`,
      timestamp: Date.now(),
      message: `${targetPlayer?.name ?? 'Player'} drew 2 cards and was skipped.`,
      type: 'system',
    });
    advanceTurn(state, 2);
  } else if (cardToPlay.type === 'wild4') {
    const targetIndex = getNextPlayerIndex(state.currentTurnIndex, state.direction, playerCount, 1);
    const targetPlayer = state.players[targetIndex];

    if (state.rules.wd4ChallengeEnabled) {
      // Prompt next player to accept or challenge
      state.pendingAction = {
        type: 'wd4_challenge',
        playerId: targetPlayer.id,
        targetPlayerId: targetPlayer.id,
        sourcePlayerId: playerId,
        card: cardToPlay,
        previousActiveColor,
      };
      state.history.push({
        id: `log_wd4_prompt_${Date.now()}`,
        timestamp: Date.now(),
        message: `${targetPlayer?.name} can challenge ${playerObj?.name}'s Wild Draw 4 or accept.`,
        type: 'challenge',
      });
      // Do not advance turn yet; wait for challenge resolution
    } else {
      // Standard without challenge: draw 4 and skip
      recycleDrawPileIfNeeded(state, 4);
      const drawn = state.drawPile.splice(0, 4);
      state.drawPileCount = state.drawPile.length;
      state.hands[targetPlayer.id].push(...drawn);
      targetPlayer.cardCount = state.hands[targetPlayer.id].length;

      state.history.push({
        id: `log_wd4_draw_${Date.now()}`,
        timestamp: Date.now(),
        message: `${targetPlayer?.name} drew 4 cards and was skipped.`,
        type: 'system',
      });
      advanceTurn(state, 2);
    }
  } else {
    // Normal number card or simple wild card
    advanceTurn(state, 1);
  }

  // Clear any previous drawn card state
  if (state.pendingAction?.type === 'drawn_card_choice') {
    state.pendingAction = null;
  }

  return { success: true, state };
}

/**
 * Execute color choice after playing a wild card.
 */
export function executeChooseColor(
  state: ServerAuthoritativeGameState,
  playerId: string,
  chosenColor: CardColor
): ActionResult {
  if (
    !state.pendingAction ||
    state.pendingAction.type !== 'color_selection' ||
    state.pendingAction.playerId !== playerId
  ) {
    return { success: false, state, error: 'No color selection pending for you.' };
  }

  if (!CARD_COLORS.includes(chosenColor)) {
    return { success: false, state, error: 'Invalid color chosen.' };
  }

  const previousActiveColor = state.pendingAction.previousActiveColor ?? state.activeColor;
  const card = state.pendingAction.card;
  state.activeColor = chosenColor;
  state.pendingAction = null;

  const playerObj = state.players.find((p) => p.id === playerId);
  state.history.push({
    id: `log_color_chosen_${Date.now()}`,
    timestamp: Date.now(),
    playerId,
    message: `${playerObj?.name ?? 'Player'} chose active color: ${chosenColor.toUpperCase()}.`,
    type: 'color',
  });

  if (card && card.type === 'wild4') {
    const targetIndex = getNextPlayerIndex(
      state.currentTurnIndex,
      state.direction,
      state.players.length,
      1
    );
    const targetPlayer = state.players[targetIndex];

    if (state.rules.wd4ChallengeEnabled) {
      state.pendingAction = {
        type: 'wd4_challenge',
        playerId: targetPlayer.id,
        targetPlayerId: targetPlayer.id,
        sourcePlayerId: playerId,
        card,
        previousActiveColor,
      };
      return { success: true, state };
    } else {
      recycleDrawPileIfNeeded(state, 4);
      const drawn = state.drawPile.splice(0, 4);
      state.drawPileCount = state.drawPile.length;
      state.hands[targetPlayer.id].push(...drawn);
      targetPlayer.cardCount = state.hands[targetPlayer.id].length;
      advanceTurn(state, 2);
      return { success: true, state };
    }
  }

  // If normal wild, advance turn by 1
  advanceTurn(state, 1);
  return { success: true, state };
}

/**
 * Execute drawing a card from the draw pile.
 */
export function executeDrawCard(
  state: ServerAuthoritativeGameState,
  playerId: string
): ActionResult {
  const currentPlayer = state.players[state.currentTurnIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { success: false, state, error: 'It is not your turn to draw.' };
  }

  if (state.pendingAction && state.pendingAction.type !== 'drawn_card_choice') {
    return { success: false, state, error: 'Cannot draw while action is pending.' };
  }

  recycleDrawPileIfNeeded(state, 1);
  if (state.drawPile.length === 0) {
    return { success: false, state, error: 'Draw pile is completely exhausted.' };
  }

  const drawnCard = state.drawPile.shift()!;
  state.drawPileCount = state.drawPile.length;
  state.hands[playerId].push(drawnCard);
  currentPlayer.cardCount = state.hands[playerId].length;
  // If player had 1 card and drew, reset UNO flag
  if (currentPlayer.cardCount > 1) {
    currentPlayer.hasCalledUno = false;
    currentPlayer.isUno = false;
  }

  state.history.push({
    id: `log_draw_${Date.now()}`,
    timestamp: Date.now(),
    playerId,
    playerName: currentPlayer.name,
    message: `${currentPlayer.name} drew a card.`,
    type: 'draw',
  });

  // Check if drawn card is playable under draw-and-play rule
  if (state.rules.allowDrawAndPlay) {
    const canPlayDrawn = isValidMove(drawnCard, state.topDiscard, state.activeColor).valid;
    if (canPlayDrawn) {
      state.pendingAction = {
        type: 'drawn_card_choice',
        playerId,
        drawnCard,
      };
      return { success: true, state };
    }
  }

  // Not playable or draw-and-play disabled -> pass to next player
  advanceTurn(state, 1);
  return { success: true, state };
}

/**
 * Handle player deciding whether to play the card they just drew.
 */
export function executePlayDrawnCard(
  state: ServerAuthoritativeGameState,
  playerId: string,
  play: boolean,
  chosenColor?: CardColor
): ActionResult {
  if (
    !state.pendingAction ||
    state.pendingAction.type !== 'drawn_card_choice' ||
    state.pendingAction.playerId !== playerId
  ) {
    return { success: false, state, error: 'No drawn card decision pending for you.' };
  }

  const drawnCard = state.pendingAction.drawnCard!;
  state.pendingAction = null;

  if (play) {
    return executePlayCard(state, playerId, drawnCard.id, chosenColor);
  } else {
    // Pass turn to next player
    state.history.push({
      id: `log_pass_${Date.now()}`,
      timestamp: Date.now(),
      playerId,
      message: `${state.players[state.currentTurnIndex]?.name} kept drawn card and passed.`,
      type: 'system',
    });
    advanceTurn(state, 1);
    return { success: true, state };
  }
}

/**
 * Handle calling UNO.
 */
export function executeCallUno(
  state: ServerAuthoritativeGameState,
  playerId: string
): ActionResult {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, state, error: 'Player not found.' };
  }

  const hand = state.hands[playerId];
  if (!hand || (hand.length !== 1 && hand.length !== 2)) {
    return {
      success: false,
      state,
      error: 'You can only call UNO when you have 1 or 2 cards remaining.',
    };
  }

  player.hasCalledUno = true;
  player.isUno = true;

  state.history.push({
    id: `log_uno_${Date.now()}`,
    timestamp: Date.now(),
    playerId,
    playerName: player.name,
    message: `🔥 ${player.name} called UNO!`,
    type: 'uno',
  });

  return { success: true, state };
}

/**
 * Catch a player who failed to call UNO.
 */
export function executeCatchUno(
  state: ServerAuthoritativeGameState,
  catcherId: string,
  targetPlayerId: string
): ActionResult {
  const targetPlayer = state.players.find((p) => p.id === targetPlayerId);
  const catcherPlayer = state.players.find((p) => p.id === catcherId);

  if (!targetPlayer || !catcherPlayer) {
    return { success: false, state, error: 'Player not found.' };
  }

  const targetHand = state.hands[targetPlayerId];
  if (!targetHand || targetHand.length !== 1) {
    return {
      success: false,
      state,
      error: 'Target player does not have exactly 1 card.',
    };
  }

  if (targetPlayer.hasCalledUno) {
    return {
      success: false,
      state,
      error: `${targetPlayer.name} already called UNO safely!`,
    };
  }

  // Apply penalty: target player draws penalty cards (default 2)
  const penaltyCount = state.rules.drawCardPenaltyOnCatchUno;
  recycleDrawPileIfNeeded(state, penaltyCount);
  const penaltyCards = state.drawPile.splice(0, penaltyCount);
  state.drawPileCount = state.drawPile.length;
  targetHand.push(...penaltyCards);
  targetPlayer.cardCount = targetHand.length;
  targetPlayer.hasCalledUno = false;
  targetPlayer.isUno = false;

  state.history.push({
    id: `log_catch_uno_${Date.now()}`,
    timestamp: Date.now(),
    message: `🚨 ${catcherPlayer.name} caught ${targetPlayer.name} without calling UNO! ${targetPlayer.name} draws ${penaltyCount} penalty cards.`,
    type: 'system',
  });

  return { success: true, state };
}

/**
 * Handle Wild Draw Four challenge resolution.
 */
export function executeChallengeWd4(
  state: ServerAuthoritativeGameState,
  challengerId: string,
  challenge: boolean
): ActionResult {
  if (
    !state.pendingAction ||
    state.pendingAction.type !== 'wd4_challenge' ||
    state.pendingAction.playerId !== challengerId
  ) {
    return { success: false, state, error: 'No WD4 challenge pending for you.' };
  }

  const { sourcePlayerId, targetPlayerId, previousActiveColor } = state.pendingAction;
  const offender = state.players.find((p) => p.id === sourcePlayerId);
  const challenger = state.players.find((p) => p.id === targetPlayerId);

  state.pendingAction = null;

  if (!offender || !challenger) {
    advanceTurn(state, 2);
    return { success: true, state };
  }

  if (!challenge) {
    // Challenger accepted: draws 4 cards and is skipped
    recycleDrawPileIfNeeded(state, 4);
    const drawn = state.drawPile.splice(0, 4);
    state.drawPileCount = state.drawPile.length;
    state.hands[challenger.id].push(...drawn);
    challenger.cardCount = state.hands[challenger.id].length;

    state.history.push({
      id: `log_wd4_accept_${Date.now()}`,
      timestamp: Date.now(),
      message: `${challenger.name} accepted the Wild Draw 4 and drew 4 cards.`,
      type: 'challenge',
    });
    advanceTurn(state, 2);
    return { success: true, state };
  }

  // Challenge issued!
  // Check if offender had a card matching the active color *before* playing WD4.
  // Note: offender's current hand contains their remaining cards.
  const offenderHand = state.hands[offender.id];
  const colorToCheck = previousActiveColor ?? state.activeColor;
  const isIllegal = isWildDrawFourPlayLegal(offenderHand, colorToCheck) === false;

  if (isIllegal) {
    // Offender is guilty! Offender draws 4 cards as penalty. Challenger does NOT draw and plays their turn!
    recycleDrawPileIfNeeded(state, 4);
    const penaltyCards = state.drawPile.splice(0, 4);
    state.drawPileCount = state.drawPile.length;
    offenderHand.push(...penaltyCards);
    offender.cardCount = offenderHand.length;

    state.history.push({
      id: `log_wd4_guilty_${Date.now()}`,
      timestamp: Date.now(),
      message: `🎯 Challenge successful! ${offender.name} played WD4 illegally and draws 4 cards. ${challenger.name} takes turn normally!`,
      type: 'challenge',
    });
    advanceTurn(state, 1);
  } else {
    // Offender was innocent! Challenger draws 6 cards (4 + 2 penalty) and is skipped.
    recycleDrawPileIfNeeded(state, 6);
    const penaltyCards = state.drawPile.splice(0, 6);
    state.drawPileCount = state.drawPile.length;
    state.hands[challenger.id].push(...penaltyCards);
    challenger.cardCount = state.hands[challenger.id].length;

    state.history.push({
      id: `log_wd4_innocent_${Date.now()}`,
      timestamp: Date.now(),
      message: `❌ Challenge failed! ${offender.name} played WD4 legally. ${challenger.name} draws 6 cards (4 + 2 penalty) and is skipped.`,
      type: 'challenge',
    });
    advanceTurn(state, 2);
  }

  return { success: true, state };
}
