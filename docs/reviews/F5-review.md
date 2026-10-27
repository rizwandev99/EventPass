# PRD Code Review: Feature F5 — Booking Flow (Fake Payment)

**Date**: 2026-10-27  
**Status**: MET (All Acceptance Criteria Satisfied)  
**Reviewer**: Automated Compliance & Quality Swarm  

| Acceptance Criterion | Result | Evidence (File & Test Name) |
|---|---|---|
| **AC-F5-1** [unit] Total = sum of tier price x quantity in paise; display uses rupees with Indian digit grouping | **Met** | `tests/unit/f5-booking-calc-and-ticket-sig.test.ts` (`AC-F5-1: total = sum of tier price x quantity in paise`) |
| **AC-F5-2** [component] Stepper cannot go below 0, above tier max, or above what is left; Continue disabled when total 0 or >10 | **Met** | `tests/component/f5-f6-booking-wallet.test.tsx` (`AC-F5-2: stepper cannot go below 0, above tier maximum, or above what is left`) & `src/components/ui/stepper.tsx` |
| **AC-F5-3** [integration] Valid `POST /api/orders` creates one order and tickets with unique signed codes, raises `sold` | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-3: valid POST /api/orders creates one order and tickets with unique signed codes`) & `src/app/api/orders/route.ts` |
| **AC-F5-4** [integration] Rejects empty/long names, invalid quantity, and wrong tier | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-4: rejects empty/long names, invalid quantity, and wrong tier`) |
| **AC-F5-5** [integration] 20 parallel requests for last 5 tickets: exactly 5 tickets sold, `sold == capacity`, others get 409 `SOLD_OUT` | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-5: 20 parallel requests for last 5 tickets`) |
| **AC-F5-6** [integration] Sending same idempotency key twice returns same order and creates no extra tickets | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-6: sending same idempotency key twice returns same order`) |
| **AC-F5-7** [integration] `simulate: "fail"` answers 402 `PAYMENT_FAILED`, creates no tickets, leaves `sold` unchanged | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-7: simulate: 'fail' answers 402 PAYMENT_FAILED`) |
| **AC-F5-8** [integration] Database rollback simulation leaves state untouched | **Met** | `tests/integration/f5-f6-booking-wallet-api.test.ts` (`AC-F5-8: rollback simulation on error leaves state untouched`) |
| **AC-F5-9** [e2e] Happy path at phone size: book 2 tickets, pay, view in wallet | **Met** | `tests/e2e/f5-f6-booking-wallet.test.ts` (`AC-F5-9: happy path at phone size: book 2 tickets, pay, view in wallet`) & `src/components/booking/booking-modal.tsx` |
| **AC-F5-10** [e2e] Sell out while sheet open shows remaining and allows changing quantity | **Met** | `tests/e2e/f5-f6-booking-wallet.test.ts` (`AC-F5-10: sell out while sheet is open displays live remaining message`) |
| **AC-F5-11** [e2e] Free tickets skip payment step and create tickets directly | **Met** | `tests/e2e/f5-f6-booking-wallet.test.ts` (`AC-F5-11: free tickets skip payment step and create tickets directly`) |
| **AC-F5-12** [component] Pay button shows loading and is disabled while running; failed payment shows error with Try again | **Met** | `tests/component/f5-f6-booking-wallet.test.tsx` (`AC-F5-12: Pay button shows loading and is disabled while running`) |

## Summary
All 12 criteria have passing automated tests. Concurrency safety and atomic reservations verified.
