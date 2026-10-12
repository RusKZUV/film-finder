"use client";

import React from "react";
import { SearchFilters } from "@/types/search";

const COMMON_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "War",
  "Western",
];

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const toggleGenre = (genre: string) => {
    const nextGenres = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: nextGenres });
  };

  return (
    <div
      role="region"
      aria-label="Search filter controls"
      className="bg-zinc-800/90 border border-zinc-700/80 rounded-lg p-5 space-y-5"
    >
      <div>
        <span id="genres-label" className="block text-sm font-medium text-zinc-200 mb-2.5">
          Filter by Genre
        </span>
        <div
          role="group"
          aria-labelledby="genres-label"
          className="flex flex-wrap gap-2.5"
        >
          {COMMON_GENRES.map((genre) => {
            const isSelected = filters.genres.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                aria-pressed={isSelected}
                className={`min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                  isSelected
                    ? "bg-amber-500 text-zinc-950 border-amber-500 font-semibold shadow-sm"
                    : "bg-zinc-900/80 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="year-from" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Year From
          </label>
          <input
            id="year-from"
            type="number"
            min="1900"
            max="2030"
            placeholder="e.g. 2000"
            value={filters.yearFrom ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                yearFrom: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="year-to" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Year To
          </label>
          <input
            id="year-to"
            type="number"
            min="1900"
            max="2030"
            placeholder="e.g. 2026"
            value={filters.yearTo ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                yearTo: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="min-rating" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Minimum Rating (0 - 10)
          </label>
          <input
            id="min-rating"
            type="number"
            min="0"
            max="10"
            step="0.5"
            placeholder="e.g. 7.5"
            value={filters.minRating ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minRating: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-zinc-900"
          />
        </div>
      </div>
    </div>
  );
}
