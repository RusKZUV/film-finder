"use client";

import { useState, useEffect } from "react";
import type { Movie } from "@/types/movie";
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/watchlist";

interface WatchlistButtonProps {
  movie: Movie;
  onToggle?: (inWatchlist: boolean) => void;
}

export default function WatchlistButton({ movie, onToggle }: WatchlistButtonProps) {
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    setSaved(isInWatchlist(movie.id));
  }, [movie.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(movie.id);
      setSaved(false);
      onToggle?.(false);
    } else {
      addToWatchlist(movie);
      setSaved(true);
      onToggle?.(true);
    }
  };

  const ariaLabel = saved
    ? `Remove ${movie.title} from watchlist`
    : `Add ${movie.title} to watchlist`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={ariaLabel}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        saved
          ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 focus:ring-amber-500"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-indigo-500"
      }`}
    >
      {saved ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>In Watchlist</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Add to Watchlist</span>
        </>
      )}
    </button>
  );
}
