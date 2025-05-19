import tsResults from "ts-results";
const { Ok, Err } = tsResults;
import type { Result } from "ts-results";
import type { BackoffStrategy } from "../types/retry";

interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff: BackoffStrategy;
  onAttempt?: (attempt: number, error: Error) => void;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, baseDelay: number, strategy: BackoffStrategy): number {
  switch (strategy) {
    case "exponential": {
      return baseDelay * Math.pow(2, attempt - 1);
    }
    case "linear": {
      return baseDelay * attempt;
    }
    case "fixed": {
      return baseDelay;
    }
    default: {
      return baseDelay;
    }
  }
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  attempt: number = 1
): Promise<Result<T, string>> {
  try {
    const result = await fn();
    return Ok(result);
  } catch (error) {
    const lastError = error instanceof Error ? error : new Error(String(error));

    try {
      options.onAttempt?.(attempt, lastError);
    } catch (callbackError) {
      // If onAttempt throws, it means we should stop retrying
      return Err(
        `${callbackError instanceof Error ? callbackError.message : String(callbackError)}`
      );
    }

    if (attempt < options.maxAttempts) {
      // Calculate delay based on backoff strategy
      const delay = calculateDelay(attempt, options.delay, options.backoff);
      await sleep(delay);

      return executeWithRetry(fn, options, attempt + 1);
    }

    return Err(`Failed after ${options.maxAttempts} attempts: ${lastError.message}`);
  }
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<Result<T, string>> {
  return executeWithRetry(fn, options);
}

export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Common retryable error patterns
  const retryablePatterns = [
    "timeout",
    "network",
    "connection",
    "econnrefused",
    "econnreset",
    "etimedout",
    "failed to navigate",
    "navigation",
    "net::",
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}
