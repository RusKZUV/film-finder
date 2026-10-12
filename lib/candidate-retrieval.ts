import { TMDBClient, TMDBSearchResponse } from "./tmdb";
import type { SearchPlan } from "./schemas";
import type { Movie } from "@/types/movie";

export const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "sci-fi": 878,
  "science fiction": 878,
  "tv movie": 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

export function mapGenresToIds(genres: string[]): number[] {
  const ids: number[] = [];
  for (const g of genres) {
    const normalized = g.trim().toLowerCase();
    if (GENRE_MAP[normalized]) {
      ids.push(GENRE_MAP[normalized]);
    }
  }
  return ids;
}

export function buildDiscoverParams(plan: SearchPlan): Record<string, string | number> {
  const params: Record<string, string | number> = {
    sort_by: "popularity.desc",
    include_adult: "false",
    page: 1,
  };

  const genreIds = mapGenresToIds(plan.genres);
  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(",");
  }

  if (plan.yearFrom) {
    params["primary_release_date.gte"] = `${plan.yearFrom}-01-01`;
  }

  if (plan.yearTo) {
    params["primary_release_date.lte"] = `${plan.yearTo}-12-31`;
  }

  if (plan.minRating && plan.minRating > 0) {
    params["vote_average.gte"] = plan.minRating;
    params["vote_count.gte"] = 50; // Filter out 1-vote 10/10 outliers
  }

  if (plan.language) {
    params.with_original_language = plan.language.toLowerCase();
  }

  return params;
}

export async function retrieveCandidates(
  client: TMDBClient,
  plan: SearchPlan,
  limit = 30
): Promise<Movie[]> {
  try {
    const discoverParams = buildDiscoverParams(plan);
    const discoverData = await client.fetchEndpoint<TMDBSearchResponse>(
      "/discover/movie",
      discoverParams
    );

    let candidates: Movie[] = [];
    if (Array.isArray(discoverData.results) && discoverData.results.length > 0) {
      candidates = discoverData.results.map((r) => ({
        id: r.id,
        title: r.title ?? "Unknown",
        releaseDate: r.release_date ?? "",
        rating: typeof r.vote_average === "number" ? r.vote_average : 0,
        runtime: typeof r.runtime === "number" ? r.runtime : 0,
        posterPath: r.poster_path ?? null,
        overview: r.overview ?? "",
        genres: [],
      }));
    }

    // Fallback: if discover yielded 0 results, fallback to query / keyword search
    if (candidates.length === 0) {
      const fallbackQuery = plan.keywords.length > 0 ? plan.keywords.join(" ") : plan.semanticSummary;
      candidates = await client.searchMovies(fallbackQuery, limit);
    }

    // Deduplicate and bound candidate pool
    const seen = new Set<number>();
    const deduplicated: Movie[] = [];
    for (const movie of candidates) {
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      deduplicated.push(movie);
      if (deduplicated.length >= limit) break;
    }

    return deduplicated;
  } catch {
    return [];
  }
}
