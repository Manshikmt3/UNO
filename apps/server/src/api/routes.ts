import { Router } from 'express';
import { RoomManager } from '../rooms/RoomManager';

export function createApiRouter(roomManager: RoomManager): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });

  router.get('/api/rooms/:code', (req, res) => {
    const { code } = req.params;
    const room = roomManager.getRoomByCode(code);

    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    res.json({
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      hostName: room.players.get(room.hostId)?.name ?? 'Host',
      playersCount: room.players.size,
      maxPlayers: room.settings.maxPlayers,
      status: room.gameState?.status ?? 'waiting',
      createdAt: room.createdAt,
    });
  });

  return router;
}
