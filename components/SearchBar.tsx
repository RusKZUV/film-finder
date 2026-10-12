"use client";

import React, { useState } from "react";
import FilterPanel from "./FilterPanel";
import { SearchFilters, SearchRequestPayload } from "@/types/search";

interface SearchBarProps {
  onSearch?: (payload: SearchRequestPayload) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    yearFrom: undefined,
    yearTo: undefined,
    minRating: undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a movie description or keywords to search.");
      return;
    }
    setErrorMessage("");

    const payload: SearchRequestPayload = {
      query: trimmed,
      filters,
      limit: 20,
    };

    if (onSearch) {
      onSearch(payload);
    } else {
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Search request error:", err));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && showFilters) {
      setShowFilters(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4" onKeyDown={handleKeyDown}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative flex flex-col sm:flex-row gap-2.5">
          <label htmlFor="movie-search-input" className="sr-only">
            Search movies in natural language
          </label>
          <input
            id="movie-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="e.g. A clever sci-fi mystery with a twist, under two hours"
            className="flex-1 min-h-[44px] px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            className="min-h-[44px] px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {errorMessage && (
          <p role="alert" className="text-sm text-rose-400">
            {errorMessage}
          </p>
        )}
      </form>

      {showFilters && (
        <div id="filter-panel">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      )}
    </div>
  );
}
