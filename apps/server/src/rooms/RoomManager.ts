import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  DEFAULT_GAME_RULES,
  PlayerInfo,
  RoomDetails,
  RoomSettings,
  ServerAuthoritativeGameState,
} from '@uno-arena/shared';
import { createInitialGameState } from '@uno-arena/game-engine';
import { config } from '../config';

export interface PlayerSession extends PlayerInfo {
  socketId: string | null;
  reconnectToken: string;
  disconnectTimeout?: NodeJS.Timeout;
}

export interface RoomInstance {
  id: string;
  code: string;
  hostId: string;
  settings: RoomSettings;
  players: Map<string, PlayerSession>;
  gameState: ServerAuthoritativeGameState | null;
  actionQueue: Promise<void>;
  rematchVotes: Set<string>;
  createdAt: number;
}

export class RoomManager {
  private roomsById = new Map<string, RoomInstance>();
  private roomsByCode = new Map<string, RoomInstance>();
  private socketToPlayer = new Map<string, { roomId: string; playerId: string }>();

  /**
   * Generates a 6-character clean uppercase alphanumeric room code.
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.roomsByCode.has(code));
    return code;
  }

  /**
   * Serializes operations per room to prevent race conditions.
   */
  public enqueueAction<T>(roomId: string, action: () => T | Promise<T>): Promise<T> {
    const room = this.roomsById.get(roomId);
    if (!room) {
      return Promise.reject(new Error('Room not found.'));
    }

    const nextAction = room.actionQueue.then(() => action());
    room.actionQueue = nextAction.then(
      () => {},
      () => {}
    );
    return nextAction;
  }

  public createRoom(
    playerName: string,
    avatar: string,
    settings?: Partial<RoomSettings>,
    socketId: string = ''
  ): { room: RoomInstance; player: PlayerSession; reconnectToken: string } {
    const roomId = uuidv4();
    const code = this.generateRoomCode();
    const playerId = uuidv4();
    const reconnectToken = uuidv4();

    const initialSettings: RoomSettings = {
      maxPlayers: settings?.maxPlayers ?? config.roomMaxPlayers,
      minPlayers: settings?.minPlayers ?? config.roomMinPlayers,
      isPrivate: settings?.isPrivate ?? true,
      rules: {
        ...DEFAULT_GAME_RULES,
        ...settings?.rules,
      },
    };

    const hostPlayer: PlayerSession = {
      id: playerId,
      name: playerName.trim(),
      avatar,
      isHost: true,
      isReady: true,
      isConnected: true,
      isAi: false,
      socketId,
      reconnectToken,
    };

    const playersMap = new Map<string, PlayerSession>();
    playersMap.set(playerId, hostPlayer);

    const roomInstance: RoomInstance = {
      id: roomId,
      code,
      hostId: playerId,
      settings: initialSettings,
      players: playersMap,
      gameState: null,
      actionQueue: Promise.resolve(),
      rematchVotes: new Set(),
      createdAt: Date.now(),
    };

    this.roomsById.set(roomId, roomInstance);
    this.roomsByCode.set(code, roomInstance);

    if (socketId) {
      this.socketToPlayer.set(socketId, { roomId, playerId });
    }

    return { room: roomInstance, player: hostPlayer, reconnectToken };
  }

  public joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string,
    socketId: string = ''
  ): { room: RoomInstance; player: PlayerSession; reconnectToken: string } {
    const code = roomCode.trim().toUpperCase();
    const room = this.roomsByCode.get(code);

    if (!room) {
      throw new Error(`Room with code "${code}" does not exist.`);
    }

    if (room.gameState && room.gameState.status === 'in_progress') {
      throw new Error('Game is already in progress in this room.');
    }

    if (room.players.size >= room.settings.maxPlayers) {
      throw new Error(`Room is full (maximum ${room.settings.maxPlayers} players).`);
    }

    const playerId = uuidv4();
    const reconnectToken = uuidv4();

    const newPlayer: PlayerSession = {
      id: playerId,
      name: playerName.trim(),
      avatar,
      isHost: false,
      isReady: false,
      isConnected: true,
      isAi: false,
      socketId,
      reconnectToken,
    };

    room.players.set(playerId, newPlayer);

    if (socketId) {
      this.socketToPlayer.set(socketId, { roomId: room.id, playerId });
    }

    return { room, player: newPlayer, reconnectToken };
  }

  public reconnect(
    roomId: string,
    playerId: string,
    reconnectToken: string,
    newSocketId: string
  ): { room: RoomInstance; player: PlayerSession } {
    const room = this.roomsById.get(roomId);
    if (!room) {
      throw new Error('Room does not exist or has expired.');
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error('Player not found in this room.');
    }

    if (player.reconnectToken !== reconnectToken) {
      throw new Error('Invalid reconnection credentials.');
    }

    // Clear any disconnect cleanup timeout
    if (player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
      player.disconnectTimeout = undefined;
    }

    // Remove old socket mapping if present
    if (player.socketId) {
      this.socketToPlayer.delete(player.socketId);
    }

    player.socketId = newSocketId;
    player.isConnected = true;
    this.socketToPlayer.set(newSocketId, { roomId, playerId });

    // Update in-game player state if game active
    if (room.gameState) {
      const pInGame = room.gameState.players.find((p) => p.id === playerId);
      if (pInGame) {
        pInGame.isConnected = true;
      }
    }

    return { room, player };
  }

  public setReady(roomId: string, playerId: string, isReady: boolean): RoomInstance {
    const room = this.roomsById.get(roomId);
    if (!room) {
      throw new Error('Room not found.');
    }

    const player = room.players.get(playerId);
    if (!player) {
      throw new Error('Player not found.');
    }

    player.isReady = isReady;
    return room;
  }

  public addAiPlayer(
    roomId: string,
    hostId: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): { room: RoomInstance; aiPlayer: PlayerSession } {
    const room = this.roomsById.get(roomId);
    if (!room) throw new Error('Room not found.');
    if (room.hostId !== hostId) throw new Error('Only the room host can add AI players.');
    if (room.gameState && room.gameState.status === 'in_progress') {
      throw new Error('Cannot add AI while game is in progress.');
    }
    if (room.players.size >= room.settings.maxPlayers) {
      throw new Error('Room is already full.');
    }

    const aiNumber = Array.from(room.players.values()).filter((p) => p.isAi).length + 1;
    const aiId = `ai_${uuidv4().substring(0, 8)}`;
    const aiNames = ['ByteBot', 'CyberAce', 'PixelPro', 'NeoUno'];
    const aiName = aiNames[aiNumber - 1] || `AI Bot ${aiNumber}`;

    const aiPlayer: PlayerSession = {
      id: aiId,
      name: `${aiName} (${difficulty.toUpperCase()})`,
      avatar: 'robot',
      isHost: false,
      isReady: true,
      isConnected: true,
      isAi: true,
      aiDifficulty: difficulty,
      socketId: null,
      reconnectToken: uuidv4(),
    };

    room.players.set(aiId, aiPlayer);
    return { room, aiPlayer };
  }

  public removeAiPlayer(roomId: string, hostId: string, aiId: string): RoomInstance {
    const room = this.roomsById.get(roomId);
    if (!room) throw new Error('Room not found.');
    if (room.hostId !== hostId) throw new Error('Only the room host can remove AI players.');
    if (room.gameState && room.gameState.status === 'in_progress') {
      throw new Error('Cannot remove players while game is in progress.');
    }

    const player = room.players.get(aiId);
    if (!player || !player.isAi) {
      throw new Error('AI player not found.');
    }

    room.players.delete(aiId);
    return room;
  }

  public startGame(roomId: string, hostId: string): RoomInstance {
    const room = this.roomsById.get(roomId);
    if (!room) throw new Error('Room not found.');
    if (room.hostId !== hostId) throw new Error('Only the room host can start the game.');

    if (room.players.size < room.settings.minPlayers) {
      throw new Error(`At least ${room.settings.minPlayers} players are required to start.`);
    }

    // Check all non-host players are ready
    for (const player of room.players.values()) {
      if (!player.isHost && !player.isReady) {
        throw new Error(`All players must be ready. ${player.name} is not ready.`);
      }
    }

    const playerList: PlayerInfo[] = Array.from(room.players.values());
    room.gameState = createInitialGameState(playerList, room.settings.rules, undefined, `game_${room.id}`);
    room.rematchVotes.clear();

    return room;
  }

  public requestRematch(roomId: string, playerId: string): { room: RoomInstance; allAgreed: boolean } {
    const room = this.roomsById.get(roomId);
    if (!room) throw new Error('Room not found.');

    room.rematchVotes.add(playerId);
    const nonAiCount = Array.from(room.players.values()).filter((p) => !p.isAi).length;
    const allAgreed = room.rematchVotes.size >= nonAiCount;

    if (allAgreed) {
      const playerList: PlayerInfo[] = Array.from(room.players.values());
      room.gameState = createInitialGameState(playerList, room.settings.rules, undefined, `game_${room.id}_rematch`);
      room.rematchVotes.clear();
    }

    return { room, allAgreed };
  }

  public handleSocketDisconnect(
    socketId: string
  ): { room?: RoomInstance; player?: PlayerSession } {
    const mapping = this.socketToPlayer.get(socketId);
    if (!mapping) return {};

    const { roomId, playerId } = mapping;
    this.socketToPlayer.delete(socketId);

    const room = this.roomsById.get(roomId);
    if (!room) return {};

    const player = room.players.get(playerId);
    if (!player) return {};

    player.isConnected = false;
    player.socketId = null;

    if (room.gameState) {
      const pInGame = room.gameState.players.find((p) => p.id === playerId);
      if (pInGame) {
        pInGame.isConnected = false;
      }
    }

    // Schedule cleanup if disconnected for longer than reconnectTimeoutMs
    player.disconnectTimeout = setTimeout(() => {
      this.leaveRoom(roomId, playerId);
    }, config.reconnectTimeoutMs);

    return { room, player };
  }

  public leaveRoom(
    roomId: string,
    playerId: string
  ): { room?: RoomInstance; newHostId?: string; roomDestroyed: boolean } {
    const room = this.roomsById.get(roomId);
    if (!room) return { roomDestroyed: false };

    const player = room.players.get(playerId);
    if (!player) return { roomDestroyed: false };

    if (player.socketId) {
      this.socketToPlayer.delete(player.socketId);
    }
    if (player.disconnectTimeout) {
      clearTimeout(player.disconnectTimeout);
    }

    room.players.delete(playerId);

    // If room is empty, destroy it
    if (room.players.size === 0) {
      this.roomsById.delete(roomId);
      this.roomsByCode.delete(room.code);
      return { roomDestroyed: true };
    }

    let newHostId: string | undefined;
    // If host left, elect new host
    if (room.hostId === playerId) {
      const nextPlayer = Array.from(room.players.values()).find((p) => !p.isAi) || Array.from(room.players.values())[0];
      if (nextPlayer) {
        nextPlayer.isHost = true;
        room.hostId = nextPlayer.id;
        newHostId = nextPlayer.id;
      }
    }

    return { room, newHostId, roomDestroyed: false };
  }

  public getRoomDetails(roomId: string): RoomDetails | null {
    const room = this.roomsById.get(roomId);
    if (!room) return null;

    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      settings: room.settings,
      players: Array.from(room.players.values()).map(({ reconnectToken, socketId, disconnectTimeout, ...publicInfo }) => publicInfo),
      createdAt: room.createdAt,
    };
  }

  public getRoomByCode(code: string): RoomInstance | undefined {
    return this.roomsByCode.get(code.trim().toUpperCase());
  }

  public getRoomById(id: string): RoomInstance | undefined {
    return this.roomsById.get(id);
  }

  public getPlayerBySocket(socketId: string): { roomId: string; playerId: string } | undefined {
    return this.socketToPlayer.get(socketId);
  }
}
