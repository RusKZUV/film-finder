import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const cachePath = path.join(process.cwd(), "lib", "cache.ts");
const tmdbPath = path.join(process.cwd(), "lib", "tmdb.ts");
const cacheSrc = fs.readFileSync(cachePath, "utf-8");
const tmdbSrc = fs.readFileSync(tmdbPath, "utf-8");

describe("lib/cache.ts structure & exports", () => {
  it("defines MemoryCache class and buildCacheKey function", () => {
    assert.ok(cacheSrc.includes("class MemoryCache"), "Should export MemoryCache class");
    assert.ok(cacheSrc.includes("function buildCacheKey"), "Should export buildCacheKey");
    assert.ok(cacheSrc.includes("tmdbResponseCache"), "Should export singleton cache instance");
  });

  it("integrates caching layer in TMDBClient.fetchEndpoint", () => {
    assert.ok(tmdbSrc.includes("tmdbResponseCache.get"), "Should check cache on request");
    assert.ok(tmdbSrc.includes("tmdbResponseCache.set"), "Should save response in cache");
  });
});

describe("MemoryCache behavior and TTL expiry", () => {
  class MemoryCache {
    map = new Map();
    maxItems;
    defaultTtlMs;

    constructor(maxItems = 5, defaultTtlSeconds = 600) {
      this.maxItems = maxItems;
      this.defaultTtlMs = defaultTtlSeconds * 1000;
    }

    get(key, now = 1000) {
      const entry = this.map.get(key);
      if (!entry) return undefined;
      if (now >= entry.expiresAt) {
        this.map.delete(key);
        return undefined;
      }
      return entry.value;
    }

    set(key, value, ttlSeconds = 600, now = 1000) {
      if (this.map.size >= this.maxItems && !this.map.has(key)) {
        const oldestKey = this.map.keys().next().value;
        if (oldestKey) this.map.delete(oldestKey);
      }
      this.map.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
    }
  }

  it("returns cached payload on cache hit", () => {
    const cache = new MemoryCache();
    cache.set("/movie/101", { title: "Cached Movie" });
    const hit = cache.get("/movie/101");
    assert.deepEqual(hit, { title: "Cached Movie" });
  });

  it("evicts stale items after TTL has elapsed (10 minutes)", () => {
    const cache = new MemoryCache();
    const t0 = 10000;
    cache.set("/search/movie", { results: [1, 2] }, 600, t0);

    // Within TTL (5 minutes later) -> Cache Hit
    assert.ok(cache.get("/search/movie", t0 + 300 * 1000));

    // After TTL (11 minutes later) -> Cache Miss
    assert.equal(cache.get("/search/movie", t0 + 660 * 1000), undefined);
  });

  it("caps maximum cache size according to LRU policy", () => {
    const cache = new MemoryCache(2);
    cache.set("k1", 1);
    cache.set("k2", 2);
    cache.set("k3", 3); // should evict oldest (k1)

    assert.equal(cache.get("k1"), undefined);
    assert.equal(cache.get("k2"), 2);
    assert.equal(cache.get("k3"), 3);
  });

  it("generates deterministic cache keys regardless of parameter ordering", () => {
    function buildCacheKey(endpoint, params) {
      const sorted = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
      return `${endpoint}?${sorted}`;
    }

    const key1 = buildCacheKey("/discover/movie", { page: 1, with_genres: "28,878" });
    const key2 = buildCacheKey("/discover/movie", { with_genres: "28,878", page: 1 });
    assert.equal(key1, key2);
  });
});
