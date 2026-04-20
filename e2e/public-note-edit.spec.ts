import { test, expect } from '@playwright/test';
import { registerUser, loginUser, uniqueEmail } from './helpers/auth';

const TEST_PASSWORD = 'Password123!';

async function createPublicNote(page: import('@playwright/test').Page, title: string) {
  // Create a note via the UI
  await page.goto('/notes/new');
  await page.waitForLoadState('networkidle');

  // Fill title
  await page.getByPlaceholder(/untitled/i).fill(title);

  // Enable sharing
  await page.getByRole('checkbox').check();

  // Save
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForLoadState('networkidle');

  // Return current URL to get note id
  return page.url();
}

test.describe('Public note — Edit link for owner', () => {
  test('owner sees Edit button on public note page', async ({ page }) => {
    const email = uniqueEmail('note-owner');
    await registerUser(page, { name: 'Note Owner', email, password: TEST_PASSWORD });

    // Create a note and enable sharing via API to avoid UI complexity
    const createRes = await page.request.post('/api/notes', {
      data: {
        title: 'My Public Note',
        content_json: JSON.stringify({ type: 'doc', content: [] }),
        is_public: true,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const { id } = await createRes.json();

    // Get the public slug
    const noteRes = await page.request.get(`/api/notes/${id}`);
    expect(noteRes.ok()).toBeTruthy();
    const note = await noteRes.json();
    expect(note.publicSlug).toBeTruthy();

    // Visit the public URL as the owner (still logged in)
    await page.goto(`/p/${note.publicSlug}`);

    await expect(page.getByRole('link', { name: /edit/i })).toBeVisible();
  });

  test('Edit link points to the note editor', async ({ page }) => {
    const email = uniqueEmail('note-owner-link');
    await registerUser(page, { name: 'Link Owner', email, password: TEST_PASSWORD });

    const createRes = await page.request.post('/api/notes', {
      data: {
        title: 'Editable Public Note',
        content_json: JSON.stringify({ type: 'doc', content: [] }),
        is_public: true,
      },
    });
    const { id } = await createRes.json();
    const noteRes = await page.request.get(`/api/notes/${id}`);
    const note = await noteRes.json();

    await page.goto(`/p/${note.publicSlug}`);

    await page.getByRole('link', { name: /edit/i }).click();
    await expect(page).toHaveURL(new RegExp(`/notes/${id}/edit`));
  });

  test('visitor (not logged in) does not see Edit button', async ({ page, browser }) => {
    // Create note as owner in a separate context
    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    const email = uniqueEmail('note-visitor');
    await registerUser(ownerPage, { name: 'Visitor Test Owner', email, password: TEST_PASSWORD });

    const createRes = await ownerPage.request.post('/api/notes', {
      data: {
        title: 'Visitor Note',
        content_json: JSON.stringify({ type: 'doc', content: [] }),
        is_public: true,
      },
    });
    const { id } = await createRes.json();
    const noteRes = await ownerPage.request.get(`/api/notes/${id}`);
    const note = await noteRes.json();
    await ownerCtx.close();

    // Visit as unauthenticated user (default page context has no session)
    await page.goto(`/p/${note.publicSlug}`);

    await expect(page.getByRole('link', { name: /edit/i })).toBeHidden();
  });

  test('different logged-in user does not see Edit button', async ({ page, browser }) => {
    // Create note as owner
    const ownerCtx = await browser.newContext();
    const ownerPage = await ownerCtx.newPage();
    const ownerEmail = uniqueEmail('note-other-owner');
    await registerUser(ownerPage, {
      name: 'Other Owner',
      email: ownerEmail,
      password: TEST_PASSWORD,
    });
    const createRes = await ownerPage.request.post('/api/notes', {
      data: {
        title: 'Other Note',
        content_json: JSON.stringify({ type: 'doc', content: [] }),
        is_public: true,
      },
    });
    const { id } = await createRes.json();
    const noteRes = await ownerPage.request.get(`/api/notes/${id}`);
    const note = await noteRes.json();
    await ownerCtx.close();

    // Log in as a different user
    const otherEmail = uniqueEmail('note-other-viewer');
    await registerUser(page, { name: 'Other Viewer', email: otherEmail, password: TEST_PASSWORD });

    await page.goto(`/p/${note.publicSlug}`);

    await expect(page.getByRole('link', { name: /edit/i })).toBeHidden();
  });

  test('public note shows creator name and avatar', async ({ page }) => {
    const email = uniqueEmail('note-creator-display');
    await registerUser(page, { name: 'Creator Name', email, password: TEST_PASSWORD });

    const createRes = await page.request.post('/api/notes', {
      data: {
        title: 'Creator Note',
        content_json: JSON.stringify({ type: 'doc', content: [] }),
        is_public: true,
      },
    });
    const { id } = await createRes.json();
    const noteRes = await page.request.get(`/api/notes/${id}`);
    const note = await noteRes.json();

    await page.goto(`/p/${note.publicSlug}`);

    await expect(page.getByText('Creator Name')).toBeVisible();
    await expect(page.locator('img[alt="Creator Name"]')).toBeVisible();
  });
});
