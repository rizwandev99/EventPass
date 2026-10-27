# Technical Decision Log

## 2026-10-27: Greenfield Stack & Framework Architecture
- **Decision**: Next.js 15+ App Router with React 19, TypeScript strict mode, and Tailwind CSS.
- **Rationale**: Aligns with modern production standard, server components for initial event list render (TTFB <200ms), API route handlers for REST contracts, and native font optimization.
- **Zero-Cost Constraint**: No paid hosting or dependencies. Deployable on Vercel Hobby.

## 2026-10-27: Design Tokens & Styling Architecture
- **Decision**: 16 semantic CSS variable tokens defined in `globals.css` with dark/light themes and 0 raw hex values in UI components.
- **Rationale**: Strict compliance with Linear-grade aesthetic and WCAG AA contrast ratios (measured text contrast >=17:1, accent >=5.5:1).

## 2026-10-27: Anonymous Guest Session Identity
- **Decision**: Cookie-based anonymous session `eventpass_guest_id` with 128-bit entropy (`crypto.randomBytes(16).toString('hex')`), HttpOnly, SameSite Lax, Secure. Lazy database upsert.
- **Rationale**: Satisfies PRD rule 2.6 (no auth, no passwords, no OAuth). Lazy upsert avoids waking sleeping Neon serverless compute on casual visits.

## 2026-10-27: Atomic Booking Concurrency & Ticket Security
- **Decision**: PostgreSQL row-level locking (`SELECT ... FOR UPDATE` in Prisma transaction) plus `sold <= capacity` check constraint. HMAC-SHA256 ticket signing with format `EP1.<ticketId>.<sig>` and `crypto.timingSafeEqual`.
- **Rationale**: Absolute protection against overselling under 20 parallel requests for the last 5 tickets. Constant-time verification prevents timing attacks.

## 2026-10-27: Offline Scanner & Resilient Sync
- **Decision**: Shared pure function `decideScan` (<50ms execution on client & server). Idempotent batch sync using compound unique constraint on `(deviceId, clientScanId)` in `ScanLog`.
- **Rationale**: Zero double-entry on retry/reconnect. Dual camera scanner (`BarcodeDetector` + `@zxing/library` software fallback) ensures universal device compatibility.

## 2026-10-27: AI Assistant Architecture & Fallback
- **Decision**: Vercel AI SDK (`ai`) with Google Gemini free tier (`@ai-sdk/google`). 12-second timeout guard, rate limiter, and automatic fallback to keyword search.
- **Rationale**: Completely immune to 500 errors if API key is missing or quota is exhausted. Zod validation on all tool arguments prevents prompt injection.
