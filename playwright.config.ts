import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,

  /*
   * Single worker: the CMS e2e tests exercise real PUT /api/admin/cms calls
   * (and restore the original values afterwards). A single worker keeps the
   * tests deterministic — parallel workers would race each other's saves and
   * restores on the shared database.
   */
  workers: 1,

  /* ── Video & trace recording (for documentation / debugging) ───── */
  //   video: 'on'           — record every test as MP4
  //   screenshot: 'on'      — capture DOM screenshot at each action
  //   trace: 'on'           — full DOM snapshot + network + console
  //
  //   For CI or daily use, switch to:
  //     video: 'retain-on-failure'
  //     screenshot: 'only-on-failure'
  //     trace: 'on-first-retry'
  use: {
    baseURL: 'http://localhost:3333',
    headless: true,

    /* Record video of every test run */
    video: 'on',

    /* Capture screenshots at every Playwright action */
    screenshot: 'on',

    /* Full trace (DOM, network, console) for trace viewer */
    trace: 'on',
  },

  /* ── Output artifacts go here ──────────────────────────────────── */
  //   test-results/videos/   — MP4 files named by test
  //   test-results/traces/   — .zip trace files for npx playwright show-report

  /* ── HTML report (interactive, shows videos + traces) ──────────── */
  reporter: [
    ['list'],                          // terminal output
    ['html', { outputFolder: 'test-report' }],  // interactive browser report
  ],

  /* ── Next.js dev server ────────────────────────────────────────── */
  webServer: {
    command: 'npx next dev -p 3333',
    port: 3333,
    reuseExistingServer: true,
  },
})
