import { Card, CardColor } from './cards';
import { PublicPlayerState } from './player';

export type GameDirection = 1 | -1;

export type GameStatus = 'waiting' | 'in_progress' | 'ended';

export type TurnPhase =
  | 'normal'
  | 'color_selection'
  | 'wd4_challenge'
  | 'drawn_card_choice';

export interface PendingAction {
  type: TurnPhase;
  playerId: string;
  card?: Card;
  targetPlayerId?: string;
  sourcePlayerId?: string;
  drawnCard?: Card;
  previousActiveColor?: CardColor;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  playerId?: string;
  playerName?: string;
  message: string;
  type: 'play' | 'draw' | 'color' | 'uno' | 'challenge' | 'system' | 'win';
}

export interface GameRulesConfig {
  allowDrawAndPlay: boolean;
  wd4ChallengeEnabled: boolean;
  unoPenaltyCards: number;
  drawCardPenaltyOnCatchUno: number;
  turnTimeoutSeconds: number;
}

export const DEFAULT_GAME_RULES: GameRulesConfig = {
  allowDrawAndPlay: true,
  wd4ChallengeEnabled: true,
  unoPenaltyCards: 2,
  drawCardPenaltyOnCatchUno: 2,
  turnTimeoutSeconds: 30,
};

export interface PublicGameState {
  id: string;
  status: GameStatus;
  players: PublicPlayerState[];
  currentTurnIndex: number;
  direction: GameDirection;
  topDiscard: Card;
  activeColor: CardColor;
  drawPileCount: number;
  discardPileCount: number;
  pendingAction?: PendingAction | null;
  winner?: {
    playerId: string;
    name: string;
    score: number;
  } | null;
  scores: Record<string, number>;
  history: GameLogEntry[];
  round: number;
  rules: GameRulesConfig;
}

export interface PrivatePlayerView extends PublicGameState {
  myHand: Card[];
  myPlayerId: string;
  canCallUno: boolean;
  canCatchUnoTargetId?: string | null;
}

export interface ServerAuthoritativeGameState extends Omit<PublicGameState, 'players'> {
  drawPile: Card[];
  discardPile: Card[];
  hands: Record<string, Card[]>; // Player ID -> Cards
  players: (PublicPlayerState & { reconnectToken?: string })[];
}
