export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T = unknown> {
  private map = new Map<string, CacheEntry<T>>();
  private maxItems: number;
  private defaultTtlMs: number;

  constructor(maxItems = 200, defaultTtlSeconds = 600) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      return undefined;
    }

    if (now >= entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // Refresh LRU order on hit
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlSeconds?: number, now = Date.now()): void {
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;

    // Enforce LRU cap
    if (this.map.size >= this.maxItems && !this.map.has(key)) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey) {
        this.map.delete(oldestKey);
      }
    }

    this.map.set(key, {
      value,
      expiresAt: now + ttlMs,
    });
  }

  has(key: string, now = Date.now()): boolean {
    return this.get(key, now) !== undefined;
  }

  size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }
}

export function buildCacheKey(endpoint: string, params: Record<string, string | number> = {}): string {
  const sortedPairs = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `${endpoint}?${sortedPairs}`;
}

export const tmdbResponseCache = new MemoryCache(200, 600);
