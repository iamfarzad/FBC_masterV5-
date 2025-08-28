import { test, expect } from '@playwright/test';

test.describe('Theme snapshots', () => {
  test('light', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('fbc-theme','light'));
    await page.goto('/chat');
    await expect(page).toHaveScreenshot({ fullPage: true });
  });

  test('dark', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('fbc-theme','dark'));
    await page.goto('/chat');
    await expect(page).toHaveScreenshot({ fullPage: true });
  });
});
