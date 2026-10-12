"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import MovieGrid from "@/components/MovieGrid";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import type { Movie, SearchResponse } from "@/types/movie";
import type { SearchRequestPayload } from "@/types/search";

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [lastPayload, setLastPayload] = useState<SearchRequestPayload | null>(null);

  const handleSearch = async (payload: SearchRequestPayload) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setLastQuery(payload.query);
    setLastPayload(payload);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMessage = "Search request failed. Please try again.";
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          // ignore json parse error
        }
        setError(errMessage);
        setMovies([]);
        return;
      }

      const data: SearchResponse = await res.json();
      setMovies(data.results || []);
    } catch {
      setError("Network error connecting to search service. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastPayload) {
      handleSearch(lastPayload);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-100">
            Discover Your Next Favorite Film
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-400">
            Find movies by describing what you want to watch in natural language.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={loading} />
      </div>

      <div className="mt-8">
        {loading && <LoadingSpinner message="Searching for matches..." />}

        {!loading && error && (
          <ErrorState message={error} onRetry={handleRetry} />
        )}

        {!loading && !error && hasSearched && movies.length === 0 && (
          <EmptyState query={lastQuery} />
        )}

        {!loading && !error && movies.length > 0 && (
          <MovieGrid movies={movies} />
        )}
      </div>
    </Layout>
  );
}
