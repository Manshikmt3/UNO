import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:server',
      port: 4000,
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm run dev:client',
      port: 5173,
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
});
