const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class TMDBClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: TMDBClientConfig = {}) {
    const key = config.apiKey || process.env.TMDB_API_KEY;
    if (!key) {
      throw new Error("TMDB_API_KEY is not defined in environment variables or configuration.");
    }
    this.apiKey = key;
    this.baseUrl = config.baseUrl || TMDB_BASE_URL;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async fetchEndpoint<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`);
    
    // Support either v3 api_key query param or v4 Bearer token
    if (this.apiKey.startsWith("eyJ")) {
      // JWT token
    } else {
      url.searchParams.set("api_key", this.apiKey);
    }

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.apiKey.startsWith("eyJ")) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`TMDB request failed with status ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

let defaultClient: TMDBClient | null = null;

export function getTMDBClient(): TMDBClient {
  if (!defaultClient) {
    defaultClient = new TMDBClient();
  }
  return defaultClient;
}
