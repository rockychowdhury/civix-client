# Civix — Technician Dashboard
### High-level spec. Reuses the shell, tokens, layered architecture, and shared components (`StatusPill`, `PriorityBadge`, `SLACountdown`, `AttachmentGallery`, `WorkOrderStatusLedger`, the citizen report flow's `AttachmentsStep`) already established across the prior docs — only differences and new pieces are detailed here.

---

## 0. Portal-wide differences from the desk-based dashboards

- **Mobile-first, not desktop-first** — most usage is in the field. Below a breakpoint, the left sidebar is replaced entirely by a **bottom tab bar** (Queue / History / Profile) as already specified in `civix-dashboards-spec.md` §3.2 — don't attempt to collapse the desktop sidebar into a hamburger on mobile; it's a different nav paradigm, not a responsive version of the same one.
- **Inline primary actions, same justification as the dispatcher's Work Orders page**: "Accept" on an assigned work order is a frequent, low-deliberation action a technician does many times a day — it belongs directly on the queue row, not gated behind a detail view, for the same reasoning already established in `civix-department-work-orders-spec.md` §1.
- Chrome stays minimal everywhere — no breadcrumb clutter, no dense topbar; a technician standing at a job site needs the content, not navigation furniture.

---

## 1. `/technician/queue` — Today's Queue (default landing)

**Recall**: same `DataTable`/list pattern used throughout, condensed row variant, SSG shell + TanStack Query live data — identical rendering strategy to every other list page in this project.

**Content**: assigned work orders, sorted by SLA proximity (not creation time), filterable by date (today / this week / all upcoming).

**Row content**: Work Order #, issue title/category, location, `PriorityBadge`, `SLACountdown`.

**Difference — the Accept action**: a work order lands here once `assignmentStatus === "CONFIRMED"` but is not yet accepted by the technician. Each such row shows an inline **Accept** button (same compact primary-button treatment as the dispatcher's row-level Confirm). Accepting moves the work order into `IN_PROGRESS` and is the technician's explicit acknowledgment they've seen and are starting the job — this matters operationally because "assigned" and "the technician actually knows about it" are not the same fact, and the backend/SLA clock should be able to distinguish them if it doesn't already.

Already-accepted rows show their live status (`IN_PROGRESS`) instead of the Accept control, and tapping the row opens the detail page.

---

## 2. `/technician/work-orders/[id]` — Work Order Detail (the field tool)

This is the one page where a technician actually does their job — give it the most room, least chrome.

**Recall**: instructions rendering (category template + issue specifics), `WorkOrderStatusLedger`, `AttachmentGallery` — all exactly as specified in `civix-department-work-orders-spec.md` §5, just technician-authored rather than department-viewed.

**New here — two distinct actions, not one, and they must stay visually distinct:**

### 2.1 Work Update (repeatable, informal progress note)
- A simple note field + optional photo(s) (reusing the `AttachmentsStep` component from the citizen report flow directly — same drop zone, same camera-first mobile behavior, same max constraint), submittable any number of times while the order is `IN_PROGRESS`.
- Each submission appends a new entry to `WorkOrderStatusLedger` — this is read by the department's Work Orders detail Sheet too, so a dispatcher/manager sees live field progress without asking.
- Styled as a secondary action — frequent, low-stakes, no confirmation needed.

### 2.2 Resolution Update (single, final submission)
- A separate, clearly distinguished form — resolution notes (required) + after-photos (reuse `AttachmentsStep`, likely wanting "after" framing in its copy specifically here) — submitted **once**, transitioning the work order toward `RESOLVED` (which, per the backend's existing status flow, becomes `PENDING_VERIFICATION` next).
- This is the technician portal's one Von Restorff moment — isolate it with real visual weight (larger button, more whitespace around it, labeled plainly: **"Mark as Resolved"**) so it reads as a deliberate, final action, not just another update. Consider a lightweight confirmation step here (not a heavy `AlertDialog`, just an inline "Are you sure? This can't be undone from here" line above the button) since it's a one-way transition out of the technician's own editable window.

---

## 3. `/technician/history` — Completed

**Recall**: same read-only archive pattern as the department's Work Orders "Completed" tab (`civix-department-work-orders-spec.md` §4) — reuse that table configuration rather than building a new one; the only difference is the query is scoped to the current technician instead of the whole department.

Filterable by date range. Each row opens the same Work Order Detail page (read-only state — no Work Update/Resolution controls rendered once `CLOSED`).

---

## 4. `/technician/profile`

**Recall**: same profile page shape as other roles (`civix-dashboards-spec.md` §3.2).

**Content specific to this role**: coverage zone(s), skill/category tags, and an **availability toggle** — this is the literal flag the backend's auto-assignment algorithm reads (`civix-department-citizen-reports-spec.md`/earlier assignment design), so make the toggle's effect legible in its copy ("You won't receive new assignments while this is off") rather than a bare on/off switch with no stated consequence.

---

## 5. Architecture note

Same layered pattern as the department pages — `api/work-orders.ts` gains technician-scoped functions (`getMyQueue`, `acceptWorkOrder`, `submitWorkUpdate`, `submitResolution`), `hooks/` wraps each in TanStack Query, `components/forms/` holds `WorkUpdateForm` and `ResolutionUpdateForm` as two distinct components (not one form with a mode flag — their stakes and visual treatment are different enough to warrant separate components, per §2 above). No new table/list component needed beyond configuring the existing `DataTable`/ledger components for this role's scope.