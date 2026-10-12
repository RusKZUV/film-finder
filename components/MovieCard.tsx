"use client";

import type { Movie } from "@/types/movie";
import WatchlistButton from "./WatchlistButton";

interface MovieCardProps {
  movie: Movie;
  matchExplanation?: string;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie, matchExplanation }: MovieCardProps) {
  const { title, releaseDate, posterPath, rating, overview, genres } = movie;
  const effectiveExplanation = matchExplanation || movie.matchExplanation;

  const year = releaseDate ? releaseDate.slice(0, 4) : "";
  const imageUrl = posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;

  // Truncate overview to ~150 chars
  const truncatedOverview =
    overview && overview.length > 150
      ? `${overview.slice(0, 150).trim()}…`
      : overview;

  return (
    <article
      className="flex flex-col rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-200"
      aria-label={`Movie card: ${title}`}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={`Poster for ${title}`}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div
            role="img"
            aria-label="No poster available"
            className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span className="text-xs">No Poster</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2 flex-1">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {year && <span>{year}</span>}
          {rating != null && rating > 0 && (
            <span className="flex items-center gap-1" aria-label={`Rating: ${rating}`}>
              <span aria-hidden="true">★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {genres && genres.length > 0 && (
          <ul className="flex flex-wrap gap-1" aria-label="Genres">
            {genres.map((genre) => (
              <li
                key={genre}
                className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs"
              >
                {genre}
              </li>
            ))}
          </ul>
        )}

        {/* AI Match Explanation Callout */}
        {effectiveExplanation && effectiveExplanation.trim().length > 0 && (
          <div
            className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed"
            aria-label="Why it matches"
          >
            <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
              Why it matches
            </span>
            <p className="line-clamp-3">{effectiveExplanation}</p>
          </div>
        )}

        {truncatedOverview && (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
            {truncatedOverview}
          </p>
        )}

        <div className="pt-2 mt-auto border-t border-gray-100 dark:border-gray-700/60">
          <WatchlistButton movie={movie} />
        </div>
      </div>
    </article>
  );
}
