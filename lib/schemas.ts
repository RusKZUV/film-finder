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
