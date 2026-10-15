export interface PlayerInfo {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isAi: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface PublicPlayerState extends PlayerInfo {
  cardCount: number;
  isUno: boolean;
  hasCalledUno: boolean;
}
