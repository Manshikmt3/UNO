import { expect, test } from '@playwright/test';

test.describe('UNO Arena End-to-End Suite', () => {
  test('Landing page renders branding, mode selector, and rule highlights', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('UNO ARENA');
    await expect(page.getByRole('button', { name: /play vs computer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /multiplayer/i })).toBeVisible();
    await expect(page.getByText(/108 Standard Cards/i)).toBeVisible();
    await expect(page.getByText(/WD4 Challenges/i)).toBeVisible();
  });

  test('Starts single-player game vs AI and interacts with table', async ({ page }) => {
    await page.goto('/');

    // Click Start Game vs AI
    const startAiBtn = page.getByRole('button', { name: /start game vs ai/i });
    await expect(startAiBtn).toBeVisible();
    await startAiBtn.click();

    // Verify navigation to /play/ai
    await expect(page).toHaveURL(/\/play\/ai/);

    // Verify table elements
    await expect(page.getByText(/your hand/i)).toBeVisible();
    await expect(page.getByText(/discard/i)).toBeVisible();
    await expect(page.getByText(/draw \(/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /call uno/i })).toBeVisible();

    // Verify AI opponent is visible
    await expect(page.getByText(/bot/i).first()).toBeVisible();

    // Draw card interaction
    const drawPileBtn = page.getByLabel(/draw card from pile/i);
    await expect(drawPileBtn).toBeVisible();
  });

  test('Opens and reads Rules modal', async ({ page }) => {
    await page.goto('/');

    // Open rules
    const rulesBtn = page.getByLabel(/view game rules/i);
    await expect(rulesBtn).toBeVisible();
    await rulesBtn.click();

    await expect(page.getByText(/uno arena rules & gameplay/i)).toBeVisible();
    await expect(page.getByText(/special action cards/i)).toBeVisible();

    // Close rules
    const gotItBtn = page.getByRole('button', { name: /got it/i });
    await gotItBtn.click();
    await expect(page.getByText(/uno arena rules & gameplay/i)).not.toBeVisible();
  });

  test('Opens Settings modal and adjusts preferences', async ({ page }) => {
    await page.goto('/');

    // Open settings
    const settingsBtn = page.getByLabel(/open settings/i);
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    await expect(page.getByText(/game settings/i)).toBeVisible();
    await expect(page.getByText(/sound effects/i)).toBeVisible();
    await expect(page.getByText(/animations/i)).toBeVisible();

    // Close settings
    const doneBtn = page.getByRole('button', { name: /done/i });
    await doneBtn.click();
    await expect(page.getByText(/game settings/i)).not.toBeVisible();
  });

  test('Creates a private multiplayer room and displays room code', async ({ page }) => {
    await page.goto('/');

    // Switch to Multiplayer tab
    const mpTabBtn = page.getByRole('button', { name: /multiplayer/i });
    await mpTabBtn.click();

    // Click Create Private Room
    const createRoomBtn = page.getByRole('button', { name: /create private room/i });
    await expect(createRoomBtn).toBeVisible();
    await createRoomBtn.click();

    // Verify navigation to /multiplayer
    await expect(page).toHaveURL(/\/multiplayer/);

    // Verify room code (6 uppercase characters) is displayed in lobby
    const codeLocator = page.locator('.font-mono').first();
    await expect(codeLocator).toBeVisible({ timeout: 10000 });
    const code = await codeLocator.textContent();
    expect(code?.trim()).toHaveLength(6);

    // Verify lobby host badge and controls
    await expect(page.getByText(/connected players/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /waiting for players|start game/i })).toBeVisible();
  });
});
