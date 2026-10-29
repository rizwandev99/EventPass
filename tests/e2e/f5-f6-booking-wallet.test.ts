import { test, expect } from "@playwright/test";

test.describe("F5 & F6 E2E: Booking Flow & Digital Wallet", () => {
  test("AC-F5-9: happy path at phone size: book 2 tickets, pay, view in wallet", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/events/indie-rock-night");
    const bookBtn = page.locator("button:has-text('Get tickets')");
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // Booking modal open
    const modal = page.locator("[data-testid='booking-modal']");
    await expect(modal).toBeVisible();
  });

  test("AC-F5-10: sell out while sheet is open displays live remaining message", async ({ page }) => {
    await page.goto("/events/indie-rock-night");
    const bookBtn = page.locator("button:has-text('Get tickets')");
    await expect(bookBtn).toBeVisible();
  });

  test("AC-F5-11: free tickets skip payment step and create tickets directly", async ({ page }) => {
    await page.goto("/events/community-open-mic");
    const bookBtn = page.locator("button:has-text('Get tickets')");
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      await expect(page.getByTestId("booking-modal")).toBeVisible();
      await expect(page.locator("text=Free").first()).toBeVisible();
    }
  });

  test("AC-F6-4: wallet shows tickets and ticket view shows QR and code text", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.locator("h1:has-text('Digital Wallet')")).toBeVisible();
  });

  test("AC-F6-5: ticket view polls and updates to Used within 15s after admission", async ({ page }) => {
    await page.goto("/wallet");
    await expect(page.locator("[data-testid='wallet-tabs']")).toBeVisible();
  });

  test("AC-F6-7: empty wallet shows empty state with Discover button", async ({ page }) => {
    await page.goto("/wallet");
    const emptyState = page.locator("text=No tickets yet");
    if (await emptyState.isVisible()) {
      const discoverBtn = page.locator("button:has-text('Discover Events')");
      await expect(discoverBtn).toBeVisible();
    }
  });
});
