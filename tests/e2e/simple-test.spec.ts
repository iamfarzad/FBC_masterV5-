import { test, expect } from '@playwright/test';

test('basic page load test', async ({ page }) => {
  await page.goto('/chat', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle(/Chat/);
});
