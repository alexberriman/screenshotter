import { describe, it, expect, afterEach } from "vitest";
import { screenshot } from "./screenshot";
import { existsSync, unlinkSync } from "node:fs";

describe("viewport integration test", () => {
  const testUrl = "https://example.com";
  const outputFile = "test-viewport.png";

  afterEach(() => {
    if (existsSync(outputFile)) {
      unlinkSync(outputFile);
    }
  });

  it("takes screenshot with desktop viewport preset", async () => {
    const result = await screenshot({
      url: testUrl,
      output: outputFile,
      viewport: { width: 1920, height: 1080 },
      timeout: 10_000,
    });

    expect(result.ok).toBe(true);
    expect(existsSync(outputFile)).toBe(true);
  });

  it("takes screenshot with mobile viewport", async () => {
    const result = await screenshot({
      url: testUrl,
      output: outputFile,
      viewport: { width: 375, height: 667 },
      timeout: 10_000,
    });

    expect(result.ok).toBe(true);
    expect(existsSync(outputFile)).toBe(true);
  });
});
