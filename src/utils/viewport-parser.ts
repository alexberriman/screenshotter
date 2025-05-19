import type { Result } from "ts-results";
import tsResults from "ts-results";
const { Ok, Err } = tsResults;
import type { ViewportSize, ViewportInput, ViewportPreset } from "../types/viewport";
import { VIEWPORT_PRESETS } from "../types/viewport";

function isViewportPreset(input: string): input is ViewportPreset {
  return input in VIEWPORT_PRESETS;
}

export function parseViewport(input: ViewportInput): Result<ViewportSize, string> {
  if (typeof input === "object") {
    if (!input.width || !input.height) {
      return Err("Invalid viewport object: width and height are required");
    }
    return Ok(input);
  }

  const normalized = input.toLowerCase().trim();

  if (isViewportPreset(normalized)) {
    return Ok(VIEWPORT_PRESETS[normalized]);
  }

  const pattern = /^(\d+)\s*x\s*(\d+)$/;
  const match = pattern.exec(normalized);
  if (!match) {
    return Err(
      "Invalid viewport format. Expected 'WIDTHxHEIGHT' (e.g., '1920x1080') or preset (desktop, tablet, mobile)"
    );
  }

  const width = Number.parseInt(match[1], 10);
  const height = Number.parseInt(match[2], 10);

  if (width <= 0 || height <= 0) {
    return Err("Viewport dimensions must be positive numbers");
  }

  return Ok({ width, height });
}
