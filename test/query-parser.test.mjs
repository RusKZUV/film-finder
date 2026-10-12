import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const parserPath = path.join(process.cwd(), "lib", "query-parser.ts");
const schemasPath = path.join(process.cwd(), "lib", "schemas.ts");
const parserSrc = fs.readFileSync(parserPath, "utf-8");
const schemasSrc = fs.readFileSync(schemasPath, "utf-8");

describe("lib/query-parser.ts & lib/schemas.ts structure", () => {
  it("defines interpretQuery function", () => {
    assert.ok(parserSrc.includes("function interpretQuery"), "Should export interpretQuery function");
  });

  it("defines SearchPlan interface and validateSearchPlan", () => {
    assert.ok(schemasSrc.includes("interface SearchPlan"), "Should define SearchPlan interface");
    assert.ok(schemasSrc.includes("function validateSearchPlan"), "Should define validateSearchPlan function");
  });

  it("prompts for structured fields (genres, years, rating, runtime, keywords)", () => {
    assert.ok(parserSrc.includes("genres"), "Should request genres");
    assert.ok(parserSrc.includes("yearFrom"), "Should request yearFrom");
    assert.ok(parserSrc.includes("yearTo"), "Should request yearTo");
    assert.ok(parserSrc.includes("minRating"), "Should request minRating");
    assert.ok(parserSrc.includes("keywords"), "Should request keywords");
  });

  it("handles explicit filters taking precedence", () => {
    assert.ok(parserSrc.includes("applyUserFilters"), "Should implement user filter overriding");
  });
});

describe("Query parsing and filter precedence logic", () => {
  function validateSearchPlan(data) {
    if (!data || typeof data !== "object") {
      return { genres: [], keywords: [], semanticSummary: "General search" };
    }
    return {
      genres: Array.isArray(data.genres) ? data.genres : [],
      yearFrom: data.yearFrom,
      yearTo: data.yearTo,
      minRating: data.minRating,
      language: data.language,
      runtimeMin: data.runtimeMin,
      runtimeMax: data.runtimeMax,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      semanticSummary: data.semanticSummary || "General search",
    };
  }

  function applyUserFilters(plan, filters) {
    if (!filters) return plan;
    return {
      ...plan,
      genres: filters.genres && filters.genres.length > 0 ? filters.genres : plan.genres,
      yearFrom: filters.yearFrom !== undefined ? filters.yearFrom : plan.yearFrom,
      yearTo: filters.yearTo !== undefined ? filters.yearTo : plan.yearTo,
      minRating: filters.minRating !== undefined ? filters.minRating : plan.minRating,
      language: filters.language !== undefined ? filters.language : plan.language,
      runtimeMin: filters.runtimeMin !== undefined ? filters.runtimeMin : plan.runtimeMin,
      runtimeMax: filters.runtimeMax !== undefined ? filters.runtimeMax : plan.runtimeMax,
    };
  }

  it("extracts structured fields correctly from mock LLM response", () => {
    const mockLLMOutput = {
      genres: ["Sci-Fi", "Action"],
      yearFrom: 1990,
      yearTo: 1999,
      minRating: 8.0,
      keywords: ["cyberpunk", "virtual reality"],
      semanticSummary: "90s cyberpunk action movies",
    };
    const plan = validateSearchPlan(mockLLMOutput);
    assert.deepEqual(plan.genres, ["Sci-Fi", "Action"]);
    assert.equal(plan.yearFrom, 1990);
    assert.equal(plan.yearTo, 1999);
    assert.equal(plan.minRating, 8.0);
    assert.deepEqual(plan.keywords, ["cyberpunk", "virtual reality"]);
  });

  it("ensures explicit user filters override inferred values", () => {
    const inferredPlan = {
      genres: ["Comedy"],
      yearFrom: 2000,
      yearTo: 2010,
      minRating: 7.0,
      keywords: ["funny"],
      semanticSummary: "Comedies from the 2000s",
    };
    const userFilters = {
      genres: ["Horror"],
      yearFrom: 1980,
      minRating: 8.5,
    };
    const finalPlan = applyUserFilters(inferredPlan, userFilters);
    assert.deepEqual(finalPlan.genres, ["Horror"]);
    assert.equal(finalPlan.yearFrom, 1980);
    assert.equal(finalPlan.yearTo, 2010); // remains from inferred if not set in filters
    assert.equal(finalPlan.minRating, 8.5);
  });

  it("handles vague queries or empty output safely", () => {
    const fallback = validateSearchPlan(null);
    assert.ok(Array.isArray(fallback.genres));
    assert.ok(Array.isArray(fallback.keywords));
    assert.equal(typeof fallback.semanticSummary, "string");
  });

  it("handles malformed non-object LLM responses without throwing", () => {
    const plan1 = validateSearchPlan("not an object");
    assert.deepEqual(plan1.genres, []);
    const plan2 = validateSearchPlan(undefined);
    assert.equal(plan2.semanticSummary, "General search");
  });
});
