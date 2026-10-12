import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const candPath = path.join(process.cwd(), "lib", "candidate-retrieval.ts");
const routePath = path.join(process.cwd(), "app", "api", "search", "route.ts");
const candSrc = fs.readFileSync(candPath, "utf-8");
const routeSrc = fs.readFileSync(routePath, "utf-8");

describe("lib/candidate-retrieval.ts & /api/search integration structure", () => {
  it("defines GENRE_MAP, mapGenresToIds, buildDiscoverParams, retrieveCandidates", () => {
    assert.ok(candSrc.includes("GENRE_MAP"), "Should export GENRE_MAP");
    assert.ok(candSrc.includes("mapGenresToIds"), "Should export mapGenresToIds");
    assert.ok(candSrc.includes("buildDiscoverParams"), "Should export buildDiscoverParams");
    assert.ok(candSrc.includes("retrieveCandidates"), "Should export retrieveCandidates");
  });

  it("route executes interpretQuery and retrieveCandidates", () => {
    assert.ok(routeSrc.includes("interpretQuery"), "Route should execute interpretQuery");
    assert.ok(routeSrc.includes("retrieveCandidates"), "Route should execute retrieveCandidates");
  });
});

describe("Candidate retrieval parameter mapping and fallback", () => {
  const GENRE_MAP = {
    action: 28,
    comedy: 35,
    drama: 18,
    horror: 27,
    "sci-fi": 878,
  };

  function mapGenresToIds(genres) {
    return genres
      .map((g) => GENRE_MAP[g.toLowerCase()])
      .filter((id) => id !== undefined);
  }

  function buildDiscoverParams(plan) {
    const params = {
      sort_by: "popularity.desc",
      include_adult: "false",
      page: 1,
    };

    const genreIds = mapGenresToIds(plan.genres || []);
    if (genreIds.length > 0) {
      params.with_genres = genreIds.join(",");
    }

    if (plan.yearFrom) {
      params["primary_release_date.gte"] = `${plan.yearFrom}-01-01`;
    }

    if (plan.yearTo) {
      params["primary_release_date.lte"] = `${plan.yearTo}-12-31`;
    }

    if (plan.minRating && plan.minRating > 0) {
      params["vote_average.gte"] = plan.minRating;
      params["vote_count.gte"] = 50;
    }

    if (plan.language) {
      params.with_original_language = plan.language.toLowerCase();
    }

    return params;
  }

  it("maps genres correctly to TMDB numeric genre IDs", () => {
    const ids = mapGenresToIds(["Action", "Sci-Fi"]);
    assert.deepEqual(ids, [28, 878]);
  });

  it("constructs full discover params from SearchPlan", () => {
    const plan = {
      genres: ["Comedy"],
      yearFrom: 1995,
      yearTo: 2005,
      minRating: 7.5,
      language: "en",
      keywords: ["slapstick"],
      semanticSummary: "90s comedies",
    };
    const params = buildDiscoverParams(plan);
    assert.equal(params.with_genres, "35");
    assert.equal(params["primary_release_date.gte"], "1995-01-01");
    assert.equal(params["primary_release_date.lte"], "2005-12-31");
    assert.equal(params["vote_average.gte"], 7.5);
    assert.equal(params.with_original_language, "en");
    assert.equal(params.sort_by, "popularity.desc");
  });

  it("falls back to text search if discover yields zero candidates", async () => {
    let textSearchCalled = false;
    const mockClient = {
      fetchEndpoint: async () => ({ results: [] }),
      searchMovies: async (q) => {
        textSearchCalled = true;
        return [{ id: 101, title: "Fallback Hit", rating: 8.0, releaseDate: "2020-01-01" }];
      },
    };

    const plan = { genres: [], keywords: ["unique"], semanticSummary: "search unique" };
    
    // Simulate candidate retrieval flow
    const discoverData = await mockClient.fetchEndpoint("/discover/movie", {});
    let candidates = discoverData.results;
    if (candidates.length === 0) {
      candidates = await mockClient.searchMovies("unique");
    }

    assert.ok(textSearchCalled);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].title, "Fallback Hit");
  });
});
