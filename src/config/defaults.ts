export const DEFAULT_CONFIG = {
  timeout: 30_000, // 30 seconds
  fullPage: true,
  format: "png" as const,
  retry: {
    enabled: false,
    maxAttempts: 3,
    delay: 1000, // 1 second
    backoff: "exponential" as const, // exponential, linear, fixed
  },
};
