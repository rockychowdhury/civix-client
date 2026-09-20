# Civix — Service Request (Report an Issue) Page
### Companion to `civix-homepage-spec.md` and `civix-auth-and-design-system-spec.md`. This is the North Star action the entire homepage points to — it must be the single best-designed screen in the product, because it's the one every operational outcome depends on.

---

## 0. Framing

Every other page in Civix exists to get someone here, or to show them the result of having been here. If this page feels like a bureaucratic form, the whole premise of the platform — "the city that actually listens" — falls apart at the exact moment it needs to be proven. The design goal is specific: **a citizen who just finished submitting a report should feel like they did something, not like they filled out paperwork.**

Concretely, that means three things drive every decision below:
1. **One decision at a time.** A single flat form with a description box, a category dropdown, an address field, and a file picker all visible at once is cognitively heavy for something citizens are often reporting in a stressed or annoyed state (they're standing next to a pothole, frustrated). Break it into a **sequential flow**, not a form.
2. **Reduce typing, increase recognition.** Wherever the system can infer, suggest, or detect something (location, likely category from description, previous ward), it should — recognition is dramatically lower cognitive load than recall.
3. **The ending has to feel earned.** The confirmation moment is not a toast that says "Success" — it's the payoff for the whole interaction, and it's designed accordingly in Step 6.

---

## 1. Overall architecture: a guided flow, not a form

**Reuse, don't reinvent**: the homepage already established a transit-line/timeline motif for "How Civix Works" (Section 4). The report flow's progress indicator should be **the literal same component**, now acting as the actual progress bar instead of a marketing illustration. This is a deliberate continuity decision — the citizen saw this exact visual on the homepage promising "here's what happens after you report," and now they're inside it. That continuity is worth more than any new progress-bar design could be.

**Steps** (five data steps + one outcome — matches the two real API calls with proper sequencing):

| Step | Purpose | Maps to payload |
|---|---|---|
| 1. What's wrong? | Category selection | `request.categoryId` |
| 2. Tell us what happened | Description | `request.description` |
| 3. Where is this? | Location | `location.*` |
| 4. Add photos (optional) | Evidence | attachment upload (separate call) |
| 5. Review | Confirm before submitting | — |
| 6. Confirmation | Payoff / tracking info | response data |

The wizard runs as **one continuous client-side form state** (not independent forms per step) so navigating back never loses data — this is a baseline trust requirement, not a nice-to-have, given people are reporting from a phone with unreliable connectivity or interruptions (a phone call, walking while typing).

**Persistent draft**: form state autosaves to `localStorage` on every field change (debounced), keyed by a draft ID. If the citizen closes the tab or the app crashes mid-report, returning to the report page should detect the draft and offer to resume — framed warmly, not as an error recovery dialog: *"Pick up where you left off? You were reporting an issue on Mazar Road."* This single feature does a lot of psychological work: it tells the citizen the system respects the effort they already put in, which is exactly the "hassle-free, want to do this again" feeling the brief is asking for.

---

## 2. Step-by-step design

### Step 1 — What's wrong? (Category)

**Psychology**: This is the first decision and it should feel fast and recognition-based, never like searching a government form's dropdown of 40 options.

- Not a `<select>` dropdown. A **two-tier visual picker**: first show 6–8 top-level parent categories (from `categoryId`'s `parentId` hierarchy) as a horizontal set of large, tappable text-forward tiles — no icons-on-top-of-cards pattern; instead, each tile is dominated by the category name in `font-display` at meaningful size, with a one-line example beneath it in smaller `font-body` ("Water Leakage, Drainage, Supply Issues" for "Water"). Selecting a parent **doesn't navigate away** — it triggers an in-place expansion beneath the tile row (same structural-morph interaction used in the homepage's progressive disclosure section) revealing the specific subcategories to choose from.
- Add a plain-text search input above the tiles for citizens who know exactly what they want to report ("streetlight") — filters the tile set live. This serves both mental models (browse vs. search) without forcing a choice between two competing UI patterns.
- The moment a specific subcategory is picked, auto-advance to Step 2 — **no explicit "Next" click required here**. Removing an unnecessary click on the very first, highest-abandonment-risk step is a meaningful friction reduction.

### Step 2 — Tell us what happened (Description)

**Psychology**: A blank, generic "Description" textarea is intimidating (blank-page problem) and produces vague reports ("it's bad"), which downstream hurts the auto-categorization confidence work already designed into the platform.

- The textarea's placeholder text is **dynamically generated based on the Step 1 category selection** — this is a direct, meaningful personalization, not decoration: selecting "Water Leakage" produces a placeholder like *"e.g. Water has been flowing continuously from a broken pipe since this morning, forming a large puddle on the road..."* This does double duty: it reduces blank-page anxiety and it implicitly teaches the citizen what level of detail is useful, improving report quality without a instructional paragraph nobody reads.
- Live character-based encouragement, not a cold counter: below ~20 characters, a quiet helper line reads "A few more details will help this get resolved faster" — framed as helpfulness toward *their own outcome* (faster resolution), not as a rule they're failing to meet ("minimum 20 characters required").
- No AI/auto-suggestion gimmicks here — keep this step simple and human. The category was already chosen deliberately in Step 1; this step's only job is capturing their own words in their own voice, since that raw text becomes the `CivicIssue.description` seed described in the platform's backend design.

### Step 3 — Where is this? (Location)

**Psychology**: Location entry is the step most likely to feel like "filling out a form" (address, postal code, ward, zone) unless the system does the work first and asks the citizen to confirm rather than compose.

- **Primary, isolated action at the top of this step**: a single large button, "Use my current location," styled with the primary Button variant — this is the step's Von Restorff focal point. Tapping it triggers the browser geolocation prompt (styled with a brief, honest pre-permission explainer line above the button so the OS permission dialog doesn't feel like a surprise: "We'll use this only to pinpoint the issue location").
- On success: reverse-geocode the coordinates server-side (via a lightweight API route) into a human-readable address, ward, and zone, and **populate the form fields automatically**, then reveal them in an already-filled, editable state — the citizen reviews and corrects rather than composes from nothing. `latitude`/`longitude` are set directly from the device.
- If geolocation is denied or unavailable (a very real case — indoor reporting, older devices, privacy-conscious users): **gracefully fall back**, not an error state. Reveal the manual fields (address, landmark, postal code, ward, zone selects) with the same visual weight, framed neutrally: "No problem — tell us where this is." Ward/zone become searchable comboboxes (shadcn `Command` + `Popover`, customized per the design system doc), not long alphabetical `<select>` dropdowns.
- **Personalization worth building**: if the citizen has previously submitted requests, silently pre-bias the manual ward/zone comboboxes' default/top suggestion toward their most recently used ward — most people report multiple issues in the same neighborhood over time, and this quietly removes a lookup step for returning citizens without being presented as a mysterious "smart" feature that needs explaining.
- A small, non-interactive static map preview (matching the paper/ledger color treatment from the homepage's Transparency Dashboard section, not a default blue Google Maps embed) confirms the pin visually once a location is set — this is a confidence-building confirmation, not a functional map (no need for pan/zoom interaction here; that would be scope creep on a step whose only job is confirming "yes, that's the spot").

### Step 4 — Add photos (optional, but positioned to encourage)

**Psychology**: Optional steps get skipped unless their value is stated before the friction (upload) is presented.

- Open with a single sentence stating *why*, not just an upload box: "Issues with a photo get resolved 40% faster on average" (use a real figure once you have the data; frame honestly if you don't yet — even a qualitative version, "Photos help technicians arrive prepared," works, but don't fabricate a stat).
- Drop zone styled consistent with the Input treatment (bottom-border/ledger-line aesthetic, not a dashed generic upload box) with a camera icon **only on mobile viewports**, where tapping opens the device camera directly — most real reports happen in the moment, standing in front of the problem, and forcing a citizen to go to their gallery app first is unnecessary friction.
- Max 3 files enforced client-side before any network call, with clear inline messaging the moment a 4th is attempted ("Up to 3 photos per report") rather than a rejection after the fact.
- Each attached photo shows as a small thumbnail with an easy one-tap remove — no confirmation dialog needed for removing a photo pre-submission (low-stakes, reversible action; confirmation dialogs should be reserved for higher-stakes moments, per general UX judgment, not sprinkled everywhere).
- Skip option is a plain ghost-text link ("Skip for now"), equal step in the flow, not a punishment for not adding photos.

### Step 5 — Review

**Psychology**: A review step exists to build confidence before an irreversible action (submission), not to make the citizen re-verify data entry — so it should read like a summary document, not an editable form repeated.

- Presented as a single, quiet document-style summary (echoing the "case file" aesthetic from the homepage's Resolved Stories section) — category, description excerpt, location, and photo thumbnails laid out as a coherent readable card, each section with a small "Edit" ghost-text link that jumps back to that specific step (not restarting the whole wizard).
- The submit button here is the flow's final and clearest Von Restorff moment — larger than any other button so far, isolated with generous whitespace above it, labeled specifically rather than generically: **"Submit Report"**, not "Next" or "Confirm."

### Step 6 — Confirmation (the payoff)

This is the moment the entire "make citizens proud" requirement is won or lost, and it deserves the most deliberate design of the whole flow.

- **Reject the generic success toast/checkmark pattern entirely.** Instead, render a full-screen confirmation styled like an **official civic receipt/certificate** — consistent with the ledger/registry aesthetic already established: the tracking number (`REQ-260920-0001`) rendered large, in `font-mono`, styled like a stamped official document reference, with a subtle single-motion "stamp" animation on entry (a brief scale+opacity settle, not a bouncy celebratory animation — the tone is dignified civic acknowledgment, not confetti).
- **Personalize the outcome using the actual response data**, which is a meaningful, non-generic detail this page can uniquely offer:
  - If `civicIssue.reportedCount === 1`: frame it as first-to-notice civic contribution — *"You're the first to report this. Thank you for keeping watch over your neighborhood."*
  - If `civicIssue.reportedCount > 1`: frame it as joining a collective effort, which is genuinely more reassuring than being told "someone already reported this" (which can feel like their effort was wasted) — *"You've joined 6 other neighbors already tracking this issue — that helps it get prioritized."* This reframes duplicate-detection, a backend deduplication mechanic, into a citizen-facing feeling of solidarity rather than redundancy.
- Show the assigned department plainly (`category.departmentId` resolved to a name) as a small accountability detail: *"Routed to: Roads & Infrastructure Department"* — this directly answers "did this go anywhere real," reinforcing the whole platform's core promise at the exact moment of highest attention.
- Primary next action: **"Track this report"** (navigates to the tracking detail page using the `trackingNumber`) — not "Submit another report," even though that's tempting to promote; respect that the citizen just finished a task and let them leave feeling complete. A quieter ghost-text link, "Report another issue," is available but not the visual priority.
- A small, optional, low-pressure share affordance ("Let others know this was reported") generates a plain civic-styled share card (tracking number + category + neutral map thumbnail, no personal data) — framed as spreading awareness of a real local issue, not as social bragging; keep this modest and skippable, consistent with the brand's restrained tone.

---

## 3. State management & data flow

- **Form library**: `react-hook-form` with a `zod` schema that mirrors `ICreateServiceRequestPayload` exactly (nested `request` and `location` objects), validated per-step (only the current step's fields are validated on "Next," full schema validated before final submit) using `mode: "onBlur"` for a forgiving, non-naggy validation feel.
- **Wizard state**: a single top-level client component owns the current step index and the `react-hook-form` instance; step components are pure, controlled children — no step manages its own separate form state, which is what causes data loss on back-navigation in poorly-built wizards.
- **Draft persistence**: a `useEffect` watching `form.watch()` (debounced ~800ms) writes to `localStorage` under a namespaced key; cleared only on successful submission or explicit "Start over."
- **Submission sequencing** (this matters — the two API calls are not symmetric in importance):
  1. `POST /api/v1/service-request/` fires first, with the full `request` + `location` JSON payload. This is the operationally critical call — a citizen's report existing in the system matters more than the photos attached to it.
  2. On success, immediately transition to a **submitting-attachments sub-state** rather than waiting to reveal the confirmation screen — if there are photos, show a brief, honest inline state ("Attaching your photos...") layered subtly at the bottom of an already-appearing confirmation screen, so the citizen sees their success immediately and isn't blocked waiting on file upload latency.
  3. `POST /api/v1/attachments/service-request/:id` fires with the returned `id` as multipart form-data. **If this call fails** (poor connectivity is common for exactly this use case — someone standing outside with a weak signal), do not fail the whole flow or make the citizen resubmit the report. Their `trackingNumber` already exists and is valid. Instead, surface a small, calm inline retry affordance on the confirmation screen itself: "Some photos didn't upload — retry?" with a scoped retry button that only re-attempts the attachment call, since the report itself already succeeded. This distinction (report success is unconditional; attachment success is best-effort) should be treated as a hard architectural rule, not an edge case handled ad hoc.
- **Optimistic UI**: none needed for the final submit (a full-screen transition to Step 6 already provides immediate feedback once the first API call resolves); do use optimistic UI for the category tile selection and photo removal, since those are purely local state changes with no server dependency.

---

## 4. Component architecture (Next.js App Router)

```
app/(citizen)/report/page.tsx                — Server Component: fetches categories,
                                                 municipality/ward/zone lookup data, and (if
                                                 authenticated) the citizen's last-used ward for
                                                 personalization. Passes this as initial props —
                                                 no client-side waterfall fetch for static lookup data.

components/report/
  ReportWizard.tsx                            — Client Component: owns form state, step index,
                                                 draft persistence, submission orchestration
  steps/
    CategoryStep.tsx                          — Client: tile grid + search + in-place expansion
    DescriptionStep.tsx                       — Client: textarea + dynamic placeholder logic
    LocationStep.tsx                          — Client: geolocation call, reverse-geocode fetch,
                                                 manual fallback comboboxes, static map preview
    AttachmentsStep.tsx                       — Client: dropzone, client-side validation, previews
    ReviewStep.tsx                            — Client: read-only summary + edit-jump links
    ConfirmationStep.tsx                      — Client: receives mutation response, renders the
                                                 receipt/certificate UI, handles attachment retry
  DraftResumeBanner.tsx                       — Client: shown conditionally on mount if a draft exists
  ProgressRail.tsx                            — Client: the shared timeline component (imported
                                                 from the same source used on the homepage's
                                                 "How Civix Works" section — do not fork a duplicate
                                                 implementation)

lib/report/
  schema.ts                                   — zod schema matching ICreateServiceRequestPayload
  useReportDraft.ts                           — localStorage persistence hook
  api.ts                                      — createServiceRequest(), uploadAttachments()
                                                 as typed functions wrapping fetch/TanStack Query
                                                 mutations
```

Keep the boundary intentional: only `page.tsx` is a Server Component (data that doesn't change per-interaction — categories, municipality reference data). Everything inside the wizard is Client, since it's entirely interaction-driven (geolocation, form state, file handling) — don't fight Next.js's model by trying to force server components deeper into this tree than the initial data fetch.

---

## 5. Micro-interaction & psychology summary (for quick implementation reference)

| Moment | Principle applied | Implementation detail |
|---|---|---|
| Category tile selection auto-advances | Reduce unnecessary clicks (friction reduction) | No explicit "Next" on Step 1 |
| Dynamic description placeholder | Recognition over recall | Placeholder keyed to selected category |
| Geolocation-first, manual-fallback | Progressive disclosure + reduce typing | Manual fields hidden unless needed |
| Ward/zone pre-biased to last used | Personalization | Silent default, not an announced "feature" |
| Draft autosave + resume banner | Trust, respect for citizen's effort | Framed warmly, not as error recovery |
| Attachment upload decoupled from report success | Never punish the citizen for network conditions | Report success is unconditional |
| Confirmation styled as a civic receipt | Von Restorff + earned payoff | Full-screen, stamped, not a toast |
| ReportedCount framed as solidarity, not redundancy | Reframing to protect the citizen's sense of contribution | Directly uses backend dedup data |
| Department name shown at confirmation | Directly answers "did this go anywhere" | Reinforces the platform's core promise |

---

## 6. Accessibility & edge cases (non-negotiable, per the design system's accessibility floor)

- Every step must be fully operable via keyboard, including the category tile grid (arrow-key navigation between tiles, `Enter`/`Space` to select) and the file dropzone (a visible, focusable "Choose files" fallback button, never relying on drag-and-drop alone).
- Geolocation permission denial, browser incompatibility, and slow reverse-geocode responses must all degrade to the manual location fields without a dead end or a spinner with no timeout.
- If a citizen is not authenticated, allow the flow to proceed under the platform's tiered-trust model (email/phone capture can happen inline before final submission, framed as "Where should we send updates?" rather than a hard login wall before they've even described the issue) — forcing authentication before Step 1 would undermine the entire low-friction premise this page is built around.
- Respect `prefers-reduced-motion` for the stamp animation, tile expansions, and progress rail fill — provide an instant-state fallback for every animated moment listed in this document, consistent with the motion rules already established for the rest of the product.