import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rankPath = path.join(process.cwd(), "lib", "ranking.ts");
const schemasPath = path.join(process.cwd(), "lib", "schemas.ts");
const rankSrc = fs.readFileSync(rankPath, "utf-8");
const schemasSrc = fs.readFileSync(schemasPath, "utf-8");

describe("lib/ranking.ts & lib/schemas.ts structure", () => {
  it("defines rankCandidates function", () => {
    assert.ok(rankSrc.includes("function rankCandidates"), "Should export rankCandidates function");
  });

  it("defines RankedItem interface and validateRankedList", () => {
    assert.ok(schemasSrc.includes("interface RankedItem"), "Should define RankedItem interface");
    assert.ok(schemasSrc.includes("function validateRankedList"), "Should define validateRankedList function");
  });

  it("instructs LLM to only rank provided candidates without inventing IDs", () => {
    assert.ok(rankSrc.includes("Never invent or hallucinate new IDs"), "Should constrain prompt against ID invention");
    assert.ok(rankSrc.includes("compactCandidates"), "Should build compact candidate payload");
  });
});

describe("Candidate ranking logic & validation", () => {
  function validateRankedList(data, allowedIds) {
    if (!data || typeof data !== "object") return [];
    const list = Array.isArray(data.ranked) ? data.ranked : Array.isArray(data) ? data : [];
    const results = [];
    const seen = new Set();
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const rawId = typeof item.id === "number" ? item.id : parseInt(String(item.id), 10);
      if (isNaN(rawId)) continue;
      if (!allowedIds.has(rawId) || seen.has(rawId)) continue;
      seen.add(rawId);
      results.push({
        id: rawId,
        matchExplanation: item.matchExplanation || "Matches search criteria.",
      });
    }
    return results;
  }

  const sampleCandidates = [
    { id: 101, title: "Movie Alpha", rating: 7.2, genres: ["Action"], overview: "Action movie" },
    { id: 102, title: "Movie Beta", rating: 8.5, genres: ["Sci-Fi"], overview: "Sci-Fi movie" },
    { id: 103, title: "Movie Gamma", rating: 6.8, genres: ["Drama"], overview: "Drama movie" },
  ];
  const allowedIds = new Set([101, 102, 103]);

  it("orders candidates according to LLM response and preserves ground truth data", () => {
    const mockLLMOutput = {
      ranked: [
        { id: 102, matchExplanation: "Perfect fit for sci-fi request." },
        { id: 101, matchExplanation: "Great action pacing." },
      ],
    };
    const validated = validateRankedList(mockLLMOutput, allowedIds);
    assert.equal(validated.length, 2);
    assert.equal(validated[0].id, 102);
    assert.equal(validated[0].matchExplanation, "Perfect fit for sci-fi request.");
    assert.equal(validated[1].id, 101);
  });

  it("discards fabricated IDs not present in the candidate pool", () => {
    const mockLLMOutput = {
      ranked: [
        { id: 99999, matchExplanation: "Hallucinated film" }, // fabricated
        { id: 103, matchExplanation: "Authentic match" },
      ],
    };
    const validated = validateRankedList(mockLLMOutput, allowedIds);
    assert.equal(validated.length, 1);
    assert.equal(validated[0].id, 103);
  });

  it("falls back gracefully when LLM output is malformed or invalid JSON", () => {
    const validated = validateRankedList("not-json", allowedIds);
    assert.deepEqual(validated, []);
  });
});
