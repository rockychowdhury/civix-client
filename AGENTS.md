<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Architecture & Tech Stack Rules

Please adhere to the following stack and architecture choices when working on this project:

### 1. Technology Stack
- **Framework**: Next.js (App Router)
- **UI/View**: Tailwind CSS + shadcn/ui
- **Data Fetching**: `ofetch` + `@tanstack/react-query`
- **Forms**: `@tanstack/react-form`
- **Validation**: `zod`
- **Linting & Formatting**: Biome

### 2. Rendering & Architecture
- **Rendering Strategy**: SSG (Static Site Generation). The project should be super fast and easy to deploy.
- **Pattern**: Follow the **"Static Shell, Dynamic Island"** architecture to handle dynamic data in SSG. This means pages are statically pre-rendered (Client Components mapping without dynamic server props), and dynamic user data (e.g., authentication state) is fetched securely on the client via `ofetch` + `tanstack-query`.
- **Cookies & Sessions**: DO NOT use client-side cookie management. Attach credentials or cookies with HTTP requests via `ofetch` configurations (e.g. `src/api/auth.api.ts` and `src/proxy.ts`).

### 3. File Structure
- **Layered Architecture**: Strictly follow a `src/`-based layered architecture.
- Do NOT create duplicate files/folders (e.g., `components`, `lib`, `services`, `hooks`) at the root directory. Everything must be securely placed inside `src/`.
- Do NOT modify the core `src/` pattern. Merge any new implementations seamlessly into this established pattern.
- Keep the codebase clean and simple. Remove unnecessary files or obsolete patterns continuously.

### 4. Components & Styling
- **Reusability**: Ensure all components are modular and reusable.
- **Styling Guidelines**: Use the global CSS theme. Do NOT use hardcoded colors.
- Maintain existing UI designs exactly as they are when restructuring or refactoring parts of the codebase.
- **Interactivity**: All actionable items (buttons, icons, toggles, links) MUST change the cursor on hover (e.g., using `cursor-pointer` utility) to clearly indicate interactivity.
