import { test, expect } from '@playwright/test';

test.describe('LGPD Consent Banner', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure clean localStorage so the banner always appears
    await page.addInitScript(() => {
      localStorage.removeItem('lgpd-consent');
      localStorage.removeItem('lgpd-banner-dismissed');
    });
  });

  test('banner appears on first visit when no consent stored', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recusar' })).toBeVisible();
  });

  test('banner contains reference to Política de Privacidade', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Política de Privacidade/)).toBeVisible();
  });

  test('accepting consent hides the banner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeHidden();
  });

  test('accepting consent saves lgpd-consent=true in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Aceitar' }).click();
    // Wait for animation to complete
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeHidden();
    const consent = await page.evaluate(() => localStorage.getItem('lgpd-consent'));
    expect(consent).toBe('true');
  });

  test('rejecting consent hides the banner', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Recusar' }).click();
    await expect(page.getByRole('button', { name: 'Recusar' })).toBeHidden();
  });

  test('rejecting consent saves lgpd-consent=false in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Recusar' }).click();
    await expect(page.getByRole('button', { name: 'Recusar' })).toBeHidden();
    const consent = await page.evaluate(() => localStorage.getItem('lgpd-consent'));
    expect(consent).toBe('false');
  });

  test('close (X) button hides banner without setting consent value', async ({ page }) => {
    await page.goto('/');
    // The X button is the third button in the banner
    const closeBtn = page.locator('[class*="fixed"][class*="bottom"] button').last();
    await closeBtn.click();
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeHidden();
    // lgpd-consent should NOT be set — only dismissed
    const consent = await page.evaluate(() => localStorage.getItem('lgpd-consent'));
    expect(consent).toBeNull();
    const dismissed = await page.evaluate(() => localStorage.getItem('lgpd-banner-dismissed'));
    expect(dismissed).toBe('true');
  });

  test('banner does not appear on second visit after consent given', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('lgpd-consent', 'true');
      localStorage.setItem('lgpd-banner-dismissed', 'true');
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeHidden();
  });

  test('banner does not appear after dismissal without consent', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('lgpd-banner-dismissed', 'true');
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Aceitar' })).toBeHidden();
  });
});
