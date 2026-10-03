# Civix — Department Dashboard: Citizen Reports Page
### Companion to `civix-dashboards-spec.md`. Matches the current shell exactly (ledger sidebar, breadcrumb topbar, theme toggle, notification bell, user chip) shown in the current build. SSG page shell, TanStack Table/Query for live data.

> **Note on scope**: I wasn't able to pull the live schema/route list from `civix-api` directly, so the actions below are modeled on the service-request workflow already established earlier in this project (category confirmation, civic-issue matching/merging, dedup handling). Confirm exact endpoint names/payloads against the actual controller before wiring — the UI structure and interaction design below hold regardless of minor contract differences.

---

## 1. Where this fits and what it's *for*

"Issue Queue" (already in the sidebar) manages `CivicIssue` — the refined, department-routed operational record. **This new "Citizen Reports" page manages `ServiceRequest`** — the raw, as-submitted citizen records before/alongside that refinement. A department needs this as a distinct view because a handful of real actions only make sense at the `ServiceRequest` level, not the `CivicIssue` level:

1. **Reclassify a miscategorized request** — when the citizen's chosen category didn't match their description well (the low-confidence case designed earlier), a staff member corrects it here, which re-triggers routing.
2. **Manually link a request to an existing `CivicIssue`** — the low-confidence duplicate-match case: the system wasn't sure two reports were the same issue, so it surfaces them for a human to confirm and merge rather than guessing.
3. **Review attachments and raw description** — the citizen's actual words and photos, which the `CivicIssue` summary condenses.
4. **Flag a request as invalid/spam** — a request that shouldn't generate or remain attached to an operational issue at all.

Keep this distinction explicit in the UI (a short line under the page title: *"Manage individual citizen submissions — confirmed issues are tracked in Issue Queue."*) so staff don't confuse the two views.

---

## 2. Page shell — match the existing layout exactly

- Sidebar: add **"Citizen Reports"** as a new item between "Issue Queue" and (if present) other items, same icon style (outline, monochrome, matches "Work Orders"/"Issue Queue" weight) — do not introduce a new icon style or size.
- Breadcrumb: `Department / Citizen Reports`, same topbar pattern already built (collapse toggle, theme toggle, notification bell, user chip) — nothing about the shell changes, only the sidebar entry and page content.
- Page heading: `Citizen Reports` in `font-display`, same size/weight as the existing "Work Orders" heading shown in the current build — consistency here matters more than any new styling idea.
- Page content area keeps the `--color-paper` background and the same content padding already established — do not introduce a new background treatment for this page.

---

## 3. Rendering strategy

- `app/(portal)/department/citizen-reports/page.tsx` is a **Server Component, statically generated** — it renders the page shell (heading, filter bar skeleton, table container) with no request-time data fetching.
- All actual data (the request list, filters, mutations) is client-rendered via **TanStack Query**, inside a client component tree mounted by the page. This keeps the shell instant and cacheable while the operational data — which changes constantly — stays live and interactive.
- No `revalidate`/ISR needed here since nothing on this page is meant to be publicly cached; it's an authenticated operational view, SSG only buys shell speed, not data freshness.

---

## 4. Layered architecture (follows the client's existing structure)

```
app/(portal)/department/citizen-reports/
  page.tsx                          — Server: static shell only

providers/
  query-provider.tsx                 — existing TanStack QueryClientProvider (reused, not new)

api/
  service-requests.ts                — typed fetch functions:
                                        getServiceRequests(filters), getServiceRequestById(id),
                                        reclassifyServiceRequest(id, categoryId),
                                        linkServiceRequestToIssue(id, civicIssueId),
                                        flagServiceRequestInvalid(id, reason)

hooks/
  useServiceRequests.ts              — useQuery wrapper for the list (filters as query key)
  useServiceRequestDetail.ts         — useQuery wrapper for one record (drives the detail Sheet)
  useReclassifyServiceRequest.ts     — useMutation + cache update (Section 7)
  useLinkServiceRequestToIssue.ts    — useMutation + cache update
  useFlagServiceRequestInvalid.ts    — useMutation + cache update
  useNearbyCivicIssues.ts            — useQuery for the "link to existing issue" search control

components/
  tables/
    ServiceRequestsTable.tsx         — the TanStack Table instance for this page (and any other
                                        page that lists ServiceRequests — keep all table
                                        instances here, per the existing convention)
    columns/service-request-columns.tsx — column defs (separate from the table component itself,
                                        so columns can be unit-tested/reused independently)
  forms/
    ReclassifyRequestForm.tsx        — category combobox + submit, used inside the detail Sheet
    LinkToIssueForm.tsx              — searchable civic-issue combobox + submit
    FlagInvalidForm.tsx              — reason textarea + confirm, used inside the destructive dialog
  service-requests/
    ServiceRequestDetailSheet.tsx    — the right-side drawer (shadcn Sheet, already customized
                                        per the design system doc) composing the forms above
    ServiceRequestFilters.tsx        — status tabs, category filter, ward filter, date range
    AttachmentGallery.tsx            — shared component (reused from the citizen report flow's
                                        attachment preview) — do not rebuild a second image viewer
```

This mirrors the convention already in place: **tables live together under `components/tables/`, forms under `components/forms/`**, regardless of which page consumes them — a future page that also needs a `ServiceRequestsTable` (e.g., a municipality-level cross-department view) imports the same component rather than forking it.

---

## 5. The table — TanStack Table, instant updates, no full reloads

`ServiceRequestsTable` is a TanStack Table instance (headless) rendered with the shadcn `Table` primitives, styled per the dashboard console rules already established: hairline row dividers, no zebra striping, status via the shared `StatusPill`.

**Columns:**
| Column | Notes |
|---|---|
| Tracking # | `font-mono`, links to open the detail Sheet (not a page navigation) |
| Category | Shows current category; a small inline indicator (e.g., a dot in `--color-signal-open`) if the request is flagged for review |
| Description preview | Truncated to one line, full text in the detail Sheet |
| Location | Ward/zone + short address |
| Status | Shared `StatusPill` |
| Linked Issue | Either the `issueNumber` as a quiet link, or a "Needs review" badge if unmatched/ambiguous |
| Attachments | Small count indicator (e.g., "2 photos") only if present — no empty icon clutter when zero |
| Submitted | Relative time (e.g., "3h ago"), exact timestamp on hover |

**Instant updates, no reload**: every mutation (Section 7) updates the TanStack Query cache directly — either via `setQueryData` to patch the specific row optimistically, or by invalidating just the affected query key — so the table re-renders the changed row in place. The table itself never triggers a full page refresh or a manual re-fetch-everything call; this is the concrete meaning of "instant data change without reload" and should be treated as a hard requirement when building the mutation hooks, not an incidental side effect.

**Filters** (`ServiceRequestFilters`, sits above the table, drives the TanStack Query key): a segmented control (shadcn `Tabs`, re-skinned per the design system — text-forward, underline-style active state, not pill buttons) for `All / Needs Review / Unlinked / Linked`, plus a category combobox and a date range control. Filter state lives in the URL (`?status=needs-review`) so a filtered view is shareable/bookmarkable within the team, consistent with the URL-state pattern already used on the public tracker page.

---

## 6. Detail Sheet — where the actions live

Clicking a row (not a separate page — stays in context, per the design system's existing rule to prefer a right-side `Sheet` over full navigation for this kind of detail-and-act interaction) opens `ServiceRequestDetailSheet`:

- Top: tracking number, status pill, submitted timestamp, citizen's raw description in full (not truncated) — this is the one place staff read the citizen's actual words unedited.
- `AttachmentGallery`: thumbnails with click-to-enlarge, reusing the same component built for the citizen report flow.
- Location block: address/ward/zone text plus the same static map-preview treatment used elsewhere in the product (never a different map style per page).
- **Action area, three distinct controls, visually separated by the department staff member's actual decision, not stacked as generic buttons:**

### 6.1 Reclassify (`ReclassifyRequestForm`)
- A single category combobox (reuse the same category-picker logic from the citizen report flow, condensed to a searchable `Command`/`Popover` combobox rather than the full two-tier tile browser — staff already know what they're looking for, unlike a first-time citizen) pre-filled with the current category.
- Submitting calls `reclassifyServiceRequest`, which should re-trigger backend routing — reflect this honestly in the UI with a short confirmation line after success: *"Recategorized — this may update routing and priority."*
- Button: the customized `primary` variant, but **secondary-weight here** (this isn't the page's single North Star action the way "Report an Issue" was on the citizen side — multiple actions coexist in this Sheet, so none should visually dominate the way a single CTA does elsewhere).

### 6.2 Link to existing issue (`LinkToIssueForm`)
- Only rendered/enabled when the request is unlinked or flagged "needs review" — hide it entirely for already-linked requests rather than disabling it, to avoid visual clutter on records that don't need this action.
- A searchable combobox (`useNearbyCivicIssues`, scoped server-side to the same category + ward/zone, mirroring the matching logic designed earlier) showing candidate issues by issue number + short title, so staff are picking from a short, relevant list rather than searching blind.
- Confirming calls `linkServiceRequestToIssue` and updates the row's "Linked Issue" cell immediately via cache update.

### 6.3 Flag as invalid (`FlagInvalidForm`, destructive path)
- The one genuinely destructive-feeling action here, so it's the one that **does** warrant a confirmation step (per the design system's standing rule: confirmations are reserved for higher-stakes, less-reversible actions, not sprinkled everywhere) — a short `AlertDialog` asking for a one-line reason before committing.
- Styled using `--color-signal-open` for the trigger (never a generic red), consistent with the rule established in the auth/design-system doc that destructive actions reuse the platform's existing semantic color rather than introducing a new one.

---

## 7. Mutations — pattern to follow for all three actions

```ts
// hooks/useReclassifyServiceRequest.ts
export function useReclassifyServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reclassifyServiceRequest,
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(["service-requests", "detail", variables.id], updated);
      queryClient.setQueriesData({ queryKey: ["service-requests", "list"] }, (old) =>
        patchRowInList(old, updated) // replace just the affected row, not a refetch
      );
    },
  });
}
```

Apply the same shape to the link and flag mutations. This is what makes the table feel instantaneous — the Sheet can close immediately on success while the table underneath has already updated, rather than the common pattern of closing a drawer and triggering a visible full-list refetch/spinner.

---

## 8. Buttons & interactive details (reiterating the standing rule, applied here)

Every button on this page — table row actions, the three Sheet actions, filter tab triggers — uses the **customized shadcn `Button`** from the design system doc (the lift-on-hover, compress-on-press interaction, the crossfade loading label for the two network-bound actions). No raw `<button>` elements anywhere on this page, and no unstyled default shadcn variants — if a button here still looks like default shadcn output, it hasn't been themed correctly per the existing design system doc.