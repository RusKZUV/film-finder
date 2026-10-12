import { getOpenAIClient, OpenAIClient } from "./openai";
import { validateRankedList } from "./schemas";
import type { Movie } from "@/types/movie";

const RANKING_SYSTEM_PROMPT = `You are a film ranking assistant.
Rank ONLY the given candidate movies based on how well they match the user's intent.
Return a JSON object with a single key "ranked" containing an array of objects:
[
  { "id": <number>, "matchExplanation": "<1-2 concise sentences explaining why this movie fits the user's search>" }
]
Rules:
- Include ONLY IDs that appear in the candidate list. Never invent or hallucinate new IDs.
- Order the array from most relevant to least relevant.
- Return ONLY valid JSON.`;

export async function rankCandidates(
  query: string,
  candidates: Movie[],
  limit = 20,
  client?: OpenAIClient
): Promise<Movie[]> {
  if (candidates.length === 0) {
    return [];
  }

  // Pre-index candidates by ID for ground-truth preservation
  const candidateMap = new Map<number, Movie>();
  for (const c of candidates) {
    candidateMap.set(c.id, c);
  }

  const allowedIds = new Set(candidates.map((c) => c.id));

  // Build compact payload for LLM (id, title, genres, releaseDate, rating, overview)
  const compactCandidates = candidates.map((c) => ({
    id: c.id,
    title: c.title,
    releaseDate: c.releaseDate,
    rating: c.rating,
    genres: c.genres,
    overview: c.overview ? c.overview.slice(0, 180) : "",
  }));

  try {
    const openai = client || getOpenAIClient();
    const prompt = `User search request: "${query}"\n\nCandidate movies:\n${JSON.stringify(compactCandidates)}`;

    const { parsed, content } = await openai.createChatCompletion(
      [
        { role: "system", content: RANKING_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      { jsonMode: true, temperature: 0.2, timeoutMs: 12000 }
    );

    let parsedObj = parsed;
    if (!parsedObj && content) {
      try {
        parsedObj = JSON.parse(content);
      } catch {
        // Fall back to default ordering
      }
    }

    const validatedRanks = validateRankedList(parsedObj, allowedIds);

    if (validatedRanks.length > 0) {
      const rankedMovies: Movie[] = [];
      const includedIds = new Set<number>();

      for (const rankItem of validatedRanks) {
        const originalMovie = candidateMap.get(rankItem.id);
        if (originalMovie) {
          rankedMovies.push({
            ...originalMovie,
            matchExplanation: rankItem.matchExplanation,
          });
          includedIds.add(rankItem.id);
        }
        if (rankedMovies.length >= limit) break;
      }

      // Append any unranked candidates up to limit
      for (const candidate of candidates) {
        if (rankedMovies.length >= limit) break;
        if (!includedIds.has(candidate.id)) {
          rankedMovies.push({
            ...candidate,
            matchExplanation: candidate.matchExplanation || "Matches search criteria.",
          });
          includedIds.add(candidate.id);
        }
      }

      return rankedMovies.slice(0, limit);
    }
  } catch {
    // Graceful fallback: maintain candidate order with standard generic match explanations
  }

  // Fallback path
  return candidates.slice(0, limit).map((c) => ({
    ...c,
    matchExplanation: c.matchExplanation || "Matches your search criteria.",
  }));
}
