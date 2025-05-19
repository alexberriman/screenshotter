import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const { join } = path;
const __dirname = fileURLToPath(new globalThis.URL(".", import.meta.url));

// Helper to execute the CLI and capture output/errors
function runCLI(args: string[]): Promise<{ exitCode: number; stderr: string }> {
  return new Promise((resolve) => {
    const cliPath = join(__dirname, "..", "bin", "screenshotter");
    const child = spawn(cliPath, args, {
      env: { ...process.env, NODE_ENV: "test" },
    });

    let stderr = "";

    child.stdout.on("data", () => {
      // Discard stdout output for these tests
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stderr,
      });
    });

    child.on("error", (error) => {
      resolve({
        exitCode: 1,
        stderr: error.message,
      });
    });
  });
}

describe("CLI error handling integration tests", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "screenshot-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  describe("network errors", () => {
    it("handles unreachable URLs", async () => {
      const { exitCode, stderr } = await runCLI(["https://this-domain-does-not-exist-12345.com"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles timeout errors for slow-loading pages", async () => {
      const { exitCode, stderr } = await runCLI([
        "https://httpstat.us/200?sleep=5000",
        "--timeout",
        "1",
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("timed out");
    }, 15_000); // Increase timeout to 15 seconds

    it("handles connection refused errors", async () => {
      const { exitCode, stderr } = await runCLI(["https://localhost:99999"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });
  });

  describe("invalid input errors", () => {
    it("handles missing URL argument", async () => {
      const { exitCode, stderr } = await runCLI([]);

      expect(exitCode).toBe(1);
      // This regex needs to be more flexible to handle different error message formats
      expect(stderr).toMatch(/error.*url|url.*not.*specified|required.*url/i);
    });

    it("handles invalid URLs", async () => {
      const { exitCode, stderr } = await runCLI(["not-a-valid-url"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles invalid viewport specifications", async () => {
      const { exitCode, stderr } = await runCLI(["https://example.com", "--viewport", "invalid"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles invalid output formats", async () => {
      const { exitCode, stderr } = await runCLI(["https://example.com", "--format", "bmp"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Invalid format");
    });

    it("handles invalid timeout values", async () => {
      const { exitCode, stderr } = await runCLI(["https://example.com", "--timeout", "0"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles invalid wait values", async () => {
      const { exitCode, stderr } = await runCLI(["https://example.com", "--wait", "not-a-number"]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles invalid quality values for JPEG", async () => {
      const { exitCode, stderr } = await runCLI([
        "https://example.com",
        "--format",
        "jpeg",
        "--quality",
        "150",
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("JPEG quality must be between 0 and 100");
    });
  });

  describe("file system errors", () => {
    it("handles non-existent output directory", async () => {
      const nonExistentPath = join("/this/does/not/exist", "screenshot.png");
      const { exitCode, stderr } = await runCLI([
        "https://example.com",
        "--output",
        nonExistentPath,
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles permission errors", async () => {
      // Skip this test on Windows where file permissions work differently
      if (process.platform === "win32") {
        return;
      }

      const readOnlyPath = join(tempDir, "readonly");

      // Create directory
      const mkdirProcess = spawn("/bin/mkdir", [readOnlyPath]);
      await new Promise<void>((resolve) => {
        mkdirProcess.on("close", resolve);
      });

      // Make directory read-only
      const chmodReadOnlyProcess = spawn("/bin/chmod", ["555", readOnlyPath]);
      await new Promise<void>((resolve) => {
        chmodReadOnlyProcess.on("close", resolve);
      });

      const outputPath = join(readOnlyPath, "screenshot.png");
      const { exitCode, stderr } = await runCLI(["https://example.com", "--output", outputPath]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");

      // Clean up - restore permissions
      const chmodWritableProcess = spawn("/bin/chmod", ["755", readOnlyPath]);
      await new Promise<void>((resolve) => {
        chmodWritableProcess.on("close", resolve);
      });
    });
  });

  describe("combination errors", () => {
    it("handles multiple invalid arguments gracefully", async () => {
      const { exitCode, stderr } = await runCLI([
        "not-a-url",
        "--viewport",
        "invalid",
        "--timeout",
        "not-a-number",
        "--wait",
        "-500",
        "--quality",
        "300",
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });

    it("handles both network and filesystem errors", async () => {
      const nonExistentPath = join("/this/does/not/exist", "screenshot.png");
      const { exitCode, stderr } = await runCLI([
        "https://this-domain-does-not-exist-12345.com",
        "--output",
        nonExistentPath,
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
    });
  });

  describe("error message formatting", () => {
    it("provides clear error messages for common issues", async () => {
      const { exitCode, stderr } = await runCLI(["https://example.com", "--viewport", "phone"]);

      // Error message should be user-friendly
      expect(exitCode).toBe(1);
      expect(stderr).toContain("Error:");
      expect(stderr).not.toContain("stack trace");
      expect(stderr).not.toContain("at Object");
    });

    it("exits cleanly without hanging on errors", async () => {
      const startTime = Date.now();
      const { exitCode } = await runCLI(["https://this-will-fail.com", "--timeout", "1000"]);

      const duration = Date.now() - startTime;

      expect(exitCode).toBe(1);
      expect(duration).toBeLessThan(3000); // Should exit quickly, not wait full timeout
    });
  });
});
