import { Page, Locator } from '@playwright/test';

export class LandingPage {
  readonly nav: Locator;
  readonly heroSection: Locator;
  readonly bioSection: Locator;
  readonly servicesSection: Locator;
  readonly resultsSection: Locator;
  readonly faqSection: Locator;
  readonly footer: Locator;
  readonly whatsappFab: Locator;
  readonly scrollToTopBtn: Locator;

  constructor(readonly page: Page) {
    this.nav = page.locator('nav').first();
    this.heroSection = page.locator('section').first();
    this.bioSection = page.locator('#sobre');
    this.servicesSection = page.locator('#servicos');
    this.resultsSection = page.locator('#resultados');
    this.faqSection = page.locator('#faq');
    this.footer = page.locator('footer');
    this.whatsappFab = page.getByRole('button', { name: 'Contato via WhatsApp' });
    this.scrollToTopBtn = page.getByRole('button', { name: 'Voltar ao topo' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async scrollDown(pixels = 400) {
    await this.page.evaluate((px) => window.scrollTo(0, px), pixels);
  }

  async openWhatsAppModal() {
    await this.scrollDown(400);
    await this.whatsappFab.waitFor({ state: 'visible' });
    await this.whatsappFab.click();
  }
}
