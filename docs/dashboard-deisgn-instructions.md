# Civix — Role Dashboards: Architecture, Routes & Design Instructions
### Companion to the homepage, auth, and report-page specs. Covers all five portals: Citizen, Technician, Department (Manager/Dispatcher), Municipality (City Admin), System (Super/Platform Admin).

---

## 0. How the brand identity translates to operational dashboards

The homepage/auth identity (paper/ledger/ink palette, editorial whitespace, restrained motion) does not get abandoned here — but a dashboard is a **working tool used daily**, not a persuasion surface, so the same tokens are applied in a denser "console mode":

- Keep every color, font, and radius token exactly as defined — never introduce a separate "admin theme." A technician and a first-time visitor to the homepage should recognize it as the same product.
- Drop the generous editorial whitespace and split-screen storytelling layouts; replace with information-dense, text-forward lists and tables. Whitespace is now used to group *rows and fields*, not to create dramatic focal moments.
- **Explicitly avoid the generic SaaS-admin-template look**: no icon-heavy sidebar with rounded active-state pills, no 6-KPI-card grid at the top of every page, no zebra-striped tables, no drop-shadow'd panel cards. Specifically:
  - Sidebar nav items are **text-first**, small icon optional and monochrome, active state indicated by a left-border accent bar in `--color-ledger` and a weight shift in the label — not a filled rounded background.
  - Data tables use **hairline row dividers** (`border-line`) with no alternating background — density and legibility come from spacing and type, not stripes.
  - Every overview/dashboard page has **one dominant metric or queue as its focal point** (Fitts's Law still applies inside the product, not just on the marketing site) — resist the instinct to open every page with a row of equally-weighted stat cards. Secondary metrics go in a quieter row beneath, or behind a "view details" expansion.
  - Status and priority always render via the shared `StatusPill`/`PriorityBadge` components (Section 3), using only the existing semantic colors (`--color-signal-open`, `--color-signal-resolved`) plus one neutral "in progress" tone added specifically for dashboards (`--color-signal-progress`, an amber/ochre — add this token now since operational views need a genuine three-state system that the marketing site never required).

---

## 1. Cross-cutting architecture (build this before any individual dashboard)

### 1.1 Route strategy

All portals live under a single protected route group so there is one shared, protected layout shell — role differences are **configuration passed into that shell**, not five separate layout implementations:

```
app/
├── (marketing)/                 → homepage, public pages (existing)
├── (auth)/                      → login, register, otp, etc. (existing)
└── (portal)/
    ├── layout.tsx                → SERVER: resolves session + role, redirects if unauthenticated,
    │                                renders <DashboardShell> with the role's nav config
    ├── citizen/...
    ├── technician/...
    ├── department/...
    ├── municipality/...
    └── system/...
```

Each role folder is a real URL segment (`/citizen`, `/technician`, `/department`, `/municipality`, `/system`) rather than a Next.js parenthesized route group — these are genuinely different portals a person is routed into after login based on their role claim, so the URL should reflect that plainly (also makes deep-linking, bookmarking, and support conversations easier: "go to /department/work-orders" is a real, sharable instruction).

### 1.2 Role → portal mapping and default landing route

| Role | Portal segment | Default landing tab |
|---|---|---|
| `CITIZEN` | `/citizen` | `/citizen/overview` |
| `TECHNICIAN` | `/technician` | `/technician/queue` |
| `DISPATCHER` | `/department` | `/department/work-orders` |
| `DEPARTMENT_MANAGER` | `/department` | `/department/overview` |
| `CITY_ADMIN` | `/municipality` | `/municipality/overview` |
| `PLATFORM_ADMIN` | `/system` | `/system/overview` |
| `SUPER_ADMIN` | `/system` | `/system/overview` |

`DISPATCHER` and `DEPARTMENT_MANAGER` **share the same `/department` portal and folder tree** — they differ only in which tabs and actions are visible, driven by the permission matrix (Section 1.4), not by duplicated pages. Same logic applies to `PLATFORM_ADMIN` vs `SUPER_ADMIN` under `/system`. This is the single biggest lever for the "scalable and maintainable" requirement: **five portals, not seven, because two pairs of roles are permission variants of the same operational view rather than genuinely different tools.**

### 1.3 Middleware (defense layer 1)

```ts
// middleware.ts
const ROLE_PORTAL_MAP: Record<Role, string> = { CITIZEN: "/citizen", TECHNICIAN: "/technician",
  DISPATCHER: "/department", DEPARTMENT_MANAGER: "/department",
  CITY_ADMIN: "/municipality", PLATFORM_ADMIN: "/system", SUPER_ADMIN: "/system" };

// For any request under /(portal)/*: read the role claim from the session/JWT,
// verify the requested path's first segment matches an allowed portal for that role,
// else redirect to that role's own default landing route (never a raw 403 page for
// a logged-in user landing in the wrong portal — silently correct them, it's a routing
// mistake from their side or a stale link, not a security event worth alarming them over).
```

### 1.4 Permission matrix (defense layer 2, and the source of truth for UI visibility)

A single file, `lib/permissions/matrix.ts`, maps `role → set of permission keys` (e.g. `workorder:assign`, `technician:manage`, `category:edit`, `municipality:create`). This file is imported in **three places**, never duplicated:
1. Server-side in each `layout.tsx`/`page.tsx` that needs to gate a whole page (e.g., only `DEPARTMENT_MANAGER` can load `/department/technicians`).
2. In `DashboardShell`'s nav renderer, to decide which sidebar items a given role sees.
3. In individual components, via a `usePermission("workorder:assign")` hook, to conditionally render an action button (e.g., only a Dispatcher/Manager sees the "Assign" button on a work order row; a read-only viewer role, if one is added later, would not).

This means adding a new role later, or changing what a `DISPATCHER` can do, is a one-file change — never a hunt through JSX across five portals.

---

## 2. Shared component layer (build once, consume everywhere)

```
components/dashboard/
  DashboardShell.tsx        — Sidebar + Topbar + content slot; accepts navConfig + role as props
  Sidebar.tsx                — renders nav items from config, permission-filtered
  Topbar.tsx                 — breadcrumb, global search, notification bell, profile menu
  DataTable.tsx              — generic, column-def driven table (built on shadcn Table),
                                used by every list screen across all five portals:
                                citizen's report list, technician's queue, department's issue
                                queue, municipality's department list, system's municipality
                                list — one implementation, configured per use, not five forks
  StatusPill.tsx              — semantic status colors, used everywhere status appears
  PriorityBadge.tsx           — LOW/MEDIUM/HIGH/CRITICAL, semantic + neutral tones
  SLACountdown.tsx            — shared countdown/overdue indicator, used on any work-order
                                or civic-issue row across department/technician/municipality views
  EmptyState.tsx              — one consistent "nothing here yet" pattern platform-wide
  AuditTrailPanel.tsx          — collapsible history panel, reused on civic issue, work order,
                                and category detail views wherever an audit log applies

features/                     — domain logic shared ACROSS portals, colocated by domain,
                                not duplicated per role folder
  civic-issues/
    api.ts, hooks.ts, components/IssueDetailPanel.tsx   — used by technician (read-limited),
                                                            department (full), municipality (read)
  work-orders/
    api.ts, hooks.ts, components/WorkOrderCard.tsx, components/AssignmentControl.tsx
  technicians/
    api.ts, hooks.ts, components/TechnicianRosterRow.tsx
  categories/
    api.ts, hooks.ts, components/CategoryEditor.tsx      — used only in municipality portal,
                                                            but colocated here since categories
                                                            are referenced (read-only) elsewhere
```

**Rule**: a component that shows the *same underlying entity* to different roles (a work order, a civic issue) is **one component with a `variant`/`permissions` prop**, not a `TechnicianWorkOrderCard` and a `ManagerWorkOrderCard` that will inevitably drift apart. This is the concrete implementation of the "scalable and maintainable" requirement — new fields or status logic get added once.

---

## 3. Portal-by-portal: routes, tabs, and design notes

### 3.1 `/citizen` — CITIZEN

The only portal that still carries some of the marketing site's warmth — this is a citizen checking in on something they personally care about, not doing operational work.

| Route | Tab | Purpose |
|---|---|---|
| `/citizen/overview` | Overview | Default landing. Focal point: a persistent, prominent "Report an Issue" action (same button styling as the homepage North Star), plus a short list of the citizen's own **active** reports as compact status-timeline rows (reuse the hero mockup's timeline visual) |
| `/citizen/my-reports` | My Reports | Full history via the shared `DataTable`, filterable by status; each row links to detail |
| `/citizen/my-reports/[trackingNumber]` | (detail, not a tab) | Full timeline for one report — reuse the confirmation screen's civic-receipt aesthetic in a persistent, revisitable form, including department name and any technician-added resolution photos |
| `/citizen/notifications` | Notifications | Plain chronological list, status-change and SLA-relevant updates only — no marketing content ever appears here |
| `/citizen/profile` | Profile | Contact info, verification tier status, and the "verify your identity" upsell from the auth spec's tiered-trust model, framed the same non-pressuring way |

**Design note**: this is the one portal where the editorial tone can survive — the empty state for zero reports, for instance, should not be a bare "No data" message but a warm, on-brand prompt reusing the homepage's hero copy pattern.

### 3.2 `/technician` — TECHNICIAN

Mobile-first by default — most technicians will use this from a phone in the field, not a desktop. Chrome is minimal; the content is the tool.

| Route | Tab | Purpose |
|---|---|---|
| `/technician/queue` | Today's Queue | Default landing. A single prioritized list (`DataTable`, condensed row variant) of assigned work orders — sorted by priority/SLA proximity, not creation date. This list, not a stat dashboard, is the entire focal point of this portal |
| `/technician/work-orders/[id]` | (detail) | The actual field tool: issue details, instructions (from `Category.workInstructions`), a large touch-friendly status-update control, a note field, and a photo-upload control **reusing the exact AttachmentsStep component** from the citizen report flow — same drop zone, same camera-first mobile behavior, same max-3 constraint (or a higher cap if resolution proof needs more — confirm with backend, but reuse the component regardless) |
| `/technician/history` | Completed | Read-only log of resolved work orders, for the technician's own reference/record |
| `/technician/profile` | Profile | Coverage zone(s), skill tags, availability toggle — the same availability flag the backend's auto-suggestion algorithm reads |

**Design note**: no sidebar navigation clutter on mobile — a simple bottom tab bar (Queue / History / Profile) replaces the desktop sidebar below a breakpoint, since a persistent left sidebar is a poor mobile pattern regardless of brand consistency.

### 3.3 `/department` — DEPARTMENT_MANAGER & DISPATCHER (shared portal)

| Route | Tab | Visible to | Purpose |
|---|---|---|---|
| `/department/overview` | Overview | Manager (default) | Focal point: SLA compliance rate as the one dominant number, department's open-issue count and average resolution time beneath it, quietly |
| `/department/issues` | Issue Queue | Both | All `CivicIssue`s routed to this department, `DataTable` with priority/SLA columns; Manager can override priority here (writes `priorityOverriddenBy`/reason per the earlier schema decision) |
| `/department/issues/[id]` | (detail) | Both | Full issue detail via the shared `IssueDetailPanel`, including linked service requests, reporter count, and the audit trail panel |
| `/department/work-orders` | Work Orders | Dispatcher (default) | The dispatch surface: work orders in `PENDING_ASSIGNMENT` or `SUGGESTED` state, each row showing the system's suggested technician (from the backend's auto-suggest algorithm) with a **one-click Confirm** action, or a searchable reassign control — styled as a functional list/ledger, explicitly not a drag-and-drop kanban board (kanban is the generic pattern to avoid here; a sortable, filterable list is both more scalable for high-volume dispatch and more consistent with the platform's ledger identity) |
| `/department/technicians` | Technician Roster | Manager only | Roster table: coverage zone, current open-order load (the same load-balancing count the assignment algorithm uses — showing it here makes the system's logic legible to the manager, not a black box), availability status |
| `/department/reports` | Analytics | Manager only | Department-level trends: resolution time over time, issues by category, SLA breach frequency — charts here are the one place in the whole product where a heavier data-viz treatment is appropriate, still using only the token colors |

**Design note**: the shared layout renders all six nav items but greys out/hides `Technicians` and `Reports` for a `DISPATCHER` per the permission matrix — implemented as a filter over the nav config array, not a second sidebar component.

### 3.4 `/municipality` — CITY_ADMIN

This portal governs the **rules the entire automated pipeline runs on** — category config, routing rules, department structure — so its design tone should feel closer to "configuration console" than "queue to work through."

| Route | Tab | Purpose |
|---|---|---|
| `/municipality/overview` | Overview | City-wide focal metric (e.g., median resolution time across all departments) plus a compact department-performance list (not a card grid) ranking departments by SLA compliance — this is the internal counterpart to the public Transparency Dashboard on the homepage, and should visually echo it (same map/heat treatment) for consistency |
| `/municipality/departments` | Departments | CRUD list of departments |
| `/municipality/departments/[id]` | (detail) | Department profile: assigned categories, staff roster link, performance history |
| `/municipality/categories` | Categories & Routing | The most structurally important screen in this portal: category tree editor (parent/child), each category's `baseSeverity`, `workInstructions` template, and routing rule (category [+ zone] → department) — since this table is the load-bearing config for auto-routing, priority scoring, and work-order instruction generation discussed earlier, its editor deserves a clear, form-per-category detail view rather than inline table editing, to avoid careless misconfiguration of something this consequential |
| `/municipality/wards-zones` | Wards & Zones | Reference data management for the location hierarchy |
| `/municipality/analytics` | Analytics | Deeper cross-department reporting than the overview's single metric — filterable by date range, category, ward |
| `/municipality/audit-log` | Audit Log | Full `AuditTrailPanel` at municipality scope — who reassigned what, who overrode a priority, who edited a routing rule |

### 3.5 `/system` — SUPER_ADMIN & PLATFORM_ADMIN (shared portal)

This is the multi-tenant control plane — if Civix is designed to serve multiple municipalities, this is where that gets managed. Distinguish the two roles narrowly and explicitly rather than treating them as equivalent:
- `PLATFORM_ADMIN`: day-to-day platform operations — onboarding municipalities, managing platform-wide category templates that new municipalities inherit, support/impersonation tooling, viewing system health.
- `SUPER_ADMIN`: everything `PLATFORM_ADMIN` can do, plus irreversible/infra-sensitive actions — creating other `PLATFORM_ADMIN`/`SUPER_ADMIN` accounts, deleting a municipality tenant, platform-wide destructive settings. Gate these specific actions with the permission matrix, not a second portal.

| Route | Tab | Purpose |
|---|---|---|
| `/system/overview` | Overview | Platform-wide focal metric (e.g., total active municipalities, or total issues resolved platform-wide this month — echoing the homepage's live counter, now as the internal source of truth for that public number) |
| `/system/municipalities` | Municipalities | Tenant list — onboarding status, plan/tier if applicable, activity level |
| `/system/municipalities/[id]` | (detail) | Tenant profile and configuration; a `SUPER_ADMIN`-only "Deactivate/Delete Municipality" action lives here, visually separated (e.g., a distinct bottom "danger zone" region, per standard destructive-action UX practice) from routine settings |
| `/system/users-roles` | Users & Roles | Global account management across all municipalities — search any user, adjust roles, and (`SUPER_ADMIN` only) create new `PLATFORM_ADMIN` accounts |
| `/system/platform-settings` | Platform Settings | Global defaults new municipalities inherit (default category templates, default SLA targets) |
| `/system/system-health` | System Health | Uptime, queue/job health (SLA-checker cron, notification queue), error rates — this is the internal view backing the public status link mentioned in the homepage footer |
| `/system/audit-log` | Audit Log | Platform-scoped audit trail, one level above municipality audit logs |

---

## 4. Notifications & search (Topbar, shared across all portals)

- **Notification bell**: a shared `NotificationCenter` component, but its content query is scoped per role (a citizen sees their own report updates; a technician sees new assignments; a manager sees SLA breach alerts) — one component, role-scoped query, not five notification implementations.
- **Global search** in the Topbar: scoped to what that role can actually see (a citizen searches only their own reports by tracking number; a department user searches issues/work orders within their department; municipality/system roles search more broadly) — implement as a single search endpoint that applies the same permission matrix server-side, so search can never leak data a role shouldn't see regardless of what the UI shows.

---

## 5. Why this structure holds up as the product grows

- Adding a **sixth role** later (e.g., a read-only "Auditor" role) means: one entry in the permission matrix, one entry in the role→portal map, and reusing an existing portal's components with a more restrictive permission set — not a new portal built from scratch.
- Adding a **new entity type** to the platform (e.g., a future `Inspection` model) means extending the shared `DataTable`/`StatusPill`/`AuditTrailPanel` components with new column defs, not building a parallel table component per portal that happens to need it.
- Because `IssueDetailPanel` and `WorkOrderCard` are shared, a schema or business-logic change (e.g., adding the `priorityOverriddenBy` field discussed earlier) surfaces automatically everywhere it's relevant, with a permission check deciding visibility — rather than needing five separate UI updates that can silently drift out of sync with each other over time, which is the actual failure mode "scalable and maintainable" is meant to prevent.