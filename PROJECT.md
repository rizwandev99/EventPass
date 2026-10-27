# Project: EventPass — Mobile-First Ticketing App

## Architecture
- **Framework**: Next.js 15+ App Router, React 19, TypeScript strict mode.
- **Styling**: Tailwind CSS with 16 strict CSS variable tokens in `globals.css` (Dark & Light mode, WCAG AA compliant).
- **Database & ORM**: Neon Postgres (serverless) + Prisma ORM with `@prisma/adapter-neon` and `@neondatabase/serverless`.
- **Concurrency & State**: Interactive database transactions (`SELECT ... FOR UPDATE` + check constraint) guaranteeing `sold <= capacity` under race conditions.
- **Security**: Node built-in `crypto` HMAC-SHA256 signed ticket codes (`EP1.<ticketId>.<sig>`), constant-time signature comparison, HttpOnly secure guest cookie (>=128-bit entropy).
- **Offline & PWA**: Service Worker caching app shell + visited event pages (stale-while-revalidate), IndexedDB (`idb`) storing wallet tickets, scanner packs, scan queue, and device metadata.
- **Scanner**: Camera QR detection (`BarcodeDetector` with software fallback), Web Audio API tone synthesis, Web Vibration API, sub-50ms offline `decideScan`, idempotent batch sync with conflict triage.
- **AI Assistant**: Streaming chat interface via Vercel AI SDK + Google Gemini model provider, 5 Zod-validated tools, graceful local search fallback on rate limits/timeouts.
- **Quality**: Vitest (unit & component), Playwright (e2e & mobile 360px), `axe-playwright` (a11y), `check:ac` PRD acceptance criteria enforcement.

## Feature Inventory
Every feature from the survey phase appears here with its assigned milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F0: Stack & Harness | Next.js, Prisma schema, Tailwind, Vitest, Playwright, check:ac script, seed data | M0 | PRD §4, §9 |
| 2 | F1: App Shell & Design System | 16 semantic tokens, 360px mobile 4-tab bar + desktop sidebar, UI primitives, Ctrl+K command menu, /about | M1 | PRD §5, §7.1 |
| 3 | F2: Guest Session | Secure HttpOnly cookie (>=128-bit entropy), lazy DB upsert, strict 404 guest isolation, identity reset | M1 | PRD §2.6, §7.2 |
| 4 | F3: Event Discovery | Home page `/`, cursor pagination (12/page), category/city/date/price filters, debounced URL sync, SVG cover art | M2 | PRD §7.3 |
| 5 | F4: Event Detail | `/events/[slug]`, tier availability badges, OpenGraph metadata, Web Share API, Google Maps directions | M2 | PRD §7.4 |
| 6 | F5: Atomic Booking Flow | Multi-step modal/sheet, paise integer math, atomic capacity lock (`sold <= capacity`), idempotency key, HMAC ticket signing | M3 | PRD §6.2, §7.5 |
| 7 | F6: Digital Wallet | `/wallet`, `/wallet/[ticketId]`, Upcoming/Past/Cancelled grouping, high-contrast QR on white tile, Screen Wake Lock, 10s polling | M3 | PRD §7.6 |
| 8 | F7: PWA & Offline Wallet | Manifest, Service Worker caching, offline wallet in IndexedDB, offline banner, install prompt | M4 | PRD §6.4, §7.7 |
| 9 | F8: Gate Scanner (Online) | `/scan`, `/scan/[eventId]`, BarcodeDetector + fallback, audio-haptic feedback, 3s rate limit, manual entry, stats | M4 | PRD §7.8 |
| 10 | F9: Offline Scanning & Sync | Offline pack download (`GET /api/scan/events/[eventId]/pack`), sub-50ms `decideScan`, batch sync (`POST /api/scan/sync`), conflict triage | M4 | PRD §7.9 |
| 11 | F10: AI Event Assistant | Streaming `/assistant`, Vercel AI SDK + Gemini, 5 Zod tools, rich card rendering, 12s timeout & local search fallback | M5 | PRD §7.10 |
| 12 | Verification & Victory Audit | Full test suite pass (`check`), 100% AC coverage (`check:ac`), adversarial hardening, PRD reviews completed | M6 | PRD §2.2, §2.3, §9 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Project Stack, DB Schema & Quality Harness | Next.js, Prisma, Tailwind, Vitest, Playwright, check:ac script, seed data | none | IN_PROGRESS |
| M1 | App Shell, Design System & Guest Session | F1, F2: Tokens, 360px layout, UI primitives, guest cookie, /about, reset demo | M0 | PLANNED |
| M2 | Event Discovery & Detail View | F3, F4: `/` event listing, filters, debounced search, SVG cover art, `/events/[slug]` | M1 | PLANNED |
| M3 | Concurrency Booking & Digital Wallet | F5, F6: atomic booking, paise math, HMAC tickets, `/wallet`, QR white tile, 10s poll | M1, M2 | PLANNED |
| M4 | PWA, Offline Capability & Gate Scanner | F7, F8, F9: Service Worker, IndexedDB, `/scan`, BarcodeDetector, pack download, sync | M1, M3 | PLANNED |
| M5 | AI Event Assistant | F10: `/assistant`, Vercel AI SDK + Gemini, 5 Zod tools, local search fallback | M1, M2, M3 | PLANNED |
| M6 | Final Verification & Hardening | 100% test pass, AC validation, adversarial stress tests, PRD reviews, victory claim | M1-M5 | PLANNED |

## Interface Contracts

### Guest Session ↔ Application Routes
- Middleware: `src/middleware.ts` extracts or generates `eventpass_guest_id` (32-hex string) and passes downstream in `x-guest-id` header.
- Server Helper: `getGuestId(req)` extracts cookie or header.
- Lazy DB: `getOrCreateGuest(guestId)` called ONLY on booking or wallet read.

### Orders API ↔ Ticket Generation
- Route: `POST /api/orders`
- Headers: `Idempotency-Key: <string>`
- Body: `{ eventId: string, items: Array<{ tierId: string, quantity: number }>, attendeeName: string, simulate?: "fail" }`
- Signer: `signTicketCode(ticketId: string, eventId: string, secret: string): string` -> `EP1.<ticketId>.<sig>`
- Verifier: `verifyTicketCode(code: string, secret: string): { valid: boolean, ticketId?: string }` using `crypto.timingSafeEqual`.

### Scanner ↔ Offline Sync
- Pure function: `decideScan(ticket: PackTicket | null, currentEventId: string, deviceId: string): ScanDecision`
  - Returns `{ result: ADMITTED | ALREADY_USED | WRONG_EVENT | INVALID | TICKET_CANCELLED, conflict?: boolean, ... }`
- Sync Route: `POST /api/scan/sync`
  - Body: `{ deviceId: string, eventId: string, scans: Array<{ clientScanId: string, code: string, scannedAt: string, deviceId: string }> }`
  - Returns: `{ results: Array<{ clientScanId: string, result: string, conflict: boolean, usedAt?: string }> }`

### AI Assistant ↔ Event Tools
- Route: `POST /api/chat`
- Tool: `searchEvents({ q?, category?, city?, fromDate?, toDate?, maxPrice? })`
- Tool: `getEventDetails({ slug })`
- Tool: `checkAvailability({ slug })`
- Tool: `getMyTickets()` (resolves guestId securely from cookie, no guestId parameter allowed)
- Tool: `prepareBooking({ eventSlug, tierName, quantity })` (proposal card only, opens booking sheet with prefilled values).

## Code Layout
```text
src/
  app/                    # Next.js App Router pages and REST route handlers
    api/
      health/route.ts
      events/route.ts
      events/[slug]/route.ts
      orders/route.ts
      orders/[id]/route.ts
      tickets/route.ts
      tickets/[id]/route.ts
      scan/validate/route.ts
      scan/events/[eventId]/stats/route.ts
      scan/events/[eventId]/pack/route.ts
      scan/sync/route.ts
      chat/route.ts
    (routes)/
      page.tsx            # / (Discover)
      events/[slug]/page.tsx
      wallet/page.tsx
      wallet/[ticketId]/page.tsx
      scan/page.tsx
      scan/[eventId]/page.tsx
      assistant/page.tsx
      about/page.tsx
      not-found.tsx
      error.tsx
    globals.css           # 16 CSS variable tokens for light/dark
    layout.tsx            # App shell with ThemeProvider, Nav, CommandMenu
  components/
    ui/                   # Reusable accessible primitives (Button, Card, Dialog, Sheet, etc.)
    shell/                # Navigation (BottomNav, Sidebar, TopBar, CommandMenu, OfflineBanner)
    events/               # EventCard, EventFilters, CoverArt, BookingSheet
    wallet/               # TicketCard, QRCodeTile, WakeLockHandler
    scanner/              # CameraScanner, ManualEntryForm, ScanResultModal, SyncConflictList
    assistant/            # ChatView, MessageList, SuggestionChips, ToolCards
  lib/
    domain/               # Pure testable business logic (pricing, ticket-codes, scan, filters, cover-art)
    offline/              # Service Worker helpers, IndexedDB client (idb), sync queue
    ai/                   # Assistant tools, system prompts, local search fallback
  server/                 # Prisma client, database services, guest management, order transactions
prisma/
  schema.prisma           # 7 tables (Guest, Event, TicketTier, Order, Ticket, ScanLog, RateLimit)
  seed.ts                 # 14 upcoming events with edge-case scenarios
scripts/
  check-ac.ts             # PRD acceptance criteria coverage validator
tests/
  unit/                   # Vitest unit tests for lib/domain
  component/              # Vitest + React Testing Library component tests
  integration/            # Vitest integration tests against test DB
  e2e/                    # Playwright end-to-end tests (mobile 360px & desktop)
docs/
  PRD.md                  # Authoritative specification
  reviews/                # PRD reviews (F1-review.md through F10-review.md)
PROGRESS.md               # User-facing feature progress tracker
DECISIONS.md              # Technical decision log
.env.example              # Environment variables template
```
