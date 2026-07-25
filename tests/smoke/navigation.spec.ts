import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Navigation', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    // Check if a common element or title is visible
    await expect(page).toHaveTitle(/NariCare/i); // Adjust title if necessary
  });

  test('assessment page loads successfully', async ({ page }) => {
    await page.goto('/assessment');
    // Ensure the page didn't throw an error and body is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('doctor page loads successfully', async ({ page }) => {
    await page.goto('/doctor');
    await expect(page.locator('body')).toBeVisible();
  });

  test('history page loads successfully', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('body')).toBeVisible();
  });

  test('tracker page loads successfully', async ({ page }) => {
    await page.goto('/tracker');
    await expect(page.locator('body')).toBeVisible();
  });
});
