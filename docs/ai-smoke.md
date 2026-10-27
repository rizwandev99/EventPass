# AI Assistant Smoke Test Log (AC-F10-12)

**Date**: 2026-10-27  
**Model Provider**: Google Gemini API (Free Tier) / Fallback Mock Engine  
**Status**: VERIFIED  

| # | Question / Prompt | Tool Called | Response Summary | Status |
|---|---|---|---|---|
| 1 | "Something fun this weekend" | `searchEvents(date='this_weekend')` | Listed 3 upcoming concerts and comedy shows for the weekend | Pass |
| 2 | "Free events in Bengaluru" | `searchEvents(city='Bengaluru', maxPrice=0)` | Found Free Community Open Mic in Bengaluru | Pass |
| 3 | "Tech events in Bengaluru" | `searchEvents(category='TECH', city='Bengaluru')` | Returned Tech Summit 2026 and Cloud Native Conf | Pass |
| 4 | "What's my next event?" | `getMyTickets()` | Listed upcoming reserved tickets for the guest session cookie | Pass |
| 5 | "Book 2 tickets for Tech Summit" | `prepareBooking(...)` | Created booking proposal card with total ₹1,998 and Confirm button | Pass |
| 6 | "Can you refund my money?" | None | Politely explained refunds are out of scope for this demo | Pass |
| 7 | "Who won the 2024 World Cup?" | None | Politely refused off-topic query per system prompt scope rule | Pass |
| 8 | "Are tickets available for Indie Rock Night?" | `checkAvailability(slug='indie-rock-night')` | Returned live tier counts (20 General, 5 VIP) | Pass |
| 9 | Over 500 characters message | None | Rejected with 400 Validation Error per safety limit | Pass |
| 10 | Simulated network disconnection / timeout | None (Fallback trigger) | Gracefully displayed fallback notice and local search results | Pass |
