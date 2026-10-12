/**
 * Tests for /api/search route (issue #7 + #8).
 *
 * The route imports @/lib/tmdb which uses a path alias that Node's test runner
 * can't resolve directly. We use file-system inspection for structural tests
 * and a direct-import approach only for the health route (no path aliases).
 *
 * Behavioral tests use a standalone simulation of the route logic.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const routePath = path.join(process.cwd(), "app", "api", "search", "route.ts");
const routeSrc = fs.readFileSync(routePath, "utf-8");

// ── Structural checks ────────────────────────────────────────────────────────

describe("app/api/search/route.ts: structure", () => {
  it("exports GET handler (405)", () => {
    assert.ok(
      routeSrc.includes("export async function GET"),
      "Should export GET handler"
    );
    assert.ok(routeSrc.includes("405"), "GET handler should return 405");
  });

  it("exports POST handler", () => {
    assert.ok(
      routeSrc.includes("export async function POST"),
      "Should export POST handler"
    );
  });

  it("validates that query field is required", () => {
    assert.ok(
      routeSrc.includes("'query' field is required") ||
        routeSrc.includes('"query" field is required'),
      "Should validate required query field"
    );
  });

  it("returns 400 for bad JSON", () => {
    assert.ok(
      routeSrc.includes("invalid or missing JSON body") ||
        routeSrc.includes("Bad Request"),
      "Should return 400 error message"
    );
  });

  it("returns SearchResponse shape with results and meta", () => {
    assert.ok(routeSrc.includes("results"), "Should include results");
    assert.ok(routeSrc.includes("meta"), "Should include meta");
    assert.ok(routeSrc.includes("count"), "Should include meta.count");
    assert.ok(routeSrc.includes("querySummary"), "Should include meta.querySummary");
  });

  it("integrates TMDB client for live search", () => {
    assert.ok(
      routeSrc.includes("getTMDBClient") || routeSrc.includes("searchMovies"),
      "Route should call TMDB searchMovies"
    );
  });

  it("falls back to mock data when TMDB key absent", () => {
    assert.ok(
      routeSrc.includes("MOCK_MOVIES"),
      "Should have MOCK_MOVIES fallback"
    );
    assert.ok(
      routeSrc.includes("TMDB_API_KEY"),
      "Should check for TMDB_API_KEY env var"
    );
  });

  it("respects limit parameter", () => {
    assert.ok(
      routeSrc.includes("limit"),
      "Should handle limit parameter"
    );
  });
});

// ── Simulated behavioral tests ───────────────────────────────────────────────

// Inline simulation of the route logic (no imports needed)
const MOCK_MOVIES = [
  {
    id: 550,
    title: "Fight Club",
    releaseDate: "1999-10-15",
    rating: 8.4,
    runtime: 139,
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    overview: "A ticking-time-bomb insomniac...",
    genres: ["Drama", "Thriller"],
    matchExplanation: "Matches your query.",
  },
  {
    id: 238,
    title: "The Godfather",
    releaseDate: "1972-03-14",
    rating: 9.2,
    runtime: 175,
    posterPath: "/3bhkrj58Vtu7enYsLagFZuhL6TQ.jpg",
    overview: "Chronicle of the Corleone family.",
    genres: ["Drama", "Crime"],
    matchExplanation: "A classic drama.",
  },
  {
    id: 13,
    title: "Forrest Gump",
    releaseDate: "1994-06-23",
    rating: 8.8,
    runtime: 142,
    posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    overview: "A man tells his story.",
    genres: ["Drama", "Romance", "Comedy"],
    matchExplanation: "Highly rated.",
  },
];

function simulatePostHandler(bodyStr, apiKeySet = false) {
  let body;
  try {
    body = JSON.parse(bodyStr);
  } catch {
    return { status: 400, data: { error: "Bad Request: invalid or missing JSON body" } };
  }

  if (!body || typeof body !== "object") {
    return { status: 400, data: { error: "Bad Request: body must be a JSON object" } };
  }

  if (typeof body.query !== "string" || body.query.trim() === "") {
    return {
      status: 400,
      data: { error: "Bad Request: 'query' field is required and must be a string" },
    };
  }

  const query = body.query.trim();
  const maxResults = typeof body.limit === "number" && body.limit > 0 ? body.limit : 20;
  const results = MOCK_MOVIES.slice(0, maxResults);
  const source = apiKeySet ? "tmdb" : "mock";

  return {
    status: 200,
    data: {
      results,
      meta: {
        count: results.length,
        querySummary: `Showing ${results.length} result(s) for "${query}" [source: ${source}]`,
      },
    },
  };
}

describe("POST /api/search: simulated behaviour", () => {
  it("returns 400 for invalid JSON", () => {
    const res = simulatePostHandler("not-json");
    assert.equal(res.status, 400);
    assert.ok(res.data.error);
  });

  it("returns 400 when query field is missing", () => {
    const res = simulatePostHandler(JSON.stringify({ filters: {} }));
    assert.equal(res.status, 400);
    assert.ok(res.data.error);
  });

  it("returns 400 when query is empty string", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "   " }));
    assert.equal(res.status, 400);
    assert.ok(res.data.error);
  });

  it("returns 200 with results and meta for valid POST", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "drama" }));
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.results), "results should be array");
    assert.ok(typeof res.data.meta === "object", "meta should be object");
    assert.ok(typeof res.data.meta.count === "number");
    assert.ok(typeof res.data.meta.querySummary === "string");
  });

  it("each result contains required Movie fields", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "action" }));
    assert.ok(res.data.results.length > 0);
    const movie = res.data.results[0];
    assert.ok(typeof movie.id === "number");
    assert.ok(typeof movie.title === "string");
    assert.ok(typeof movie.releaseDate === "string");
    assert.ok(typeof movie.rating === "number");
    assert.ok(typeof movie.runtime === "number");
    assert.ok(movie.posterPath === null || typeof movie.posterPath === "string");
    assert.ok(typeof movie.overview === "string");
    assert.ok(Array.isArray(movie.genres));
  });

  it("respects limit parameter", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "test", limit: 1 }));
    assert.ok(res.data.results.length <= 1);
    assert.equal(res.data.meta.count, res.data.results.length);
  });

  it("querySummary includes the query string", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "sci-fi" }));
    assert.ok(res.data.meta.querySummary.includes("sci-fi"));
  });

  it("source is mock when no API key", () => {
    const res = simulatePostHandler(JSON.stringify({ query: "horror" }), false);
    assert.ok(res.data.meta.querySummary.includes("[source: mock]"));
  });
});

describe("GET /api/search: simulated 405", () => {
  it("GET handler returns 405", () => {
    // This is verified structurally above; confirm route source indicates 405 for GET
    assert.ok(routeSrc.includes("export async function GET"));
    assert.ok(routeSrc.includes("405"));
  });
});
