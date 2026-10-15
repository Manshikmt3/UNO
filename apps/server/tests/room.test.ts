import { beforeEach, describe, expect, it } from 'vitest';
import { RoomManager } from '../src/rooms/RoomManager';

describe('RoomManager Unit & Integration', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  it('creates a room with unique code and host player', () => {
    const { room, player, reconnectToken } = roomManager.createRoom('Alice', 'cat');

    expect(room.id).toBeDefined();
    expect(room.code).toHaveLength(6);
    expect(player.name).toBe('Alice');
    expect(player.isHost).toBe(true);
    expect(player.isReady).toBe(true);
    expect(reconnectToken).toBeDefined();
    expect(room.players.size).toBe(1);
  });

  it('allows second player to join via valid room code', () => {
    const { room } = roomManager.createRoom('Alice', 'cat');
    const { player: bob, reconnectToken } = roomManager.joinRoom(room.code, 'Bob', 'dog');

    expect(bob.name).toBe('Bob');
    expect(bob.isHost).toBe(false);
    expect(bob.isReady).toBe(false);
    expect(reconnectToken).toBeDefined();
    expect(room.players.size).toBe(2);
  });

  it('rejects joining a room that does not exist', () => {
    expect(() => roomManager.joinRoom('UNKNOWN', 'Bob', 'dog')).toThrowError(
      'does not exist'
    );
  });

  it('rejects joining when room reaches maximum capacity', () => {
    const { room } = roomManager.createRoom('Alice', 'cat', { maxPlayers: 2 });
    roomManager.joinRoom(room.code, 'Bob', 'dog');

    expect(() => roomManager.joinRoom(room.code, 'Charlie', 'fox')).toThrowError(
      'Room is full'
    );
  });

  it('allows host to add and remove AI players', () => {
    const { room, player: host } = roomManager.createRoom('Alice', 'cat');
    const { aiPlayer } = roomManager.addAiPlayer(room.id, host.id, 'hard');

    expect(aiPlayer.isAi).toBe(true);
    expect(aiPlayer.aiDifficulty).toBe('hard');
    expect(room.players.size).toBe(2);

    roomManager.removeAiPlayer(room.id, host.id, aiPlayer.id);
    expect(room.players.size).toBe(1);
  });

  it('reconnects player using secret reconnect token', () => {
    const { room, player, reconnectToken } = roomManager.createRoom('Alice', 'cat', undefined, 'sock1');

    // Simulate socket disconnect
    roomManager.handleSocketDisconnect('sock1');
    expect(player.isConnected).toBe(false);

    // Reconnect with new socket ID and valid token
    const { player: reconnectedPlayer } = roomManager.reconnect(
      room.id,
      player.id,
      reconnectToken,
      'sock2'
    );

    expect(reconnectedPlayer.isConnected).toBe(true);
    expect(reconnectedPlayer.socketId).toBe('sock2');
  });

  it('rejects reconnection with invalid token', () => {
    const { room, player } = roomManager.createRoom('Alice', 'cat');

    expect(() =>
      roomManager.reconnect(room.id, player.id, 'fake-token-123', 'sock2')
    ).toThrowError('Invalid reconnection credentials.');
  });

  it('elects new host if current host leaves', () => {
    const { room, player: host } = roomManager.createRoom('Alice', 'cat');
    const { player: bob } = roomManager.joinRoom(room.code, 'Bob', 'dog');

    const { newHostId } = roomManager.leaveRoom(room.id, host.id);
    expect(newHostId).toBe(bob.id);
    expect(room.hostId).toBe(bob.id);
    expect(bob.isHost).toBe(true);
  });
});
