import type { ViewportSize } from "./viewport";

export interface ScreenshotOptions {
  url: string;
  output?: string;
  timeout?: number;
  wait?: number;
  fullPage?: boolean;
  viewport?: ViewportSize;
}
