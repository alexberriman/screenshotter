import type { ViewportSize } from "./viewport";

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
}
