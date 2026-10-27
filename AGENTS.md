# Project Memory & Guidelines

<!-- === ZONE 1: USER-OWNED (DO NOT MODIFY BY AGENT) === -->
## Project Overview & Directives
- **Project**: EventPass — Mobile-First Ticketing App
- **Goal**: Build a complete, mobile-first showcase ticketing application featuring an attendee app, offline-capable gate scanner with QR code validation, and an AI event assistant.
- **Audience**: Hiring teams at product studios evaluating code polish, TDD rigor, and architecture.
- **Core Directives**:
  - Full ticketing flow: list, detail, book, digital wallet, gate scan.
  - Offline-first behavior (PWA, Service Worker, IndexedDB) with seamless background sync.
  - Linear-grade UI aesthetic (dark/light theme, semantic tokens, 360px mobile-first layout).
  - TDD mandatory: every Acceptance Criterion (AC) starts with failing test.
  - PRD code reviews after every feature (`docs/reviews/F<number>-review.md`).
  - Zero-cost architecture: Vercel Hobby, Neon Postgres free tier, Gemini API free tier. No paid services, no auth/login system (guest cookies only).

<!-- === ZONE 2: AGENT-MAINTAINED (UPDATED BY AGENT) === -->
## Architecture & Active Context
### Key Architectural Decisions
- Stack: Next.js (App Router), React, TypeScript strict mode, Tailwind CSS, Prisma ORM with Neon Postgres driver, Zod schemas, Vitest / Playwright for TDD.
- Ticket Signature: HMAC-SHA256 (`EP1.<ticketId>.<sig>`) with constant-time comparison.
- Offline & Sync: Service Worker + IndexedDB (`idb` / `fake-indexeddb`), idempotent sync batches with clientScanId.
- Assistant: Vercel AI SDK with Gemini free tier, graceful fallback to local search.

### Technical Gotchas & Traps
- Neon free tier compute sleeps on idle; tests and API must handle connection wakeup gracefully.
- Strict token enforcement: no raw hex/rgb values in components; strictly use CSS variable tokens.
- Offline QR tile must retain white background with safe padding in both dark and light modes for optical readability.

### Active Milestone & Next Steps
- Status: All Milestones M0 through M6 are 100% complete!
  - M0: Database, Prisma 6 Schema, Seed Data & Test Harness
  - M1: Linear-grade App Shell, 16 Semantic Tokens & Anonymous Guest Session (F1, F2)
  - M2: Event Discovery with 250ms debounced search & Detail View with SVG covers (F3, F4)
  - M3: Atomic Booking Concurrency & Digital Wallet with HMAC QR codes (F5, F6)
  - M4: Offline PWA, Online/Offline Gate Scanner & Conflict-free Sync (F7, F8, F9)
  - M5: Streaming AI Event Assistant with Zod tools and proposal cards (F10)
  - M6: Domain layer decoupling, 98/98 AC coverage, 68/68 Vitest tests, 0 TS errors, clean Next.js 15 production build.
