import type { Result } from "ts-results";
import tsResults from "ts-results";
const { Ok, Err } = tsResults;

export interface ArgumentValidationResult {
  format?: "png" | "jpeg";
  quality?: number;
  timeout?: number;
  wait?: number;
  retryAttempts?: number;
  retryDelay?: number;
  retryBackoff?: "exponential" | "linear" | "fixed";
}

export function validateFormat(format: string): Result<"png" | "jpeg", string> {
  if (!["png", "jpeg"].includes(format)) {
    return Err(`Invalid format "${format}". Must be "png" or "jpeg".`);
  }
  return Ok(format as "png" | "jpeg");
}

export function validateQuality(quality: string, format?: string): Result<number, string> {
  const qualityNum = Number.parseInt(quality);

  if (Number.isNaN(qualityNum)) {
    return Err("Quality must be a valid number.");
  }

  if (format === "jpeg" && (qualityNum < 0 || qualityNum > 100)) {
    return Err("JPEG quality must be between 0 and 100.");
  }

  return Ok(qualityNum);
}

export function validateTimeout(timeout: string): Result<number, string> {
  const timeoutNum = Number.parseInt(timeout);

  if (Number.isNaN(timeoutNum)) {
    return Err("Timeout must be a valid number.");
  }

  if (timeoutNum <= 0) {
    return Err("Timeout must be greater than 0.");
  }

  return Ok(timeoutNum * 1000); // Convert to milliseconds
}

export function validateWait(wait: string): Result<number, string> {
  const waitNum = Number.parseInt(wait);

  if (Number.isNaN(waitNum)) {
    return Err("Wait time must be a valid number.");
  }

  if (waitNum < 0) {
    return Err("Wait time cannot be negative.");
  }

  return Ok(waitNum * 1000); // Convert to milliseconds
}

export function validateRetryAttempts(attempts: string): Result<number, string> {
  const attemptsNum = Number.parseInt(attempts);

  if (Number.isNaN(attemptsNum)) {
    return Err("Retry attempts must be a valid number.");
  }

  if (attemptsNum <= 0) {
    return Err("Retry attempts must be greater than 0.");
  }

  return Ok(attemptsNum);
}

export function validateRetryDelay(delay: string): Result<number, string> {
  const delayNum = Number.parseInt(delay);

  if (Number.isNaN(delayNum)) {
    return Err("Retry delay must be a valid number.");
  }

  if (delayNum < 0) {
    return Err("Retry delay cannot be negative.");
  }

  return Ok(delayNum);
}

type BackoffStrategy = "exponential" | "linear" | "fixed";

export function validateRetryBackoff(backoff: string): Result<BackoffStrategy, string> {
  const validStrategies = ["exponential", "linear", "fixed"];

  if (!validStrategies.includes(backoff)) {
    return Err(
      `Invalid retry backoff strategy "${backoff}". Must be one of: ${validStrategies.join(", ")}.`
    );
  }

  return Ok(backoff as BackoffStrategy);
}

export function validateUrl(url: string): Result<string, string> {
  try {
    new globalThis.URL(url);
    return Ok(url);
  } catch {
    return Err(`Invalid URL: ${url}`);
  }
}
