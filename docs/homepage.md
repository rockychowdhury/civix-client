# Civix — Homepage Design Specification
### For: Frontend/Design team building the Next.js landing experience
### Role brief: Design as a Principal Product Designer — cognitive psychology, interaction design, elite visual engineering. This is civic infrastructure, not a SaaS product. It must read as authoritative, transparent, and quietly competent — the opposite of a startup marketing page.

---

## 0. Grounding: what Civix actually is, and why that dictates the design

Civix is not "an app." It is the visible surface of a municipal accountability system — citizens report real problems (a broken streetlight, a water leak, a dangerous pothole), and the platform's entire value proposition is *the loop closes and it's provably tracked*. The homepage's job is to make a visitor feel, within seconds, that **this is the first civic system that doesn't swallow their report into a void.**

This means the design vocabulary should borrow from **dispatch consoles, transit boards, land registries, and civic signage** — not from consumer SaaS. Think: the quiet authority of a well-run city hall counter, not the glossy energy of a startup selling productivity software. Every visual decision below should be checked against that identity.

**Do not build**: three rounded feature cards with icons, a hero with a centered headline over a soft gradient blob, a testimonial carousel, or a pricing-style "for citizens / for cities" card pair with checkmarks. If a section here starts resembling any of those, stop and redesign the section, not just its skin.

---

## Design Token System (define these first — every section below consumes them, nothing is hardcoded)

**Color** — a civic, paper-and-ink palette with two accent colors that carry *meaning*, not decoration:
- `--color-paper: #EFEBE2` — warm municipal off-white (like archival paper / official documents), the base canvas
- `--color-ink: #1C1B19` — near-black, warm not cold, primary text
- `--color-ledger: #2E4034` — deep municipal green (the "institution" color — used for structure, navbar, authority marks)
- `--color-signal-open: #B5502C` — a rust/clay accent reserved *only* for "unresolved / needs attention" states — never decorative
- `--color-signal-resolved: #4C6B4F` — a muted forest accent reserved *only* for "resolved / closed" states
- `--color-line: #C9C2B4` — hairline dividers, low-contrast structural rules

The rule for staff/engineering: **the two signal colors are semantic, not palette choices.** They may only appear on status indicators, live counters, or map markers — never on decorative shapes, never on a CTA button just because it needs "an accent."

**Type** — two families, clearly distinct roles:
- Display/headline: a slab or civic-signage-inspired serif with real weight variation (e.g. something in the family of *Fraunces* or *Tiempos Headline*) — evokes engraved municipal lettering, not a tech startup
- Body/UI/data: a plain, highly legible grotesk (e.g. *Inter* is explicitly banned by brief — use *Söhne*, *General Sans*, or *IBM Plex Sans* instead) for anything functional: labels, stats, form fields, nav
- Set as CSS variables: `--font-display`, `--font-body`, `--font-mono` (mono reserved for tracking numbers/IDs only — e.g. `CVX-2026-004821` — because that's a legitimate data-label use, not decoration)
- Body line-height: 1.6. Display line-height: 1.05–1.15 (tight, weighty, intentional).

**Layout**
- Base unit: an 8px grid, but content should break the grid asymmetrically — a 60/40 or 65/35 split is the default posture for any section with text + visual, never a centered 50/50 card.
- No border-radius above 2px anywhere except live status pills. Sharp, engraved, document-like edges are part of the identity.
- Whitespace, not borders, separates groups. A section ends when the vertical rhythm changes, not when a box closes.

**Motion principle**: one orchestrated reveal per section maximum, tied to *meaning* (a counter ticking up, a map pin landing, a status changing color) — never a generic fade-slide-up on scroll for every block.

---

## Navbar

**Responsibility**: Establish institutional credibility instantly and get out of the way. This is not a marketing nav with six dropdown mega-menus — it's closer to a government portal's header: quiet, four items, unmistakable.

**Questions it must answer**: *Is this a real, operating system (not a mockup)? Can I immediately track something I already reported? Can I get to my city's data?*

**Anti-generic direction**:
- No hamburger-hiding-everything on desktop. No logo-left / links-center / CTA-button-right formula with a gradient button.
- Left: wordmark set in the display serif, small, with a single live indicator next to it — a small dot + number ("14,208 issues resolved this month," updating quietly) that acts as a constant, ambient credibility signal rather than a stat dumped in the hero.
- Right: three text links max (*Track a Report*, *For Municipalities*, *Public Data*) — no icons, no dropdown chrome — and one isolated, asymmetrically-weighted CTA that looks structurally different from the links around it (e.g., it sits inside a thin engraved outline, not a filled gradient pill): **"Report an Issue."** This is the Von Restorff isolation point of the entire header — everything else recedes so this cannot be missed.
- On scroll: the navbar compresses height and the live counter's digits keep ticking — a small detail that reinforces "this is a live system," not a static page.

---

## Footer

**Responsibility**: Function as a civic registry / public record, not a sitemap dump. Reinforce transparency and trust as the very last thing a visitor sees.

**Questions it must answer**: *Who actually runs this? Is there real accountability behind it (a real entity, real data, real municipalities)? Where do I go if something's wrong?*

**Anti-generic direction**:
- Reject the 4-column link-dump-plus-social-icons-plus-newsletter-box template entirely.
- Structure it like a public ledger: a thin horizontal band listing every municipality currently live on Civix, styled like a plaque/directory, not logo chips.
- Below that, a single wide row split asymmetrically: left third is the wordmark + one sentence of plain-language mission copy ("A public record for problems that get fixed, not filed away."); right two-thirds holds functional links in plain text columns with no headers styled as buttons.
- Legal/status line at the very bottom in mono type: system status, uptime, and a link to the incident/status page — because for civic infrastructure, "is this thing actually running" is a legitimate trust signal, not boilerplate.

---

## Section 1 — Hero: The Report, Not the Pitch

**Responsibility**: This is the single absolute focal point of the entire page (Fitts's Law target). Its job is not to "explain Civix" — it's to make the North Star action (filing a report) feel like the only thing on the page.

**Questions it must answer**: *What do I do here, right now, in one action? Does this feel like a real, working system or a landing page for an idea?*

**Anti-generic direction**:
- Kill the centered-headline-over-gradient-blob pattern entirely. Instead: an asymmetrical split — left 55% is a short, weighty headline in the display serif ("Report it once. Watch it get fixed.") set left-aligned, NOT centered, with generous negative space above and below it so it's the only thing the eye can land on.
- Right 45% is not an illustration — it's a **live, functioning miniature of the actual product**: a real (or realistically simulated) complaint-tracking card showing an actual status progression (Submitted → Routed to Roads Dept. → Technician Assigned → Resolved) with a timestamp ticking in real time. This does double duty: it's the visual anchor *and* proof the system is real, which a decorative illustration could never do.
- The North Star CTA ("Report an Issue — takes 40 seconds") sits isolated beneath the headline with no competing secondary button beside it. If a secondary action ("See how it works") is needed, render it as a plain text link below the button, visually quiet — never a second button of equal visual weight (this is the single most common hierarchy failure to avoid).
- No stock photography of "diverse city" or "smiling citizen with phone." If imagery is used at all, it should be an abstracted, geometric rendering of a city grid/map, tied to the product's actual location-based logic.

---

## Section 2 — Live City Pulse

**Responsibility**: An ambient trust strip, not a hero stat block. Proves the system is active *right now* without demanding attention — a peripheral-vision signal, not a focal point.

**Questions it must answer**: *Is anyone actually using this? Is it working today, or is this a demo?*

**Anti-generic direction**:
- A thin, full-width horizontal band directly beneath the hero — not a card, not a boxed stat row. Background shifts subtly to `--color-ledger` at low opacity to mark a change in "register" without a hard border.
- Content: a slow horizontal ticker (marquee-style, but slow and dignified, not attention-grabbing) of real recent activity in plain sentence form: *"Pothole reported on 4th Avenue — assigned to Roads Dept., 6 min ago." "Streetlight outage resolved in Ward 7 — 2 hrs ago."* Real sentences, not icons-plus-numbers. This reads as a live civic record, closer to a stock ticker or flight board than a metrics dashboard.
- No auto-playing sound, no jarring motion — the ticker should feel like it's always been running, like you walked past a departures board.

---

## Section 3 — The Broken Loop (Problem framing)

**Responsibility**: Establish the actual problem before pitching the solution — earns the right to be trusted rather than assumed. This is the section that makes a skeptical visitor (especially a city official) nod because it names their exact frustration.

**Questions it must answer**: *Does this platform actually understand what's wrong with the current system, or is it just another app?*

**Anti-generic direction**:
- Editorial, magazine-style layout: a large pull-quote-style statement in the display serif spanning most of the width ("Most complaints don't fail because no one filed them. They fail because no one owns them after that.") — treated as the visual centerpiece, not paired with an icon.
- Beneath it, three short, plainly-written observations set as a **vertical annotated list** (not cards) — each a sentence with a thin left-side rule in `--color-signal-open`, like margin notes in a report, not icon-topped feature blocks: *"Reports get sent to the wrong department." "No one tracks how long anything actually takes." "Citizens have no way to know if their report was even seen."*
- This section should feel restrained and slightly somber — deliberately lower-energy than the hero, using the emotional contrast to make the next section's "here's the fix" feel earned.

---

## Section 4 — How Civix Works (legitimate sequence — numbered markers earned here)

**Responsibility**: The only section where numbered steps are appropriate, because the content genuinely is a sequence. Reduce perceived complexity via progressive disclosure — show the shape of the process, not the underlying machinery yet.

**Questions it must answer**: *What actually happens after I click "Report an Issue"? How long does this take? Do I have to keep checking manually?*

**Anti-generic direction**:
- Not a 3-column grid with icons. Instead: a horizontal, scroll-snapped timeline/rail (a single interactive strip the user can drag or scroll horizontally) with three to four stops: **Report → Route → Resolve → Confirm.** Each stop is a distinct visual state (like stations on a transit line), connected by a single continuous line that visually "fills in" as you scroll past each stop — reinforcing progress as a literal, physical metaphor rather than abstract steps.
- Each stop shows one short sentence of what happens and, critically, **who is responsible at that stage** ("Routed automatically to the correct department based on category and location") — this directly answers the accountability question the whole product is built around, rather than just describing UI.
- No stopwatch icons, no checkmarks-in-circles. The transit-line metaphor carries the "progress" meaning entirely on its own.

---

## Section 5 — Under the Hood (progressive disclosure of the intelligence layer)

**Responsibility**: This is where Miller's Law governs directly. Civix's real sophistication (duplicate detection, SLA engine, auto-routing) is genuinely interesting but would overwhelm a first-time visitor if dumped flat — so it must be collapsed by default and revealed on demand.

**Questions it must answer**: *Is there real engineering behind this, or is it just a form that emails someone?* (This section exists specifically to earn credibility with technically-minded visitors — municipal IT evaluators, procurement officers — without punishing casual visitors who skip it.)

**Anti-generic direction**:
- Reject the accordion-with-plus-icons pattern. Instead: three short, single-line statements stacked with generous vertical space, each behaving like a closed drawer that expands **in place, pushing content down smoothly** rather than opening a modal or an icon-triggered accordion — e.g. *"Duplicate reports are automatically merged."* On click/tap, the line itself transforms — its type grows slightly heavier, and a short explanatory paragraph plus a small inline diagram (not a photo) unfolds directly beneath it.
- Only one drawer should be able to be open at a time (a real Miller's Law constraint — don't let all three stack open into visual noise).
- The transition should feel like something *sliding into view*, not fading — a small structural morph is one of the "adaptive canvas" moments worth spending on, precisely because it's rare in the page.

---

## Section 6 — The Transparency Dashboard (public data preview)

**Responsibility**: Prove the platform's central promise — public accountability — with real (or realistic) aggregate data, not marketing claims.

**Questions it must answer**: *Can I actually see what's happening in my city right now, without logging in? Is this data real?*

**Anti-generic direction**:
- Not a row of KPI cards. A single large embedded map (abstracted, low-saturation, styled to match the paper/ink palette, not a default Google Maps blue) showing live density of open issues by ward as a heat gradient using *only* the two signal colors (rust for open density, green for resolved density) — this reuses the semantic color system directly, reinforcing that these colors always mean the same thing throughout the product.
- Beside the map (asymmetrical split, map larger than the text column), a short, quiet stat presented as a single dominant number in the display serif — not a dashboard grid of five equal-weight numbers. Pick the one number that matters most: **"Median time to resolution: 3.2 days."** Everything else (total reports, by category) is available behind a single "View full public data" link, not crammed into the section.

---

## Section 7 — The Accountability Promise (SLA / trust commitment)

**Responsibility**: State, in plain language, the actual guarantee the system enforces — this is what separates Civix from "just a form." It should read like a public commitment, not a feature bullet.

**Questions it must answer**: *What actually happens if my report just sits there? Is there a real consequence for a department that ignores something?*

**Anti-generic direction**:
- A single, isolated, large-format statement — most of the viewport devoted to one sentence, center of gravity shifted intentionally off-center (not centered on the page) to avoid looking like a generic "big quote" slide: *"Every report has a deadline. If a department misses it, the issue escalates automatically — no one has to ask twice."*
- Below it, in small type, a plain factual explanation of how escalation actually works (one or two sentences, not a bulleted feature list) — the confidence here comes from specificity, not decoration.
- No shield icons, no checkmark badges. The authority comes entirely from the clarity and directness of the sentence itself.

---

## Section 8 — Two Audiences, One System (Citizens / Municipal Staff)

**Responsibility**: Civix serves two very different visitors with different goals on the same page — this section must split them without resorting to a "pricing tier" card comparison, which would misrepresent the product (this isn't a plan choice).

**Questions it must answer**: *Is this for me as a resident, or as a city employee evaluating a system? Where do I go next?*

**Anti-generic direction**:
- A true vertical split-screen (not two cards side by side with matching padding) — left half in `--color-paper`, right half inverted to `--color-ledger` with light text, a hard vertical seam down the middle. This visual inversion itself communicates "two different worlds," which a shared card style would not.
- Left (citizen side): a short, warm, plain-language statement and the same North Star CTA repeated ("Report an Issue"), because most homepage visitors are citizens and shouldn't have to hunt for the primary action twice.
- Right (staff/procurement side): a colder, more technical tone — "Built for departments that need real routing, SLA enforcement, and audit trails" — with a CTA to a separate, dedicated municipal/enterprise page rather than trying to sell government procurement on this same page.

---

## Section 9 — Resolved Stories (proof, without testimonial cards)

**Responsibility**: Provide social proof grounded in real outcomes, not quote-bubble testimonials with headshots, which read as generic and are easy to distrust.

**Questions it must answer**: *Does this actually work in practice? What does a real resolved issue look like start to finish?*

**Anti-generic direction**:
- One single, fully-told case study per screen (not a carousel of many shallow quotes): an actual before/after narrative of one real complaint, told as a short editorial strip — the original citizen report text, the tracking number, the timeline, and a resolution photo, laid out like a case file rather than a marketing quote card.
- Navigation between two or three such stories is a subtle horizontal swipe/arrow, not dots or a carousel indicator strip — keep it understated, since this section supports the page rather than driving it.

---

## Section 10 — Verified & Trusted (identity/trust tiers)

**Responsibility**: Explain, briefly, why verification matters for report credibility — without turning it into a scary KYC wall that would suppress the primary action.

**Questions it must answer**: *Do I need to hand over an ID to use this? What's the actual benefit if I do?*

**Anti-generic direction**:
- Understated, text-forward, two-tier explanation (basic vs. verified) presented as a short comparison written in plain sentences, not a checkmark-grid pricing table.
- Tone should reassure, not gatekeep: lead with "You can report anonymously with just an email" before mentioning ID verification at all — order of information here is itself a design/psychology decision (reduce friction anxiety before introducing the optional deeper commitment).

---

## Section 11 — Where Civix Runs (coverage / expansion)

**Responsibility**: Show real geographic legitimacy — this is civic infrastructure, and "which cities actually use this" is a credibility question, especially for a municipal buyer.

**Questions it must answer**: *Is this live anywhere real? Is my city one of them, or could it be?*

**Anti-generic direction**:
- Not a logo wall. A simple, styled list/map of live municipalities set like an official registry or directory (echoing the footer's ledger treatment, creating a consistent motif), each with a one-line stat (e.g., "Dhaka North City Corporation — live since March 2026, 8,400 issues resolved").
- Include a plain, low-pressure CTA for cities not yet listed: "Bring Civix to your city" — as a text link, not a bright button, since this is a secondary, longer-cycle action.

---

## Section 12 — Final CTA: Close the Loop

**Responsibility**: Return to the single North Star action one last time, now that trust has been built through the page — this is the second and final isolated focal point of the entire page, deliberately echoing the hero rather than introducing a new one.

**Questions it must answer**: *Now that I understand this, what do I do?*

**Anti-generic direction**:
- Full-width, generous whitespace, a short single sentence in the display serif ("Your city should answer when you report something.") followed immediately by the same CTA button styling used in the hero and navbar — deliberate visual repetition, not a "new" differently-styled CTA, because consistency of the North Star element across the page is itself what makes it trustworthy and easy to act on.
- No secondary content below this — footer follows immediately. The page should end on the action, not trail off into more information.

---

## Cross-cutting rules for implementation

1. **Every color reference in code must be a CSS custom property** (`var(--color-signal-open)`, etc.) — never a hardcoded hex in a component. The two signal colors must never be used for anything except live status meaning, anywhere in the app, not just the homepage.
2. **No section should use identical spacing, corner radius, or shadow treatment as the section before it** — visual rhythm across the page comes from deliberate variation in structure (split ratios, background shifts, alignment), not from a repeating card component reused with different text.
3. **Motion budget**: one meaningful animated moment per section, max. If you can't articulate what real-world change the animation represents (a status changing, progress advancing, content expanding), cut it.
4. **Accessibility floor is non-negotiable regardless of how experimental the layout gets**: visible keyboard focus states, reduced-motion fallback for every animated moment listed above, and color contrast that holds even with the muted, low-saturation signal palette — test `--color-signal-open` and `--color-signal-resolved` against `--color-paper` directly.