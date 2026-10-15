import { Server, Socket } from 'socket.io';
import {
  AddAiPlayerSchema,
  CatchUnoSchema,
  ChallengeWd4Schema,
  ChooseColorSchema,
  ClientToServerEvents,
  CreateRoomSchema,
  JoinRoomSchema,
  PlayCardSchema,
  PlayDrawnCardSchema,
  ReconnectRoomSchema,
  RemoveAiPlayerSchema,
  ServerToClientEvents,
  SetReadySchema,
} from '@uno-arena/shared';
import {
  chooseAIMove,
  executeCallUno,
  executeCatchUno,
  executeChallengeWd4,
  executeChooseColor,
  executeDrawCard,
  executePlayCard,
  executePlayDrawnCard,
  projectPublicGameState,
} from '@uno-arena/game-engine';
import { RoomInstance, RoomManager } from '../rooms/RoomManager';
import { SimpleRateLimiter } from '../security/rateLimiter';

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  roomManager: RoomManager,
  rateLimiter: SimpleRateLimiter
): void {
  // Helper to synchronize game state to room (public) and to each player (private hand)
  const syncGameState = (room: RoomInstance) => {
    if (!room.gameState) return;

    const publicState = projectPublicGameState(room.gameState);
    io.to(room.id).emit('gameStateUpdated', { gameState: publicState });

    // Send private hand individually to each connected player
    for (const player of room.players.values()) {
      if (!player.isAi && player.socketId) {
        const hand = room.gameState.hands[player.id] ?? [];
        io.to(player.socketId).emit('yourHandUpdated', { hand });
      }
    }

    // Trigger AI move if it's an AI turn and game is in progress
    checkAndTriggerAiMove(room);
  };

  // Helper to trigger AI turn if active player is an AI bot
  const checkAndTriggerAiMove = (room: RoomInstance) => {
    if (!room.gameState || room.gameState.status !== 'in_progress') return;

    const currentTurnIndex = room.gameState.currentTurnIndex;
    const activePlayer = room.gameState.players[currentTurnIndex];

    if (!activePlayer || !activePlayer.isAi) {
      // Check if any player has pending action that is AI (e.g. pending color selection or WD4 challenge)
      if (
        room.gameState.pendingAction &&
        room.players.get(room.gameState.pendingAction.playerId)?.isAi
      ) {
        const aiPlayer = room.players.get(room.gameState.pendingAction.playerId)!;
        triggerAiAction(room, aiPlayer.id, aiPlayer.aiDifficulty ?? 'medium');
      }
      return;
    }

    triggerAiAction(room, activePlayer.id, activePlayer.aiDifficulty ?? 'medium');
  };

  const triggerAiAction = (
    room: RoomInstance,
    aiPlayerId: string,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    // Artificial thinking delay so humans see the action flow
    setTimeout(() => {
      roomManager.enqueueAction(room.id, () => {
        if (!room.gameState || room.gameState.status !== 'ended' && room.gameState.status !== 'in_progress') return;
        if (room.gameState.status === 'ended') return;

        const aiHand = room.gameState.hands[aiPlayerId] ?? [];
        const publicState = projectPublicGameState(room.gameState);
        const decision = chooseAIMove(publicState, aiPlayerId, aiHand, difficulty);

        if (decision.callUno) {
          executeCallUno(room.gameState, aiPlayerId);
        }

        if (decision.type === 'catch_uno' && decision.targetPlayerId) {
          executeCatchUno(room.gameState, aiPlayerId, decision.targetPlayerId);
        } else if (decision.type === 'color' && decision.chosenColor) {
          executeChooseColor(room.gameState, aiPlayerId, decision.chosenColor);
        } else if (decision.type === 'challenge' && decision.challenge !== undefined) {
          executeChallengeWd4(room.gameState, aiPlayerId, decision.challenge);
        } else if (decision.type === 'drawn_choice') {
          executePlayDrawnCard(room.gameState, aiPlayerId, !!decision.play, decision.chosenColor);
        } else if (decision.type === 'play' && decision.cardId) {
          executePlayCard(room.gameState, aiPlayerId, decision.cardId, decision.chosenColor);
        } else if (decision.type === 'draw') {
          executeDrawCard(room.gameState, aiPlayerId);
        }

        syncGameState(room);
      });
    }, 850);
  };

  io.on('connection', (socket: Socket) => {
    // Rate limit check wrapper
    const checkRateLimit = (): boolean => {
      const { allowed } = rateLimiter.check(socket.id);
      if (!allowed) {
        socket.emit('actionRejected', {
          reason: 'Rate limit exceeded. Please slow down your actions.',
        });
        return false;
      }
      return true;
    };

    // 1. Create Room
    socket.on('createRoom', (rawPayload) => {
      if (!checkRateLimit()) return;

      const parsed = CreateRoomSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit('errorNotification', {
          code: 'INVALID_PAYLOAD',
          message: parsed.error.issues[0]?.message ?? 'Invalid room configuration.',
        });
        return;
      }

      try {
        const { room, player, reconnectToken } = roomManager.createRoom(
          parsed.data.playerName,
          parsed.data.avatar,
          parsed.data.settings,
          socket.id
        );

        socket.join(room.id);
        const roomDetails = roomManager.getRoomDetails(room.id)!;

        socket.emit('roomCreated', {
          room: roomDetails,
          reconnectToken,
          playerId: player.id,
        });
      } catch (err: any) {
        socket.emit('errorNotification', { code: 'ROOM_CREATE_FAILED', message: err.message });
      }
    });

    // 2. Join Room
    socket.on('joinRoom', (rawPayload) => {
      if (!checkRateLimit()) return;

      const parsed = JoinRoomSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit('errorNotification', {
          code: 'INVALID_PAYLOAD',
          message: parsed.error.issues[0]?.message ?? 'Invalid join payload.',
        });
        return;
      }

      try {
        const { room, player, reconnectToken } = roomManager.joinRoom(
          parsed.data.roomCode,
          parsed.data.playerName,
          parsed.data.avatar,
          socket.id
        );

        socket.join(room.id);
        const roomDetails = roomManager.getRoomDetails(room.id)!;

        socket.emit('roomJoined', {
          room: roomDetails,
          reconnectToken,
          playerId: player.id,
        });

        // Notify room members
        io.to(room.id).emit('roomUpdated', { room: roomDetails });
      } catch (err: any) {
        socket.emit('errorNotification', { code: 'JOIN_FAILED', message: err.message });
      }
    });

    // 3. Reconnect Room
    socket.on('reconnectRoom', (rawPayload) => {
      const parsed = ReconnectRoomSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit('errorNotification', { code: 'INVALID_PAYLOAD', message: 'Invalid reconnection token.' });
        return;
      }

      try {
        const { room, player } = roomManager.reconnect(
          parsed.data.roomId,
          parsed.data.playerId,
          parsed.data.reconnectToken,
          socket.id
        );

        socket.join(room.id);
        const roomDetails = roomManager.getRoomDetails(room.id)!;
        const myHand = room.gameState ? room.gameState.hands[player.id] ?? [] : [];

        socket.emit('reconnected', {
          room: roomDetails,
          gameState: room.gameState ? projectPublicGameState(room.gameState) : null,
          myHand,
          playerId: player.id,
        });

        io.to(room.id).emit('playerReconnected', {
          playerId: player.id,
          playerName: player.name,
        });

        io.to(room.id).emit('roomUpdated', { room: roomDetails });
      } catch (err: any) {
        socket.emit('errorNotification', { code: 'RECONNECT_FAILED', message: err.message });
      }
    });

    // 4. Set Ready
    socket.on('setReady', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = SetReadySchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      try {
        const room = roomManager.setReady(mapping.roomId, mapping.playerId, parsed.data.isReady);
        const roomDetails = roomManager.getRoomDetails(room.id)!;
        io.to(room.id).emit('roomUpdated', { room: roomDetails });
      } catch (err: any) {
        socket.emit('actionRejected', { reason: err.message });
      }
    });

    // 5. Add AI Player
    socket.on('addAiPlayer', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = AddAiPlayerSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      try {
        const { room } = roomManager.addAiPlayer(mapping.roomId, mapping.playerId, parsed.data.difficulty);
        const roomDetails = roomManager.getRoomDetails(room.id)!;
        io.to(room.id).emit('roomUpdated', { room: roomDetails });
      } catch (err: any) {
        socket.emit('actionRejected', { reason: err.message });
      }
    });

    // 6. Remove AI Player
    socket.on('removeAiPlayer', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = RemoveAiPlayerSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      try {
        const room = roomManager.removeAiPlayer(mapping.roomId, mapping.playerId, parsed.data.playerId);
        const roomDetails = roomManager.getRoomDetails(room.id)!;
        io.to(room.id).emit('roomUpdated', { room: roomDetails });
      } catch (err: any) {
        socket.emit('actionRejected', { reason: err.message });
      }
    });

    // 7. Start Game
    socket.on('startGame', () => {
      if (!checkRateLimit()) return;
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      try {
        const room = roomManager.startGame(mapping.roomId, mapping.playerId);
        syncGameState(room);
      } catch (err: any) {
        socket.emit('actionRejected', { reason: err.message });
      }
    });

    // 8. Play Card
    socket.on('playCard', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = PlayCardSchema.safeParse(rawPayload);
      if (!parsed.success) {
        socket.emit('actionRejected', { reason: 'Invalid play card data.' });
        return;
      }

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executePlayCard(
          room.gameState,
          mapping.playerId,
          parsed.data.cardId,
          parsed.data.chosenColor
        );

        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Invalid card play.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 9. Draw Card
    socket.on('drawCard', () => {
      if (!checkRateLimit()) return;
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executeDrawCard(room.gameState, mapping.playerId);
        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Cannot draw card.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 10. Play Drawn Card
    socket.on('playDrawnCard', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = PlayDrawnCardSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executePlayDrawnCard(
          room.gameState,
          mapping.playerId,
          parsed.data.play,
          parsed.data.chosenColor
        );

        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Action rejected.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 11. Choose Color
    socket.on('chooseColor', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = ChooseColorSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executeChooseColor(
          room.gameState,
          mapping.playerId,
          parsed.data.color
        );

        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Cannot choose color.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 12. Call UNO
    socket.on('callUno', () => {
      if (!checkRateLimit()) return;
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executeCallUno(room.gameState, mapping.playerId);
        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Cannot call UNO now.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 13. Catch UNO
    socket.on('catchUno', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = CatchUnoSchema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executeCatchUno(
          room.gameState,
          mapping.playerId,
          parsed.data.targetPlayerId
        );

        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Catch UNO failed.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 14. Challenge WD4
    socket.on('challengeWd4', (rawPayload) => {
      if (!checkRateLimit()) return;
      const parsed = ChallengeWd4Schema.safeParse(rawPayload);
      if (!parsed.success) return;

      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      roomManager.enqueueAction(mapping.roomId, () => {
        const room = roomManager.getRoomById(mapping.roomId);
        if (!room || !room.gameState) return;

        const result = executeChallengeWd4(
          room.gameState,
          mapping.playerId,
          parsed.data.challenge
        );

        if (!result.success) {
          socket.emit('actionRejected', { reason: result.error ?? 'Challenge failed.' });
          return;
        }

        syncGameState(room);
      });
    });

    // 15. Rematch
    socket.on('requestRematch', () => {
      if (!checkRateLimit()) return;
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      try {
        const { room, allAgreed } = roomManager.requestRematch(
          mapping.roomId,
          mapping.playerId
        );
        const player = room.players.get(mapping.playerId);

        io.to(room.id).emit('rematchRequested', {
          playerId: mapping.playerId,
          playerName: player?.name ?? 'Player',
        });

        if (allAgreed) {
          syncGameState(room);
        }
      } catch (err: any) {
        socket.emit('actionRejected', { reason: err.message });
      }
    });

    // 16. Leave Room
    socket.on('leaveRoom', () => {
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      const { room, newHostId, roomDestroyed } = roomManager.leaveRoom(
        mapping.roomId,
        mapping.playerId
      );

      socket.leave(mapping.roomId);

      if (!roomDestroyed && room) {
        io.to(room.id).emit('playerLeft', {
          playerId: mapping.playerId,
          playerName: 'Player',
          newHostId,
        });
        const details = roomManager.getRoomDetails(room.id);
        if (details) {
          io.to(room.id).emit('roomUpdated', { room: details });
        }
      }
    });

    // Chat
    socket.on('sendChat', (rawPayload) => {
      if (!checkRateLimit()) return;
      const mapping = roomManager.getPlayerBySocket(socket.id);
      if (!mapping) return;

      const room = roomManager.getRoomById(mapping.roomId);
      if (!room) return;

      const player = room.players.get(mapping.playerId);
      if (!player) return;

      const raw = typeof rawPayload?.message === 'string' ? rawPayload.message.trim() : '';
      if (!raw || raw.length === 0 || raw.length > 200) return;

      const chatMsg = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        playerId: mapping.playerId,
        playerName: player.name,
        message: raw,
        timestamp: Date.now(),
      };

      io.to(room.id).emit('chatReceived', chatMsg);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const { room, player } = roomManager.handleSocketDisconnect(socket.id);
      if (room && player) {
        io.to(room.id).emit('playerDisconnected', {
          playerId: player.id,
          playerName: player.name,
        });
        const details = roomManager.getRoomDetails(room.id);
        if (details) {
          io.to(room.id).emit('roomUpdated', { room: details });
        }
      }
    });
  });
}
