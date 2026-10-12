import type { SearchRequestPayload } from "@/types/search";
import type { Movie, SearchResponse } from "@/types/movie";
import { getTMDBClient } from "@/lib/tmdb";
import { interpretQuery } from "@/lib/query-parser";
import { retrieveCandidates } from "@/lib/candidate-retrieval";
import { rankCandidates } from "@/lib/ranking";
import { checkRateLimit, extractClientIp } from "@/lib/rate-limit";

const MOCK_MOVIES: Movie[] = [
  {
    id: 550,
    title: "Fight Club",
    releaseDate: "1999-10-15",
    rating: 8.4,
    runtime: 139,
    posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    genres: ["Drama", "Thriller"],
    matchExplanation: "Matches your query for dramatic thrillers.",
  },
  {
    id: 238,
    title: "The Godfather",
    releaseDate: "1972-03-14",
    rating: 9.2,
    runtime: 175,
    posterPath: "/3bhkrj58Vtu7enYsLagFZuhL6TQ.jpg",
    overview:
      "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.",
    genres: ["Drama", "Crime"],
    matchExplanation: "A classic drama matching your search.",
  },
  {
    id: 13,
    title: "Forrest Gump",
    releaseDate: "1994-06-23",
    rating: 8.8,
    runtime: 142,
    posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    overview:
      "A man with a low IQ has accomplished great things in his life and tells his story to random people.",
    genres: ["Drama", "Romance", "Comedy"],
    matchExplanation: "Highly rated drama with broad appeal.",
  },
];

export async function GET(): Promise<Response> {
  return Response.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function POST(request: Request): Promise<Response> {
  const clientIp = extractClientIp(request.headers);
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
        },
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Bad Request: invalid or missing JSON body" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      { error: "Bad Request: body must be a JSON object" },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.query !== "string" || payload.query.trim() === "") {
    return Response.json(
      { error: "Bad Request: 'query' field is required and must be a string" },
      { status: 400 }
    );
  }

  const { query, filters, limit } = (payload as unknown) as SearchRequestPayload;
  const maxResults = typeof limit === "number" && limit > 0 ? limit : 20;

  let results: Movie[] = [];
  let source = "mock";
  let querySummary = `Showing results for "${query.trim()}"`;

  if (process.env.TMDB_API_KEY) {
    try {
      const tmdbClient = getTMDBClient();
      const plan = await interpretQuery(query, filters);
      querySummary = plan.semanticSummary || querySummary;

      const candidates = await retrieveCandidates(tmdbClient, plan, 30);
      let initialCandidates = candidates;

      if (initialCandidates.length === 0) {
        initialCandidates = await tmdbClient.searchMovies(query.trim(), 30);
      }

      if (process.env.OPENAI_API_KEY) {
        results = await rankCandidates(query.trim(), initialCandidates, maxResults);
        source = "tmdb+llm-ranked";
      } else {
        results = initialCandidates.slice(0, maxResults);
        source = "tmdb-discover";
      }
    } catch {
      results = MOCK_MOVIES.slice(0, maxResults);
    }
  } else {
    results = MOCK_MOVIES.slice(0, maxResults);
  }

  const response: SearchResponse = {
    results,
    meta: {
      count: results.length,
      querySummary: `${querySummary} [source: ${source}]`,
    },
  };

  return Response.json(response, {
    status: 200,
    headers: {
      "X-RateLimit-Limit": String(rateLimit.limit),
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}
