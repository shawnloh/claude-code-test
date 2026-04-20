import { test, expect } from '@playwright/test';
import { registerUser, loginUser, uniqueEmail } from './helpers/auth';

const TEST_PASSWORD = 'Password123!';

test.describe('Profile page', () => {
  test('shows profile link in header after login', async ({ page }) => {
    const email = uniqueEmail('profile-header');
    await registerUser(page, { name: 'Header User', email, password: TEST_PASSWORD });

    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
  });

  test('profile page shows current name and email', async ({ page }) => {
    const email = uniqueEmail('profile-view');
    await registerUser(page, { name: 'View User', email, password: TEST_PASSWORD });

    await page.goto('/profile');

    await expect(page.getByLabel('Email')).toHaveValue(email);
    await expect(page.getByLabel('Display name')).toHaveValue('View User');
  });

  test('email field is read-only', async ({ page }) => {
    const email = uniqueEmail('profile-readonly');
    await registerUser(page, { name: 'Readonly User', email, password: TEST_PASSWORD });

    await page.goto('/profile');

    await expect(page.getByLabel('Email')).toBeDisabled();
  });

  test('can update display name', async ({ page }) => {
    const email = uniqueEmail('profile-update');
    await registerUser(page, { name: 'Old Name', email, password: TEST_PASSWORD });

    await page.goto('/profile');
    await page.getByLabel('Display name').fill('New Name');
    await page.getByRole('button', { name: /save changes/i }).click();

    await expect(page.getByText('Profile saved.')).toBeVisible();
  });

  test('shows avatar preview on profile page', async ({ page }) => {
    const email = uniqueEmail('profile-avatar');
    await registerUser(page, { name: 'Avatar User', email, password: TEST_PASSWORD });

    await page.goto('/profile');

    // Avatar img should be visible (gravatar or custom)
    const avatar = page.locator('img[alt="Avatar User"], img[alt="Your name"]').first();
    await expect(avatar).toBeVisible();
  });

  test('shows gravatar in header', async ({ page }) => {
    const email = uniqueEmail('profile-gravatar');
    await registerUser(page, { name: 'Gravatar User', email, password: TEST_PASSWORD });

    const headerAvatar = page.locator('header img').first();
    await expect(headerAvatar).toBeVisible();
  });

  test('delete account button shows confirmation dialog', async ({ page }) => {
    const email = uniqueEmail('profile-delete-dialog');
    await registerUser(page, { name: 'Delete Dialog User', email, password: TEST_PASSWORD });

    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();

    await expect(page.getByRole('heading', { name: /delete account\?/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('cancel button dismisses the delete dialog', async ({ page }) => {
    const email = uniqueEmail('profile-delete-cancel');
    await registerUser(page, { name: 'Cancel Delete User', email, password: TEST_PASSWORD });

    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByRole('heading', { name: /delete account\?/i })).toBeHidden();
  });

  test('deleting account signs out and redirects to auth page', async ({ page }) => {
    const email = uniqueEmail('profile-delete-confirm');
    await registerUser(page, { name: 'Delete Me', email, password: TEST_PASSWORD });

    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();
    await page
      .getByRole('button', { name: /delete account/i })
      .last()
      .click();

    await page.waitForURL('/authentication');
  });

  test('deleted account cannot log back in', async ({ page }) => {
    const email = uniqueEmail('profile-deleted-login');
    await registerUser(page, { name: 'Deleted User', email, password: TEST_PASSWORD });

    // Delete the account
    await page.goto('/profile');
    await page.getByRole('button', { name: /delete account/i }).click();
    await page
      .getByRole('button', { name: /delete account/i })
      .last()
      .click();
    await page.waitForURL('/authentication');

    // Try to log back in — login should be rejected (deleted account)
    await page.goto('/authentication');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should stay on /authentication with an error message
    await expect(page).toHaveURL('/authentication');
    await expect(page.getByText(/deleted|suspended|invalid/i)).toBeVisible();
  });
});
