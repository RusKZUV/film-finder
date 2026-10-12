import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../app/api/search/route.ts";

function makeRequest(body) {
  return {
    json: async () => {
      if (body === "__invalid__") throw new SyntaxError("bad JSON");
      return body;
    },
  };
}

describe("GET /api/search → 405", () => {
  it("returns 405 for GET requests", async () => {
    const res = await GET();
    assert.equal(res.status, 405);
    const data = await res.json();
    assert.ok(data.error, "should have error field");
  });
});

describe("POST /api/search", () => {
  it("returns 400 when body JSON is invalid", async () => {
    const req = makeRequest("__invalid__");
    const res = await POST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error, "should have error field");
  });

  it("returns 400 when query field is missing", async () => {
    const req = makeRequest({ filters: {} });
    const res = await POST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error, "should have error field");
  });

  it("returns 400 when query is empty string", async () => {
    const req = makeRequest({ query: "  " });
    const res = await POST(req);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error, "should have error field");
  });

  it("returns 200 with results array and meta for valid POST", async () => {
    const req = makeRequest({ query: "drama" });
    const res = await POST(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.results), "results should be an array");
    assert.ok(typeof data.meta === "object", "meta should be an object");
    assert.ok(typeof data.meta.count === "number", "meta.count should be a number");
    assert.ok(typeof data.meta.querySummary === "string", "meta.querySummary should be a string");
  });

  it("each result contains required Movie fields", async () => {
    const req = makeRequest({ query: "action" });
    const res = await POST(req);
    const data = await res.json();
    assert.ok(data.results.length > 0, "should have at least one result");
    const movie = data.results[0];
    assert.ok(typeof movie.id === "number", "id should be number");
    assert.ok(typeof movie.title === "string", "title should be string");
    assert.ok(typeof movie.releaseDate === "string", "releaseDate should be string");
    assert.ok(typeof movie.rating === "number", "rating should be number");
    assert.ok(typeof movie.runtime === "number", "runtime should be number");
    assert.ok(
      movie.posterPath === null || typeof movie.posterPath === "string",
      "posterPath should be string or null"
    );
    assert.ok(typeof movie.overview === "string", "overview should be string");
    assert.ok(Array.isArray(movie.genres), "genres should be array");
  });

  it("respects the limit parameter", async () => {
    const req = makeRequest({ query: "test", limit: 1 });
    const res = await POST(req);
    const data = await res.json();
    assert.ok(data.results.length <= 1, "should return at most 1 result");
    assert.equal(data.meta.count, data.results.length);
  });

  it("meta.querySummary includes the query string", async () => {
    const req = makeRequest({ query: "sci-fi" });
    const res = await POST(req);
    const data = await res.json();
    assert.ok(
      data.meta.querySummary.includes("sci-fi"),
      "querySummary should include the query"
    );
  });
});
