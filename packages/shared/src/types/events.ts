import { Card, CardColor } from './cards';
import { PublicGameState } from './game';
import { RoomDetails, RoomSettings } from './room';

export interface CreateRoomPayload {
  playerName: string;
  avatar: string;
  settings?: Partial<RoomSettings>;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  avatar: string;
}

export interface ReconnectRoomPayload {
  roomId: string;
  playerId: string;
  reconnectToken: string;
}

export interface SetReadyPayload {
  isReady: boolean;
}

export interface PlayCardPayload {
  cardId: string;
  chosenColor?: CardColor;
}

export interface PlayDrawnCardPayload {
  play: boolean;
  chosenColor?: CardColor;
}

export interface ChooseColorPayload {
  color: CardColor;
}

export interface CatchUnoPayload {
  targetPlayerId: string;
}

export interface ChallengeWd4Payload {
  challenge: boolean;
}

export interface AddAiPlayerPayload {
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface RemoveAiPlayerPayload {
  playerId: string;
}

export interface KickPlayerPayload {
  targetPlayerId: string;
}

export interface SendChatPayload {
  message: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

// Client-to-Server event interface mapping
export interface ClientToServerEvents {
  createRoom: (payload: CreateRoomPayload) => void;
  joinRoom: (payload: JoinRoomPayload) => void;
  reconnectRoom: (payload: ReconnectRoomPayload) => void;
  setReady: (payload: SetReadyPayload) => void;
  startGame: () => void;
  playCard: (payload: PlayCardPayload) => void;
  drawCard: () => void;
  playDrawnCard: (payload: PlayDrawnCardPayload) => void;
  chooseColor: (payload: ChooseColorPayload) => void;
  callUno: () => void;
  catchUno: (payload: CatchUnoPayload) => void;
  challengeWd4: (payload: ChallengeWd4Payload) => void;
  leaveRoom: () => void;
  requestRematch: () => void;
  addAiPlayer: (payload: AddAiPlayerPayload) => void;
  removeAiPlayer: (payload: RemoveAiPlayerPayload) => void;
  kickPlayer: (payload: KickPlayerPayload) => void;
  sendChat: (payload: SendChatPayload) => void;
}

// Server-to-Client event payloads
export interface RoomCreatedPayload {
  room: RoomDetails;
  reconnectToken: string;
  playerId: string;
}

export interface RoomJoinedPayload {
  room: RoomDetails;
  reconnectToken: string;
  playerId: string;
}

export interface ReconnectedPayload {
  room: RoomDetails;
  gameState?: PublicGameState | null;
  myHand: Card[];
  playerId: string;
}

export interface GameStartedPayload {
  gameState: PublicGameState;
  myHand: Card[];
}

export interface CardPlayedEventPayload {
  playerId: string;
  playerName: string;
  card: Card;
  chosenColor?: CardColor;
}

export interface CardDrawnEventPayload {
  playerId: string;
  playerName: string;
  count: number;
}

export interface ChallengeResolvedEventPayload {
  challengerId: string;
  challengedId: string;
  success: boolean;
  cardsDrawn: number;
}

export interface GameOverEventPayload {
  winnerId: string;
  winnerName: string;
  score: number;
  scores: Record<string, number>;
}

// Server-to-Client event interface mapping
export interface ServerToClientEvents {
  roomCreated: (payload: RoomCreatedPayload) => void;
  roomJoined: (payload: RoomJoinedPayload) => void;
  roomUpdated: (payload: { room: RoomDetails }) => void;
  reconnected: (payload: ReconnectedPayload) => void;
  gameStarted: (payload: GameStartedPayload) => void;
  gameStateUpdated: (payload: { gameState: PublicGameState }) => void;
  yourHandUpdated: (payload: { hand: Card[] }) => void;
  cardPlayed: (payload: CardPlayedEventPayload) => void;
  cardDrawn: (payload: CardDrawnEventPayload) => void;
  turnChanged: (payload: { currentTurnIndex: number; playerId: string }) => void;
  unoCalled: (payload: { playerId: string; playerName: string }) => void;
  unoPenaltyApplied: (payload: {
    playerId: string;
    playerName: string;
    penaltyCards: number;
    caughtBy?: string;
  }) => void;
  challengeResolved: (payload: ChallengeResolvedEventPayload) => void;
  playerDisconnected: (payload: { playerId: string; playerName: string }) => void;
  playerReconnected: (payload: { playerId: string; playerName: string }) => void;
  playerLeft: (payload: { playerId: string; playerName: string; newHostId?: string }) => void;
  gameOver: (payload: GameOverEventPayload) => void;
  actionRejected: (payload: { reason: string; action?: string }) => void;
  errorNotification: (payload: { code: string; message: string }) => void;
  rematchRequested: (payload: { playerId: string; playerName: string }) => void;
  chatReceived: (payload: ChatMessage) => void;
}
