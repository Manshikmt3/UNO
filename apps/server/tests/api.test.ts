import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, roomManager } from '../src/index';

describe('Server REST API', () => {
  it('GET /health returns 200 and ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /api/rooms/:code returns 404 for non-existent room', async () => {
    const res = await request(app).get('/api/rooms/XYZ999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Room not found.');
  });

  it('GET /api/rooms/:code returns room details for an existing room', async () => {
    const { room } = roomManager.createRoom('HostPlayer', 'cat');
    const res = await request(app).get(`/api/rooms/${room.code}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(room.code);
    expect(res.body.hostName).toBe('HostPlayer');
    expect(res.body.playersCount).toBe(1);
    expect(res.body.status).toBe('waiting');
  });
});
