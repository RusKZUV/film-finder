import type { SearchRequestPayload } from "@/types/search";
import type { Movie, SearchResponse } from "@/types/movie";

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

  const { query, limit } = payload as SearchRequestPayload;
  const maxResults = typeof limit === "number" && limit > 0 ? limit : 10;
  const results = MOCK_MOVIES.slice(0, maxResults);

  const response: SearchResponse = {
    results,
    meta: {
      count: results.length,
      querySummary: `Showing ${results.length} placeholder result(s) for "${query}"`,
    },
  };

  return Response.json(response, { status: 200 });
}
