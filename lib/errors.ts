export interface StandardErrorResponse {
  error: string;
  code?: string;
}

export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status = 500, code = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request: invalid payload") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class UpstreamTimeoutError extends AppError {
  constructor(service = "Upstream service") {
    super(`${service} request timed out. Please try again.`, 504, "GATEWAY_TIMEOUT");
  }
}

export class UpstreamServiceError extends AppError {
  constructor(service = "Upstream service", status = 502) {
    super(`${service} failed to respond.`, status, "BAD_GATEWAY");
  }
}

export function redactSecrets(text: string): string {
  let cleaned = text;
  if (process.env.OPENAI_API_KEY) {
    cleaned = cleaned.replaceAll(process.env.OPENAI_API_KEY, "[REDACTED]");
  }
  if (process.env.TMDB_API_KEY) {
    cleaned = cleaned.replaceAll(process.env.TMDB_API_KEY, "[REDACTED]");
  }
  // Generic pattern for bearer tokens and sensitive keys
  cleaned = cleaned.replace(/sk-[a-zA-Z0-9_-]{20,}/g, "[REDACTED]");
  return cleaned;
}

export function formatErrorResponse(
  error: unknown,
  nodeEnv = process.env.NODE_ENV
): { status: number; body: StandardErrorResponse } {
  let status = 500;
  let code = "INTERNAL_SERVER_ERROR";
  let message = "An unexpected server error occurred.";

  if (error instanceof AppError) {
    status = error.status;
    code = error.code;
    message = error.message;
  } else if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.status === "number") {
      status = errObj.status;
    }
    if (typeof errObj.code === "string") {
      code = errObj.code;
    }
    if (typeof errObj.message === "string") {
      message = errObj.message;
    }
  } else if (typeof error === "string") {
    message = error;
  }

  // Redact secrets and sensitive tokens
  message = redactSecrets(message);

  // In production, mask unhandled 500 errors to prevent leaking stack traces or system internals
  if (nodeEnv === "production" && status >= 500 && code === "INTERNAL_SERVER_ERROR") {
    message = "An unexpected server error occurred. Please try again later.";
  }

  return {
    status,
    body: {
      error: message,
      code,
    },
  };
}
