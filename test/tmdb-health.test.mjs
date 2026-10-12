import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { GET, POST } from "../app/api/health/route.ts";

test("lib/tmdb.ts: exists and throws error when TMDB_API_KEY is missing", () => {
  const tmdbPath = path.resolve(process.cwd(), "lib/tmdb.ts");
  assert.ok(fs.existsSync(tmdbPath), "lib/tmdb.ts must exist");

  const tmdbContent = fs.readFileSync(tmdbPath, "utf-8");
  assert.match(tmdbContent, /export class TMDBClient/);
  assert.match(tmdbContent, /TMDB_API_KEY is not defined/);
  assert.doesNotMatch(tmdbContent, /NEXT_PUBLIC_TMDB_API_KEY/, "TMDB key must never use NEXT_PUBLIC prefix");
});

test("API route /api/health: GET returns HTTP 200 with { ok: true } and non-GET returns 405", async () => {
  const getResponse = await GET();
  assert.equal(getResponse.status, 200);
  const getData = await getResponse.json();
  assert.deepEqual(getData, { ok: true });

  const postResponse = await POST();
  assert.equal(postResponse.status, 405);
  const postData = await postResponse.json();
  assert.deepEqual(postData, { error: "Method Not Allowed" });
});
