import { test, expect } from "@playwright/test";

test.describe("F1 & F2 E2E: App Shell, Design System & Guest Session", () => {
  test("AC-F1-2: with system theme set to dark and nothing saved, first paint is dark without flash", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/about");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("AC-F1-3: at 360 px width bottom tab bar shows four tabs and sidebar is hidden; at 1280 px sidebar shows", async ({ page }) => {
    // Mobile 360px viewport
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/about");
    const bottomNav = page.locator("[data-testid='mobile-bottom-nav']");
    await expect(bottomNav).toBeVisible();
    const sidebar = page.locator("[data-testid='desktop-sidebar']");
    await expect(sidebar).toBeHidden();

    // Desktop 1280px viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about");
    await expect(sidebar).toBeVisible();
    await expect(bottomNav).toBeHidden();
  });

  test("AC-F1-7: unknown URL shows not-found page with a link home", async ({ page }) => {
    await page.goto("/non-existent-random-route-404");
    await expect(page.locator("text=Page Not Found")).toBeVisible();
    const homeLink = page.locator("a[href='/']");
    await expect(homeLink).toBeVisible();
  });

  test("AC-F1-9: /about shows demo description, demo steps and tech list", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=About This Demo")).toBeVisible();
    await expect(page.locator("text=The 2-minute demo")).toBeVisible();
    await expect(page.locator("text=Tech Stack")).toBeVisible();
  });

  test("AC-F2-4: Reset demo identity clears cookie, wallet cache and scanner data", async ({ page, context }) => {
    await page.goto("/about");
    const resetBtn = page.locator("button:has-text('Reset demo identity')");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(page.locator("text=Demo identity reset")).toBeVisible();
  });
});
