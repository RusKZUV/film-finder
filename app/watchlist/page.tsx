"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/types/movie";
import { getWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setMovies(getWatchlist());
  }, []);

  const handleRefresh = () => {
    setMovies(getWatchlist());
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">My Watchlist</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Notice: Your watchlist is stored locally in your current browser and will not sync across other devices.
            </p>
          </div>
          {mounted && movies.length > 0 && (
            <span className="text-xs px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full w-fit">
              {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
            </span>
          )}
        </div>

        {mounted && movies.length === 0 ? (
          <div
            role="status"
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="p-4 rounded-full bg-zinc-800/80 text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-200">Your watchlist is empty</h2>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                Explore movies using natural language search or filters and bookmark your favorites.
              </p>
            </div>
            <Link
              href="/"
              className="mt-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Discover Movies
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            onClick={handleRefresh}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
