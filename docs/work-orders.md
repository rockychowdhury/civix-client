# Civix — Department Dashboard: Work Orders (Dispatch)
### Companion to `civix-dashboards-spec.md`, `civix-department-citizen-reports-spec.md`, `civix-department-issue-queue-spec.md`. This replaces the current "section is being constructed" placeholder shown in the build.

> **Source note**: grounded in the auto-assignment design already worked out in this project — `WorkOrder` created automatically from a routed `CivicIssue`, a suggested technician/team via a rules-based load-balancing algorithm, with a manager/dispatcher confirming rather than the system binding the assignment outright (`assignmentStatus: SUGGESTED | CONFIRMED`, falling back to `PENDING_ASSIGNMENT` when no eligible technician exists). Confirm exact field/endpoint names against the live `civix-api` controllers before wiring.

---

## 1. What this page is, and the one interaction decision that shapes everything else

This is the **highest-frequency page a Dispatcher touches** — potentially dozens of confirm/reassign actions a day. Every other dashboard page in this project routes its actions through a detail Sheet, and that's correct for infrequent, higher-stakes actions (overriding a priority, reclassifying a report). **This page is the deliberate exception**: the single most common action — confirming a suggested technician — must happen **inline, directly on the table row**, with zero navigation. Forcing a Sheet-open for something done dozens of times a day would misapply a pattern that's right everywhere else; treat this as an intentional divergence, not an inconsistency.

The detail Sheet still exists here, but it's for the **secondary** need — reviewing a work order's full history/instructions/field notes — not for the primary dispatch action.

---

## 2. Page shell

- Sidebar item: `Work Orders` (already present).
- Breadcrumb: `Department / Work orders`, identical topbar.
- Heading: `Work Orders`, same `font-display` treatment already shown in the current build.
- Default landing tab for `DISPATCHER`: **"Needs Assignment"** (Section 4) — the actionable queue, not a general overview, since a dispatcher opening this page has one job: clear the assignment backlog.

---

## 3. Rendering & architecture

```
app/(portal)/department/work-orders/page.tsx     — Server, SSG shell only

api/
  work-orders.ts            — getWorkOrders(filters), getWorkOrderById(id),
                               confirmSuggestedTechnician(id),
                               reassignTechnician(id, technicianId, reason?),
                               createWorkOrder(civicIssueId, technicianId?)

hooks/
  useWorkOrders.ts
  useWorkOrderDetail.ts
  useConfirmSuggestedTechnician.ts
  useReassignTechnician.ts
  useCreateWorkOrder.ts
  useSuggestedTechnician.ts        — SHARED with Issue Queue's CreateWorkOrderForm; this page
                                      is the canonical owner of this hook — Issue Queue imports
                                      it, it does not reimplement it

components/
  tables/
    WorkOrdersTable.tsx
    columns/work-order-columns.tsx
  forms/
    ReassignTechnicianForm.tsx
    CreateWorkOrderForm.tsx          — canonical implementation lives here; Issue Queue's
                                        Section 5.5 imports this component directly
  work-orders/
    WorkOrderDetailSheet.tsx
    WorkOrderStatusLedger.tsx        — same stamped-ledger pattern as StatusHistoryLedger,
                                        generalized to work-order status events (ASSIGNED →
                                        IN_PROGRESS → COMPLETED) plus technician notes —
                                        extend the existing ledger component with a variant
                                        prop rather than building a second timeline, per the
                                        consistency rule established on the Issue Queue page
    TechnicianSuggestionInline.tsx   — the row-level suggested-technician + confirm control
```

Reuse directly, no new primitives: `StatusPill`, `PriorityBadge`, `SLACountdown`, `AttachmentGallery` (for viewing a technician's field-submitted resolution photos, read-only here).

---

## 4. The table — where the actual dispatch work happens

**Tabs** (URL-synced, replacing a flat filter list since these are the department's real mental model of the queue, not arbitrary filters): `Needs Assignment` (default) / `Active` / `Completed`.

### Needs Assignment tab — the core screen
Rows here are `PENDING_ASSIGNMENT` or `SUGGESTED` work orders. Columns:

| Column | Notes |
|---|---|
| Work Order # | `font-mono` |
| Issue | Linked `issueNumber` + title, opens Issue Queue's detail Sheet if clicked (cross-navigation, not duplication) |
| Category / Priority | `PriorityBadge` |
| SLA | `SLACountdown` — this tab should default-sort by SLA urgency, not creation time, since the whole point of the page is closing the gap before something breaches |
| **Assignment** | The row's working area — see below |

**Assignment column behavior** (this is `TechnicianSuggestionInline`, the page's most important component):
- If `assignmentStatus === "SUGGESTED"`: show the suggested technician's name plainly with their current load in parentheses ("Rahman (3 open)") — reusing the same load number the backend's own algorithm computed, so the dispatcher sees the system's reasoning, not a black box — next to a single **Confirm** button (the customized primary button, but compact row-sized) and a quieter "Change" text link beside it.
- If `assignmentStatus === "PENDING_ASSIGNMENT"` (no eligible technician found automatically): render a clearly distinct state — not just an empty cell — a small `--color-signal-open` indicator text ("No technician available") with a visible **"Assign manually"** button. This is the fallback case flagged as needing a human the moment it occurs, and the UI should make it impossible to miss in a scan of the table, since it represents the automation genuinely failing to resolve something.
- **Confirm** fires `useConfirmSuggestedTechnician`, and on success the row transitions in place (status badge updates, the inline control collapses to a plain "Assigned to Rahman" text) — no row removal/refetch; it simply moves out of the "Needs Assignment" tab's filter criteria on next query, which TanStack Query handles naturally via the cache update.
- **Change** / **"Assign manually"** both open the same `ReassignTechnicianForm`, inline as a small popover anchored to the row (not a full Sheet, keeping with this page's "stay fast" principle) — a searchable technician combobox, scoped server-side to the work order's zone/skill requirements (same constraint logic as the backend's own suggestion algorithm, so a dispatcher can't accidentally assign someone who doesn't actually cover that area).

### Active tab
`CONFIRMED`/`IN_PROGRESS` work orders — a quieter, read-oriented table (technician name, status, SLA, last update time) since there's no pending dispatcher action here; clicking a row opens the detail Sheet for monitoring, not quick action.

### Completed tab
Read-only archive, same `DataTable` shell, no special row controls.

---

## 5. Detail Sheet — the secondary, deeper view

Opened from the Issue # link or by explicitly clicking into a row (not the primary interaction path on the Needs Assignment tab, which resolves inline as above):

- **Instructions**: rendered directly from the category's work-instruction template plus the issue's specifics — the generated text designed earlier (`standard_instructions` + location + priority + citizen's description) — shown exactly as the technician would see it in their own portal, so a dispatcher/manager reviewing a work order sees precisely what's being asked of the field team, not a paraphrase.
- **`WorkOrderStatusLedger`**: the field progression (`ASSIGNED → IN_PROGRESS → COMPLETED`) plus any technician notes, using the same stamped-ledger visual language as everywhere else status history appears in the product.
- **Field evidence**: `AttachmentGallery`, read-only, showing any before/after photos the technician has submitted from their portal.
- **Reassign** (`ReassignTechnicianForm`, same component as the inline popover, just full-sized here) — available even on active work orders, for the real-world case of a technician becoming unavailable mid-job; require a short reason, consistent with the audit-conscious pattern used for every reassignment-style action elsewhere in the product.

---

## 6. Creating a work order manually (`CreateWorkOrderForm`)

Canonical implementation here, invoked two ways:
1. Standalone, from a "New Work Order" action on this page (a secondary, quietly-styled button near the table — this is a rare path, since most work orders are auto-created, so it shouldn't visually compete with the Needs Assignment queue).
2. Embedded, from Issue Queue's detail Sheet when an issue genuinely has none yet.

Fields: civic issue selector (pre-filled and locked when invoked from Issue Queue), instructions preview (read-only, generated automatically — never freehand-typed by staff, to keep the category-template system as the single source of truth discussed earlier), and the same suggested-technician-with-confirm control used in the table, so creating a work order manually still benefits from the same load-balancing suggestion rather than forcing a blind manual pick.

---

## 7. Mutations — same discipline as the other two department pages

`useConfirmSuggestedTechnician` and `useReassignTechnician` both patch the specific row in the TanStack Query cache on success — given this page is confirmed/reassigned against dozens of times per session, a naive refetch-the-whole-list pattern here would be the most noticeable performance and "feel" regression in the entire dashboard if done wrong.

---

## 8. Consistency notes for the team

- This page, not Issue Queue, owns `CreateWorkOrderForm` and `useSuggestedTechnician` — Issue Queue imports them. Build this page's assignment logic first; Issue Queue's work-order creation path depends on it.
- The inline-row-action pattern used here (`TechnicianSuggestionInline`) is intentionally unique to this page — don't carry it over to Citizen Reports or Issue Queue, where the Sheet-first pattern remains correct for their lower-frequency, higher-deliberation actions. Match the interaction weight to how often and how quickly the action is actually performed, not for pattern consistency's own sake.