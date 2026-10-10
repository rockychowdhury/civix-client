# Civix — Report Flow: Description-First Category Matching
### Supersedes the category/description steps in `civix-report-page-spec.md`. Everything else in that doc (location, photos, review, confirmation, submission sequencing) is unchanged. Same tokens, shadcn customization, and layered architecture as the other specs.

---

## 1. What changes in the flow

The order flips: **Step 1 = Describe the issue, Step 2 = Choose a category** (from matches only). The category tile browser, Step 1 auto-advance, and the category-keyed dynamic placeholder from the earlier spec are retired. Step 1's placeholder becomes a generic, rotating example ("e.g. Water has been leaking from a pipe near my house since morning").

Why this order is better: the citizen's own words come before any category bias, and the matcher turns the description into a short, relevant list, which directly reduces the "wrong category" problem designed around earlier.

The matching is **client-side only** (`GET api/v1/categories` once, no per-keystroke backend calls). Keep the server-side category-confidence check on the backend regardless; the client can be bypassed by any API consumer.

---

## 2. Refinements to the original idea

| Original idea | Problem | Refinement |
|---|---|---|
| Push matches into an array after each space, keep the union | Never shrinks: editing, deleting or pasting leaves stale categories behind | **Derive, don't accumulate.** Recompute matches from the full text with a memoized function. The result is still the union of every word's matches, but always correct after edits |
| Match each word against categories | Filler words ("the", "is", "near") match everything or nothing; "leaking" won't match "Leakage" | Tokenize, drop stopwords and very short tokens, **stem** both sides, and weight rare words above common ones |
| Flat unordered list | Long, unhelpful | **Rank by score** so the best match is first |
| Only exact word matches | Typos ("streetlite") and local phrasing find nothing | Prefix match on the word being typed, light fuzzy match, and a **synonym map** indexed per category |
| Zero matches blocks the user permanently | A real issue with unusual wording or a typo dead-ends the citizen, which contradicts the platform's premise | Block only while the text is **too short**. With enough text and zero matches, show a calm "no match" state with **"Browse all categories"**, which unlocks Next. `categoryId` stays required |

---

## 3. Data source and SSG

- Categories change rarely. Fetch with TanStack Query: `staleTime` ~30 min, long `gcTime`.
- If `api/v1/categories` is public: fetch in the page's Server Component with `revalidate` (ISR, e.g. hourly) and pass it as `initialData`, so the list is present on first paint while the page stays static. If it needs auth: start the client fetch on mount. Description-first hides the latency, since the citizen is typing while it loads.
- Do not bake categories in at build time without revalidation; they would go stale until the next deploy.
- If categories haven't loaded, Step 1 shows a quiet "preparing categories" state and Next stays disabled. On failure, show a retry action.

---

## 4. Architecture

```
lib/category-matcher/            — pure TypeScript, no React, fully unit-tested
  analyze.ts                      — normalize → tokenize → stopwords → stem
  stopwords.ts                    — ~60 English words + generic filler (problem, issue, please, since, near, area)
  stem.ts                         — small suffix stripper (leaking/leaks/leakage → leak) or the `stemmer` package
  synonyms.ts                     — { [categorySlug]: string[] } (pothole, crater → road damage, etc.)
  build-index.ts                  — categories → Index
  fuzzy.ts                        — bounded Levenshtein
  match.ts                        — (text, index, opts) → RankedMatch[]
  config.ts                       — all thresholds in one place (Section 6)
api/categories.ts                 — getCategories()
hooks/useCategories.ts            — TanStack Query
hooks/useCategoryIndex.ts         — useMemo(buildIndex, [categories])
hooks/useCategoryMatches.ts       — debounced text → { status, matches }
components/forms/report/
  DescriptionStep.tsx             — textarea + status line
  CategorySelectStep.tsx          — shadcn Command list + debounced search
```

Keep `lib/category-matcher` free of React and browser APIs so it can move into a Web Worker later if the category count ever grows past roughly 2,000. Below that, the main thread is fine.

---

## 5. Algorithm

**Selectable categories**: `isActive` and leaf nodes only (parents are groupings). Each leaf is indexed from: its name (weight 1.0), its synonyms by `slug` (0.9), its parent's name (0.5), and its description if present (0.5; it is currently `null`, so don't depend on it).

**Index build (once per category load)**
```
for each selectable leaf, for each field, for each token in analyze(field.text):
    postings[stem].set(categoryId, max(existing, field.weight))   // max, not sum: long text can't dominate
idf[stem] = ln(1 + N / df(stem)), normalized to 0.25–1             // rare words count more
vocabulary = keys(postings)
```

**Match (derived on every debounced change)**
```
tokens   = analyze(text)
complete = tokens, except the last one while the text doesn't end in whitespace
partial  = that trailing token (if length >= 3)

for each unique token t in complete:        // cached per token in a Map
    hits = postings[t]                                    → factor 1.0
    else fuzzy(t, vocabulary)                             → factor 0.5
for partial: prefix scan of vocabulary                    → factor 0.6

score(category) = Σ over tokens of  bestFieldWeight × factor × idf
keep score >= MIN_SCORE; sort by score desc, then sortOrder, then name
also return, per category, the matched words (for the "matched on" hint)
```

- **Fuzzy**: only if no exact posting; candidates share the first letter and have a length difference ≤ max edits; max edits is 0 for ≤3 chars, 1 for 4–7, 2 for ≥8. Results are cached per token.
- **Space-triggered feel without staleness**: finished words are matched exactly/fuzzily; the word being typed is prefix-only; on blur or Next, everything is treated as finished.
- **Bangla and mixed text**: tokenize with Unicode property classes (`\p{L}\p{N}`), never `\w`; skip stemming for non-Latin scripts and allow 2-character tokens there. The synonym file is where Bangla and transliterated terms get added, by someone who knows local phrasing.
- **Complexity**: with the per-token cache, a keystroke costs lookups proportional to the number of tokens. A pasted paragraph is handled in a single pass.

---

## 6. Config (single file, tunable without touching the algorithm)

`MIN_CHARS = 15`, `MIN_MEANINGFUL_TOKENS = 2`, `MIN_SCORE = 0.5`, `DEBOUNCE_MS = 250`, `SEARCH_DEBOUNCE_MS = 200`, `NO_MATCH_MESSAGE_DELAY_MS = 800`, fuzzy edit thresholds, and the factors above.

---

## 7. Rendering performance rules

- The form stores only `request.description` and `request.categoryId`. **Matches are derived data**: never put them in form state or a growing `useState` array.
- Only the small status/matches component subscribes to the text (`useWatch` on the one field), so the rest of the wizard does not re-render per keystroke. Debounce, then `useMemo`.
- Build the index once (`useMemo` on the categories array). Never rebuild it on typing.
- Step 2 recomputes matches with "all words finished" from the saved description, rather than storing them. Draft autosave also stores only the two fields.
- Reserve space for the status line so nothing shifts while typing.

---

## 8. UX states

**Step 1: Description.** One status line under the textarea, in the existing tone:
- *Insufficient information* (below `MIN_CHARS` or `MIN_MEANINGFUL_TOKENS`): "Add a few more details so we can find the right category." Next disabled. Don't show it mid-word; show it after a pause or on blur.
- *Matching*: no message (no spinner for a sub-frame computation).
- *Matched* (n > 0): "We found n possible categories" in quiet type. Next enabled.
- *No match* (enough text, zero results): "We couldn't match this yet. Try naming the problem, like 'broken streetlight'." with a **Browse all categories** text action. Next stays disabled until they either keep typing or choose to browse.

**Step 2: Category.** shadcn `Command` list, customized per the design system:
- Ranked matches first, each row showing the name, the parent as muted context, and the matched word in `font-mono` ("matched: leak"). Selecting writes `request.categoryId`.
- A debounced search bar above the list filters it (set `shouldFilter={false}` and filter with the same `analyze` so synonyms and typos work in search too). If a search finds nothing in the matches, offer "Search all categories".
- "Search all categories" (or arriving via Browse all) swaps in the full list grouped by parent, still searchable.
- If the citizen goes back and edits the description so their chosen category stops matching, keep the selection pinned at the top as "Selected". Never clear it silently.

---

## 9. Acceptance tests (unit tests on `lib/category-matcher`)

| Input | Expected |
|---|---|
| "water is leaking from a pipe near my house" | Water Leakage ranked first |
| "pothole on main road" | Road damage category ranked first |
| "streetlite not working" | Streetlight found via fuzzy |
| "the problem is there please help" | Insufficient information (only filler words) |
| "xqzv lorem ipsum dolor sit amet" | No match, browse-all offered |
| Type "water leak", delete "leak" | Matches update immediately; no stale categories |
| Paste a 300-word paragraph | Single pass, no visible input lag |
| Inactive or parent-only categories | Never appear as selectable |

Add a benchmark test as a regression guard: a 500-word input against a few hundred categories should complete well within a single frame budget (~16 ms). Verify on the team's own hardware and adjust the target if needed.

---

## 10. Later, without blocking this work

Move `synonyms` into a `keywords` field on `ServiceCategory` so the municipality can edit them. The client index then reads from the API instead of the static file, and the matcher itself doesn't change.