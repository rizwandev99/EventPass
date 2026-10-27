# PRD: EventPass – Mobile-First Ticketing App

Oct 27, 2026 · @Rizwan

## 1. Product Overview

EventPass is a mobile-first event ticketing app. People find events, book tickets, keep them in a digital wallet, and get checked in at the gate by scanning a QR code, even with no internet.

This is a showcase project, not a real business. A hiring team at a product studio will open it, use it for a few minutes, and judge the polish and the code. It must feel like a real product, not a tutorial. The app name "EventPass" can be changed.

**Three parts in one app**

- **Attendee app:** browse events, book tickets, see QR tickets in a wallet.
- **Gate Scanner:** staff scan tickets with the phone camera. It works offline and syncs later.
- **AI Event Assistant:** a chat that finds events and prepares a booking for the user to confirm.

**Goals**

- A complete ticketing flow: list, detail, book, wallet, scan.
- Offline-first behavior that is easy to see and demo.
- A clean, fast, modern UI in dark and light mode.
- Code that a senior engineer would respect: typed, tested, small files, clear names.
- Zero cost to build and run.

**The 2-minute demo the viewer will do**

1. Open the app and see a list of events.
2. Book 2 tickets for one event.
3. Open the wallet and see the QR tickets.
4. Open the Scanner on a second device or tab and scan a ticket. It shows green.
5. Turn off the internet and scan another ticket. It still works. Turn the internet on and the scans sync.
6. Ask the assistant: "something fun this weekend under ₹1000".

**Success criteria**

- All 10 features in section 7 pass their acceptance criteria and their PRD review.
- Every acceptance criterion has at least one automated test.
- The deployed app works on a phone-size screen and a desktop screen, in both themes.
- The offline demo (step 5) works without any manual fix.

**How this project matches the target job post**

The job post is the Timebase Remote Full Stack Developer (6 Months Internship) listing on Wellfound, checked October 2026.

| Job post asks for | Where this app shows it |
| --- | --- |
| Core ticketing flow: event listing, booking, digital wallet | F3, F4, F5, F6 |
| QR code ticket validation and scanning | F8 |
| Offline data handling (bonus) | F7, F9 |
| QR code scanners (bonus) | F8, F9 |
| Next.js and JavaScript/TypeScript | Whole app, strict TypeScript |
| REST APIs for events, tickets, booking | Section 8 API list |
| Mobile UI/UX best practices, responsive UI, animations | F1, F6, section 5 |
| Debugging crashes, edge cases, performance | Edge-case criteria in every feature, section 9 |
| PostgreSQL and Prisma (skill tags) | Neon Postgres with Prisma |
| Git and working in sprints | Small commits, one feature per cycle |
| AI-first platforms (from their website) | F10 AI Event Assistant |

The job post also lists Node.js and MongoDB as skills. Node.js runs the Next.js server code. MongoDB is not used, because the studio website names PostgreSQL and Prisma as its main database stack.

## 2. Rules for the AI Agent (read this first)

You are the AI agent building this app. Follow these rules for the whole project. They matter as much as the features. If a rule here conflicts with your habits, the rule wins.

### 2.1 Always use the latest versions

- This PRD does not list any version numbers on purpose. Your memory of versions is old.
- Install every framework and library at its latest stable version (for example with the package manager's `latest` tag). Do not copy version numbers from memory, blog posts or old examples.
- Before using a framework or library, read its current official documentation for the version you installed. If the docs and your memory disagree, the docs win.
- Use the current recommended patterns, not deprecated ones. If a command or API from your memory fails, look up the new way in the docs. Do not downgrade to make old code work.
- Use web search to confirm anything that may have changed: setup steps, config names, free-tier limits.

### 2.2 Test-driven development (TDD) is required

For every feature, write the failing tests first. Never write feature code before a failing test exists for it.

1. Read the feature in section 7. Each acceptance criterion (AC) has an ID like `AC-F5-3`.
2. Write tests for the ACs. Put the AC ID in each test name, for example `AC-F5-3: rejects quantity above max per order`.
3. **Red:** run the tests. Confirm they fail, and that they fail for the right reason (missing behavior, not a typo or bad import). Keep the failing output.
4. **Green:** write the smallest code that makes the tests pass.
5. **Refactor:** clean up while the tests stay green.
6. Run the full checks: unit and integration tests, type check, lint. All must pass before review.

If you find a bug later, first write a failing test that shows the bug, then fix it.

### 2.3 PRD code review after every feature

A feature is not done when the tests pass. It is done when the review passes.

1. After a feature is green, review the code against this PRD. If you can start a separate sub-agent or fresh pass that did not write the code, use it. Otherwise re-read the PRD section from the top and check as a strict reviewer.
2. Check the feature line by line: every requirement, every AC, every edge case, plus the shared checks in 2.4.
3. Write the result in `docs/reviews/F<number>-review.md` using the template in section 10. Each row needs evidence: a file path and the test name that proves it.
4. If any row is **Not met** or **Partly met**: write a new failing test, fix, run all checks, and review again.
5. Only when every row is **Met**, commit and mark the feature done in `PROGRESS.md`. Then start the next feature.

Do not skip a review because the feature looks small. Do not mark a row Met without evidence.

### 2.4 Shared checks for every feature

- Works at phone width (360 px) and desktop width. Touch targets are at least 44 px.
- Works in dark mode and light mode. Only design tokens from section 5 are used. No hard-coded colors.
- Loading, empty and error states exist and look good.
- Keyboard works and focus is visible. Images and icon buttons have labels.
- Inputs are validated on the server with a schema. Errors use the standard error format from section 8.
- No paid service, no login system, no secret in the repo.
- TypeScript strict mode passes with no `any`. No leftover `console.log`.

### 2.5 Free services only

- Everything must cost zero and must not need a credit card.
- Allowed: Vercel Hobby, Neon free plan, a free AI model API key, open-source libraries.
- If you think something paid is needed, stop. Pick a free option or build a simple fake version (a mock) instead. Write the choice in `DECISIONS.md`.
- Do not add Razorpay, Stripe, Twilio, email services, paid image services or paid analytics.

### 2.6 No authentication

- This is a showcase app. Do not build login, signup, passwords, OAuth, roles or admin pages. Do not install an auth library.
- The app gives each browser a random guest ID (feature F2). That is the only identity.
- The scanner page is open to everyone. Show a small "Demo mode" note instead of any login.

### 2.7 Working style

- Build one feature at a time, in the order in section 10. Do not start the next feature before the review of the current one passes.
- Do not add features that are not in this PRD. If something is unclear, choose the simplest reading and write your assumption in `DECISIONS.md`.
- Keep `PROGRESS.md` up to date: each feature is Not started, In progress, or Done (review passed).
- Make small commits with clear messages. One commit for the failing tests, one for the passing code, one for the review is a good rhythm.
- Keep files small and names clear. Separate pure logic (easy to test) from UI and from database code.
- Never commit secrets. Keep a `.env.example` with names only.

## 3. Scope

Build only what is in the "In scope" list. Everything in "Out of scope" is left out on purpose, so the project stays small and finishes.

| In scope | Out of scope |
| --- | --- |
| Event list with search and filters | Login, signup, passwords, roles, admin pages |
| Event detail page with ticket tiers | Real payments (Razorpay, Stripe, UPI). Payment is a fake step |
| Booking flow with a fake payment step | Email, SMS or WhatsApp sending |
| Digital wallet with QR tickets | Creating or editing events in the UI. Events come from seed data |
| Installable app (PWA) with offline wallet | Refunds, ticket transfer, resale |
| Gate Scanner with camera and manual entry | Push notifications, native iOS or Android apps |
| Offline scanning with later sync | Multiple languages |
| AI Event Assistant chat with tool calling | Vector search or RAG (Neon supports it, so it can be added later) |
| Dark and light theme, Linear-style design | User analytics, ads, tracking |
| Short "About this demo" page | Paid hosting, paid database, paid AI models |

**Currency:** show prices in Indian rupees (₹). Store money as whole numbers in the smallest unit (paise), never as decimals.

**Language:** all app text is in simple English.

**Browsers:** latest Chrome and Safari on phone and desktop. The camera scanner must have a fallback when the browser has no built-in QR detector.

## 4. Tech Stack and Free Services

The stack copies what the Timebase website says it uses (Next.js, TypeScript, Tailwind, PostgreSQL, Prisma, Vercel, Vercel AI SDK), with only free services. Install the latest stable version of everything (rule 2.1).

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router), React, TypeScript in strict mode | One app for UI and REST API routes |
| Styling | Tailwind CSS | Design tokens as CSS variables (section 5) |
| UI parts | Radix UI primitives or shadcn/ui, Lucide icons, Inter font via the Next.js font tool | Free and open source |
| Theme | next-themes or a small custom script | No flash of wrong theme on load |
| Database | Neon Postgres, added through the Vercel integration | Free plan |
| ORM | Prisma with the Neon driver setup from the Prisma docs | Migrations plus a seed script |
| Validation | Zod | Every API input and every AI tool input |
| Ticket signing | Built-in Node `crypto` (HMAC) | No extra library |
| QR create | A small maintained open-source QR library | Draw as SVG so it stays sharp |
| QR scan | Built-in `BarcodeDetector` when the browser has it, else a maintained open-source JS or WASM scanner | Choose one that has recent releases |
| Offline | Service worker (follow the current Next.js PWA guide) and IndexedDB with a small wrapper like `idb` | Cache app shell, wallet and scanner data |
| AI | Vercel AI SDK with a free model provider | See "AI model" below |
| Tests | Vitest, Testing Library, Playwright, `fake-indexeddb` | Section 9 |
| Quality | ESLint, Prettier, `tsc` type check | One `check` script runs all |
| Package manager | pnpm | Free |
| Hosting and Git | Vercel Hobby and a public GitHub repo | Free |

**Free services and their limits (checked October 2026)**

| Service | What is free | Limits to design for |
| --- | --- | --- |
| Neon | Free plan, no card needed | 100 CU-hours of compute per project per month. Compute sleeps after 5 minutes idle, so the first query can be slow. 10 branches per project. Storage: Neon's pages show both 0.5 GB and 1 GB per project, so stay under 0.5 GB. Our data is tiny. |
| Vercel Hobby | Free hosting | For personal, non-commercial use only. If usage goes over the free limits, the project is paused. Function run time is short, so keep API calls fast and stream AI replies. |
| AI model API | A free key from Google AI Studio (Gemini API) | The free tier has request-per-minute and per-day limits that are tight and can change. Some top models are paid only. Free-tier prompts may be used by the provider to improve its products, so send only fake demo data. |

**AI model rules**

- Pick a current Flash-class (fast, small) model that your free key is allowed to use. Check the rate-limit page in AI Studio on the day you build.
- Keep the provider and model in environment variables so they can be swapped. If the free tier changes, switch to another free provider the AI SDK supports. Do not pay.
- The AI feature must never break the app. When the model is slow, over its limit, or missing a key, show a friendly message and use the basic search fallback (feature F10).

**Environment variables** (names only, put them in `.env.example`)

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection, used by the running app |
| `DIRECT_DATABASE_URL` | Neon direct connection, used for migrations |
| `DATABASE_URL_TEST` | A separate Neon branch used only by tests |
| `TICKET_SIGNING_SECRET` | Long random string used to sign ticket codes |
| `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY` | Free AI model settings |

**Suggested folder layout**

```text
src/
  app/            pages and REST route handlers
  components/     UI parts (design system in components/ui)
  lib/domain/     pure logic: pricing, ticket codes, scan decisions, sync rules
  lib/offline/    service worker helpers, IndexedDB, sync queue
  lib/ai/         assistant tools, prompts, fallback search
  server/         database access (Prisma), services used by route handlers
prisma/           schema, migrations, seed
tests/            e2e tests and shared test helpers
docs/reviews/     one review file per feature
PROGRESS.md  DECISIONS.md  .env.example
```

Put rules in pure functions under `lib/domain` so they are easy to test first. Route handlers stay thin: validate, call a service, return JSON.

**Sources:** [Neon Free plan limits](https://neon.com/faqs/free-plan-limits-and-quotas) · [Neon plans](https://neon.com/docs/introduction/plans) · [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) · [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) · [Gemini with Vercel AI SDK](https://ai.google.dev/gemini-api/docs/vercel-ai-sdk-example) · [Timebase website](https://www.timebasehq.com/)

## 5. Design System

The look is modern, calm and sharp, in the spirit of linear.app: quiet neutral colors, one accent color, thin borders, tight spacing, fast small animations. Take inspiration only. Do not copy any logo, text or asset from Linear. Dark and light mode are both first-class: design and test both from the start.

### 5.1 Principles

- Content first. Few colors, lots of space, borders instead of heavy shadows.
- One accent color, used for the main action and for focus only.
- Everything is fast: transitions of 120 to 200 ms, no bouncing, no long animations.
- Mobile first. Design for 360 px wide first, then grow to desktop.
- Respect the user: follow the system theme by default, respect "reduce motion".

### 5.2 Color tokens

Define every color as a CSS variable and map it in Tailwind. Components may only use these tokens. The values below are starting points: change them if a text color fails the contrast rule (normal text at least 4.5:1, large text and icons at least 3:1) in either theme.

| Token | Light | Dark |
| --- | --- | --- |
| `bg` (page) | `#FFFFFF` | `#0B0C0E` |
| `bg-subtle` | `#FAFAFB` | `#101114` |
| `surface` (cards) | `#F4F5F7` | `#16171B` |
| `surface-raised` (menus, sheets) | `#FFFFFF` | `#1C1D22` |
| `border` | `rgba(17,18,20,0.08)` | `rgba(255,255,255,0.08)` |
| `border-strong` | `rgba(17,18,20,0.16)` | `rgba(255,255,255,0.16)` |
| `text` | `#111214` | `#F2F3F5` |
| `text-muted` | `#5B6068` | `#A0A4AB` |
| `text-faint` | `#8B9098` | `#6F737B` |
| `accent` | `#5B5BD6` | `#7C7FF2` |
| `accent-hover` | `#4C4CC4` | `#9296F5` |
| `accent-soft` (tinted background) | `rgba(91,91,214,0.10)` | `rgba(124,127,242,0.16)` |
| `success` | `#1F9D63` | `#3DD68C` |
| `warning` | `#B7791F` | `#F5B544` |
| `danger` | `#D93844` | `#FF6B73` |
| `info` | `#2F6FED` | `#6EA8FF` |

Focus ring: 2 px `accent` outline with a 2 px offset, on every interactive element.

### 5.3 Type, space, shape, motion

| Area | Rule |
| --- | --- |
| Font | Inter for text. A monospace font for ticket codes and numbers that must line up. Load fonts with the Next.js font tool (self-hosted, free). |
| Sizes | 12, 13, 14 (default body), 16, 20, 24, 32 px. Weights 400, 500, 600. Headings use slightly tight letter spacing. |
| Spacing | 4 px grid. Page side padding 16 px on phone, 24 px or more on desktop. |
| Radius | 6 px for controls, 10 px for cards, 16 px for sheets and dialogs. |
| Borders and depth | 1 px borders using the `border` token. Very soft shadows in light mode only. In dark mode use borders and a slightly lighter surface. |
| Motion | 120 to 200 ms, ease-out. Fade and small slide only. Turn motion off when the user asks for reduced motion. |
| Icons | Lucide, 16 or 20 px, stroke width the same everywhere. |

### 5.4 Layout

- **Phone (under 768 px):** a bottom tab bar with four tabs: Discover, Wallet, Scan, Assistant. Respect the device safe area at the bottom. Dialogs for choices open as bottom sheets.
- **Desktop (1024 px and up):** a slim left sidebar with the same four items, content centered with a maximum width, dialogs shown in the center.
- A top bar holds the page title and the theme toggle (light, dark, system).

### 5.5 Components to build first (`components/ui`)

Button (primary, secondary, ghost, danger; small, medium, large), IconButton, Input, Select, Tabs, Badge, Card, Dialog and Sheet, Toast, Skeleton, EmptyState, ErrorState, Tooltip, Stepper (quantity), Command menu. Each one is keyboard friendly, uses only tokens, and looks right in both themes.

### 5.6 Signature details

- **Command menu:** press Ctrl+K or Cmd+K to search events and jump to pages. Works on desktop. On phone, a search button opens the same menu.
- **Event cover art:** no outside images. Draw a cover from the event ID: a soft gradient and a simple pattern made with CSS or SVG, using the accent family and category colors. It works offline and costs nothing.
- **Ticket card:** looks like a real ticket, with a notch between the info part and the QR part. The QR always sits on a white tile with a quiet margin, in both themes, so cameras can read it.
- **Status badges:** Valid (success), Used (muted), Cancelled (danger), Sold out (muted), Almost gone (warning).
- **Offline banner:** a thin, calm bar at the top when the device is offline.
- **Theme switch:** no flash of the wrong theme on first load. The browser's theme color meta tag changes with the theme.

## 6. Data Model

The database has six main tables in Neon Postgres (feature F10 adds a seventh, a tiny RateLimit table), defined in the Prisma schema. Use the field names below as a guide. Add indexes where the notes say so.

### 6.1 Tables

**Guest** (a random browser identity, not an account)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | text, unique | Random ID made by the server |
| `displayName` | text, optional | Shown nowhere important. Used by the assistant greeting |
| `createdAt` | datetime |  |

**Event**

| Field | Type | Notes |
| --- | --- | --- |
| `id` | text, unique |  |
| `slug` | text, unique | Used in the URL |
| `title`, `description` | text |  |
| `category` | enum | MUSIC, TECH, SPORTS, COMEDY, FOOD, ART |
| `city`, `venueName`, `address` | text |  |
| `startsAt`, `endsAt` | datetime (UTC) | Index on `startsAt`. Show in the viewer's local time |
| `status` | enum | PUBLISHED or CANCELLED |
| `coverSeed` | text | Input for the generated cover art |

**TicketTier**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `eventId` | text | Index on `eventId` |
| `name`, `description` | text | For example General, VIP |
| `pricePaise` | integer, 0 or more | 0 means free |
| `capacity` | integer, above 0 |  |
| `sold` | integer, 0 or more | Database check: `sold` never goes above `capacity` |
| `maxPerOrder` | integer | Default 6 |

**Order**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `guestId`, `eventId` | text | Index on `guestId` |
| `status` | enum | CONFIRMED or CANCELLED |
| `totalPaise` | integer |  |
| `attendeeName` | text |  |
| `paymentRef` | text | Fake reference such as `FAKE-<random>` |
| `createdAt` | datetime |  |

**Ticket**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `orderId`, `eventId`, `tierId`, `guestId` | text | Index on `guestId` and on (`eventId`, `status`) |
| `attendeeName` | text |  |
| `code` | text, unique | The signed string inside the QR (see 6.2) |
| `status` | enum | VALID, USED or CANCELLED |
| `usedAt` | datetime, optional | Time of the first successful scan |
| `usedByDeviceId` | text, optional | Which scanner device admitted it |

**ScanLog**

| Field | Type | Notes |
| --- | --- | --- |
| `id`, `eventId` | text | Index on `eventId` |
| `ticketId` | text, optional | Empty when the code was not valid |
| `code`, `deviceId` | text |  |
| `result` | enum | ADMITTED, ALREADY\_USED, INVALID, WRONG\_EVENT, TICKET\_CANCELLED |
| `scannedAt` | datetime | Time on the scanner device |
| `receivedAt` | datetime | Time the server saw it. Offline scans also carry clientScanId (text, optional, made on the device). It is unique together with deviceId, so a repeated sync never counts a scan twice |
| `source` | enum | ONLINE or OFFLINE\_SYNC |

### 6.2 Ticket code

- Format: `EP1.<ticketId>.<signature>`. The signature is the first 16 characters of a base64url HMAC-SHA256 of the ticket ID and event ID, made with `TICKET_SIGNING_SECRET`.
- The QR contains only this short string, so it scans fast.
- Check the signature with a constant-time compare before any database lookup. A bad signature is INVALID.
- The signing secret never goes to the browser. The offline scanner pack holds the list of valid codes, not the secret.

### 6.3 Rules

- Money is stored as whole paise. Format it as rupees only when showing it.
- Creating an order and its tickets is one database transaction. Capacity is taken with one atomic update, so two people can never buy the last ticket together.
- A ticket becomes USED only once. A second scan never changes `usedAt`.
- Do not delete rows in the app. Cancelled events and tickets keep their rows.

### 6.4 Browser storage (IndexedDB)

| Store | Holds | Used by |
| --- | --- | --- |
| `wallet_tickets` | The guest's tickets, with event details copied in, and the last sync time | F6, F7 |
| `scan_packs` | Per event: the list of tickets (code, ticket ID, tier, attendee, status) and the download time | F9 |
| `scan_queue` | Scans made offline that wait to sync: event ID, code, scan time, local result, device ID | F9 |
| `meta` | Scanner `deviceId` (random, made once), settings | F8, F9 |

## 7. Features

There are 10 features. Build them in order (section 10). Each feature has a goal, requirements, and acceptance criteria (ACs). Every AC needs at least one test, and the test name starts with the AC ID. The tag in brackets says the best test type: unit, component, integration (real test database) or e2e (Playwright). Edge cases are written as ACs on purpose, so none are forgotten.

### F1. App shell and design system

**Goal:** the frame and the building blocks every other screen uses.

**Requirements**

- Tokens, theme toggle (light, dark, system), layout (section 5.4), the components in 5.5, command menu, offline banner component (wired up in F7).
- A friendly not-found page and an error page with a retry button.
- An `/about` page: what this demo is, the 2-minute demo steps from section 1, the tech used, and a link to the source repo.

**Acceptance criteria**

- **AC-F1-1** \[component\] The theme toggle switches between light, dark and system. The choice is saved and restored after reload.
- **AC-F1-2** \[e2e\] With the system theme set to dark and nothing saved, the first paint is dark. The theme is set on the page before the first paint, so there is no flash.
- **AC-F1-3** \[e2e\] At 360 px width the bottom tab bar shows four tabs and the sidebar is hidden. At 1280 px width the sidebar shows and the tab bar is hidden.
- **AC-F1-4** \[unit\] A check finds no hard-coded color values in `components` and `app` files outside the token file.
- **AC-F1-5** \[unit\] Each text token on its background token meets the contrast rule from 5.2 in both themes.
- **AC-F1-6** \[component\] The command menu opens with Ctrl+K and Cmd+K, closes with Escape, keeps focus inside while open and returns focus when closed.
- **AC-F1-7** \[e2e\] An unknown URL shows the not-found page with a link home. A render error shows the error state with a retry button, never a blank screen.
- **AC-F1-8** \[component\] Interactive elements show a visible focus ring and have accessible names. With reduced motion on, animations are off.
- **AC-F1-9** \[e2e\] `/about` shows the demo description, the demo steps and the tech list.

### F2. Guest session (no login)

**Goal:** give each browser an identity so tickets belong to someone, with no auth system.

**Requirements**

- The server sets a random, hard-to-guess guest ID in a long-lived cookie (HttpOnly, SameSite Lax, Secure in production).
- The Guest row is created only when needed (first booking or first wallet read), not on every page view.
- A "Reset demo identity" button on `/about` clears the cookie and all data stored on this device.

**Acceptance criteria**

- **AC-F2-1** \[integration\] A request without a guest cookie gets a new cookie with at least 128 bits of randomness. Later requests keep the same ID.
- **AC-F2-2** \[integration\] Orders and tickets are only returned for the guest in the cookie. Asking for another guest's ticket or order gives 404.
- **AC-F2-3** \[integration\] Public pages and event APIs do not create Guest rows. The first booking or wallet read does.
- **AC-F2-4** \[e2e\] "Reset demo identity" clears the cookie, the wallet cache and the scanner data on this device. The wallet is empty afterwards.
- **AC-F2-5** \[unit\] The project has no auth library in `package.json` and no route named login, signup or sign-in.

### F3. Event discovery

**Goal:** the home page where people find events fast.

**Requirements**

- `/` lists upcoming events, soonest first. Cancelled events are listed with a Cancelled badge. A "Show past events" option adds events that have ended.
- Search text matches title, venue, city and description.
- Filters: category chips, city, date (Today, This weekend, Next 7 days, Next 30 days, Any), price (Free, Under ₹500, Under ₹1000, Any). Sort: Soonest, Price low to high.
- Filters and search live in the URL, so a link restores the same view.
- Event card: generated cover, title, local date and time, venue and city, price text, and badges. Page size 12 with a "Load more" button (cursor based). The first page is rendered on the server. Search waits 250 ms after typing stops.
- Loading shows skeleton cards. Empty and error states are designed.
- The command menu searches events too.

**Acceptance criteria**

- **AC-F3-1** \[integration\] `GET /api/events` returns upcoming PUBLISHED and CANCELLED events sorted by start time. Past events appear only with `includePast=true`.
- **AC-F3-2** \[integration\] The filters `q`, `category`, `city`, date range and `maxPrice` combine with AND. Invalid values give 400 in the standard error format.
- **AC-F3-3** \[integration\] Cursor paging returns 12 per page with no duplicates and no gaps. `nextCursor` is empty on the last page.
- **AC-F3-4** \[unit\] Price text is "From ₹X" using the lowest tier, or "Free" when every tier is free. "Sold out" shows when every tier has 0 left. "Almost gone" shows when 10 or fewer tickets are left in total.
- **AC-F3-5** \[component\] The event card shows cover, title, local date and time, venue, city, price text and the right badge.
- **AC-F3-6** \[e2e\] Typing in search updates the results after a short delay and the URL. Reloading that URL restores the same filters and results.
- **AC-F3-7** \[e2e\] No results shows an empty state with a "Clear filters" button that resets everything.
- **AC-F3-8** \[component\] Loading shows skeleton cards. A failed request shows an error state whose Retry button works.
- **AC-F3-9** \[e2e\] Cards open the event page. The grid has 1 column on phone, 2 on tablet and 3 on desktop.
- **AC-F3-10** \[e2e\] The command menu lists matching events and opens the chosen one.

### F4. Event detail

**Goal:** show everything about one event and start booking.

**Requirements**

- `/events/[slug]` shows a cover hero, title, category badge, local date and time with weekday, venue, address, an "Open in Maps" link (a plain maps search URL, no paid map service), description, and the list of ticket tiers with price and how many are left.
- A "Get tickets" button opens the booking sheet (F5). A Share button uses the Web Share API, or copies the link.
- Cancelled event: a banner and no booking. Ended event: "This event has ended" and no booking. Sold out: a disabled button.
- Page title, description and Open Graph tags come from the event data.

**Acceptance criteria**

- **AC-F4-1** \[integration\] `GET /api/events/[slug]` returns the event with its tiers and live remaining counts. An unknown slug gives 404 in the standard error format.
- **AC-F4-2** \[e2e\] The page shows hero, title, local date and time, venue, address, description and all tiers with prices.
- **AC-F4-3** \[unit\] The remaining label is the exact number when it is 20 or less, "Available" above 20, and "Sold out" at 0.
- **AC-F4-4** \[e2e\] A cancelled event shows a banner and no booking button. An ended event shows "This event has ended" and no booking button. A sold-out event shows "Sold out" and a disabled button.
- **AC-F4-5** \[e2e\] An unknown slug shows the not-found page.
- **AC-F4-6** \[component\] Share uses the Web Share API when it exists. Otherwise it copies the link and shows a toast.
- **AC-F4-7** \[unit\] The page metadata (title, description, Open Graph) is built from the event data.
- **AC-F4-8** \[unit\] The "Open in Maps" link safely encodes venue and city, including special characters.

### F5. Booking flow

**Goal:** book tickets in a few taps and never sell more than exist.

**Requirements**

- "Get tickets" opens a bottom sheet on phone and a dialog on desktop with steps: (1) choose tickets with a stepper per tier and a live total, (2) attendee name, (3) fake payment, (4) success.
- Limits: tier `maxPerOrder`, and at most 10 tickets per order in total.
- The payment step shows a clear note: "Demo payment. No money is taken." A demo switch "Simulate failure" shows how failure is handled. Free orders skip the payment step.
- The client sends an idempotency key, so a double tap or a retry never makes two orders.
- `POST /api/orders` does everything in one database transaction: validate, take capacity with an atomic update, create the order, create tickets with signed codes. If a tier sold out meanwhile, answer 409 `SOLD_OUT` with the new remaining counts.
- Success screen has a "View tickets" button that opens the wallet.

**Acceptance criteria**

- **AC-F5-1** \[unit\] Total = sum of tier price × quantity, in paise. Display uses rupees with Indian digit grouping (for example ₹1,25,000).
- **AC-F5-2** \[component\] The stepper cannot go below 0, above the tier maximum, or above what is left. "Continue" is disabled when the total quantity is 0 or above 10.
- **AC-F5-3** \[integration\] A valid `POST /api/orders` creates one order and the right number of tickets with unique valid signed codes, and raises `sold` by the same number.
- **AC-F5-4** \[integration\] The API rejects: empty or too long (over 60 characters) attendee name, a quantity that is not a positive whole number, a tier that does not belong to the event, and a cancelled or ended event.
- **AC-F5-5** \[integration\] 20 parallel requests for the last 5 tickets: exactly 5 tickets are sold in total, `sold` equals `capacity`, and the other requests get 409 `SOLD_OUT`.
- **AC-F5-6** \[integration\] Sending the same idempotency key twice returns the same order and creates no extra tickets.
- **AC-F5-7** \[integration\] With `simulate: "fail"` the API answers 402 `PAYMENT_FAILED`, creates no order or tickets, and leaves `sold` unchanged.
- **AC-F5-8** \[integration\] If creating tickets fails halfway (forced in the test), the whole transaction rolls back: no order, no tickets, `sold` unchanged.
- **AC-F5-9** \[e2e\] Happy path at phone size: open an event, choose 2 tickets, enter a name, pay, see success, tap "View tickets", see 2 tickets in the wallet.
- **AC-F5-10** \[e2e\] If tickets sell out while the sheet is open, the user sees how many are left and can change the quantity.
- **AC-F5-11** \[e2e\] Free tickets skip the payment step and still create tickets.
- **AC-F5-12** \[component\] The Pay button shows a loading state and is disabled while the request runs. A failed payment shows an error with "Try again" and keeps the user's choices.

### F6. Digital wallet

**Goal:** see tickets and show the QR at the gate.

**Requirements**

- `/wallet` lists the guest's tickets in groups: Upcoming, Past, Cancelled. Each card shows cover, event title, date, tier, attendee name and a status badge.
- `/wallet/[ticketId]` is the full ticket: a large QR on a white tile (SVG), the code in monospace below it (for manual entry), event details, tier, attendee and status. A "Keep screen on" behavior uses the Screen Wake Lock API when the browser supports it.
- When the ticket is scanned on another device, the wallet changes to "Used" by itself. Poll every 10 seconds while the page is visible and online. This is the "magic moment" of the demo.
- Empty state with a button to Discover.
- Tickets are fetched from `GET /api/tickets` and saved to the device (F7).

**Acceptance criteria**

- **AC-F6-1** \[integration\] `GET /api/tickets` returns only this guest's tickets with event and tier info, sorted by event start. `GET /api/tickets/[id]` returns one ticket, or 404 for another guest's ticket.
- **AC-F6-2** \[unit\] Grouping puts tickets into Upcoming (event not ended, ticket not cancelled), Past, or Cancelled. It handles an event that ends exactly now.
- **AC-F6-3** \[component\] The QR encodes exactly the ticket code. Decoding the rendered QR in the test returns the same code.
- **AC-F6-4** \[e2e\] After a new booking the wallet shows the tickets. The ticket view shows QR, code text, event details, tier and attendee.
- **AC-F6-5** \[e2e\] After the ticket is admitted through the API, the open ticket view changes to "Used" within 15 seconds without a reload. The QR is dimmed and "Used at \<time>" shows.
- **AC-F6-6** \[component\] The Wake Lock is requested when the ticket view opens and released when it closes. If the browser does not support it, nothing breaks.
- **AC-F6-7** \[e2e\] An empty wallet shows the empty state with a Discover button.
- **AC-F6-8** \[component\] The QR tile stays white with a quiet margin in both themes. The ticket card works at 360 px width.

### F7. Installable app and offline wallet

**Goal:** the app can be installed, and the wallet and QR codes open with no internet.

**Requirements**

- A web app manifest: name, short name, icons (make free icons yourself, SVG and PNG), standalone display, start URL, theme and background colors.
- A service worker (follow the current Next.js PWA guide) that caches the app shell and static files, uses stale-while-revalidate for visited event pages, and never caches non-GET requests or scan and order API calls.
- Wallet data is read from IndexedDB when offline and shows a "Last updated" time.
- An offline fallback page for routes that are not cached.
- Offline banner and a "Back online" toast. When back online, data refreshes by itself.
- Booking and the assistant show a clear "You're offline" message and do not try the network.
- When a new version is ready, show an "Update available" toast with a Refresh button.
- An "Install app" button where the browser supports it. On iPhone, show a short "Add to Home Screen" tip.

**Acceptance criteria**

- **AC-F7-1** \[e2e\] The manifest is valid (name, icons of the required sizes, standalone display, start URL, theme colors) and the page links to it.
- **AC-F7-2** \[e2e\] After one online visit, going offline and reloading `/wallet` shows the app shell and the saved tickets, each with its QR.
- **AC-F7-3** \[e2e\] Offline, an uncached route shows the offline fallback page, not the browser error page.
- **AC-F7-4** \[unit\] The wallet cache saves, reads and replaces tickets in IndexedDB (use `fake-indexeddb`). After a refresh from the server, tickets that no longer exist are removed from the cache.
- **AC-F7-5** \[component\] The offline banner appears within 1 second of going offline and disappears when online. A "Back online" toast shows.
- **AC-F7-6** \[e2e\] Offline, "Get tickets" shows the offline message and does not call the network.
- **AC-F7-7** \[e2e\] When a new service worker is waiting, an "Update available" toast shows and Refresh activates it.
- **AC-F7-8** \[unit\] The caching rules never cache non-GET requests or any API call for orders, scan validate or scan sync.
- **AC-F7-9** \[component\] The wallet shows the "Last updated" time when data comes from the device cache.

### F8. Gate scanner (online)

**Goal:** staff check people in by scanning QR codes with a phone camera.

**Requirements**

- `/scan` lists upcoming events with the number of tickets sold. `/scan/[eventId]` opens the scanner for one event. A small "Demo mode" note replaces any login.
- Camera view with a frame overlay. Use the browser's built-in `BarcodeDetector` when available, else the fallback scanner library.
- On every read, call `POST /api/scan/validate`. Show a full-screen result for about 1.5 seconds, using color, an icon and words (never color alone):
  - ADMITTED (green): attendee name and tier.
  - ALREADY\_USED (red): the time it was first used.
  - WRONG\_EVENT (amber): the name of the ticket's real event.
  - INVALID (red): the code is not a real ticket.
  - TICKET\_CANCELLED (red).
- Phone vibration and a short tone made with the Web Audio API (no audio files), with a mute switch. Missing support must not cause errors.
- Do not send the same code again within 3 seconds.
- Manual code entry (type or paste) for desktop and for when the camera is not allowed. A clear help message when camera permission is denied.
- Counters: "Admitted X of Y" and a list of the last 10 scans.
- Server rule: verify the signature, find the ticket, decide the result, and mark the ticket USED with one conditional update (`WHERE status = VALID`), then write a ScanLog row.
- A short "Demo tip" panel: book a ticket, open the wallet on another device, scan it.

**Acceptance criteria**

- **AC-F8-1** \[unit\] The code checker accepts a valid code and rejects a wrong prefix, a bad signature, a changed ticket ID, a wrong length and an empty string. It compares signatures in constant time.
- **AC-F8-2** \[integration\] `POST /api/scan/validate` returns ADMITTED for a valid ticket of the right event, marks it USED with `usedAt` and the device ID, and writes a ScanLog.
- **AC-F8-3** \[integration\] A second scan returns ALREADY\_USED with the first `usedAt`. The stored `usedAt` does not change.
- **AC-F8-4** \[integration\] WRONG\_EVENT is returned (with the real event title) when scanned at another event. TICKET\_CANCELLED is returned for a cancelled ticket. INVALID is returned for a bad code.
- **AC-F8-5** \[integration\] 10 parallel validate requests for the same ticket give exactly one ADMITTED and nine ALREADY\_USED.
- **AC-F8-6** \[component\] The result screen shows the right color, icon and words for each of the 5 results.
- **AC-F8-7** \[component\] Reading the same code repeatedly within 3 seconds sends only one request.
- **AC-F8-8** \[e2e\] Manual code entry works end to end and shows the result.
- **AC-F8-9** \[e2e\] With camera permission denied, the page shows help text and the manual entry form.
- **AC-F8-10** \[component\] Giving the scanner module an image of a valid QR returns the exact code.
- **AC-F8-11** \[integration\] `GET /api/scan/events/[eventId]/stats` returns the admitted count and the total of valid and used tickets. The counter on screen updates after each scan.
- **AC-F8-12** \[component\] Vibration and sound run when supported and can be muted. When not supported, nothing breaks.

### F9. Offline scanning and sync

**Goal:** the scanner keeps working with no internet and syncs later, with no double entry.

**Requirements**

- "Download for offline" on the scanner page calls `GET /api/scan/events/[eventId]/pack`, which returns every ticket of the event (code, ticket ID, tier name, attendee name, status, `usedAt`). The pack is saved in IndexedDB with the download time. A new download replaces the pack for that event only. Prompt the user to download when online and no pack exists.
- The scanner switches to offline mode when the browser is offline or a validate call fails or takes longer than 3 seconds. An "Offline" chip and a "pending scans" count are shown.
- Offline decision: use the same pure function as the server (`decideScan`). A code that is not in the pack shows "Not in the offline list. Reconnect to check." Offline admits are marked used in the pack and added to the `scan_queue` with a client scan ID, the scan time and the device ID.
- Sync: starts when the browser comes online, when the app opens, when the user taps "Sync now", and on a timer with growing delay after failures. Send in chunks of up to 100 to `POST /api/scan/sync`. Remove an item from the queue only after the server confirms it.
- Server sync rules: process scans in scan-time order. If the ticket is VALID, mark it USED with `usedAt` equal to the scan time. If it is already USED by another device, record a conflict. Log every scan with source OFFLINE\_SYNC. Repeating a batch changes nothing (unique on device ID and client scan ID).
- Conflicts are shown in a list on the scanner page and stay until the user dismisses them. Never hide a conflict.
- Show a warning when the pack is older than 2 hours.
- Add a field `clientScanId` to ScanLog as noted in section 6.

**Acceptance criteria**

- **AC-F9-1** \[integration\] The pack API returns all tickets of the event (VALID, USED and CANCELLED) with only the fields listed above.
- **AC-F9-2** \[unit\] A pack is saved with its download time. A new download replaces the old pack for that event only.
- **AC-F9-3** \[unit\] `decideScan` returns the same result on client and server for the same inputs. A table test covers all 5 results.
- **AC-F9-4** \[component\] Offline, scanning a code that is in the pack returns ADMITTED in under 50 ms, marks it used in the pack, adds one queue item, and shows the Offline chip and pending count.
- **AC-F9-5** \[component\] Offline, scanning the same code again returns ALREADY\_USED and adds no new admit. A code not in the pack shows the "Not in the offline list" result.
- **AC-F9-6** \[integration\] `POST /api/scan/sync` with 3 scans returns one result per scan. Valid tickets become USED with `usedAt` equal to the scan time. ScanLog rows have source OFFLINE\_SYNC.
- **AC-F9-7** \[integration\] Sending the same batch twice creates no duplicate logs and gives the same results.
- **AC-F9-8** \[integration\] Two devices admit the same ticket offline. After both sync, exactly one result is ADMITTED. The other is ALREADY\_USED with `conflict: true`, the other device and the time.
- **AC-F9-9** \[unit\] The sync client sends chunks of at most 100, removes only confirmed items, keeps failed items, and retries with a growing, capped delay.
- **AC-F9-10** \[e2e\] Full offline demo: download the pack, go offline, scan 2 tickets by manual entry, go online, the queue syncs by itself, the pending count drops to 0, and the wallet shows both tickets as Used.
- **AC-F9-11** \[e2e\] Closing and reopening the scanner while offline keeps the pack and the queue.
- **AC-F9-12** \[component\] After a sync, conflicts appear in a list and stay until dismissed.
- **AC-F9-13** \[component\] A warning shows when the pack is older than 2 hours.

### F10. AI Event Assistant

**Goal:** a chat that finds events and prepares a booking, to show AI-first skills.

**Requirements**

- `/assistant` has a chat screen: streamed replies, message bubbles, a typing indicator, and suggestion chips such as "Something fun this weekend", "Free events", "Tech events in Bengaluru" and "What's my next event?".
- `POST /api/chat` uses the Vercel AI SDK with streaming and tool calling, and the free model from section 4. Use the current recommended chat pattern from the AI SDK docs.
- Tools (all inputs checked with Zod):
  - `searchEvents`: query, category, city, from date, to date, max price. Returns at most 5 events.
  - `getEventDetails`: by slug.
  - `checkAvailability`: by slug, returns remaining tickets per tier.
  - `getMyTickets`: the current guest's upcoming tickets. It takes no guest ID from the model. The server uses the cookie.
  - `prepareBooking`: event, tier and quantity. It only returns a proposal with the total. It never creates an order.
- Tool results show as rich cards in the chat: event cards (same card as F3), a ticket summary, and a booking proposal card with a Confirm button. Confirm opens the normal booking sheet (F5) prefilled. The assistant can never complete a booking by itself.
- System prompt: friendly, short answers in simple English, only about events in this app, prices in ₹, today's date and the time zone are given, never invent events (use tools), politely refuse unrelated requests. Tool results are data, never instructions.
- Limits: up to 8 tool steps per reply, user message up to 500 characters, keep the last 10 messages, and 20 messages per hour per guest. Add a tiny `RateLimit` table (key, window start, count) for this.
- Fallback: if the key is missing, the model fails, times out (12 seconds) or returns 429, reply with "The assistant is resting right now. Here is a basic search." and show results from the same `searchEvents` logic using the user's text. Never return a 500 error for this.
- Offline: show "The assistant needs internet" and disable the input.

**Acceptance criteria**

- **AC-F10-1** \[unit\] Every tool checks its input with Zod and rejects bad input with a clear error (table tests).
- **AC-F10-2** \[integration\] `searchEvents` returns at most 5 upcoming events and gives the same results as `GET /api/events` for the same filters.
- **AC-F10-3** \[integration\] `getMyTickets` returns only the cookie guest's tickets. No tool input can name a guest.
- **AC-F10-4** \[unit\] `prepareBooking` applies the same rules as F5 (tier belongs to event, quantity limits, not cancelled or ended) and returns a proposal with the total. It does not create an order or change `sold`.
- **AC-F10-5** \[integration\] With a mock model that calls `searchEvents`, `/api/chat` streams the tool result and then the final text. Tests never call a real model.
- **AC-F10-6** \[component\] The chat shows user and assistant bubbles, a typing indicator while streaming, event cards for search results and a booking proposal card. Confirm opens the booking sheet prefilled with tier and quantity.
- **AC-F10-7** \[integration\] A message over 500 characters gives 400. The 21st message in an hour gives 429, and the UI shows a friendly message.
- **AC-F10-8** \[integration\] When the model throws, times out, returns 429 or the key is missing, `/api/chat` returns the fallback notice and basic search results, not a 500 error.
- **AC-F10-9** \[e2e\] With a mock model: tap a suggestion chip, see the streamed answer and cards, tap Confirm and finish a booking.
- **AC-F10-10** \[unit\] The system prompt builder includes today's date, the time zone, the currency rule and the scope rule, and marks tool results as data.
- **AC-F10-11** \[e2e\] Offline, the assistant shows "The assistant needs internet" and the input is disabled.
- **AC-F10-12** \[manual, once before deploy\] Run 10 sample questions against the real free model and write the results in `docs/ai-smoke.md`. This is not part of the automated tests.

## 8. Pages and API

The app has 8 pages and a small REST API. Use these names so tests and docs agree.

### 8.1 Pages

| Route | Feature | What it is |
| --- | --- | --- |
| `/` | F3 | Discover: search, filters, event list |
| `/events/[slug]` | F4, F5 | Event detail and booking sheet |
| `/wallet` | F6 | Tickets in groups |
| `/wallet/[ticketId]` | F6 | One ticket with the large QR |
| `/scan` | F8 | Choose an event to scan for |
| `/scan/[eventId]` | F8, F9 | Scanner, offline pack, sync, conflicts |
| `/assistant` | F10 | AI Event Assistant chat |
| `/about` | F1, F2 | About this demo, demo steps, reset identity, install tip |

Also: a not-found page, an error page and an offline fallback page.

### 8.2 REST API

All bodies are JSON. Dates are ISO 8601 in UTC. Money is in paise. The guest comes from the cookie. Share the Zod schemas between the server and the client.

| Method and path | Feature | Notes |
| --- | --- | --- |
| `GET /api/health` | Setup | Returns ok and checks the database |
| `GET /api/events` | F3 | Query: `q`, `category`, `city`, `date`, `maxPrice`, `sort`, `includePast`, `cursor`. Returns items and `nextCursor` |
| `GET /api/events/[slug]` | F4 | Event with tiers and remaining counts |
| `POST /api/orders` | F5 | Body: event ID, items (tier ID, quantity), attendee name, optional `simulate`. Header `Idempotency-Key` |
| `GET /api/orders/[id]` | F5 | Order with tickets, for this guest only |
| `GET /api/tickets` | F6 | This guest's tickets |
| `GET /api/tickets/[id]` | F6 | One ticket, for this guest only |
| `POST /api/scan/validate` | F8 | Body: code, event ID, device ID. Returns the result |
| `GET /api/scan/events/[eventId]/stats` | F8 | Admitted count and total |
| `GET /api/scan/events/[eventId]/pack` | F9 | All tickets of the event for offline use |
| `POST /api/scan/sync` | F9 | Body: device ID, event ID, scans (up to 100). Returns one result per scan |
| `POST /api/chat` | F10 | Streams the assistant reply |

### 8.3 Standard error format

Every error has the same shape, so the UI can handle them in one place:

```json
{ "error": { "code": "SOLD_OUT", "message": "Only 2 tickets are left.", "details": {} } }
```

| Code | HTTP status | When |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | Input does not match the schema |
| `NOT_FOUND` | 404 | Unknown or not owned by this guest |
| `PAYMENT_FAILED` | 402 | Demo payment failed on purpose |
| `SOLD_OUT` | 409 | Not enough tickets left |
| `EVENT_NOT_BOOKABLE` | 409 | Event is cancelled or has ended |
| `RATE_LIMITED` | 429 | Too many assistant messages |
| `INTERNAL` | 500 | Unexpected error. Never show internals to the user |

Messages are short and in simple English. Never put stack traces or secrets in a response.

## 9. Testing Strategy and Seed Data

Tests are how the agent proves each feature works. Write them first (rule 2.2). Save this PRD in the repo as `docs/PRD.md` so scripts and reviews can read it.

### 9.1 Test types

| Type | Tools | What it covers |
| --- | --- | --- |
| Unit | Vitest | Pure logic in `lib/domain`: pricing, ticket codes, scan decisions, sync rules, filters, formatting |
| Component | Vitest, Testing Library | UI states: loading, empty, error, success, both themes |
| Integration | Vitest and the real `DATABASE_URL_TEST` Neon branch | Route handlers and services with a real database: booking, validation, sync, parallel requests |
| End to end | Playwright | Full flows in a phone-size browser and a desktop browser, in light and dark, with the network switched off for offline tests |
| Accessibility | Playwright with axe | No serious or critical issues on main pages, in both themes |

### 9.2 Test rules

- Every AC has at least one test. The test name starts with the AC ID, for example `AC-F8-5: ...`.
- A script `check:ac` reads `docs/PRD.md`, finds every `AC-Fn-m` ID for features marked Done in `PROGRESS.md`, and fails if a test with that ID is missing.
- Tests never call a real AI model or any outside service. Use the AI SDK's mock model. A mock switch for tests must be disabled in production builds.
- Use a fake clock for date logic. Never depend on the real current time or time zone.
- Each integration test makes its own data and cleans up. The test database is reset before the full run. Retry the first connection, because a sleeping Neon database needs a moment to wake.
- Keep the test database small. Neon's free plan has limited compute hours and storage.
- Camera is not tested in e2e. Use manual entry in e2e, and test the scanner module with QR images in component tests.
- Offline tests use Playwright's offline mode and `fake-indexeddb` for unit tests.

### 9.2.1 Scripts

`test` (unit and component), `test:integration`, `test:e2e`, `typecheck`, `lint`, `check:ac`, and `check` (runs all of them). `db:migrate`, `db:seed`, `db:reset-test`.

### 9.3 Quality targets

- Line coverage of at least 80 percent for `lib/domain` and `server`. UI coverage is not a goal.
- Lighthouse on the production build, mobile settings, for Discover and Wallet: performance at least 90, accessibility at least 95, best practices at least 95. Measure with the database awake.
- Warm `POST /api/scan/validate` under 300 ms at the 95th percentile. Offline scan decision under 50 ms.
- Load the scanner library and the chat code only on their own pages, so Discover stays light.

### 9.4 Seed data

The seed script (`db:seed`) is safe to run many times. Dates are relative to the day the seed runs, so the data never looks old. Use made-up event names, venues and artists. Do not use real brands or real people.

| Need | Detail |
| --- | --- |
| Events | 14 upcoming, spread over the next 45 days, all six categories |
| Cities | Delhi, Noida, Gurugram, Bengaluru, Mumbai, Pune, Hyderabad |
| Price range | Free to ₹5,000 |
| Tiers | 2 to 4 per event, such as General, Early Bird, VIP |
| Starting soon | 1 event that starts within the next 24 hours (for the scanner demo) |
| Sold out | 1 event with every tier at capacity |
| Almost gone | 1 event with 3 tickets left in total |
| One tier sold out | 1 event where one tier is full and others are open |
| Free event | 1 event with price 0 |
| Cancelled | 1 event with status CANCELLED |
| Ended | 1 event that ended yesterday (shown only with past events) |
| Text | Titles that are different lengths, descriptions of 2 to 4 sentences, one very long title to test layout |

The seed also sets `coverSeed` for each event. Tests use small factory functions to build their own data and do not depend on the seed.
