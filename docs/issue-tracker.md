# Civix — Public Issue Tracker Page
### Companion to prior specs. Same tokens, same rules: no hardcoded colors, global CSS variables only, fully responsive.

---

## 1. Route & rendering strategy

- Route: `app/(marketing)/track/[[...issueNumber]]/page.tsx` — optional catch-all segment so `/track` (empty search state) and `/track/ISS-260923-0001` (direct/shared link) are the same statically-generated page shell.
- **Page itself is SSG** — no per-request server data fetching, no `generateStaticParams` for issue numbers (unbounded, and status changes constantly, so pre-rendering per issue would go stale immediately). The static shell ships instantly; the actual issue data is fetched **client-side via TanStack Query**, keyed on the URL segment.
- This is exactly what makes the homepage hero tracker input work: submitting `ISS-260923-0001` there is a client-side `router.push("/track/" + value)` — the destination page is already built and cached, only the query fires on load. Same mechanism makes the result **shareable and bookmarkable** by design, with no extra state management.
- Not found / malformed issue number → same page shell renders an inline "We couldn't find that issue number — check it and try again" state, not a hard 404, since a citizen mistyping a character is the expected failure mode, not an error condition.

## 2. Layered architecture

```
app/(marketing)/track/[[...issueNumber]]/page.tsx   — Server: renders <TrackerPage> shell only
features/civic-issue-tracking/
  api.ts        — getPublicCivicIssue(issueNumber): typed fetch against
                  /api/v1/civic-issues/public/:issueNumber
  hooks.ts       — useCivicIssueTracking(issueNumber) → TanStack Query wrapper
                   (enabled: !!issueNumber, sensible staleTime since status
                   changes infrequently relative to page visits — refetch on
                   window focus is reasonable here, no polling needed)
  schema.ts     — zod schema for the tracker search input (issue number format)
  components/
    TrackerPage.tsx        — client: owns URL state, renders search OR result view
    IssueSearchForm.tsx    — client: TanStack Form + zod, single input + submit
    CurrentStatusPanel.tsx — the fixed, non-scrolling focal summary
    StatusHistoryLedger.tsx — the internally-scrollable timeline
```

Reuse existing shared components directly — do not rebuild: `StatusPill`, `PriorityBadge` (if priority is ever exposed publicly), and the design tokens already established. `IssueSearchForm` uses **TanStack Form** for field state/validation and hands the submitted value to the router, not to a mutation — this is a navigation, not a data write.

## 3. Layout: the page does not scroll, the history does

The viewport is treated as a fixed frame (`h-dvh`, no body scroll) — only `StatusHistoryLedger` has internal `overflow-y: auto`. This is a deliberate constraint, not a limitation: the citizen's question is "what's the current state," and that answer should never scroll out of view while they're reading how it got there.

**Desktop** (asymmetrical split, consistent with the site's established posture): left ~40% is fixed — search input (collapses to a small "Track another issue" link once a result is showing) above `CurrentStatusPanel`. Right ~60% is `StatusHistoryLedger`, height-locked to the viewport, scrolling independently.

**Mobile**: stacked, but the same fixed/scroll split holds — `CurrentStatusPanel` pinned at top (compact but never truncated), `StatusHistoryLedger` takes the remaining viewport height below it with its own scroll, so the current status is always visible while thumbing through history.

## 4. `CurrentStatusPanel` — the focal point

Not a card. A quiet, document-style block matching the confirmation-screen and case-file aesthetic already established:
- Issue number in `font-mono`, large — this is the thing the citizen came to confirm.
- Title, category, municipality, and address in `font-display`/`font-body` as plain text, no field labels needed for self-explanatory values.
- Status rendered via the shared `StatusPill` at meaningfully larger size than anywhere else it's used — this page's single Von Restorff moment.
- "Reported by 1 other neighbor" style line if `reportedCount > 1`, reusing the same solidarity framing from the report-confirmation screen — consistency of tone matters here since a citizen may be the original reporter checking back.

## 5. `StatusHistoryLedger` — the advanced timeline

Reject the standard vertical-dotted-line-with-circles pattern. Treat `statusHistory` as **stamped ledger entries**, reverse-chronological (newest at top, matching how a citizen actually wants to read it — "what just happened" first):

- Each entry is a horizontal record row: timestamp in `font-mono` (left, fixed-width column so entries align like a real ledger), the transition itself as plain text using the shared `StatusPill` twice with a small connecting glyph (`PENDING_VERIFICATION → CLOSED`), and `notes` beneath in quieter type when present (e.g., "Auto-created from service request REQ-260923-0001" — surface this verbatim, it's genuine transparency about automation, not something to hide).
- A thin persistent vertical rule runs along the fixed timestamp column through all entries — this is the one carried-over visual element from a traditional timeline, kept because it does real work (reading order), while everything riding on it (dots, icons, cards) is dropped in favor of the plain record-row treatment.
- The **very first entry** (oldest, `previousStatus: null`, bottom of the reverse-chronological list) gets a distinct visual treatment — a subtle top-of-scroll marker or heavier rule — since it represents the issue's origin and deserves a beat of emphasis on its own, not just another identical row.
- Scroll affordance: a soft fade/gradient at the top and bottom edges of the ledger container (not a visible scrollbar track styled as a design element) hints there's more history without adding chrome.

## 6. Data fetching notes

- `useCivicIssueTracking` should distinguish **loading**, **not-found**, and **error** states explicitly in the UI — a not-found issue number is a normal, expected outcome for a public search tool and must read as calm and helpful, never as a broken page.
- No auth required, no personal data rendered — confirm the API response (as shown) never includes citizen identity, and keep it that way; this page's URL is meant to be shareable in public (e.g., a citizen posting their tracking link on social media), so it must never leak anything beyond what's already public by design.