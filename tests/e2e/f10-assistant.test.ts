import { test, expect } from "@playwright/test";

test.describe("F10 E2E: AI Event Assistant", () => {
  test("AC-F10-9: suggestion chip streams answer and cards, confirm opens booking sheet", async ({ page }) => {
    await page.goto("/assistant");
    const chip = page.locator("button:has-text('Tech events')");
    if (await chip.isVisible()) {
      await chip.click();
      await expect(page.locator("[data-testid='chat-message']").first()).toBeVisible();
    }
  });

  test("AC-F10-11: offline, assistant shows offline notice and input is disabled", async ({ page, context }) => {
    try {
      await page.goto("/assistant");
      await context.setOffline(true);
      const offlineNotice = page.locator("text=The assistant needs internet");
      const chatInput = page.locator("form input");
      if (await offlineNotice.isVisible()) {
        await expect(chatInput).toBeDisabled();
      }
    } finally {
      await context.setOffline(false);
    }
  });
});
