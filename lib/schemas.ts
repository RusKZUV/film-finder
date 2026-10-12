export interface SearchPlan {
  genres: string[];
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  language?: string;
  runtimeMin?: number;
  runtimeMax?: number;
  keywords: string[];
  semanticSummary: string;
}

export interface RankedItem {
  id: number;
  matchExplanation: string;
}

export function validateRankedList(data: unknown, allowedIds: Set<number>): RankedItem[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const obj = data as Record<string, unknown>;
  const list = Array.isArray(obj.ranked)
    ? obj.ranked
    : Array.isArray(data)
    ? data
    : [];

  const results: RankedItem[] = [];
  const seen = new Set<number>();

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const rawId = typeof r.id === "number" ? r.id : parseInt(String(r.id), 10);
    if (isNaN(rawId)) continue;

    // Discard any fabricated ID not present in the candidate pool
    if (!allowedIds.has(rawId) || seen.has(rawId)) continue;
    seen.add(rawId);

    const matchExplanation =
      typeof r.matchExplanation === "string" && r.matchExplanation.trim()
        ? r.matchExplanation.trim()
        : "Matches your query criteria.";

    results.push({ id: rawId, matchExplanation });
  }

  return results;
}

export function validateSearchPlan(data: unknown): SearchPlan {
  if (!data || typeof data !== "object") {
    return createDefaultSearchPlan();
  }

  const obj = data as Record<string, unknown>;

  const genres = Array.isArray(obj.genres)
    ? obj.genres.filter((g): g is string => typeof g === "string" && g.trim().length > 0)
    : [];

  const keywords = Array.isArray(obj.keywords)
    ? obj.keywords.filter((k): k is string => typeof k === "string" && k.trim().length > 0)
    : [];

  const parseNumber = (val: unknown): number | undefined => {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
    return undefined;
  };

  const yearFrom = parseNumber(obj.yearFrom);
  const yearTo = parseNumber(obj.yearTo);
  const minRating = parseNumber(obj.minRating);
  const runtimeMin = parseNumber(obj.runtimeMin);
  const runtimeMax = parseNumber(obj.runtimeMax);

  const language = typeof obj.language === "string" && obj.language.trim() ? obj.language.trim() : undefined;
  const semanticSummary = typeof obj.semanticSummary === "string" && obj.semanticSummary.trim()
    ? obj.semanticSummary.trim()
    : "General search";

  return {
    genres,
    yearFrom,
    yearTo,
    minRating,
    language,
    runtimeMin,
    runtimeMax,
    keywords,
    semanticSummary,
  };
}

export function createDefaultSearchPlan(query = ""): SearchPlan {
  return {
    genres: [],
    keywords: query.trim() ? [query.trim()] : [],
    semanticSummary: query.trim() ? `Search for "${query.trim()}"` : "General search",
  };
}
