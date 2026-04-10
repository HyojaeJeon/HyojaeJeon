import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('root redirects to dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard page renders widgets', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('대시보드');
    // Check W1-W6 widget cards exist
    await expect(page.locator('text=이번 달 예산 사용률')).toBeVisible();
    await expect(page.locator('text=월간 소진 추세')).toBeVisible();
    await expect(page.locator('text=부서별 소진 랭킹')).toBeVisible();
  });

  const routes = [
    { path: '/departments', title: '부서 관리' },
    { path: '/employees', title: '임직원' },
    { path: '/policies', title: '식대 정책' },
    { path: '/budget', title: '예산 관리' },
    { path: '/merchants', title: '제휴 식당' },
    { path: '/invoices', title: '전자세금계산서' },
    { path: '/settings/company', title: '회사 정보' },
  ];

  for (const route of routes) {
    test(`${route.path} renders correctly`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    });
  }
});
