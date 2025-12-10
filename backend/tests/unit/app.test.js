import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

describe('App Configuration', () => {
  it('should return 200 OK for health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toEqual(false);
    expect(res.body.errorCode).toEqual('NOT_FOUND');
  });

  it('should have security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-download-options']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBeDefined();
    expect(res.headers['x-xss-protection']).toBeDefined();
  });
});
