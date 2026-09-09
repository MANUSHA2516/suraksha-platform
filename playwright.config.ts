import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    launchOptions: { executablePath: process.env.CHROME_PATH },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    navigationTimeout: 15000,
    actionTimeout: 15000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: [
    {
      command: 'npm run start -w @suraksha/api',
      url: 'http://127.0.0.1:4000/v1/auth/me',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm run start -w @suraksha/web',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
});
