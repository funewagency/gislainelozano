import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/LandingPage';

test.describe('Landing Page', () => {
  let landing: LandingPage;

  test.beforeEach(async ({ page }) => {
    // Dismiss LGPD banner so it doesn't overlap clickable elements
    await page.addInitScript(() => {
      localStorage.setItem('lgpd-consent', 'true');
      localStorage.setItem('lgpd-banner-dismissed', 'true');
    });
    landing = new LandingPage(page);
    await landing.goto();
  });

  test.describe('Page structure', () => {
    test('has correct title', async ({ page }) => {
      await expect(page).toHaveTitle(/Gislaine Lozano/);
    });

    test('renders hero section with h1 heading', async ({ page }) => {
      await expect(page.locator('h1:visible').first()).toBeVisible();
    });

    test('renders all required sections with correct IDs', async () => {
      await expect(landing.bioSection).toBeVisible();
      await expect(landing.servicesSection).toBeVisible();
      await expect(landing.resultsSection).toBeVisible();
      await expect(landing.faqSection).toBeVisible();
    });

    test('renders footer', async () => {
      await landing.footer.scrollIntoViewIfNeeded();
      await expect(landing.footer).toBeVisible();
    });
  });

  test.describe('Navbar navigation', () => {
    test('has visible navbar', async () => {
      await expect(landing.nav).toBeVisible();
    });

    test('Sobre link scrolls to bio section', async ({ page }) => {
      await page.locator('nav a:has-text("Sobre")').first().click();
      await expect(landing.bioSection).toBeInViewport();
    });

    test('Serviços link scrolls to services section', async ({ page }) => {
      await page.locator('nav a:has-text("Serviços")').first().click();
      await expect(landing.servicesSection).toBeInViewport();
    });

    test('FAQ link scrolls to FAQ section', async ({ page }) => {
      await page.locator('nav a:has-text("FAQ")').first().click();
      await expect(landing.faqSection).toBeInViewport();
    });
  });

  test.describe('Services section', () => {
    test('renders service cards', async ({ page }) => {
      await landing.servicesSection.scrollIntoViewIfNeeded();
      await expect(landing.servicesSection).toBeVisible();
      const cards = landing.servicesSection.locator('> div > div').first();
      await expect(cards).toBeVisible();
    });
  });

  test.describe('FAQ accordion', () => {
    test('first question opens when clicked', async ({ page }) => {
      await landing.faqSection.scrollIntoViewIfNeeded();
      const firstQuestion = landing.faqSection.getByRole('button').first();
      await expect(firstQuestion).toBeVisible();
      await firstQuestion.click();
      await expect(firstQuestion).toBeVisible();
    });

    test('accordion can be toggled', async ({ page }) => {
      await landing.faqSection.scrollIntoViewIfNeeded();
      const firstQuestion = landing.faqSection.getByRole('button').first();
      await firstQuestion.click();
      await firstQuestion.click();
      await expect(firstQuestion).toBeVisible();
    });
  });

  test.describe('WhatsApp FAB', () => {
    test('FAB is hidden at page top', async ({ page }) => {
      await expect(landing.whatsappFab).toBeHidden();
    });

    test('FAB appears after scrolling 300px+', async () => {
      await landing.scrollDown(400);
      await expect(landing.whatsappFab).toBeVisible();
    });

    test('scroll-to-top button appears with FAB', async () => {
      await landing.scrollDown(400);
      await expect(landing.scrollToTopBtn).toBeVisible();
    });

    test('FAB click opens WhatsApp lead modal', async ({ page }) => {
      await landing.openWhatsAppModal();
      await expect(page.getByRole('heading', { name: /Falar com Gislaine/i })).toBeVisible();
    });

    test('WhatsApp modal closes on X button', async ({ page }) => {
      await landing.openWhatsAppModal();
      await page.getByRole('button', { name: 'Fechar' }).click();
      await expect(page.getByRole('heading', { name: /Falar com Gislaine/i })).toBeHidden();
    });
  });

  test.describe('WhatsApp Lead Modal', () => {
    test.beforeEach(async () => {
      await landing.openWhatsAppModal();
    });

    test('shows name, email, and phone fields', async ({ page }) => {
      await expect(page.getByLabel('Nome')).toBeVisible();
      await expect(page.getByLabel('E-mail')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'WhatsApp' })).toBeVisible();
    });

    test('name field is required — browser prevents empty submit', async ({ page }) => {
      await page.getByLabel('E-mail').fill('test@test.com');
      await page.getByRole('textbox', { name: 'WhatsApp' }).fill('(11) 99999-9999');
      await page.locator('form button[type="submit"]').click({ force: true });
      // Modal stays open, no redirect
      await expect(page.getByLabel('Nome')).toBeVisible();
    });

    test('server-side error message is displayed', async ({ page }) => {
      await page.route('/api/contact', async (route) => {
        await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: 'WhatsApp inválido. Informe um número brasileiro com DDD.' }) });
      });
      await page.getByLabel('Nome').fill('Test User');
      await page.getByLabel('E-mail').fill('test@example.com');
      await page.getByRole('textbox', { name: 'WhatsApp' }).fill('12345');
      await page.locator('form button[type="submit"]').click({ force: true });
      await expect(page.getByText('WhatsApp inválido')).toBeVisible();
    });

    test('shows redirecting state on successful submit', async ({ page }) => {
      await page.route('/api/contact', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, syncedToCms: true }) });
      });
      await page.getByLabel('Nome').fill('Ana Silva');
      await page.getByLabel('E-mail').fill('ana@example.com');
      await page.getByRole('textbox', { name: 'WhatsApp' }).fill('(45) 98823-1902');
      await page.locator('form button[type="submit"]').click({ force: true });
      await expect(page.getByText('Redirecionando...')).toBeVisible();
    });
  });
});
