export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAICompletionOptions {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

export interface OpenAIClientError {
  isError: true;
  status?: number;
  code: string;
  message: string;
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIClient {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey?: string, defaultModel = "gpt-4o-mini") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables or configuration.");
    }
    this.apiKey = key;
    this.defaultModel = defaultModel;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async createChatCompletion(
    messages: OpenAIMessage[],
    options: OpenAICompletionOptions = {}
  ): Promise<{ content: string; parsed?: unknown }> {
    const model = options.model || this.defaultModel;
    const timeoutMs = options.timeoutMs || 15000;

    const payload: Record<string, unknown> = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
    };

    if (options.jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        throw {
          isError: true,
          code: "TIMEOUT",
          message: `OpenAI request timed out after ${timeoutMs}ms`,
        } as OpenAIClientError;
      }
      throw {
        isError: true,
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network failure connecting to OpenAI",
      } as OpenAIClientError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMsg = `OpenAI API returned status ${response.status}`;
      let errCode = "API_ERROR";
      try {
        const errorBody = await response.json();
        if (errorBody?.error?.message) {
          errorMsg = errorBody.error.message;
        }
        if (errorBody?.error?.code) {
          errCode = String(errorBody.error.code);
        }
      } catch {
        // ignore JSON parse error for error body
      }

      if (response.status === 401) errCode = "UNAUTHORIZED";
      if (response.status === 429) errCode = "RATE_LIMIT_EXCEEDED";
      if (response.status >= 500) errCode = "SERVER_ERROR";

      throw {
        isError: true,
        status: response.status,
        code: errCode,
        message: errorMsg,
      } as OpenAIClientError;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    let parsed: unknown;
    if (options.jsonMode && content) {
      try {
        parsed = JSON.parse(content);
      } catch {
        // preserve content even if parsing fails
      }
    }

    return { content, parsed };
  }
}

let defaultOpenAIClient: OpenAIClient | null = null;

export function getOpenAIClient(): OpenAIClient {
  if (!defaultOpenAIClient) {
    defaultOpenAIClient = new OpenAIClient();
  }
  return defaultOpenAIClient;
}
