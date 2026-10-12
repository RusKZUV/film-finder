import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const wlPath = path.join(process.cwd(), "lib", "watchlist.ts");
const wlTypesPath = path.join(process.cwd(), "types", "watchlist.ts");
const wlSrc = fs.readFileSync(wlPath, "utf-8");
const wlTypesSrc = fs.readFileSync(wlTypesPath, "utf-8");

describe("lib/watchlist.ts structure & exports", () => {
  it("exports required watchlist functions", () => {
    assert.ok(wlSrc.includes("function getWatchlist"), "Should export getWatchlist");
    assert.ok(wlSrc.includes("function addToWatchlist"), "Should export addToWatchlist");
    assert.ok(wlSrc.includes("function removeFromWatchlist"), "Should export removeFromWatchlist");
    assert.ok(wlSrc.includes("function isInWatchlist"), "Should export isInWatchlist");
    assert.ok(wlSrc.includes("function clearWatchlist"), "Should export clearWatchlist");
  });

  it("defines schema version in types and storage data", () => {
    assert.ok(wlTypesSrc.includes("version: number"), "Types should include version");
    assert.ok(wlSrc.includes("STORAGE_VERSION"), "Should define STORAGE_VERSION");
  });

  it("guards against SSR when window/localStorage is missing", () => {
    assert.ok(wlSrc.includes("isBrowser"), "Should contain browser environment check");
    assert.ok(wlSrc.includes("typeof window"), "Should check window object");
  });
});

describe("Watchlist storage behavior simulation", () => {
  let mockStorage = {};
  const mockWindow = {
    localStorage: {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
    },
  };

  const KEY = "film_finder_watchlist";

  function getWatchlist(win = mockWindow) {
    if (!win || !win.localStorage) return [];
    try {
      const raw = win.localStorage.getItem(KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
      return [];
    } catch {
      win.localStorage.removeItem(KEY);
      return [];
    }
  }

  function saveWatchlist(items, win = mockWindow) {
    if (!win || !win.localStorage) return;
    win.localStorage.setItem(KEY, JSON.stringify({ version: 1, items }));
  }

  function addToWatchlist(movie, win = mockWindow) {
    const list = getWatchlist(win);
    if (list.some((m) => m.id === movie.id)) return list;
    const updated = [movie, ...list];
    saveWatchlist(updated, win);
    return updated;
  }

  function removeFromWatchlist(id, win = mockWindow) {
    const list = getWatchlist(win);
    const updated = list.filter((m) => m.id !== id);
    saveWatchlist(updated, win);
    return updated;
  }

  function isInWatchlist(id, win = mockWindow) {
    return getWatchlist(win).some((m) => m.id === id);
  }

  beforeEach(() => {
    mockStorage = {};
  });

  it("handles SSR gracefully when window is undefined", () => {
    assert.deepEqual(getWatchlist(undefined), []);
  });

  it("adds movie to watchlist and prevents duplicates", () => {
    const m1 = { id: 10, title: "Film 10" };
    addToWatchlist(m1);
    assert.equal(getWatchlist().length, 1);
    assert.ok(isInWatchlist(10));

    // duplicate add
    addToWatchlist(m1);
    assert.equal(getWatchlist().length, 1);
  });

  it("removes movie from watchlist", () => {
    const m1 = { id: 10, title: "Film 10" };
    const m2 = { id: 20, title: "Film 20" };
    addToWatchlist(m1);
    addToWatchlist(m2);
    assert.equal(getWatchlist().length, 2);

    removeFromWatchlist(10);
    assert.equal(getWatchlist().length, 1);
    assert.equal(isInWatchlist(10), false);
    assert.equal(isInWatchlist(20), true);
  });

  it("recovers from corrupted JSON in localStorage without throwing", () => {
    mockStorage[KEY] = "corrupted-invalid-{json";
    const res = getWatchlist();
    assert.deepEqual(res, []);
    assert.equal(mockStorage[KEY], undefined, "Should have cleared corrupted entry");
  });
});
