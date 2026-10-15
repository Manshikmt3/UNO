import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Card, ClientToServerEvents, RoomDetails, ServerToClientEvents } from '@uno-arena/shared';
import { server } from '../src/index';

describe('Socket.IO Real-time Gameplay Integration', () => {
  let serverPort: number;
  let clientAlice: ClientSocket<ServerToClientEvents, ClientToServerEvents>;
  let clientBob: ClientSocket<ServerToClientEvents, ClientToServerEvents>;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        serverPort = (server.address() as AddressInfo).port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (clientAlice) clientAlice.disconnect();
    if (clientBob) clientBob.disconnect();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('connects clients, creates room, and joins via room code', async () => {
    clientAlice = Client(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      forceNew: true,
    });
    clientBob = Client(`http://localhost:${serverPort}`, {
      transports: ['websocket'],
      forceNew: true,
    });

    await new Promise<void>((resolve) => {
      clientAlice.on('connect', () => resolve());
    });

    // Alice creates room
    const createPromise = new Promise<{ room: RoomDetails; reconnectToken: string; playerId: string }>((resolve) => {
      clientAlice.on('roomCreated', (payload) => resolve(payload));
    });

    clientAlice.emit('createRoom', { playerName: 'Alice', avatar: 'cat' });
    const { room: createdRoom, reconnectToken: aliceToken } = await createPromise;

    expect(createdRoom.code).toBeDefined();
    expect(createdRoom.players).toHaveLength(1);
    expect(aliceToken).toBeDefined();

    // Bob joins room
    const joinPromise = new Promise<{ room: RoomDetails; reconnectToken: string; playerId: string }>((resolve) => {
      clientBob.on('roomJoined', (payload) => resolve(payload));
    });

    clientBob.emit('joinRoom', {
      roomCode: createdRoom.code,
      playerName: 'Bob',
      avatar: 'dog',
    });

    const { room: joinedRoom } = await joinPromise;
    expect(joinedRoom.players).toHaveLength(2);
  });

  it('keeps private hands isolated: each player receives only their own cards', async () => {
    let aliceHand: Card[] = [];
    let bobHand: Card[] = [];

    const aliceHandPromise = new Promise<void>((resolve) => {
      clientAlice.on('yourHandUpdated', (payload) => {
        aliceHand = payload.hand;
        resolve();
      });
    });

    const bobHandPromise = new Promise<void>((resolve) => {
      clientBob.on('yourHandUpdated', (payload) => {
        bobHand = payload.hand;
        resolve();
      });
    });

    // Bob sets ready
    clientBob.emit('setReady', { isReady: true });

    // Alice starts game
    clientAlice.emit('startGame');

    await Promise.all([aliceHandPromise, bobHandPromise]);

    expect(aliceHand).toHaveLength(7);
    expect(bobHand).toHaveLength(7);

    // Verify card IDs are distinct
    const aliceCardIds = aliceHand.map((c) => c.id);
    const bobCardIds = bobHand.map((c) => c.id);

    for (const id of aliceCardIds) {
      expect(bobCardIds).not.toContain(id);
    }
  });

  it('rejects gameplay moves from non-turn player', async () => {
    const rejectionPromise = new Promise<{ reason: string }>((resolve) => {
      clientBob.on('actionRejected', (payload) => resolve(payload));
    });

    // Bob tries to play while Alice is turn index 0
    clientBob.emit('playCard', { cardId: 'fake_card_id' });

    const rejected = await rejectionPromise;
    expect(rejected.reason).toBeDefined();
  });
});
