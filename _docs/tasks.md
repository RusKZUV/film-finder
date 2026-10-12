# Tasks Backlog

## Phase 1 – Project foundation

### 1. Initialize Next.js project
**Goal:** Scaffold an empty Next.js TypeScript app with Tailwind and a passing test.
**Description:** Run `npx create-next-app@latest` with TypeScript, install Tailwind CSS, configure Jest (or the built‑in testing library) and add a simple test that succeeds.

### 2. Add environment variable placeholders
**Goal:** Provide a .env.example for required secrets.
**Description:** Create a `.env.example` file defining `TMDB_API_KEY` and `OPENAI_API_KEY` with placeholder values and document how to copy it to `.env.local`.

### 3. Basic layout component
**Goal:** Implement a shared layout with Header and Footer.
**Description:** Add a `components/Layout.tsx` that wraps pages, includes a site title, and ensures Tailwind styling works globally.

### 4. TMDB client stub
**Goal:** Provide a server‑side TMDB wrapper with a health‑check endpoint.
**Description:** Create `lib/tmdb.ts` exposing a function to call TMDB and an API route `/api/health` that returns `{ok:true}` when the client can be instantiated.

### 5. CI pipeline skeleton
**Goal:** Set up a GitHub Actions workflow that runs lint and tests on each push.
**Description:** Add `.github/workflows/ci.yml` that installs dependencies, runs `npm test`, and caches `node_modules`.

## Phase 2 – Basic search

### 6. Search UI with filter panel
**Goal:** Build a page with a natural‑language input and optional filter controls.
**Description:** Create `pages/index.tsx` containing a search bar, a collapsible filter panel (genre, year, rating), and a submit button.

### 7. Simple search API route
**Goal:** Return placeholder movie data for a given request.
**Description:** Implement `pages/api/search.ts` that accepts `{query, filters}` and responds with a static JSON array of movie objects.

### 8. TMDB title search integration
**Goal:** Fetch candidates from TMDB using the title query.
**Description:** Extend the search route to call the TMDB client, map results to a minimal shape (id, title, poster, year), and limit to 20 items.

### 9. Movie‑card grid display
**Goal:** Render fetched movies as cards.
**Description:** Add a `components/MovieCard.tsx` showing poster, title, and year; display a grid on the results page.

### 10. Loading & empty states
**Goal:** Provide UI feedback while awaiting results or when none are found.
**Description:** Show a spinner during fetch and a friendly message when the result array is empty.

## Phase 3 – AI query understanding & ranking

### 11. OpenAI client wrapper
**Goal:** Encapsulate calls to GPT‑4o‑mini.
**Description:** Create `lib/openai.ts` that sends prompts and returns parsed JSON, handling API key from env.

### 12. Query interpreter
**Goal:** Convert natural‑language input into a normalized search plan.
**Description:** Add a function that sends the user request to the LLM and receives a JSON plan (genres, year range, etc.).

### 13. Search route using interpreter output
**Goal:** Build TMDB queries from the LLM‑generated plan.
**Description:** Modify `/api/search` to first run the interpreter, then construct TMDB filter parameters before fetching candidates.

### 14. LLM ranking step
**Goal:** Rank candidate movies and generate explanations.
**Description:** After gathering candidates, send a compact list to the LLM, receive ordered IDs with short match explanations, and return them to the frontend.

### 15. Show AI explanations on cards
**Goal:** Display the LLM‑generated match explanation under each movie card.
**Description:** Extend `MovieCard` to accept an `explanation` prop and render it in a styled paragraph.

## Phase 4 – Watchlist & UX polish

### 16. Watchlist storage module
**Goal:** Provide a TypeScript‑typed wrapper around LocalStorage.
**Description:** Implement `lib/watchlist.ts` with `add`, `remove`, `getAll`, and persistence logic.

### 17. Add‑to‑watchlist button
**Goal:** Let users save movies locally.
**Description:** Add a button on each `MovieCard` that toggles inclusion in the watchlist via the storage module.

### 18. Watchlist page/panel
**Goal:** Show saved movies in a dedicated view.
**Description:** Create `pages/watchlist.tsx` that reads the stored IDs, fetches minimal TMDB data, and displays them in the same card grid.

### 19. Responsive & accessibility enhancements
**Goal:** Ensure the UI works well on mobile and meets basic a11y standards.
**Description:** Refine Tailwind breakpoints, add ARIA labels, ensure keyboard navigation for the search bar, filters, and cards.

### 20. Unit & integration tests for watchlist
**Goal:** Verify watchlist logic and end‑to‑end search flow.
**Description:** Write Jest tests for `watchlist.ts` and a Cypress/Playwright test that searches, adds a movie, and checks persistence.

## Phase 5 – Hardening & launch

### 21. Rate‑limiting middleware
**Goal:** Prevent abuse of the `/api/search` endpoint.
**Description:** Add a simple token‑bucket implementation (e.g., `express-rate-limit` style) that limits requests per IP per minute.

### 22. Robust error handling
**Goal:** Gracefully handle TMDB or LLM failures.
**Description:** Centralize error responses with user‑friendly messages and proper HTTP status codes.

### 23. TMDB response caching
**Goal:** Reduce latency and API cost.
**Description:** Cache successful TMDB lookups for 10 minutes using an in‑memory map or Vercel edge‑cache.

### 24. Vercel deployment configuration
**Goal:** Prepare the app for production hosting.
**Description:** Add `vercel.json` with route rewrites, define required environment variables, and test a preview deployment.

### 25. Full end‑to‑end Playwright suite
**Goal:** Validate the complete user journey.
**Description:** Write Playwright scripts that perform a natural‑language search, verify ranked results with explanations, add a movie to the watchlist, and confirm persistence after reload.

### 26. README & contribution guide
**Goal:** Document setup, scripts, and how to contribute.
**Description:** Write a `README.md` covering `npm install`, `npm run dev`, testing commands, and guidelines for new contributors.
