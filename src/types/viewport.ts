export interface ViewportSize {
  width: number;
  height: number;
}

export type ViewportInput = string | ViewportSize;

export type ViewportPreset = "desktop" | "tablet" | "mobile";

export const VIEWPORT_PRESETS: Record<ViewportPreset, ViewportSize> = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};
