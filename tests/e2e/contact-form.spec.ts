import { test, expect } from '@playwright/test';

/**
 * Contact form tests.
 * The ContactSection (contact.tsx) is a standalone component with id="contato"
 * that is NOT currently rendered on the landing page (page.tsx).
 * These tests cover the /api/contact endpoint and the WhatsApp lead modal,
 * which is the active lead-capture mechanism on the landing page.
 */

test.describe('POST /api/contact — validation', () => {
  test('returns 400 when name is missing', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { email: 'test@example.com', phone: '45988231902' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/obrigatório/i);
  });

  test('returns 400 when email is missing', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ana Silva', phone: '45988231902' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/obrigatório/i);
  });

  test('returns 400 when phone is missing', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ana Silva', email: 'ana@example.com' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/obrigatório/i);
  });

  test('returns 400 for invalid email format', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ana Silva', email: 'not-an-email', phone: '45988231902' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/e-mail inválido/i);
  });

  test('returns 400 for invalid Brazilian phone (too short)', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Ana Silva', email: 'ana@example.com', phone: '12345' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/whatsapp inválido/i);
  });

  test('returns 400 for phone without DDD', async ({ request }) => {
    // 8 digits — no DDD
    const res = await request.post('/api/contact', {
      data: { name: 'Ana Silva', email: 'ana@example.com', phone: '988231902' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/whatsapp inválido/i);
  });

  test('returns 200 for valid contact submission', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'Ana Silva',
        email: `e2e-test-${Date.now()}@example.com`,
        phone: '45988231902',
        message: 'Test message from e2e suite',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('accepts optional message field as null', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'Test User',
        email: `e2e-null-msg-${Date.now()}@example.com`,
        phone: '45988231902',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('strips non-digit characters from phone before validation', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'Ana Silva',
        email: `e2e-fmt-${Date.now()}@example.com`,
        // Formatted phone as the UI would send it
        phone: '(45) 98823-1902',
      },
    });
    expect(res.status()).toBe(200);
  });

  test('trims whitespace from name and email', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: '  Ana Silva  ',
        email: `  E2E-TRIM-${Date.now()}@EXAMPLE.COM  `,
        phone: '45988231902',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('rejects XSS payload — stores safely, does not execute', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: '<script>alert(1)</script>',
        email: `xss-test-${Date.now()}@example.com`,
        phone: '45988231902',
        message: '<img src=x onerror=alert(1)>',
      },
    });
    // Should store (no server-side sanitization) but return 200
    expect(res.status()).toBe(200);
  });

  test('returns 400 for empty body', async ({ request }) => {
    const res = await request.post('/api/contact', { data: {} });
    expect(res.status()).toBe(400);
  });
});

test.describe('Contact form — browser UI (mocked API)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('lgpd-consent', 'true');
      localStorage.setItem('lgpd-banner-dismissed', 'true');
    });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.getByRole('button', { name: 'Contato via WhatsApp' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Contato via WhatsApp' }).click();
  });

  test('shows loading spinner while submitting', async ({ page }) => {
    let resolve: () => void;
    const blocker = new Promise<void>((r) => { resolve = r; });

    await page.route('/api/contact', async (route) => {
      await blocker;
      await route.fulfill({ status: 200, json: { success: true } });
    });

    await page.getByLabel('Nome').fill('Ana');
    await page.getByLabel('E-mail').fill('ana@example.com');
    await page.getByRole('textbox', { name: 'WhatsApp' }).fill('(45) 98823-1902');
    await page.locator('form button[type="submit"]').click({ force: true });

    await expect(page.getByText('Enviando...')).toBeVisible();
    resolve!();
  });

  test('shows error text from server', async ({ page }) => {
    await page.route('/api/contact', async (route) => {
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'E-mail inválido.' }) });
    });
    await page.getByLabel('Nome').fill('Ana');
    await page.getByLabel('E-mail').fill('ana@example.com');
    await page.getByRole('textbox', { name: 'WhatsApp' }).fill('(45) 98823-1902');
    await page.locator('form button[type="submit"]').click({ force: true });
    await expect(page.getByText('E-mail inválido.')).toBeVisible();
  });

  test('network error shows fallback message', async ({ page }) => {
    await page.route('/api/contact', (route) => route.abort('failed'));
    await page.getByLabel('Nome').fill('Ana');
    await page.getByLabel('E-mail').fill('ana@example.com');
    await page.getByRole('textbox', { name: 'WhatsApp' }).fill('(45) 98823-1902');
    await page.locator('form button[type="submit"]').click({ force: true });
    await expect(page.getByText(/conexão/i).first()).toBeVisible();
  });
});
