export interface SearchFilters {
  genres: string[];
  yearFrom?: number;
  yearTo?: number;
  minRating?: number;
  language?: string;
  runtimeMin?: number;
  runtimeMax?: number;
  movieType?: string;
}

export interface SearchRequestPayload {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}
