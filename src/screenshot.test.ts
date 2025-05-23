import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Browser, Page } from "playwright";
import { screenshot } from "./screenshot";
import { chromium } from "playwright";
import { generateFilename } from "./utils/filename";

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

vi.mock("./utils/filename", () => ({
  generateFilename: vi.fn(),
}));

describe("screenshot", () => {
  const mockBrowser = {
    newPage: vi.fn(),
    close: vi.fn(),
  };

  const mockPage = {
    goto: vi.fn(),
    waitForTimeout: vi.fn(),
    screenshot: vi.fn(),
    close: vi.fn(),
    evaluate: vi.fn(),
    setViewportSize: vi.fn(),
    waitForSelector: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as unknown as Browser);
    mockBrowser.newPage.mockResolvedValue(mockPage as unknown as Page);
    vi.mocked(generateFilename).mockReturnValue("screenshot-test.png");
    // Mock evaluate to return a height for scrolling logic
    mockPage.evaluate.mockResolvedValue(1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("takes a screenshot with default options", async () => {
    const options = { url: "https://example.com" };

    const result = await screenshot(options);

    expect(result.ok).toBe(true);
    expect(result.val).toBe("screenshot-test.png");
    expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", {
      timeout: 30_000,
      waitUntil: "networkidle",
    });
    expect(mockPage.screenshot).toHaveBeenCalledWith({
      path: "screenshot-test.png",
      fullPage: true,
      type: "png",
      animations: "disabled",
    });
    expect(mockPage.close).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it("takes a screenshot with custom output path", async () => {
    const options = {
      url: "https://example.com",
      output: "custom-screenshot.png",
    };

    const result = await screenshot(options);

    expect(result.ok).toBe(true);
    expect(result.val).toBe("custom-screenshot.png");
    expect(mockPage.screenshot).toHaveBeenCalledWith({
      path: "custom-screenshot.png",
      fullPage: true,
      type: "png",
      animations: "disabled",
    });
  });

  it("takes a viewport screenshot when fullPage is false", async () => {
    const options = {
      url: "https://example.com",
      fullPage: false,
    };

    const result = await screenshot(options);

    expect(result.ok).toBe(true);
    expect(mockPage.screenshot).toHaveBeenCalledWith({
      path: "screenshot-test.png",
      fullPage: false,
      type: "png",
    });
  });

  it("applies custom timeout", async () => {
    const options = {
      url: "https://example.com",
      timeout: 60_000,
    };

    await screenshot(options);

    expect(mockPage.goto).toHaveBeenCalledWith("https://example.com", {
      timeout: 60_000,
      waitUntil: "networkidle",
    });
  });

  it("waits additional time when wait is specified", async () => {
    const options = {
      url: "https://example.com",
      wait: 5000,
    };

    await screenshot(options);

    expect(mockPage.waitForTimeout).toHaveBeenCalledWith(5000);
  });

  it("returns error when navigation fails", async () => {
    const errorMessage = "Navigation failed";
    mockPage.goto.mockRejectedValue(new Error(errorMessage));

    const options = { url: "https://example.com" };
    const result = await screenshot(options);

    expect(result.err).toBe(true);
    expect(result.val).toBe(`Network error: ${errorMessage}`);
    expect(mockPage.close).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it("cleans up resources when screenshot fails", async () => {
    const errorMessage = "Screenshot failed";
    mockPage.screenshot.mockRejectedValue(new Error(errorMessage));

    const options = { url: "https://example.com" };
    const result = await screenshot(options);

    expect(result.err).toBe(true);
    expect(result.val).toBe(`Failed to take screenshot: ${errorMessage}`);
    expect(mockPage.close).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  it("handles non-Error exceptions gracefully", async () => {
    mockPage.goto.mockRejectedValue("String error");

    const options = { url: "https://example.com" };
    const result = await screenshot(options);

    expect(result.err).toBe(true);
    expect(result.val).toBe("Failed to take screenshot: String error");
  });
});
