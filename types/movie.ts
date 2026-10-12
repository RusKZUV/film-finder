export interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  rating: number;
  runtime: number;
  posterPath: string | null;
  overview: string;
  genres: string[];
  matchExplanation?: string;
}

export interface SearchResponse {
  results: Movie[];
  meta: {
    count: number;
    querySummary: string;
  };
}
