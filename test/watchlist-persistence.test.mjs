import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

describe("Watchlist comprehensive unit & persistence suite", () => {
  let mockStorage = {};
  let throwOnSet = false;

  const mockWindow = {
    localStorage: {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => {
        if (throwOnSet) {
          throw new Error("QuotaExceededError: DOM Exception 22");
        }
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
    try {
      win.localStorage.setItem(KEY, JSON.stringify({ version: 1, items }));
    } catch {
      // Graceful fallback for quota exceeded / disabled localStorage
    }
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

  function clearWatchlist(win = mockWindow) {
    if (!win || !win.localStorage) return;
    win.localStorage.removeItem(KEY);
  }

  beforeEach(() => {
    mockStorage = {};
    throwOnSet = false;
  });

  it("verifies adding items and preserving all metadata properties", () => {
    const movie = {
      id: 550,
      title: "Fight Club",
      rating: 8.4,
      releaseDate: "1999-10-15",
      overview: "A great movie",
      posterPath: "/poster.jpg",
      genres: ["Drama"],
    };
    addToWatchlist(movie);
    const saved = getWatchlist();
    assert.equal(saved.length, 1);
    assert.deepEqual(saved[0], movie);
  });

  it("prevents duplicate entries when adding the same ID multiple times", () => {
    const movie = { id: 101, title: "Inception" };
    addToWatchlist(movie);
    addToWatchlist(movie);
    addToWatchlist({ id: 101, title: "Inception Duplicate" });
    assert.equal(getWatchlist().length, 1);
    assert.equal(getWatchlist()[0].id, 101);
  });

  it("removes items by ID correctly", () => {
    addToWatchlist({ id: 1, title: "Film 1" });
    addToWatchlist({ id: 2, title: "Film 2" });
    assert.equal(getWatchlist().length, 2);

    removeFromWatchlist(1);
    const remaining = getWatchlist();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, 2);
  });

  it("clears all watchlist entries", () => {
    addToWatchlist({ id: 1, title: "Film 1" });
    addToWatchlist({ id: 2, title: "Film 2" });
    assert.equal(getWatchlist().length, 2);

    clearWatchlist();
    assert.equal(getWatchlist().length, 0);
    assert.equal(mockStorage[KEY], undefined);
  });

  it("recovers safely from corrupted or invalid JSON without crashing", () => {
    mockStorage[KEY] = "{ corrupted invalid json [";
    const res = getWatchlist();
    assert.deepEqual(res, []);
    assert.equal(mockStorage[KEY], undefined, "Corrupted entry should be cleared");
  });

  it("recovers safely from non-array schema corruption", () => {
    mockStorage[KEY] = JSON.stringify({ version: 1, items: "not an array" });
    const res = getWatchlist();
    assert.deepEqual(res, []);
  });

  it("handles quota exceeded exceptions without throwing unhandled errors", () => {
    throwOnSet = true;
    assert.doesNotThrow(() => {
      addToWatchlist({ id: 99, title: "Large Film" });
    });
  });

  it("simulates persistence across component re-mounts", () => {
    // Mount 1: Add movie
    addToWatchlist({ id: 777, title: "Interstellar" });
    assert.equal(getWatchlist().length, 1);

    // Simulated Re-mount in new component instance
    const newComponentRead = getWatchlist();
    assert.equal(newComponentRead.length, 1);
    assert.equal(newComponentRead[0].title, "Interstellar");
  });
});
