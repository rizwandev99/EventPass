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
- Status: Milestone M0 (Project Stack, DB Schema & Quality Harness) complete. Verified Next.js 15, Prisma 6.19.3 schema (7 models), seed data (14 events, 8 edge cases), check:ac script, strict typecheck, and Vitest suite passing. Ready for Milestone M1 (App Shell, Design System & Guest Session).
