# PRD Code Review: Feature F9 — Offline Scanning and Sync

**Date**: 2026-10-27  
**Status**: MET (All Acceptance Criteria Satisfied)  
**Reviewer**: Automated Compliance & Quality Swarm  

| Acceptance Criterion | Result | Evidence (File & Test Name) |
|---|---|---|
| **AC-F9-1** [integration] Pack API returns all tickets of event with required fields | **Met** | `tests/integration/f8-f9-scanner-api.test.ts` (`AC-F9-1: pack API returns all tickets of event with required fields`) & `src/app/api/scan/events/[eventId]/pack/route.ts` |
| **AC-F9-2** [unit] Pack is saved with download time; new download replaces old pack for that event only | **Met** | `tests/unit/f7-offline-storage-and-cache-rules.test.ts` (`AC-F9-2: pack is saved with download time; new download replaces old pack`) |
| **AC-F9-3** [unit] `decideScan` returns same result on client and server for same inputs (table test covering all 5 results) | **Met** | `tests/unit/f8-f9-scan-decision.test.ts` (`AC-F9-3: decideScan returns same result on client and server for same inputs`) |
| **AC-F9-4** [component] Offline scanning code in pack returns ADMITTED < 50ms, marks used, adds queue item, shows Offline chip | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F9-4: offline scanning code in pack returns ADMITTED < 50ms`) |
| **AC-F9-5** [component] Offline scanning same code returns ALREADY_USED and adds no new admit; code not in pack shows Not in offline list | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F9-5: offline scanning same code returns ALREADY_USED`) |
| **AC-F9-6** [integration] `POST /api/scan/sync` with 3 scans returns 1 result per scan with `OFFLINE_SYNC` source | **Met** | `tests/integration/f8-f9-scanner-api.test.ts` (`AC-F9-6: POST /api/scan/sync with 3 scans returns 1 result per scan`) & `src/app/api/scan/sync/route.ts` |
| **AC-F9-7** [integration] Sending same batch twice creates no duplicate logs and gives same results | **Met** | `tests/integration/f8-f9-scanner-api.test.ts` (`AC-F9-7: sending same batch twice creates no duplicate logs and gives same results`) |
| **AC-F9-8** [integration] Two devices admit same ticket offline: after both sync exactly one is ADMITTED, other ALREADY_USED with conflict: true | **Met** | `tests/integration/f8-f9-scanner-api.test.ts` (`AC-F9-8: two devices admit same ticket offline`) |
| **AC-F9-9** [unit] Sync client sends chunks of at most 100, removes only confirmed items, keeps failed items | **Met** | `tests/unit/f7-offline-storage-and-cache-rules.test.ts` (`AC-F9-9: sync client sends chunks of at most 100`) |
| **AC-F9-10** [e2e] Full offline demo: download pack, go offline, manual scan, reconnect and sync queue | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F9-10: full offline demo: download pack, go offline, manual scan, reconnect and sync queue`) & `src/app/scan/[eventId]/page.tsx` |
| **AC-F9-11** [e2e] Closing and reopening scanner while offline keeps pack and queue | **Met** | `tests/e2e/f7-f8-f9-offline-pwa-scanner.test.ts` (`AC-F9-11: closing and reopening scanner while offline keeps pack and queue`) |
| **AC-F9-12** [component] After sync, conflicts appear in list and stay until dismissed | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F9-12: after sync, conflicts appear in list and stay until dismissed`) |
| **AC-F9-13** [component] Warning shows when pack is older than 2 hours | **Met** | `tests/component/f7-f8-f9-offline-scanner.test.tsx` (`AC-F9-13: warning shows when pack is older than 2 hours`) |

## Summary
All 13 criteria have passing automated tests. Idempotent sync batches, conflict detection, and sub-50ms offline decisions verified.
