import { Page, expect } from '@playwright/test';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bobo#lobo';

export class AuthPage {
  constructor(readonly page: Page) {}

  async login(username = ADMIN_USERNAME, password = ADMIN_PASSWORD) {
    await this.page.goto('/admin/login');
    // Dismiss cookie consent banner if visible (can overlay login form on mobile)
    const dismissBanner = async () => {
      try {
        const btn = this.page.getByRole('button', { name: /Aceitar/i });
        if (await btn.isVisible({ timeout: 300 })) {
          await btn.click({ timeout: 2000 });
          await this.page.waitForTimeout(500);
        }
      } catch { /* banner not present */ }
    };
    await dismissBanner();
    await this.page.locator('#username').fill(username);
    await this.page.locator('#password').fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
    await this.page.waitForURL('/admin/dashboard', { timeout: 12000 });
  }

  async loginAndGoTo(path: string) {
    await this.login();
    await this.page.goto(path, { waitUntil: 'load' });
  }
}
