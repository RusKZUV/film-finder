"use client";

import React from "react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
            >
              Film Finder
            </Link>
          </div>
          <nav aria-label="Main navigation" className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Search
            </Link>
            <Link
              href="/watchlist"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Watchlist
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Film Finder. All rights reserved.</p>
          <p className="text-xs text-zinc-600">
            Powered by TMDB and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
