import { GameRulesConfig, PublicGameState } from './game';
import { PlayerInfo } from './player';

export interface RoomSettings {
  maxPlayers: number;
  minPlayers: number;
  isPrivate: boolean;
  rules: GameRulesConfig;
}

export interface RoomSummary {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  playersCount: number;
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'ended';
  createdAt: number;
}

export interface RoomDetails {
  id: string;
  code: string;
  hostId: string;
  settings: RoomSettings;
  players: PlayerInfo[];
  gameState?: PublicGameState | null;
  createdAt: number;
}
