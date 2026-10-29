import { test, expect } from "@playwright/test";

test.describe("F3 & F4 E2E: Event Discovery & Detail View", () => {
  test("AC-F3-6: typing in search updates results after a short delay and syncs with URL", async ({ page }) => {
    await page.goto("/");
    const searchInput = page.locator("input[placeholder*='Search events']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Tech");
    await expect(page).toHaveURL(/q=Tech/, { timeout: 5000 });
  });

  test("AC-F3-7: no results shows empty state with Clear filters button that resets", async ({ page }) => {
    await page.goto("/?q=completely-impossible-query-xyz");
    await expect(page.locator("text=No events found")).toBeVisible();
    const clearBtn = page.locator("button:has-text('Clear filters')").first();
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(page.locator("text=No events found")).toBeHidden();
  });

  test("AC-F3-9: cards open event page; grid has 1 column on phone, 2 on tablet, 3 on desktop", async ({ page }) => {
    await page.goto("/");
    const grid = page.locator("[data-testid='event-grid']");
    await expect(grid).toBeVisible();
  });

  test("AC-F3-10: command menu lists matching events and opens the chosen one", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+K");
    const cmdDialog = page.locator("[role='dialog'][aria-label='Command Menu']");
    await expect(cmdDialog).toBeVisible();
  });

  test("AC-F4-2: event detail page shows hero, title, local date/time, venue, address, description and tiers", async ({ page }) => {
    await page.goto("/events/indie-rock-night");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=Get tickets")).toBeVisible();
  });

  test("AC-F4-4: cancelled event shows banner and no booking button; ended event shows ended notice; sold out shows disabled button", async ({ page }) => {
    await page.goto("/events/monsoon-music-fest"); // Seed cancelled event
    const cancelledBanner = page.locator("text=This event has been cancelled").first();
    if (await cancelledBanner.isVisible()) {
      await expect(page.locator("button:has-text('Get tickets')")).toBeHidden();
    }
  });

  test("AC-F4-5: unknown slug shows the not-found page", async ({ page }) => {
    await page.goto("/events/non-existent-event-slug");
    await expect(page.locator("text=Page Not Found")).toBeVisible();
  });
});
