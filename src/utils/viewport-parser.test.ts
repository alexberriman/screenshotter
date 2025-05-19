import { describe, it, expect } from "vitest";
import { parseViewport } from "./viewport-parser";

describe("parseViewport", () => {
  it("parses viewport preset 'desktop'", () => {
    const result = parseViewport("desktop");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 1920, height: 1080 });
  });

  it("parses viewport preset 'tablet'", () => {
    const result = parseViewport("tablet");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 768, height: 1024 });
  });

  it("parses viewport preset 'mobile'", () => {
    const result = parseViewport("mobile");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 375, height: 667 });
  });

  it("parses viewport preset case-insensitively", () => {
    const result = parseViewport("DESKTOP");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 1920, height: 1080 });
  });

  it("parses custom viewport dimensions", () => {
    const result = parseViewport("1280x720");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 1280, height: 720 });
  });

  it("parses dimensions with spaces", () => {
    const result = parseViewport("1280 x 720");
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 1280, height: 720 });
  });

  it("accepts viewport object", () => {
    const result = parseViewport({ width: 1024, height: 768 });
    expect(result.ok).toBe(true);
    expect(result.val).toEqual({ width: 1024, height: 768 });
  });

  it("returns error for invalid format", () => {
    const result = parseViewport("invalid");
    expect(result.err).toBe(true);
    expect(result.val).toContain("Invalid viewport format");
  });

  it("returns error for negative dimensions", () => {
    const result = parseViewport("-100x200");
    expect(result.err).toBe(true);
    expect(result.val).toContain("Invalid viewport format");
  });

  it("returns error for zero dimensions", () => {
    const result = parseViewport("0x200");
    expect(result.err).toBe(true);
    expect(result.val).toContain("Viewport dimensions must be positive numbers");
  });

  it("returns error for invalid object", () => {
    const result = parseViewport({ width: 100 } as unknown as { width: number; height: number });
    expect(result.err).toBe(true);
    expect(result.val).toContain("Invalid viewport object");
  });
});
