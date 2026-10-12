import type { Movie } from "@/types/movie";
import type { WatchlistStorageData } from "@/types/watchlist";

const STORAGE_KEY = "film_finder_watchlist";
const STORAGE_VERSION = 1;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getWatchlist(): Movie[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as WatchlistStorageData;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return parsed.items;
    }

    // Invalid schema -> reset safely
    clearWatchlist();
    return [];
  } catch {
    // Malformed JSON -> recover safely by resetting
    clearWatchlist();
    return [];
  }
}

function saveWatchlist(items: Movie[]): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const data: WatchlistStorageData = {
      version: STORAGE_VERSION,
      items,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota or browser security block
  }
}

export function addToWatchlist(movie: Movie): Movie[] {
  const current = getWatchlist();
  if (current.some((m) => m.id === movie.id)) {
    return current;
  }
  const updated = [movie, ...current];
  saveWatchlist(updated);
  return updated;
}

export function removeFromWatchlist(movieId: number): Movie[] {
  const current = getWatchlist();
  const updated = current.filter((m) => m.id !== movieId);
  saveWatchlist(updated);
  return updated;
}

export function isInWatchlist(movieId: number): boolean {
  const current = getWatchlist();
  return current.some((m) => m.id === movieId);
}

export function clearWatchlist(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
