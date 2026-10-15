import {
  Card,
  CardColor,
  CARD_COLORS,
  DEFAULT_GAME_RULES,
  GameLogEntry,
  GameRulesConfig,
  PlayerInfo,
  PrivatePlayerView,
  PublicGameState,
  PublicPlayerState,
  ServerAuthoritativeGameState,
} from '@uno-arena/shared';
import { createStandardDeck, dealCards, shuffleDeck } from '../deck/deck';

/**
 * Creates a new authoritative game state from a list of players.
 */
export function createInitialGameState(
  players: PlayerInfo[],
  rules: GameRulesConfig = DEFAULT_GAME_RULES,
  customDeck?: Card[],
  gameId: string = `game_${Date.now()}`
): ServerAuthoritativeGameState {
  if (players.length < 2) {
    throw new Error('At least 2 players are required to start a game.');
  }

  let deck = customDeck ? [...customDeck] : shuffleDeck(createStandardDeck());
  const hands: Record<string, Card[]> = {};

  // Deal 7 cards to each player
  for (const player of players) {
    const { dealt, remaining } = dealCards(deck, 7);
    hands[player.id] = dealt;
    deck = remaining;
  }

  // Draw first card for discard pile.
  // Rule: If it's a Wild Draw 4, reshuffle into deck and flip another until it's not WD4.
  let topDiscard: Card;
  let discardPile: Card[] = [];

  while (true) {
    if (deck.length === 0) {
      deck = shuffleDeck(createStandardDeck());
    }
    const card = deck.shift()!;
    if (card.type === 'wild4') {
      deck.push(card);
      deck = shuffleDeck(deck);
    } else {
      topDiscard = card;
      discardPile.push(card);
      break;
    }
  }

  let direction: 1 | -1 = 1;
  let currentTurnIndex = 0;
  let activeColor: CardColor = topDiscard.color ?? CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
  const history: GameLogEntry[] = [
    {
      id: `log_init_${Date.now()}`,
      timestamp: Date.now(),
      message: `Game started with top card ${topDiscard.color ?? ''} ${topDiscard.type}${topDiscard.value !== undefined ? ' ' + topDiscard.value : ''}.`,
      type: 'system',
    },
  ];

  const publicPlayers: (PublicPlayerState & { reconnectToken?: string })[] = players.map(
    (p) => ({
      ...p,
      cardCount: hands[p.id]?.length ?? 0,
      isUno: false,
      hasCalledUno: false,
    })
  );

  const state: ServerAuthoritativeGameState = {
    id: gameId,
    status: 'in_progress',
    players: publicPlayers,
    currentTurnIndex: 0,
    direction: 1,
    topDiscard,
    activeColor,
    drawPile: deck,
    discardPile,
    drawPileCount: deck.length,
    discardPileCount: discardPile.length,
    pendingAction: null,
    winner: null,
    scores: {},
    history,
    round: 1,
    rules,
    hands,
  };

  // Handle first card special action if applicable
  if (topDiscard.type === 'skip') {
    state.currentTurnIndex = getNextPlayerIndex(0, direction, players.length);
    state.history.push({
      id: `log_first_skip_${Date.now()}`,
      timestamp: Date.now(),
      message: `${players[0].name} was skipped by starting card.`,
      type: 'system',
    });
  } else if (topDiscard.type === 'reverse') {
    if (players.length === 2) {
      // In 2-player game, Reverse acts as a Skip
      state.currentTurnIndex = getNextPlayerIndex(0, direction, players.length);
      state.history.push({
        id: `log_first_rev_skip_${Date.now()}`,
        timestamp: Date.now(),
        message: `${players[0].name} was skipped by starting Reverse card.`,
        type: 'system',
      });
    } else {
      direction = -1;
      state.direction = -1;
      state.currentTurnIndex = getNextPlayerIndex(0, direction, players.length);
      state.history.push({
        id: `log_first_rev_${Date.now()}`,
        timestamp: Date.now(),
        message: `Starting Reverse changed direction to counter-clockwise.`,
        type: 'system',
      });
    }
  } else if (topDiscard.type === 'draw2') {
    const firstPlayerId = players[0].id;
    // Deal 2 cards to player 0 and skip turn
    const { dealt, remaining } = dealCards(state.drawPile, 2);
    state.hands[firstPlayerId].push(...dealt);
    state.drawPile = remaining;
    state.drawPileCount = remaining.length;
    publicPlayers[0].cardCount = state.hands[firstPlayerId].length;
    state.currentTurnIndex = getNextPlayerIndex(0, direction, players.length);
    state.history.push({
      id: `log_first_draw2_${Date.now()}`,
      timestamp: Date.now(),
      message: `${players[0].name} drew 2 cards and was skipped by starting Draw Two.`,
      type: 'system',
    });
  } else if (topDiscard.type === 'wild') {
    // First player gets to choose color
    state.pendingAction = {
      type: 'color_selection',
      playerId: players[0].id,
      card: topDiscard,
    };
    state.history.push({
      id: `log_first_wild_${Date.now()}`,
      timestamp: Date.now(),
      message: `${players[0].name} must choose starting color.`,
      type: 'system',
    });
  }

  return state;
}

/**
 * Calculates next turn index based on direction and player count.
 */
export function getNextPlayerIndex(
  currentIndex: number,
  direction: 1 | -1,
  playerCount: number,
  steps: number = 1
): number {
  const next = (currentIndex + direction * steps) % playerCount;
  return next < 0 ? next + playerCount : next;
}

/**
 * Strips private hands and tokens from server state for public broadcast.
 */
export function projectPublicGameState(
  state: ServerAuthoritativeGameState
): PublicGameState {
  return {
    id: state.id,
    status: state.status,
    players: state.players.map(({ reconnectToken, ...publicProps }) => ({
      ...publicProps,
      cardCount: state.hands[publicProps.id]?.length ?? 0,
    })),
    currentTurnIndex: state.currentTurnIndex,
    direction: state.direction,
    topDiscard: state.topDiscard,
    activeColor: state.activeColor,
    drawPileCount: state.drawPile.length,
    discardPileCount: state.discardPile.length,
    pendingAction: state.pendingAction,
    winner: state.winner,
    scores: state.scores,
    history: state.history.slice(-30), // keep recent 30 events for UI log
    round: state.round,
    rules: state.rules,
  };
}

/**
 * Projects personalized private view for an individual player.
 */
export function projectPlayerView(
  state: ServerAuthoritativeGameState,
  playerId: string
): PrivatePlayerView {
  const publicState = projectPublicGameState(state);
  const myHand = state.hands[playerId] ?? [];

  // Can call UNO: if player has 2 cards (about to play 1) or has 1 card and hasn't called UNO yet
  const canCallUno =
    (myHand.length === 2 || myHand.length === 1) &&
    !state.players.find((p) => p.id === playerId)?.hasCalledUno;

  // Can catch UNO: any opponent who has exactly 1 card and has NOT called UNO
  const opponentMissingUno = state.players.find(
    (p) =>
      p.id !== playerId &&
      (state.hands[p.id]?.length === 1 || p.cardCount === 1) &&
      !p.hasCalledUno
  );

  return {
    ...publicState,
    myHand,
    myPlayerId: playerId,
    canCallUno,
    canCatchUnoTargetId: opponentMissingUno?.id ?? null,
  };
}
