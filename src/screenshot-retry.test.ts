import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screenshot } from "./screenshot";
import * as playwright from "playwright";

// Mock playwright
vi.mock("playwright");

interface MockPage {
  setViewportSize: ReturnType<typeof vi.fn>;
  goto: ReturnType<typeof vi.fn>;
  waitForSelector: ReturnType<typeof vi.fn>;
  waitForTimeout: ReturnType<typeof vi.fn>;
  screenshot: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockBrowser {
  newPage: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

describe("screenshot with retry", () => {
  let mockBrowser: MockBrowser;
  let mockPage: MockPage;

  beforeEach(() => {
    mockPage = {
      setViewportSize: vi.fn().mockResolvedValue(undefined),
      goto: vi.fn().mockResolvedValue(undefined),
      waitForSelector: vi.fn().mockResolvedValue(undefined),
      waitForTimeout: vi.fn().mockResolvedValue(undefined),
      screenshot: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(undefined),
    };

    (playwright.chromium.launch as ReturnType<typeof vi.fn>).mockResolvedValue(mockBrowser);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should retry on network error", async () => {
    // First two attempts fail with network error, third succeeds
    mockPage.goto
      .mockRejectedValueOnce(new Error("net::ERR_CONNECTION_REFUSED"))
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValueOnce(undefined);

    const result = await screenshot({
      url: "https://example.com",
      retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 10,
        backoff: "fixed",
      },
    });

    expect(result.ok).toBe(true);
    expect(mockPage.goto).toHaveBeenCalledTimes(3);
  });

  it("should not retry when retry is disabled", async () => {
    mockPage.goto.mockRejectedValueOnce(new Error("Network error"));

    const result = await screenshot({
      url: "https://example.com",
      retry: {
        enabled: false,
        maxAttempts: 3,
        delay: 10,
        backoff: "fixed",
      },
    });

    expect(result.err).toBe(true);
    expect(result.val).toContain("Network error");
    expect(mockPage.goto).toHaveBeenCalledTimes(1);
  });

  it("should fail after max retry attempts", async () => {
    mockPage.goto.mockRejectedValue(new Error("Network failed"));

    const result = await screenshot({
      url: "https://example.com",
      retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 10,
        backoff: "fixed",
      },
    });

    expect(result.err).toBe(true);
    expect(result.val).toContain("Failed after 3 attempts");
    expect(mockPage.goto).toHaveBeenCalledTimes(3);
  });

  it("should handle timeout errors with proper message", async () => {
    mockPage.goto.mockRejectedValueOnce(new Error("Timeout 30000ms exceeded"));

    const result = await screenshot({
      url: "https://example.com",
      timeout: 30_000,
      retry: {
        enabled: true,
        maxAttempts: 1,
        delay: 10,
        backoff: "fixed",
      },
    });

    expect(result.err).toBe(true);
    expect(result.val).toContain("Screenshot timed out after 30000ms");
  });

  it("should not retry on non-retryable errors", async () => {
    mockPage.goto.mockRejectedValueOnce(new Error("Invalid URL"));

    const result = await screenshot({
      url: "https://example.com",
      retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 10,
        backoff: "fixed",
      },
    });

    expect(result.err).toBe(true);
    expect(result.val).toContain("Invalid URL");
    expect(mockPage.goto).toHaveBeenCalledTimes(1);
  });
});
