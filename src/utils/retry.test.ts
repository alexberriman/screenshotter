import { describe, it, expect, vi } from "vitest";
import { retry, isRetryableError } from "./retry";

describe("retry", () => {
  it("should succeed on first attempt", async () => {
    const fn = vi.fn().mockResolvedValueOnce("success");

    const result = await retry(fn, {
      maxAttempts: 3,
      delay: 1000,
      backoff: "exponential",
    });

    expect(result.ok).toBe(true);
    expect(result.val).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"))
      .mockResolvedValueOnce("success");

    const result = await retry(fn, {
      maxAttempts: 3,
      delay: 100,
      backoff: "fixed",
    });

    expect(result.ok).toBe(true);
    expect(result.val).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should fail after max attempts", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));

    const result = await retry(fn, {
      maxAttempts: 3,
      delay: 10,
      backoff: "fixed",
    });

    expect(result.err).toBe(true);
    expect(result.val).toBe("Failed after 3 attempts: always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should use exponential backoff", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const startTime = Date.now();

    await retry(fn, {
      maxAttempts: 3,
      delay: 100,
      backoff: "exponential",
    });

    const elapsed = Date.now() - startTime;
    // Should wait 100ms (1st attempt) + 200ms (2nd attempt) = 300ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(300);
  });

  it("should use linear backoff", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const startTime = Date.now();

    await retry(fn, {
      maxAttempts: 3,
      delay: 100,
      backoff: "linear",
    });

    const elapsed = Date.now() - startTime;
    // Should wait 100ms (1st attempt) + 200ms (2nd attempt) = 300ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(300);
  });

  it("should call onAttempt callback", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    const onAttempt = vi.fn();

    await retry(fn, {
      maxAttempts: 2,
      delay: 10,
      backoff: "fixed",
      onAttempt,
    });

    expect(onAttempt).toHaveBeenCalledTimes(2);
    expect(onAttempt).toHaveBeenCalledWith(1, expect.any(Error));
    expect(onAttempt).toHaveBeenCalledWith(2, expect.any(Error));
  });
});

describe("isRetryableError", () => {
  it("should identify timeout errors as retryable", () => {
    expect(isRetryableError(new Error("Request timeout exceeded"))).toBe(true);
    expect(isRetryableError(new Error("Navigation timeout"))).toBe(true);
    expect(isRetryableError(new Error("ETIMEDOUT"))).toBe(true);
  });

  it("should identify network errors as retryable", () => {
    expect(isRetryableError(new Error("Network failed"))).toBe(true);
    expect(isRetryableError(new Error("Connection refused"))).toBe(true);
    expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true);
    expect(isRetryableError(new Error("ECONNRESET"))).toBe(true);
    expect(isRetryableError(new Error("net::ERR_CONNECTION_REFUSED"))).toBe(true);
  });

  it("should identify navigation errors as retryable", () => {
    expect(isRetryableError(new Error("Failed to navigate to page"))).toBe(true);
    expect(isRetryableError(new Error("Navigation failed"))).toBe(true);
  });

  it("should not identify other errors as retryable", () => {
    expect(isRetryableError(new Error("File not found"))).toBe(false);
    expect(isRetryableError(new Error("Invalid argument"))).toBe(false);
    expect(isRetryableError(new Error("Permission denied"))).toBe(false);
  });
});
