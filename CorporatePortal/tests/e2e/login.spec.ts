import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('기업 포털');
    await expect(page.locator('input[placeholder="admin@company.com"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="admin@company.com"]', 'wrong');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    // Should show error (network error or auth error)
    await expect(page.locator('[class*="danger"]')).toBeVisible({ timeout: 10000 });
  });
});
