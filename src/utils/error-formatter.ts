import type { ScreenshotOptions } from "../types/screenshot";
import { DEFAULT_CONFIG } from "../config/defaults";
import { isRetryableError } from "./retry";

export function formatError(error: unknown, options: ScreenshotOptions): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // If already formatted, return as is
  if (
    errorMessage.startsWith("Failed to take screenshot:") ||
    errorMessage.startsWith("Network error:") ||
    errorMessage.startsWith("Screenshot timed out after")
  ) {
    return errorMessage;
  }

  if (errorMessage.toLowerCase().includes("timeout")) {
    return `Screenshot timed out after ${options.timeout || DEFAULT_CONFIG.timeout}ms: ${errorMessage}`;
  }

  if (error instanceof Error && isRetryableError(error)) {
    return `Network error: ${errorMessage}`;
  }

  return `Failed to take screenshot: ${errorMessage}`;
}
