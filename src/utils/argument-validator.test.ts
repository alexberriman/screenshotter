import { describe, it, expect } from "vitest";
import {
  validateFormat,
  validateQuality,
  validateTimeout,
  validateWait,
  validateRetryAttempts,
  validateRetryDelay,
  validateRetryBackoff,
  validateUrl,
} from "./argument-validator";

describe("Argument Validation", () => {
  describe("validateFormat", () => {
    it("should accept valid formats", () => {
      expect(validateFormat("png").ok).toBe(true);
      expect(validateFormat("png").val).toBe("png");
      expect(validateFormat("jpeg").ok).toBe(true);
      expect(validateFormat("jpeg").val).toBe("jpeg");
    });

    it("should reject invalid formats", () => {
      const result = validateFormat("gif");
      expect(result.ok).toBe(false);
      expect(result.val).toBe('Invalid format "gif". Must be "png" or "jpeg".');
    });
  });

  describe("validateQuality", () => {
    it("should accept valid quality values", () => {
      const result = validateQuality("50");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(50);
    });

    it("should reject non-numeric quality", () => {
      const result = validateQuality("abc");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Quality must be a valid number.");
    });

    it("should reject JPEG quality out of range", () => {
      const result1 = validateQuality("101", "jpeg");
      expect(result1.ok).toBe(false);
      expect(result1.val).toBe("JPEG quality must be between 0 and 100.");

      const result2 = validateQuality("-1", "jpeg");
      expect(result2.ok).toBe(false);
      expect(result2.val).toBe("JPEG quality must be between 0 and 100.");
    });

    it("should accept any quality for PNG", () => {
      const result = validateQuality("150", "png");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(150);
    });
  });

  describe("validateTimeout", () => {
    it("should accept valid timeout and convert to milliseconds", () => {
      const result = validateTimeout("30");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(30_000);
    });

    it("should reject non-numeric timeout", () => {
      const result = validateTimeout("abc");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Timeout must be a valid number.");
    });

    it("should reject zero or negative timeout", () => {
      const result1 = validateTimeout("0");
      expect(result1.ok).toBe(false);
      expect(result1.val).toBe("Timeout must be greater than 0.");

      const result2 = validateTimeout("-5");
      expect(result2.ok).toBe(false);
      expect(result2.val).toBe("Timeout must be greater than 0.");
    });
  });

  describe("validateWait", () => {
    it("should accept valid wait time and convert to milliseconds", () => {
      const result = validateWait("5");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(5000);
    });

    it("should accept zero wait time", () => {
      const result = validateWait("0");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(0);
    });

    it("should reject non-numeric wait time", () => {
      const result = validateWait("abc");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Wait time must be a valid number.");
    });

    it("should reject negative wait time", () => {
      const result = validateWait("-5");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Wait time cannot be negative.");
    });
  });

  describe("validateRetryAttempts", () => {
    it("should accept valid retry attempts", () => {
      const result = validateRetryAttempts("3");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(3);
    });

    it("should reject non-numeric retry attempts", () => {
      const result = validateRetryAttempts("abc");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Retry attempts must be a valid number.");
    });

    it("should reject zero or negative retry attempts", () => {
      const result1 = validateRetryAttempts("0");
      expect(result1.ok).toBe(false);
      expect(result1.val).toBe("Retry attempts must be greater than 0.");

      const result2 = validateRetryAttempts("-1");
      expect(result2.ok).toBe(false);
      expect(result2.val).toBe("Retry attempts must be greater than 0.");
    });
  });

  describe("validateRetryDelay", () => {
    it("should accept valid retry delay", () => {
      const result = validateRetryDelay("1000");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(1000);
    });

    it("should accept zero retry delay", () => {
      const result = validateRetryDelay("0");
      expect(result.ok).toBe(true);
      expect(result.val).toBe(0);
    });

    it("should reject non-numeric retry delay", () => {
      const result = validateRetryDelay("abc");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Retry delay must be a valid number.");
    });

    it("should reject negative retry delay", () => {
      const result = validateRetryDelay("-100");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Retry delay cannot be negative.");
    });
  });

  describe("validateRetryBackoff", () => {
    it("should accept valid backoff strategies", () => {
      expect(validateRetryBackoff("exponential").val).toBe("exponential");
      expect(validateRetryBackoff("linear").val).toBe("linear");
      expect(validateRetryBackoff("fixed").val).toBe("fixed");
    });

    it("should reject invalid backoff strategies", () => {
      const result = validateRetryBackoff("random");
      expect(result.ok).toBe(false);
      expect(result.val).toBe(
        'Invalid retry backoff strategy "random". Must be one of: exponential, linear, fixed.'
      );
    });
  });

  describe("validateUrl", () => {
    it("should accept valid URLs", () => {
      expect(validateUrl("https://example.com").ok).toBe(true);
      expect(validateUrl("http://localhost:3000").ok).toBe(true);
      expect(validateUrl("file:///path/to/file.html").ok).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = validateUrl("not a url");
      expect(result.ok).toBe(false);
      expect(result.val).toBe("Invalid URL: not a url");
    });
  });
});
