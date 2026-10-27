# PRD Code Review: Feature F7 — Installable App & Offline Wallet (PWA)

**Date**: 2026-10-27  
**Status**: MET (All Acceptance Criteria Satisfied)  
**Reviewer**: Automated Compliance & Quality Swarm  

| Acceptance Criterion | Result | Evidence (File & Test Name) |
|---|---|---|
| **AC-F7-1** [e2e] Web app manifest is valid and linked from page | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F7-1: web app manifest is valid and linked from page`) & `public/manifest.json` |
| **AC-F7-2** [e2e] Offline visit to `/wallet` shows app shell and saved tickets | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F7-2: offline visit to /wallet shows app shell and saved tickets`) & `src/app/wallet/page.tsx` |
| **AC-F7-3** [e2e] Offline uncached route shows offline fallback page | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F7-3: offline uncached route shows offline fallback page`) & `src/app/offline/page.tsx` |
| **AC-F7-4** [unit] Wallet cache saves, reads and replaces in IndexedDB; stale tickets removed | **Met** | `tests/unit/f7-offline-storage-and-cache-rules.test.ts` (`AC-F7-4: wallet cache saves, reads and replaces in IndexedDB`) |
| **AC-F7-5** [component] Offline banner appears within 1s of going offline and disappears when online | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F7-5: offline banner appears within 1s of going offline`) & `src/components/offline/offline-banner.tsx` |
| **AC-F7-6** [e2e] Offline "Get tickets" shows offline message and does not call network | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F7-6: offline 'Get tickets' shows offline message and does not call network`) |
| **AC-F7-7** [e2e] When new service worker waiting, update available shows and refresh activates | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F7-7: when new service worker is waiting, update available shows and refresh activates`) |
| **AC-F7-8** [unit] Caching rules never cache non-GET requests or any API call for orders, scan validate, or scan sync | **Met** | `tests/unit/f7-offline-storage-and-cache-rules.test.ts` (`AC-F7-8: caching rules never cache non-GET requests`) |
| **AC-F7-9** [component] Wallet shows "Last updated" time when data comes from device cache | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F7-9: wallet shows Last updated time when data comes from device cache`) |

## Summary
All 9 criteria have passing automated tests. PWA manifest, offline banner, and IndexedDB caching verified.
