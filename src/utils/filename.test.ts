import { describe, it, expect } from "vitest";
import { generateFilename } from "./filename";

describe("generateFilename", () => {
  it("generates a filename with correct format", () => {
    const filename = generateFilename();

    expect(filename).toMatch(/^screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png$/);
  });

  it("generates a jpeg filename with correct format", () => {
    const filename = generateFilename({ format: "jpeg" });

    expect(filename).toMatch(/^screenshot-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.jpeg$/);
  });

  it("includes screenshot prefix", () => {
    const filename = generateFilename();

    expect(filename).toMatch(/^screenshot-/);
  });

  it("includes png extension by default", () => {
    const filename = generateFilename();

    expect(filename).toMatch(/\.png$/);
  });

  it("generates unique filenames for sequential calls", async () => {
    const filename1 = generateFilename();
    await new Promise((resolve) => globalThis.setTimeout(resolve, 2)); // Small delay
    const filename2 = generateFilename();

    expect(filename1).not.toBe(filename2);
  });
});
