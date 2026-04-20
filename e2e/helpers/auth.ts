import { type Page } from '@playwright/test';

/** Register a new account and land on /dashboard. */
export async function registerUser(
  page: Page,
  user: { name: string; email: string; password: string },
) {
  await page.goto('/authentication?mode=register');
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /create account/i }).click();
  await page.waitForURL('/dashboard');
}

/** Sign in and land on /dashboard. */
export async function loginUser(page: Page, user: { email: string; password: string }) {
  await page.goto('/authentication');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/dashboard');
}

/** Create a unique test email to avoid conflicts across runs. */
export function uniqueEmail(prefix = 'test') {
  return `${prefix}+${Date.now()}@example.com`;
}
