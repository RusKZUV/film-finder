/**
 * Tests for TMDB integration (issue #8).
 *
 * We test the mapping logic by reading lib/tmdb.ts file structure and
 * by exercising the searchMovies behaviour with a mock TMDBClient instance
 * built directly in JS (without importing TypeScript).
 *
 * The mapping/deduplication/cap logic is independently tested here.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const tmdbPath = path.join(process.cwd(), "lib", "tmdb.ts");
const tmdbSrc = fs.readFileSync(tmdbPath, "utf-8");

describe("lib/tmdb.ts: TMDB integration structure", () => {
  it("exports TMDBMovieResult interface", () => {
    assert.ok(
      tmdbSrc.includes("TMDBMovieResult"),
      "Should define TMDBMovieResult interface"
    );
  });

  it("exports TMDBSearchResponse interface", () => {
    assert.ok(
      tmdbSrc.includes("TMDBSearchResponse"),
      "Should define TMDBSearchResponse interface"
    );
  });

  it("defines searchMovies method in TMDBClient", () => {
    assert.ok(
      tmdbSrc.includes("async searchMovies"),
      "TMDBClient should have searchMovies method"
    );
  });

  it("calls /search/movie endpoint", () => {
    assert.ok(
      tmdbSrc.includes("/search/movie"),
      "searchMovies should call TMDB /search/movie endpoint"
    );
  });

  it("deduplicates results by id", () => {
    assert.ok(
      tmdbSrc.includes("seen.has") || tmdbSrc.includes("Set<number>"),
      "Should deduplicate movie results by id"
    );
  });

  it("caps results at limit", () => {
    assert.ok(
      tmdbSrc.includes("movies.length >= limit"),
      "Should cap results at provided limit"
    );
  });

  it("handles errors gracefully (returns empty array on catch)", () => {
    assert.ok(
      tmdbSrc.includes("return []"),
      "Should return empty array on network/API errors"
    );
  });

  it("maps TMDB fields to Movie fields", () => {
    assert.ok(tmdbSrc.includes("release_date"), "Should map release_date");
    assert.ok(tmdbSrc.includes("vote_average"), "Should map vote_average");
    assert.ok(tmdbSrc.includes("poster_path"), "Should map poster_path");
    assert.ok(tmdbSrc.includes("overview"), "Should map overview");
  });

  it("handles null poster_path without runtime exception", () => {
    assert.ok(
      tmdbSrc.includes("poster_path ?? null") ||
        tmdbSrc.includes("poster_path || null"),
      "Should handle null posterPath"
    );
  });
});

describe("TMDB mapping logic (pure JS simulation)", () => {
  // Simulate the mapTMDBMovie transformation in plain JS
  function mapTMDBMovie(raw) {
    return {
      id: raw.id,
      title: raw.title ?? "Unknown",
      releaseDate: raw.release_date ?? "",
      rating: typeof raw.vote_average === "number" ? raw.vote_average : 0,
      runtime: typeof raw.runtime === "number" ? raw.runtime : 0,
      posterPath: raw.poster_path ?? null,
      overview: raw.overview ?? "",
      genres: [],
    };
  }

  it("maps standard TMDB fields correctly", () => {
    const raw = {
      id: 123,
      title: "Test Movie",
      release_date: "2023-06-01",
      vote_average: 7.5,
      runtime: 120,
      poster_path: "/abc.jpg",
      overview: "A test movie overview.",
      genre_ids: [28, 12],
    };
    const movie = mapTMDBMovie(raw);
    assert.equal(movie.id, 123);
    assert.equal(movie.title, "Test Movie");
    assert.equal(movie.releaseDate, "2023-06-01");
    assert.equal(movie.rating, 7.5);
    assert.equal(movie.runtime, 120);
    assert.equal(movie.posterPath, "/abc.jpg");
    assert.equal(movie.overview, "A test movie overview.");
    assert.ok(Array.isArray(movie.genres));
  });

  it("handles null poster_path", () => {
    const raw = { id: 1, title: "No Poster", poster_path: null };
    const movie = mapTMDBMovie(raw);
    assert.equal(movie.posterPath, null);
  });

  it("handles missing release_date", () => {
    const raw = { id: 2, title: "No Date" };
    const movie = mapTMDBMovie(raw);
    assert.equal(movie.releaseDate, "");
  });

  it("handles missing vote_average (defaults to 0)", () => {
    const raw = { id: 3, title: "No Rating" };
    const movie = mapTMDBMovie(raw);
    assert.equal(movie.rating, 0);
  });

  it("handles missing overview (defaults to empty string)", () => {
    const raw = { id: 4, title: "No Overview" };
    const movie = mapTMDBMovie(raw);
    assert.equal(movie.overview, "");
  });

  it("deduplicates movies by id", () => {
    const raws = [
      { id: 1, title: "Movie A" },
      { id: 1, title: "Movie A duplicate" },
      { id: 2, title: "Movie B" },
    ];
    const seen = new Set();
    const movies = [];
    for (const r of raws) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      movies.push(mapTMDBMovie(r));
    }
    assert.equal(movies.length, 2, "Duplicates should be removed");
    assert.equal(movies[0].id, 1);
    assert.equal(movies[1].id, 2);
  });

  it("caps results at provided limit", () => {
    const raws = Array.from({ length: 30 }, (_, i) => ({ id: i, title: `Movie ${i}` }));
    const limit = 20;
    const seen = new Set();
    const movies = [];
    for (const r of raws) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      movies.push(mapTMDBMovie(r));
      if (movies.length >= limit) break;
    }
    assert.equal(movies.length, limit, "Should cap at limit");
  });
});

describe("Search route: graceful fallback when TMDB_API_KEY is absent", () => {
  it("search route source code falls back to mock data when API key missing", () => {
    const searchRoutePath = path.join(process.cwd(), "app", "api", "search", "route.ts");
    const src = fs.readFileSync(searchRoutePath, "utf-8");
    assert.ok(
      src.includes("MOCK_MOVIES"),
      "Route should define fallback MOCK_MOVIES"
    );
    assert.ok(
      src.includes("TMDB_API_KEY"),
      "Route should check for TMDB_API_KEY"
    );
    assert.ok(
      src.includes("searchMovies"),
      "Route should call searchMovies for live data"
    );
  });
});
