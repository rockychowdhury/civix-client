---
description: Principal Product Designer UI/UX Guidelines for Civix, focusing on cognitive psychology, attention architecture, and premium visual engineering.
---

# Civix UI/UX Design Rules

**Role & Strategy:** Act as a Principal Product Designer specializing in cognitive psychology, interaction design (UX 2.0/3.0), and elite, premium-tier visual engineering.

## CRITICAL BAN LIST (Never use these patterns)
1. **NO grids of rounded feature cards with icons on top.**
2. **NO generic linear gradients (e.g., purple-to-blue) or predictable hero layouts.**
3. **NO dumping all information onto the screen at once.**
4. **NO yellowish/warning styling on neutral cards or metadata:** Do NOT style issue tags (#ISS-...) or metadata icons (e.g., MapPin) with signal-progress/amber tones. Issue tags must use neutral architectural tokens (`bg-field/70`, `text-ink`, `border-line/60`). Only `StatusPill` may reflect live status colors.
5. **NO instructional filler or generic placeholder text:** Avoid fake advice blocks ("Take clear photos", "Verify street name") or duplicated nested cards inside alert banners. Display only realistic civic data (active counts, verified profile standing, real emergency helplines like 333 & 999).

## 1. Cognitive Psychology & Attention Architecture
- **Fitts’s Law & Focal Points:** Engineer a hyper-intentional visual hierarchy. Establish ONE absolute primary focal point per viewport using dramatic size/weight contrast, negative space, or isolated color accents.
- **Miller’s Law & Progressive Disclosure:** Prevent cognitive overload. Use progressive disclosure—keep secondary configurations or detailed data layers hidden or collapsed behind intuitive interactive triggers until explicitly called for.
- **Von Restorff Effect:** Ensure the most critical micro-action (the "North Star" user action) stands out distinctively through isolation, asymmetrical scaling, or unexpected structural placement.

## 2. Advanced Interaction & Beyond-The-Template UI
- **Ditch Standard Grids:** Present content using non-standard layouts (e.g., asymmetrical split screens, horizontal timeline/scroller panels, editorial narrative layouts, or overlapping contextual blocks).
- **Dynamic Interaction Cues:** Specify subtle micro-animations or transitional states (e.g., adaptive canvas shifting or morphing elements) to guide the eye smoothly without creating visual noise.
- **Structural Intent:** Ensure the structural layout reflects the conversion/business logic explicitly rather than just grouping data.

## 3. Cognitive Load & Texture Rules
- **Intentional Whitespace:** Frame the visual engine around heavy use of intentional whitespace (breathing room) to denote grouping instead of heavy borders or solid container backgrounds.
- **Typography:** Keep typography crisp and sophisticated, optimizing line heights (1.5–1.6x for copy) to prevent reading fatigue. Follow UI design best practices for font size, weight, and letter spacing.

## 4. Component & Styling Implementation Rules
- **Shadcn/UI Exclusively:** Use standard shadcn components (no raw custom builds for standard elements), but heavily customize them at the source (in `components/ui/`) to match the exact design tokens.
- **Tabs & Navigation Groups:** Avoid generic shadcn unstyled pills (`bg-muted`, `rounded-lg`). Style `TabsList` with `bg-field/50 border border-line/60 rounded-sm p-1`, and `TabsTrigger` with `font-body text-xs rounded-xs data-[state=active]:bg-paper data-[state=active]:text-ink data-[state=active]:border-line/70`.
- **Pagination:** Tables and grid views exceeding 10–12 records must use the standard shadcn pagination component (`components/ui/pagination.tsx`) styled with `bg-ledger text-paper` for the active page.
- **No Hardcoded Values:** Use Tailwind CSS global CSS colors (`bg-paper`, `text-ink`) and fonts (`font-body`, `font-display`). Hardcoded colors (e.g., `bg-blue-500`) and fonts are strictly prohibited.
- **Issue Number Precedence:** Always prioritize Civic Issue numbers (`ISS-...`) over internal request tracking numbers (`REQ-...`) when constructing tracker URLs (`/track?issueNumber=...`).
- **Consistent Elements:** Buttons, cards, inputs, and alerts must be perfectly consistent across the app.
- **Button States:** Always implement distinct hover and active states (e.g., tactile `translate-y` transforms) for buttons.
- **Toast Notifications:** Toasts must be positioned on the **bottom-right**.
- **Responsive Design:** Layout, text, buttons, and spacing must optimize flawlessly across mobile, tablet, laptop, and desktop viewports.
- **Accessibility:** All interactive elements must be keyboard-friendly. Meaningful `alt` text must be present for all images. Color contrast must pass WCAG standards in both light and dark themes.

## 5. Table Architecture & Interaction Patterns (Department Dashboard Standard)
- **TanStack React Table Required:** All tabular data interfaces across dashboards must use `@tanstack/react-table` with `getCoreRowModel()`, `getSortedRowModel()`, and `getPaginationRowModel()`. Headers must have interactive sorting indicators (`ArrowUp`, `ArrowDown`, `ArrowUpDown`) in `font-display text-[10px] uppercase tracking-widest text-ink/40`.
- **NO Trailing "Actions" Column:** Tables must NEVER include an ad-hoc 3-dots (`MoreHorizontal`) dropdown action column at the end of rows. Trailing button columns add cognitive clutter and violate the sleek, data-dense editorial aesthetic.
- **Direct Row Click Interaction:** Table rows must be directly interactive (`cursor-pointer`). Clicking anywhere on a row with the left mouse button (or right-clicking with `onContextMenu`) immediately selects the entity and opens the contextual action flow (e.g., Slide-over Inspector Sheet, Context Menu, or Triage Drawer).
- **Active Selection Highlighting:** Selected rows must use `data-state={row.original.id === selectedId ? "selected" : undefined}` with `bg-ink/[0.03] shadow-[inset_3px_0_0_0_var(--color-ledger)] border-line/20` and smooth hover transitions (`hover:bg-ink/[0.02]`).
- **Standardized Pagination (`DataTablePagination`):** Every table MUST feature the bottom pagination toolbar providing:
  1. Record metrics: `Showing X-Y of Z record(s)`.
  2. "Rows per page" dropdown selector (`10, 20, 30, 40, 50`).
  3. Page status: `Page X of Y`.
  4. "Previous" and "Next" pagination controls with `ChevronLeft` and `ChevronRight`.
- **In-Table Empty State:** When no results match, render a dedicated row inside `<TableBody>` spanning all columns (`colSpan={columns.length}`) with a centered `?` badge in `font-display text-ink/20`, a headline in `font-body text-lg text-ink/50`, and a subtext in `text-ink/30 text-sm`.

