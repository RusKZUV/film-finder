import type { Movie } from "@/types/movie";
import { tmdbResponseCache, buildCacheKey } from "./cache";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Raw TMDB API shapes
export interface TMDBMovieResult {
  id: number;
  title: string;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  poster_path?: string | null;
  overview?: string;
  genre_ids?: number[];
}

export interface TMDBSearchResponse {
  results: TMDBMovieResult[];
  total_results: number;
  total_pages: number;
}

// Map a raw TMDB result to the internal Movie type
function mapTMDBMovie(raw: TMDBMovieResult): Movie {
  return {
    id: raw.id,
    title: raw.title ?? "Unknown",
    releaseDate: raw.release_date ?? "",
    rating: typeof raw.vote_average === "number" ? raw.vote_average : 0,
    runtime: typeof raw.runtime === "number" ? raw.runtime : 0,
    posterPath: raw.poster_path ?? null,
    overview: raw.overview ?? "",
    genres: [], // genre_ids → names requires a separate endpoint; left empty here
  };
}

export interface TMDBClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class TMDBClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: TMDBClientConfig = {}) {
    const key = config.apiKey || process.env.TMDB_API_KEY;
    if (!key) {
      throw new Error("TMDB_API_KEY is not defined in environment variables or configuration.");
    }
    this.apiKey = key;
    this.baseUrl = config.baseUrl || TMDB_BASE_URL;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async fetchEndpoint<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const cacheKey = buildCacheKey(endpoint, params);
    const cached = tmdbResponseCache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    const url = new URL(`${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`);
    
    // Support either v3 api_key query param or v4 Bearer token
    if (this.apiKey.startsWith("eyJ")) {
      // JWT token
    } else {
      url.searchParams.set("api_key", this.apiKey);
    }

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.apiKey.startsWith("eyJ")) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`TMDB request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    tmdbResponseCache.set(cacheKey, data);
    return data;
  }

  async searchMovies(query: string, limit = 20): Promise<Movie[]> {
    try {
      const data = await this.fetchEndpoint<TMDBSearchResponse>("/search/movie", {
        query,
        page: 1,
      });

      const raw = Array.isArray(data.results) ? data.results : [];

      // Map, deduplicate by id, cap at limit
      const seen = new Set<number>();
      const movies: Movie[] = [];
      for (const item of raw) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        movies.push(mapTMDBMovie(item));
        if (movies.length >= limit) break;
      }

      return movies;
    } catch {
      // Network errors or TMDB 5xx — return empty list
      return [];
    }
  }
}

let defaultClient: TMDBClient | null = null;

export function getTMDBClient(): TMDBClient {
  if (!defaultClient) {
    defaultClient = new TMDBClient();
  }
  return defaultClient;
}
