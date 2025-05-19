import { describe, it, expect } from "vitest";
import { formatError } from "./error-formatter";
import type { ScreenshotOptions } from "../types/screenshot";

describe("Error Formatting", () => {
  it("should format timeout errors with timeout duration", () => {
    const error = new Error("Navigation timeout exceeded");
    const options: ScreenshotOptions = { url: "https://example.com", timeout: 30_000 };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Screenshot timed out after 30000ms: Navigation timeout exceeded");
  });

  it("should format network errors", () => {
    // Create an error that looks like a network error
    const error = new Error("net::ERR_CONNECTION_REFUSED");
    const options: ScreenshotOptions = { url: "https://example.com" };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Network error: net::ERR_CONNECTION_REFUSED");
  });

  it("should format general errors", () => {
    const error = new Error("Something went wrong");
    const options: ScreenshotOptions = { url: "https://example.com" };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Failed to take screenshot: Something went wrong");
  });

  it("should handle non-Error objects", () => {
    const error = "String error message";
    const options: ScreenshotOptions = { url: "https://example.com" };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Failed to take screenshot: String error message");
  });

  it("should handle undefined error", () => {
    const error = undefined;
    const options: ScreenshotOptions = { url: "https://example.com" };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Failed to take screenshot: undefined");
  });

  it("should use default timeout if not specified", () => {
    const error = new Error("Timeout during load");
    const options: ScreenshotOptions = { url: "https://example.com" };
    const formatted = formatError(error, options);

    expect(formatted).toBe("Screenshot timed out after 30000ms: Timeout during load");
  });
});
