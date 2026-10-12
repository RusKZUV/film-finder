import { getOpenAIClient, OpenAIClient } from "./openai";
import { SearchPlan, validateSearchPlan, createDefaultSearchPlan } from "./schemas";
import type { SearchFilters } from "@/types/search";

const SYSTEM_PROMPT = `You are a film discovery query parser.
Analyze the user's natural language film request and extract a structured search plan in JSON format.
The JSON object must strictly have these fields:
- "genres": string array of recognized movie genres (e.g. ["Action", "Sci-Fi"])
- "yearFrom": integer or null (earliest release year)
- "yearTo": integer or null (latest release year)
- "minRating": float or null (minimum rating from 0 to 10)
- "language": string or null (ISO 639-1 code e.g. "en", "fr", "ja")
- "runtimeMin": integer or null (minimum minutes)
- "runtimeMax": integer or null (maximum minutes)
- "keywords": string array of core themes, topics, or subjects
- "semanticSummary": brief 1-sentence synopsis of the query intent

Return ONLY a JSON object.`;

export async function interpretQuery(
  query: string,
  userFilters?: SearchFilters,
  client?: OpenAIClient
): Promise<SearchPlan> {
  const trimmed = query ? query.trim() : "";
  if (!trimmed) {
    const fallback = createDefaultSearchPlan();
    return applyUserFilters(fallback, userFilters);
  }

  let plan: SearchPlan;

  try {
    const openai = client || getOpenAIClient();
    const prompt = `User query: "${trimmed}"`;

    const { parsed, content } = await openai.createChatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      { jsonMode: true, temperature: 0.2 }
    );

    let parsedObj = parsed;
    if (!parsedObj && content) {
      try {
        parsedObj = JSON.parse(content);
      } catch {
        // Fall back to default plan if JSON parsing fails
      }
    }

    plan = validateSearchPlan(parsedObj);
  } catch {
    // Malformed LLM response or network/key error -> safe fallback
    plan = createDefaultSearchPlan(trimmed);
  }

  return applyUserFilters(plan, userFilters);
}

function applyUserFilters(plan: SearchPlan, filters?: SearchFilters): SearchPlan {
  if (!filters) {
    return plan;
  }

  return {
    ...plan,
    genres: filters.genres && filters.genres.length > 0 ? filters.genres : plan.genres,
    yearFrom: filters.yearFrom !== undefined ? filters.yearFrom : plan.yearFrom,
    yearTo: filters.yearTo !== undefined ? filters.yearTo : plan.yearTo,
    minRating: filters.minRating !== undefined ? filters.minRating : plan.minRating,
    language: filters.language !== undefined ? filters.language : plan.language,
    runtimeMin: filters.runtimeMin !== undefined ? filters.runtimeMin : plan.runtimeMin,
    runtimeMax: filters.runtimeMax !== undefined ? filters.runtimeMax : plan.runtimeMax,
  };
}
