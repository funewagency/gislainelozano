import { test, expect } from '@playwright/test';

test.describe('Public API endpoints', () => {
  test('GET /api/health returns valid structure', async ({ request }) => {
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('db');
    expect(data).toHaveProperty('env');
    expect(data).toHaveProperty('cms');
    expect(data).toHaveProperty('timestamp');
  });

  test('GET /api/settings returns analytics config', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('ga4Id');
    expect(data).toHaveProperty('fbPixelId');
    expect(data).toHaveProperty('gAdsId');
    expect(data).toHaveProperty('gAdsLabel');
  });

  test('POST /api/contact validates required fields', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: '', email: '', phone: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/contact validates email format', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: 'João', email: 'not-an-email', phone: '11999999999' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/contact validates phone format', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: 'João', email: 'joao@test.com', phone: '123' },
    });
    expect(response.status()).toBe(400);
  });

  test('POST /api/contact accepts valid submission', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'João Test',
        email: 'joao@example.com',
        phone: '11999999999',
        message: 'Teste',
      },
    });
    expect([200, 429]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });

  test('Admin API routes require auth', async ({ request }) => {
    const response = await request.get('/api/admin/leads');
    expect(response.status()).toBe(401);
  });

  test('Admin analytics requires auth', async ({ request }) => {
    const response = await request.get('/api/admin/analytics');
    expect(response.status()).toBe(401);
  });

  test('Admin CMS is publicly accessible', async ({ request }) => {
    const response = await request.get('/api/admin/cms');
    expect(response.status()).toBe(200);
  });

  test('Admin settings requires auth', async ({ request }) => {
    const response = await request.get('/api/admin/settings');
    expect(response.status()).toBe(401);
  });

  test('Admin images requires auth', async ({ request }) => {
    const response = await request.get('/api/admin/images');
    expect(response.status()).toBe(401);
  });
});
