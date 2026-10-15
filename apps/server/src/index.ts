import http from 'http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '@uno-arena/shared';
import { createApiRouter } from './api/routes';
import { config } from './config';
import { RoomManager } from './rooms/RoomManager';
import { SimpleRateLimiter } from './security/rateLimiter';
import { registerSocketHandlers } from './socket/handlers';

export const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());

export const roomManager = new RoomManager();
export const rateLimiter = new SimpleRateLimiter(
  config.rateLimitWindowMs,
  config.rateLimitMaxRequests
);

// REST API routes
app.use(createApiRouter(roomManager));

export const server = http.createServer(app);

export const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: config.corsOrigin === '*' ? true : [config.corsOrigin, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerSocketHandlers(io, roomManager, rateLimiter);

// Only listen if this file is run directly (not during vitest tests)
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`[UNO Arena Server] Listening on http://localhost:${config.port}`);
  });
}
