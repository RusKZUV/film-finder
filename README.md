# Film Finder 🎬

AI-Powered Movie Discovery Web Application built with Next.js, React, TypeScript, Tailwind CSS, TMDB API, and OpenAI GPT-4o-mini.

## Overview

Film Finder lets movie enthusiasts find what to watch by describing their preferences in plain, natural language (e.g., *"A tense 90s psychological thriller with a twist ending"*). The app interprets queries into structured search plans, retrieves matching candidates from The Movie Database (TMDB), re-ranks them using OpenAI `gpt-4o-mini`, and renders personalized match explanations. Users can also manage a local movie watchlist directly in their browser.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Movie Catalog**: [The Movie Database (TMDB) API](https://www.themoviedb.org/)
- **AI / LLM**: OpenAI API (`gpt-4o-mini`)
- **Testing**: Node.js Native Test Runner (`node --test`), Playwright for E2E

---

## Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **API Keys**:
  - TMDB API Key ([Register on TMDB](https://www.themoviedb.org/documentation/api))
  - OpenAI API Key ([Get an OpenAI Key](https://platform.openai.com/api-keys))

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/RusKZUV/film-finder.git
cd film-finder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API credentials:

```ini
# TMDB API Key (v3 auth)
TMDB_API_KEY=your_tmdb_api_key_here

# OpenAI API Key for gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here

# Optional: override rate limit (default: 20 req/min per IP)
RATE_LIMIT_PER_MINUTE=20
```

> **Security**: Keep `.env.local` ignored in Git. Neither key is prefixed with `NEXT_PUBLIC_` and both remain strictly server-side.

---

## Running the Application

### Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Create an optimized production build:

```bash
npm run build
npm run start
```

---

## Running Tests

Run the full automated test suite:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

---

## Key Features

- **Natural Language Search**: Describe moods, themes, genres, and constraints in plain English.
- **Filter Controls**: Multi-select genres, year range (from/to), and minimum rating sliders with 44px accessible touch targets.
- **AI Match Explanations**: Each film card explains why it fits the user's specific prompt.
- **Client-Side Watchlist**: Save films to your browser's `localStorage` with SSR-safe hydration and corrupted data recovery.
- **In-Memory Caching & Rate Limiting**: 10-minute LRU cache on TMDB API responses and per-IP rate limiting (HTTP 429) to keep costs low.
- **Responsive & Accessible**: WCAG 2.1 AA compliant colors, visible focus rings, ARIA roles, and responsive mobile-to-desktop grid.

---

## Attribution & Compliance

This product uses the TMDB API but is not endorsed or certified by TMDB.

All film posters, synopses, and metadata are provided courtesy of [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

## Contribution & Agent Rules

- Follow the process in [_docs/process.md](_docs/process.md).
- Follow the guidelines defined in [AGENTS.md](AGENTS.md).
- Never introduce new npm dependencies without explicit confirmation.
- Keep acceptance criteria strict and commit after each completed task.

---

## License

MIT License. Copyright © 2026 Film Finder.
