import { test, expect } from '@playwright/test';

test.describe('Departments', () => {
  test('should show department list page', async ({ page }) => {
    await page.goto('/departments');
    await expect(page.locator('h1')).toContainText('부서');
  });

  test('should open create form when clicking add button', async ({ page }) => {
    await page.goto('/departments');
    const addButton = page.locator('button', { hasText: '부서 추가' });
    if (await addButton.isVisible()) {
      await addButton.click();
      await expect(page.locator('text=부서 코드')).toBeVisible();
      await expect(page.locator('text=부서명')).toBeVisible();
    }
  });
});
