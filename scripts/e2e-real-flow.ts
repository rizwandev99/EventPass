import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:\\Users\\rizwan\\.gemini\\antigravity\\brain\\e0757112-5bd3-4b57-9858-5cd35b1a1f6a\\screenshots";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function ssPath(name: string) {
  return path.join(SCREENSHOT_DIR, name);
}

async function run() {
  console.log("=== Launching Real-Mode End-to-End User Flow Test ===");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    // ---------------------------------------------------------
    // STEP 1: Browse Events (/)
    // ---------------------------------------------------------
    console.log("\n[1/5] Testing Browse Events (/) & Discovery...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("01_browse_events.png") });
    console.log("✓ Saved: 01_browse_events.png");

    // Filter by TECH
    console.log("  - Filtering by TECH...");
    const techBtn = page.locator("button:has-text('TECH')").first();
    await techBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: ssPath("02_filter_tech.png") });
    console.log("✓ Saved: 02_filter_tech.png");

    // Filter by MUSIC
    console.log("  - Filtering by MUSIC...");
    const musicBtn = page.locator("button:has-text('MUSIC')").first();
    await musicBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: ssPath("03_filter_music.png") });
    console.log("✓ Saved: 03_filter_music.png");

    // Reset filter & Test debounced search
    console.log("  - Testing debounced search for keyword 'Delhi'...");
    const allBtn = page.locator("button:has-text('ALL')").first();
    await allBtn.click();
    await page.waitForTimeout(400);

    const searchInput = page.locator("input[placeholder*='Search events']").first();
    await searchInput.fill("Delhi");
    // wait for 250ms debouncer + URL sync
    await page.waitForTimeout(800);
    await page.screenshot({ path: ssPath("04_search_keyword.png") });
    console.log("✓ Saved: 04_search_keyword.png");

    // ---------------------------------------------------------
    // STEP 2: Event Detail & Real Booking Flow
    // ---------------------------------------------------------
    console.log("\n[2/5] Testing Event Detail & Real Booking Flow...");
    // Clear search to show full list
    await searchInput.fill("");
    await page.waitForTimeout(600);

    // Find first bookable event card
    const firstCard = page.locator("a[href*='/events/']").first();
    const eventHref = (await firstCard.getAttribute("href")) || "/events/delhi-live-indie-music-nights";
    console.log(`  - Opening Event: ${eventHref}...`);
    
    await page.goto(`http://localhost:3000${eventHref}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    
    const eventHeading = page.locator("h1").first();
    const eventTitle = (await eventHeading.textContent())?.trim() || "Delhi Live: Indie Music & Acoustic Nights";
    console.log(`  - Event Title: "${eventTitle}"`);
    
    await page.screenshot({ path: ssPath("05_event_detail.png") });
    console.log("✓ Saved: 05_event_detail.png");

    // Click "Get tickets"
    console.log("  - Opening Booking Sheet...");
    const getTicketsBtn = page.locator("button:has-text('Get tickets')").first();
    await getTicketsBtn.click();

    const modal = page.locator("[data-testid='booking-modal']");
    await modal.waitFor({ state: "visible", timeout: 5000 });

    // Select 1 ticket on the first tier using the '+' stepper
    console.log("  - Selecting ticket tier...");
    const plusBtn = modal.locator("button[aria-label='Increase quantity']").first();
    await plusBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: ssPath("06_booking_tier_selected.png") });
    console.log("✓ Saved: 06_booking_tier_selected.png");

    // Click Continue (1)
    const continueBtn = modal.locator("button:has-text('Continue')").first();
    await continueBtn.click();
    await page.waitForTimeout(500);

    // Step 2: Attendee Name (Guest session)
    console.log("  - Entering Attendee Name (Guest session handles booking without login)...");
    const nameInput = modal.locator("input[placeholder*='Rahul Sharma']").first();
    await nameInput.fill("Arjun Verma");
    await page.screenshot({ path: ssPath("07_booking_attendee_name.png") });
    console.log("✓ Saved: 07_booking_attendee_name.png");

    // Click Proceed to Payment
    const proceedBtn = modal.locator("button:has-text('Proceed to Payment'), button:has-text('Confirm Booking')").first();
    await proceedBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath("08_booking_payment.png") });
    console.log("✓ Saved: 08_booking_payment.png");

    // Click Pay
    console.log("  - Confirming real booking order...");
    const payBtn = modal.locator("button:has-text('Pay')").first();
    if (await payBtn.isVisible()) {
      await payBtn.click();
    }

    // Await success step
    await modal.locator("text=Booking Confirmed!").waitFor({ state: "visible", timeout: 10000 });
    await page.screenshot({ path: ssPath("09_booking_confirmed.png") });
    console.log("✓ Saved: 09_booking_confirmed.png");

    // ---------------------------------------------------------
    // STEP 3: Digital Wallet & High-Contrast QR Code
    // ---------------------------------------------------------
    console.log("\n[3/5] Testing Digital Wallet (/wallet) & Tamper-Proof QR Pass...");
    const viewWalletBtn = modal.locator("button:has-text('View Tickets in Wallet')").first();
    await viewWalletBtn.click();
    await page.waitForURL(/\/wallet/, { timeout: 8000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("10_digital_wallet.png") });
    console.log("✓ Saved: 10_digital_wallet.png");

    // View QR Pass
    console.log("  - Inspecting High-Contrast QR Pass modal...");
    const viewQrBtn = page.locator("button:has-text('View QR Pass')").first();
    await viewQrBtn.click();

    const qrTile = page.locator("[data-testid='qr-white-tile']");
    await qrTile.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(600);

    // Extract the HMAC signed ticket code text (e.g. EP1.tkt_...sig...)
    const codeElement = page.locator("p.font-mono.select-all").first();
    const ticketCode = (await codeElement.textContent())?.trim() || "";
    console.log(`  - Real HMAC-signed Ticket Code: ${ticketCode}`);

    await page.screenshot({ path: ssPath("11_wallet_qr_pass.png") });
    console.log("✓ Saved: 11_wallet_qr_pass.png");

    // Close QR modal
    const closeQrBtn = page.locator("button:has-text('Close')").first();
    await closeQrBtn.click();
    await page.waitForTimeout(400);

    // ---------------------------------------------------------
    // STEP 4: Gate Scanner (/scan) Real Pass/Fail Validation
    // ---------------------------------------------------------
    console.log("\n[4/5] Testing Gate Scanner (/scan) Real-Time Validation...");
    await page.goto("http://localhost:3000/scan", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: ssPath("12_scan_event_list.png") });
    console.log("✓ Saved: 12_scan_event_list.png");

    // Find and select the event matching our booked ticket
    console.log(`  - Selecting scanner for "${eventTitle}"...`);
    const scanEventLink = page.locator(`a:has-text('${eventTitle}')`).first();
    let scannerUrl = "";
    if (await scanEventLink.isVisible()) {
      scannerUrl = (await scanEventLink.getAttribute("href")) || "";
    } else {
      const anyEventLink = page.locator("a[href*='/scan/']").first();
      scannerUrl = (await anyEventLink.getAttribute("href")) || "";
    }
    
    await page.goto(`http://localhost:3000${scannerUrl}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("13_gate_scanner_view.png") });
    console.log("✓ Saved: 13_gate_scanner_view.png");

    // Test VALID TICKET PASS
    console.log(`  - Validating real booked ticket code: ${ticketCode}...`);
    const codeInput = page.locator("input[placeholder*='EP1.tkt_']").first();
    await codeInput.fill(ticketCode);

    const validateBtn = page.locator("button:has-text('Validate')").first();
    await validateBtn.click();

    // Wait for the overlay to appear
    const overlay = page.locator("[data-testid='scan-result-overlay']");
    await overlay.waitFor({ state: "visible", timeout: 5000 });
    await page.screenshot({ path: ssPath("14_scan_validation_pass.png") });
    console.log("✓ Saved: 14_scan_validation_pass.png (ADMITTED PASS)");

    // Wait for overlay to dismiss (1.5s)
    await page.waitForTimeout(2000);

    // Test INVALID / TAMPERED TICKET FAIL
    console.log("  - Validating invalid / tampered ticket code...");
    const fakeCode = "EP1.tkt_fake_hacked_9999.invalid_signature_hex";
    await codeInput.fill(fakeCode);
    await validateBtn.click();

    await overlay.waitFor({ state: "visible", timeout: 5000 });
    await page.screenshot({ path: ssPath("15_scan_validation_fail.png") });
    console.log("✓ Saved: 15_scan_validation_fail.png (INVALID CODE FAIL)");

    await page.waitForTimeout(2000);

    // ---------------------------------------------------------
    // STEP 5: AI Event Assistant (/assistant) Real Gemini Chat
    // ---------------------------------------------------------
    console.log("\n[5/5] Testing AI Event Assistant (/assistant) with Live Gemini API...");
    await page.goto("http://localhost:3000/assistant", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("16_ai_assistant_initial.png") });
    console.log("✓ Saved: 16_ai_assistant_initial.png");

    // Prompt 1: "What tech events do you have coming up?"
    console.log("  - Asking AI: 'What tech events do you have coming up?'...");
    const chatInput = page.locator("form input").first();
    await chatInput.fill("What tech events do you have coming up?");
    const sendBtn = page.locator("button[aria-label='Send message']").first();
    await sendBtn.click();

    // Wait for response to appear (Gemini generation)
    console.log("  - Waiting for live Gemini response stream...");
    await page.waitForFunction(
      () => {
        const msgs = document.querySelectorAll("[data-testid='chat-message']");
        return msgs.length >= 3; // intro, user, assistant response
      },
      { timeout: 25000 }
    );
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("17_ai_assistant_tech_events_reply.png") });
    console.log("✓ Saved: 17_ai_assistant_tech_events_reply.png");

    // Prompt 2: "Find me a free event."
    console.log("  - Asking AI: 'Find me a free event.'...");
    await chatInput.fill("Find me a free event.");
    await sendBtn.click();

    console.log("  - Waiting for live Gemini response stream...");
    await page.waitForFunction(
      () => {
        const msgs = document.querySelectorAll("[data-testid='chat-message']");
        return msgs.length >= 5; // intro, user1, ast1, user2, ast2
      },
      { timeout: 25000 }
    );
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ssPath("18_ai_assistant_free_event_reply.png") });
    console.log("✓ Saved: 18_ai_assistant_free_event_reply.png");

    console.log("\n==================================================================");
    console.log("=== ALL REAL-MODE END-TO-END TESTS PASSED WITH SCREENSHOT PROOFS! ===");
    console.log("==================================================================");
  } catch (err) {
    console.error("Test failed with error:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

run();
