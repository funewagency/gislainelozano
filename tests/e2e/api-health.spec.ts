import { test, expect } from '@playwright/test';
import crypto from 'crypto';

test.describe('GET /api/health', () => {
  test('returns ok field and timestamp', async ({ request }) => {
    const res = await request.get('/api/health');
    // Status is 200 (ok) or 503 (db/env issue) — both are valid operational states
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('env');
    expect(body).toHaveProperty('db');
    expect(body).toHaveProperty('timestamp');
  });

  test('timestamp is a valid ISO 8601 date', async ({ request }) => {
    const res = await request.get('/api/health');
    const body = await res.json();
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test('database is reachable', async ({ request }) => {
    const res = await request.get('/api/health');
    const body = await res.json();
    expect(body.db).toBe(true);
  });
});

test.describe('POST /api/revalidate — webhook', () => {
  function sign(body: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  const SECRET = process.env.WEBHOOK_SECRET || 'dev-webhook-secret-change-in-production';

  test('returns 401 when signature header is missing', async ({ request }) => {
    const res = await request.post('/api/revalidate', {
      data: { event: 'content.updated', tenant: 'gislaine' },
    });
    expect(res.status()).toBe(401);
  });

  test('returns 401 for invalid signature', async ({ request }) => {
    const body = JSON.stringify({ event: 'content.updated', tenant: 'gislaine' });
    const res = await request.post('/api/revalidate', {
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'bad-signature',
      },
      data: body,
    });
    expect(res.status()).toBe(401);
  });

  test('returns 200 with valid HMAC signature', async ({ request }) => {
    const payload = JSON.stringify({ event: 'content.updated', tenant: 'gislaine' });
    const sig = sign(payload, SECRET);
    const res = await request.post('/api/revalidate', {
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': sig,
      },
      data: payload,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

test.describe('GET /api/admin/cms — public content access', () => {
  test('returns CMS data without authentication', async ({ request }) => {
    // GET /api/admin/cms intentionally has no auth check — content is public
    const res = await request.get('/api/admin/cms');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('hero');
    expect(body.data).toHaveProperty('navbar');
  });

  test('response includes version metadata', async ({ request }) => {
    const res = await request.get('/api/admin/cms');
    const body = await res.json();
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('version');
  });
});
