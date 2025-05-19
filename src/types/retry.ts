export type BackoffStrategy = "exponential" | "linear" | "fixed";

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  delay: number;
  backoff: BackoffStrategy;
}
