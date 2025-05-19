import type { ViewportSize } from "./viewport";
import type { RetryConfig } from "./retry";

export interface ScreenshotOptions {
  url: string;
  output?: string;
  timeout?: number;
  wait?: number;
  waitFor?: string;
  fullPage?: boolean;
  viewport?: ViewportSize;
  format?: "png" | "jpeg";
  quality?: number;
  template?: string;
  retry?: RetryConfig;
  trimWhitespace?: boolean;
}
