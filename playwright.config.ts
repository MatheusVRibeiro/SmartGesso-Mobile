import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração de testes E2E para SmartGesso-Mobile
 * Mobile-first: foca em dispositivos Android
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
    headless: true,
  },

  projects: [
    {
      name: 'Android',
      use: {
        ...devices['Pixel 7'],
        baseURL: 'http://localhost:8081',
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 430, height: 932 },
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    },
  ],

  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
