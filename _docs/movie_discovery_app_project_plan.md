# AI-Powered Movie Discovery Web App — Project Plan

## 1. Overview

Build a web application that helps people discover movies using natural-language requests such as “a clever sci-fi movie with a surprising ending, not too long” alongside structured filters. The app retrieves candidate movies from TMDB, uses a hosted large language model (LLM) to interpret the request and rank candidates, and presents movie cards with concise explanations.

## 2. MVP Scope

### Included
- Natural-language movie search.
- Structured filters for genre, release-year range, rating, language, runtime, and movie type.
- Candidate retrieval through TMDB search/discovery endpoints.
- LLM-based relevance ranking of retrieved candidates.
- Up to 20 results per search.
- Movie cards with basic details and a short, query-specific AI explanation.
- Personal watchlist stored locally in the browser.
- Responsive web interface.
- No user accounts or server-side user profiles.

### Excluded from the MVP
- User accounts, social features, and shared lists.
- Streaming playback or ticket purchasing.
- Personalized recommendations based on a long-term server-side history.
- Reviews written by users.
- Guaranteed availability on a specific streaming service.

## 3. Target User and Main Use Case

The target user knows the kind of movie they want but may not know a title. They describe a mood, theme, plot element, or combination of preferences and receive a ranked shortlist.

Example query: “Recommend a tense science-fiction mystery from after 2010, rated well, under two hours, with a twist.”

The app should infer reasonable defaults for vague requests and run a search immediately rather than forcing the user through a long clarification flow.

## 4. User Journey

1. The user opens the home page.
2. They enter a natural-language request and optionally adjust filters.
3. The frontend sends the query and filters to the server search endpoint.
4. The server interprets the request, retrieves candidates from TMDB, and ranks them with the LLM.
5. The interface displays up to 20 ranked movie cards and short explanations.
6. The user can open movie details or add a movie to their watchlist.
7. The watchlist persists in that browser using local storage.

## 5. Technology Choices

- **Frontend and web framework:** Next.js with React and TypeScript.
- **Styling:** Tailwind CSS or an equivalent consistent styling system.
- **Movie metadata:** TMDB API.
- **Query understanding and ranking:** Hosted LLM API.
- **Watchlist persistence:** Browser local storage.
- **Server-side integration:** Next.js route handlers/API routes.
- **Hosting:** Any suitable platform that supports Next.js server routes and environment variables.

Keep API keys on the server. Do not expose the TMDB or LLM secret keys in browser code.

## 6. Search and Ranking Design

Use a two-stage approach rather than asking the LLM to invent movie titles.

### Stage A: Interpret the query

Convert the user’s text and filters into a normalized search plan. The plan can include:
- Genres or likely genres.
- Release-year minimum and maximum.
- Minimum rating, if requested.
- Language.
- Runtime bounds.
- Movie type, such as feature film.
- Themes, tone, plot elements, and other semantic preferences.
- Any explicit exclusions.

The LLM should distinguish hard constraints from soft preferences. Explicit user constraints should take priority over inferred preferences.

### Stage B: Retrieve candidates from TMDB

Use the appropriate TMDB search and discovery endpoints to obtain a candidate pool. Apply supported structured filters at retrieval time where possible. Use multiple retrieval strategies when necessary—for example, a keyword/title search plus a discovery query—to avoid missing relevant movies.

Normalize results into a consistent internal movie representation and deduplicate by TMDB movie ID.

### Stage C: Rank candidates with the LLM

Give the LLM the user request, normalized filters, and a compact list of retrieved candidate metadata. Ask it to rank only the supplied candidates and return structured output.

Ranking should balance:
- Match to the user’s themes and plot preferences.
- Match to tone or mood.
- Compliance with explicit filters.
- General quality signals such as TMDB rating, without allowing popularity to overwhelm query relevance.

Do not let the model fabricate titles, IDs, ratings, release dates, or other movie facts. Validate its returned IDs against the candidate pool, and use TMDB as the source of truth for displayed metadata.

### Stage D: Return results

Return no more than 20 movies. Each result should include TMDB metadata and a concise explanation tied to the request. If few candidates meet hard constraints, return fewer results rather than quietly ignoring those constraints.

## 7. Filters

Support these MVP filters:

- **Genre:** one or more genres.
- **Release year:** minimum and maximum year.
- **Rating:** minimum TMDB rating.
- **Language:** original language.
- **Runtime:** minimum and maximum minutes.
- **Movie type:** feature film for the initial version; expand later if needed.

Filters should work alongside natural-language search. The UI should make active filters visible and easy to clear. If a filter conflicts with the text query, prioritize explicit constraints and make the active settings clear to the user.

## 8. Movie Cards and Explanations

Each movie card should show, where available:
- Poster.
- Title and release year.
- TMDB rating.
- Runtime.
- Genre labels.
- Short overview.
- A concise AI explanation of why it matches the user’s request.
- An action to add or remove the movie from the watchlist.

Explanations should be specific and brief, for example: “Matches your request for a tense sci-fi mystery, with an emphasis on investigation and an uncertain outcome.” Avoid claiming plot details that are not supported by the metadata or reliable candidate information.

## 9. Watchlist

The MVP has no accounts. Save the watchlist in browser local storage.

Recommended behavior:
- Store TMDB IDs and only the minimal display data needed for quick rendering.
- Keep the stored format versioned so it can be migrated later.
- Handle invalid or outdated local data safely.
- Provide an empty state when the watchlist has no movies.
- Explain that the list is local to the current browser and is not automatically synchronized across devices.

## 10. Suggested Application Architecture

### Frontend
- Home/search page with natural-language input.
- Filter controls.
- Loading, empty, error, and results states.
- Reusable movie-card component.
- Watchlist page or panel.
- Responsive layout for desktop and mobile.

### Server routes
- `POST /api/search`: interprets a query, retrieves candidates, ranks them, and returns results.
- Optional later route: `GET /api/movie/[id]` for a richer movie-details view if needed.

### Internal modules
- TMDB client for authenticated API requests.
- Query parser/normalizer.
- Candidate retrieval and deduplication.
- LLM ranking client and prompt/schema definitions.
- Response validation and error handling.

### Example project structure

```text
app/
  page.tsx
  watchlist/page.tsx
  api/search/route.ts
components/
  SearchBar.tsx
  FilterPanel.tsx
  MovieCard.tsx
  MovieGrid.tsx
  WatchlistButton.tsx
lib/
  tmdb.ts
  query-parser.ts
  candidate-retrieval.ts
  ranking.ts
  schemas.ts
  watchlist.ts
  validation.ts
types/
  movie.ts
```

This is a suggested structure, not a requirement. Keep modules small and separate API integration, ranking, validation, and UI concerns.

## 11. API Contract

### Request: `POST /api/search`

```json
{
  "query": "A clever sci-fi mystery with a surprising ending, under two hours",
  "filters": {
    "genres": ["Science Fiction", "Mystery"],
    "yearFrom": 2010,
    "yearTo": 2026,
    "minRating": 7,
    "language": "en",
    "runtimeMin": 0,
    "runtimeMax": 120,
    "movieType": "feature"
  },
  "limit": 20
}
```

### Response shape

```json
{
  "results": [
    {
      "id": 123,
      "title": "Example Movie",
      "releaseDate": "2020-01-01",
      "rating": 7.8,
      "runtime": 110,
      "posterPath": "/example.jpg",
      "overview": "A short official movie overview.",
      "genres": ["Science Fiction", "Mystery"],
      "matchExplanation": "A concise explanation based on the user's request."
    }
  ],
  "meta": {
    "count": 1,
    "querySummary": "A science-fiction mystery with a twist, under two hours"
  }
}
```

The example is illustrative only; real results must come from TMDB and be validated. Decide whether to return a partial result set or an error when one upstream service fails, and keep that behavior consistent.

## 12. Performance and Cost Controls

- Retrieve a bounded candidate pool rather than sending an entire catalog to the LLM.
- Use compact candidate metadata in ranking prompts.
- Set explicit timeouts and token limits.
- Cache suitable TMDB responses where allowed by TMDB’s terms and policies.
- Cache query/ranking responses only when safe and useful; avoid caching user-specific data unnecessarily.
- Use a smaller/faster model for straightforward query parsing if evaluation shows it is sufficient.
- Monitor latency, errors, token usage, and cost per search.
- Limit request size and add rate limiting to prevent abuse.

## 13. Reliability, Security, and Data Quality

- Keep all secret API keys in server-side environment variables.
- Validate request bodies and enforce a maximum query length.
- Validate LLM output against a strict schema.
- Discard ranked IDs that were not in the retrieved candidate pool.
- Treat movie descriptions and other retrieved text as data, not as instructions to the LLM.
- Handle missing posters, unknown runtime, missing release dates, and unavailable ratings gracefully.
- Provide clear messages for TMDB errors, LLM timeouts, empty results, and network failures.
- Respect TMDB attribution, branding, and API usage requirements.
- Review the current TMDB terms and the selected LLM provider’s privacy and retention terms before launch.

## 14. UX Requirements

- A prominent natural-language search field.
- Filters that are optional and do not block a basic search.
- A visible loading state while results are being prepared.
- Results ordered by relevance, not simply by popularity.
- A clear way to edit the query and rerun the search.
- A clear empty state with suggestions to broaden the request.
- Error messages that tell users what they can do next.
- Accessible labels, keyboard navigation, and adequate contrast.
- Mobile-friendly cards and filter controls.

## 15. Testing Plan

### Unit tests
- Query/filter normalization.
- TMDB response normalization.
- Candidate deduplication.
- LLM output schema validation.
- Rejection of unknown movie IDs.
- Local watchlist add/remove and malformed-storage handling.

### Integration tests
- Search route with mocked TMDB and LLM responses.
- TMDB failure and timeout behavior.
- LLM failure and invalid output behavior.
- Searches with and without filters.

### Product-quality tests
Create a small evaluation set of representative queries, including:
- Clear genre requests.
- Mood and theme requests.
- Queries with hard constraints such as runtime or release year.
- Vague queries.
- Conflicting preferences.
- Requests that should return few or no matches.

Review whether the top results satisfy explicit constraints and whether the explanations are accurate. Adjust retrieval and ranking based on measured failures rather than prompt changes alone.

## 16. MVP Acceptance Criteria

The MVP is ready when:
1. A user can submit a natural-language query and receive real TMDB movies.
2. The app supports all listed filters.
3. The ranking is based on retrieved candidates and does not invent movie records.
4. Each result includes a short, relevant explanation.
5. The number of results never exceeds 20.
6. Users can add and remove movies from a browser-local watchlist.
7. The app handles empty results and upstream failures gracefully.
8. Secret keys are not exposed to the browser.
9. The interface works on desktop and mobile.
10. Core parsing, validation, ranking-route behavior, and watchlist behavior have automated tests.

## 17. Implementation Roadmap

### Phase 1 — Project foundation
- Create the Next.js TypeScript project.
- Add styling and shared layout.
- Configure environment variables.
- Implement and test a server-side TMDB client.

### Phase 2 — Basic search
- Build the search form and filter panel.
- Implement TMDB candidate retrieval.
- Normalize and display results without LLM ranking initially.

### Phase 3 — AI query understanding and ranking
- Define a strict query interpretation schema.
- Implement candidate ranking using the hosted LLM.
- Validate output and generate concise explanations.
- Add evaluation queries and inspect ranking quality.

### Phase 4 — Watchlist and UX polish
- Implement local storage persistence.
- Add loading, empty, error, and missing-data states.
- Improve responsive layout and accessibility.

### Phase 5 — Hardening and launch
- Add rate limiting, timeouts, and appropriate caching.
- Run unit and integration tests.
- Review API terms and attribution.
- Deploy and monitor latency, errors, and cost.

## 18. Potential Future Improvements

- Optional accounts and cloud-synchronized watchlists.
- More advanced personalization based on explicit feedback.
- “More like this” recommendations.
- A movie-details page with richer metadata.
- Streaming availability, if a reliable licensed data source is selected.
- Evaluation dashboards for relevance and latency.
- User controls for explanation length and ranking priorities.

## 19. Key Decisions to Preserve

- Build a **web application**.
- Use **TMDB** as the movie metadata source.
- Use a **hosted LLM API** for query understanding and ranking, balancing quality, speed, and cost.
- Use **TMDB retrieval followed by LLM ranking** rather than relying on model memory to name movies.
- Return **up to 20 movies** per search.
- Infer reasonable interpretations for vague requests and search immediately.
- Include **genre, year range, rating, language, runtime, and movie type** filters.
- Keep the watchlist **local to the browser**, with no accounts in the MVP.
- Aim for a **balanced relevance ranking** that honors explicit constraints without letting popularity dominate.

## 20. Final Product Definition

An AI-powered movie discovery web app where users describe the movie they want in natural language, optionally refine the request with structured filters, and receive up to 20 TMDB-backed results ranked by relevance with concise AI explanations. Users can save titles to a browser-local watchlist without creating an account.
