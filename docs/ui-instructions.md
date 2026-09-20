# Civix — Auth Pages, Design System Implementation & Homepage Revisions
### Companion document to `civix-homepage-spec.md`. Same design identity, same psychology rules — this document covers how it's actually built (Tailwind + shadcn/ui), the auth flow, fixes to the homepage, and a few citizen-value additions worth building.

---

## Part 1 — Turning the design tokens into Tailwind + shadcn, without it looking like shadcn

The risk with shadcn is not the components — it's that every shadcn project defaults to the same rounded-lg, same shadow-sm, same slate/zinc palette, same Inter-adjacent type scale. The instruction here is: **use shadcn for behavior and accessibility, never for its default appearance.** If a component still looks recognizably "default shadcn" after theming, it hasn't been customized enough.

### 1.1 Tailwind theme = the token system, not new decisions

Nothing here is a new design choice — `tailwind.config.ts` should be a direct transcription of the tokens already defined in the homepage spec. Do not introduce new colors, radii, or type sizes at implementation time.

```ts
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      paper: "var(--color-paper)",
      ink: "var(--color-ink)",
      ledger: "var(--color-ledger)",
      "signal-open": "var(--color-signal-open)",
      "signal-resolved": "var(--color-signal-resolved)",
      line: "var(--color-line)",
    },
    fontFamily: {
      display: ["var(--font-display)"],
      body: ["var(--font-body)"],
      mono: ["var(--font-mono)"],
    },
    borderRadius: {
      DEFAULT: "2px",   // overrides shadcn's default lg/md/sm radius scale globally
      pill: "999px",    // reserved only for live status pills, per the homepage spec
    },
  },
}
```

Set the CSS custom properties themselves in `globals.css` under `:root`, exactly as named in the homepage spec — Tailwind classes should always resolve to `var(--...)`, never to a literal hex, so a future palette adjustment is a one-line change, not a find-and-replace across components.

### 1.2 shadcn components: install, then re-skin at the source

Use the CLI to scaffold (`button`, `input`, `label`, `form`, `dialog`, `otp-input` via `input-otp`, `collapsible`, `sonner` for toasts) — but treat the generated files in `components/ui/` as a starting skeleton you edit directly, not a locked dependency. Specifically:

- Delete every default Tailwind class referencing `rounded-md`, `rounded-lg`, `shadow-sm`, `ring-offset-background`, or the default `slate`/`zinc` palette from each generated component, and replace with the token classes above.
- Never wrap a shadcn component in an extra styled `<div>` to fake customization — edit the component's own `cva()` variant definitions so the customization is structural, not a patch on top.

### 1.3 Button — the "premium, modern, interactive" spec

The button is the single most-repeated element in the product (North Star CTA appears three times on the homepage alone), so its interaction quality carries a disproportionate amount of the "premium" feeling. Customize the `buttonVariants` in `components/ui/button.tsx`:

**Visual (resting state)**
- No gradient fill. Primary button: solid `bg-ledger` fill with `text-paper`, 2px radius, a **1px inset border one shade darker than the fill** (not a drop shadow) — this reads as engraved/pressed civic signage rather than a soft floating SaaS button.
- Weight: slightly more horizontal padding than a typical shadcn default (`px-7 py-3` rather than `px-4 py-2`) — a civic CTA should feel substantial, not compact.
- Label typography: `font-body`, medium weight, and — importantly, per the homepage's anti-generic rule — no trailing arrow glyph (`→`) appended by default; only use a directional arrow where the action genuinely navigates forward to a new context (e.g., "View full public data →"), never on the primary report action.

**Interaction (this is where "premium" is actually earned)**
- On hover: not a simple opacity or brightness shift. Use a short (150–180ms) `transform: translateY(-1px)` combined with the inset border deepening slightly — the button should feel like it's lifting fractionally off the page, echoing a physical stamped button, not a flat color swap.
- On active/press: `translateY(0)` with a slightly compressed scale (`scale-[0.98]`) and near-zero transition duration (60–80ms) — the snappy return communicates tactile feedback, which is what makes a button "feel" premium far more than any color choice does.
- Focus-visible: a **2px offset outline in `--color-ledger`**, never the shadcn default blue ring — must remain fully visible for keyboard users; this is not optional per the accessibility floor in the homepage spec.
- Loading state (used constantly across auth forms): do not use a generic spinner icon swapped in for the label. Instead, the button label text itself should crossfade to a short status phrase ("Sending code…") while a thin progress underline animates left-to-right beneath the label — smaller, quieter, and more in keeping with the document/ledger aesthetic than a spinning icon.

**Variants to define explicitly** (`primary`, `secondary` — outline-only, no fill, for the "For Municipalities" and other secondary paths — and `ghost-text` for the quiet text-link-style secondary actions specified throughout the homepage spec). Do not use shadcn's `destructive` variant's default red; if a destructive action is ever needed (e.g., "Delete account"), it must use `--color-signal-open`, keeping the app's semantic color system intact even here.

### 1.4 Form fields (Input, Label, OTP input)

- `Input`: remove the default shadow and border-radius; use a bottom-border-only style (`border-b border-line`, transparent background) that shifts to `border-ledger` and slightly thicker on focus — this reads like filling out a form on paper/a ledger line, reinforcing the whole product metaphor, rather than a boxed SaaS input.
- Error state: do not just turn the border red. Use `--color-signal-open` for the border and render the error message directly beneath in the same color, in `font-body` sentence case, phrased plainly per the writing guidance ("Enter a valid email address," not "Invalid input").
- OTP input (`input-otp`): six individual cells, each styled as the same bottom-border-only treatment as `Input`, evenly spaced with generous gaps (not touching boxes) — each cell should have a distinct micro-animation when a digit lands (a brief scale-in), giving the OTP entry a satisfying, tactile rhythm since it's otherwise a tedious task.

---

## Part 2 — Auth pages

### Shared auth layout pattern (applies to all pages below)

**Responsibility**: Every auth screen must still feel like Civix — not a generic centered-white-card-on-gray-background auth template, which is the single most common "tell" of an unstyled auth flow.

**Anti-generic direction**:
- Reuse the homepage's asymmetrical split-screen posture (see Section 8 of the homepage spec) rather than a centered modal-like card. Left ~45%: the actual form, left-aligned, on `--color-paper`. Right ~55%: a persistent visual panel on `--color-ledger` that changes contextually per page (described per-page below) — this panel is what prevents auth from feeling like a disconnected, bolted-on flow.
- No logo-in-a-box above the form. The wordmark sits quietly at the top-left of the form column, same treatment as the navbar.
- Form width capped for legibility (max ~420px), left-aligned labels above inputs (not floating labels — floating labels hurt legibility for exactly the audience this product serves, including older or less tech-familiar citizens).
- Every primary submit button uses the premium `primary` button variant defined in Part 1 — never a full-width flat-color default button.

### 2.1 Register

**Questions this page must answer**: *What do I actually need to give up to use this? Can I still report anonymously if I want to?*

- Fields: name, email or phone (toggle, not two separate required fields — respects the tiered-trust model from the platform's design), password, and a single-line reassurance directly under the heading: "You can start reporting with just an email — verifying your identity later unlocks priority tracking." This directly de-escalates the friction anxiety the homepage's "Verified & Trusted" section (Section 10) was designed to manage — keep that same ordering logic here.
- Right panel: a live-updating version of the same status-card mockup used in the hero, reinforcing "this is what you're signing up to use," not a generic illustration of people or a padlock icon.

### 2.2 Login

**Questions this page must answer**: *Is this quick? What do I do if I forgot my password (without it feeling punishing)?*

- Minimal: email/phone + password, "Forgot password?" as a quiet text link (ghost-text variant) directly beside the password label — not buried at the bottom of the form.
- Right panel: rotate through one or two real "Resolved Stories" excerpts (same content source as homepage Section 9) at low visual intensity — this quietly reinforces trust at exactly the moment someone is about to commit to using the platform again.

### 2.3 OTP Verification

**Questions this page must answer**: *Did my code actually get sent? How long do I have? What if it doesn't arrive?*

- The six-cell OTP input from Part 1.4 is the sole focal point — everything else recedes (a direct Von Restorff application: this is the one moment in the whole product where literally nothing else should compete for attention).
- A visible countdown for code expiry rendered in `font-mono` (a legitimate data-label use) — small, beneath the input, not a dramatic timer.
- "Resend code" as a ghost-text link that is disabled and visibly greyed until the countdown expires, then animates into its active state — this prevents spam-tapping while making the affordance's availability change obvious without a jarring popup.
- Right panel: static and calm — this page has the highest abandonment risk of the whole flow, so the visual panel should contain a single reassuring sentence ("This confirms it's really you — reports linked to verified accounts get priority in duplicate detection") rather than any competing content.

### 2.4 Forgot Password

**Questions this page must answer**: *Is this going to work? What happens after I submit?*

- Single field (email/phone), single button. After submit, do not navigate away — transform the form in place (same "structural morph" principle used in the homepage's progressive-disclosure section) into a confirmation state: the input fades to a disabled state and a confirmation message slides in beneath it ("If an account exists for that address, we've sent a reset link"). This in-place transition avoids the jarring full-page-redirect-to-a-generic-"check your email"-page pattern.

### 2.5 Reset Password

**Questions this page must answer**: *Is my new password strong enough? Did it actually work?*

- New password + confirm password fields, with a live strength indicator styled as a **thin horizontal bar that fills and shifts from `--color-signal-open` to `--color-signal-resolved`** as strength improves — this is a meaningful, non-decorative reuse of the semantic color system (weak = needs attention, strong = resolved/good), rather than a generic red-yellow-green meter that has no connection to the rest of the product's visual language.
- On success, transition directly into a confirmation state matching the Forgot Password page's in-place-morph pattern, then redirect to Login after a brief pause — avoid a disconnected "success!" interstitial page.

---

## Part 3 — Homepage revisions

### 3.1 Fixing the section below the hero (the ticker/slider)

The horizontal marquee ticker specified for Section 2 is the right *idea* (ambient proof of live activity) but a marquee is genuinely a poor execution choice here — continuously-scrolling horizontal text is hard to read at a comfortable pace, feels more like a stock ticker/ad banner than civic infrastructure, and (worth being direct about this) is a common source of a page feeling cheap rather than premium, exactly what this brief is trying to avoid.

**Replacement: a split-flap status board**, not a slider. This is a strictly better fit for the civic/dispatch identity already established elsewhere in the spec (it directly echoes the transit-line metaphor in Section 4):

- A single, fixed-position line of text (not scrolling) that changes every 4–5 seconds by animating each character/word through a mechanical flip transition — the same visual language as an airport departure board or an old train station sign. This is calmer, more legible, and far more distinctive than a marquee, while still delivering the exact same "the system is alive right now" signal.
- Implementation: a small set of rotating real activity sentences (same content source originally planned for the ticker), each swapped via a CSS/JS flip-transition on a fixed-width monospace-adjacent line (`font-mono` is appropriate here specifically because split-flap boards are monospaced by nature) — a good candidate for a small custom React component rather than a shadcn component, since nothing in shadcn covers this pattern; keep it visually consistent by using only the token colors and fonts already defined.
- Keep the low-opacity `--color-ledger` background band from the original spec — that part was correct and should stay.

### 3.2 Where to apply shadcn + Tailwind across the homepage

Replace any previously-assumed custom/raw elements with the customized shadcn primitives from Part 1, specifically:
- **Navbar CTA and Hero CTA** → the customized `primary` Button variant (Part 1.3) — not a raw `<button>` or `<a>` styled ad hoc.
- **"Under the Hood" progressive disclosure drawers (Section 5)** → shadcn's `Collapsible`, re-skinned to remove its default chevron-in-a-circle affordance in favor of the in-place type-weight-shift interaction already specified — the accessibility and keyboard behavior comes free from shadcn; only the skin changes.
- **Toasts/confirmations** (e.g., "Report submitted," "Reset link sent") → `sonner`, re-themed to the paper/ledger palette with 2px radius, positioned bottom-left rather than top-right to avoid the generic top-right-toast pattern common to every default install.
- **Any modal moment** (e.g., a "quick report" flow triggered from the nav without a full page navigation) → shadcn `Dialog`, customized to drop its default centered-card-with-shadow treatment for a full-height right-side drawer instead, consistent with the split-screen posture used throughout the rest of the product.
- **Report tracking lookup** (see 3.3 below) → shadcn `Input` + `Button`, styled per Part 1.4/1.3.

### 3.3 Additional citizen-value additions worth building (same design theme, genuinely useful — not decoration)

A few things stood out as missing from a citizen's actual point of view, worth adding without breaking the design system:

- **"Track a report" quick-lookup**, directly in the navbar or as a compact input pinned near the hero — a citizen who already filed a report has a much more urgent need than a first-time visitor reading marketing copy, and currently the only path to tracking is implied, not offered directly. A single input ("Enter your tracking number") + the customized Button, styled quietly so it doesn't compete with the primary "Report an Issue" CTA, but is genuinely one click away.
- **Multi-language toggle (Bangla/English)**, given the platform's real-world context — a civic tool serving the general public in Bangladesh cannot assume English fluency, and this is a legitimate accessibility/inclusion feature, not a decorative locale switcher. Place it quietly in the navbar, styled as plain text (e.g., "বাং / EN"), never as a flag icon (flag icons for language are a well-known usability and inclusivity anti-pattern).
- **Low-connectivity / non-smartphone reporting channel** (SMS or WhatsApp-based reporting) mentioned explicitly on the homepage — likely as a short line in the "How Civix Works" or "Two Audiences" section: "No smartphone? Report by SMS to [short code]." This matters because a system whose only entry point is a polished web/app form structurally excludes exactly the citizens least likely to be heard through informal channels already — including this closes a real equity gap rather than adding a feature for its own sake, and it's consistent with the platform's whole premise of nobody's report disappearing into a void.
- **Basic accessibility statement/controls** (text scaling, high-contrast toggle) — worth a small, quiet control near the footer rather than the navbar, since it's a low-frequency but important affordance for elderly or visually-impaired citizens, a realistic and significant part of "citizen" as a user group for a public service.

These four are genuinely load-bearing for a *public service* product specifically (as opposed to a generic SaaS product where they'd be nice-to-haves) — they directly serve citizens who are otherwise least able to use the primary flow, which is squarely in scope for what this platform claims to solve.