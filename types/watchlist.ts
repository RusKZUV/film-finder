import type { Movie } from "./movie";

export interface WatchlistStorageData {
  version: number;
  items: Movie[];
}
