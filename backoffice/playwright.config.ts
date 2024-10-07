// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',  // Directory where E2E tests are stored
  retries: 1,
  timeout: 30 * 1000,  // 30 seconds timeout per test
  use: {
    headless: true,  // Run tests in headless mode
    baseURL: 'http://localhost:3000',  // Your NestJS app's base URL
    screenshot: 'on',
    video: 'on-first-retry',
  },
  reporter: [
    ['list'],  // Default terminal reporter
    ['allure-playwright', { outputFolder: 'allure-results/playwright' }],
  ],
});