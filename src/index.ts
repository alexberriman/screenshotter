import { program } from "commander";
import { version, description } from "../package.json";
import { screenshot } from "./screenshot";
import type { ScreenshotOptions } from "./types/screenshot";
import { parseViewport } from "./utils/viewport-parser";
import { validateTimeout, validateWait, validateUrl } from "./utils/argument-validator";

interface CLIOptions {
  output?: string;
  timeout: string;
  wait?: string;
  waitFor?: string;
  fullPage?: boolean;
  viewport?: string;
  format: string;
  quality: string;
  template?: string;
  retry?: boolean;
  retryAttempts?: string;
  retryDelay?: string;
  retryBackoff?: string;
}

function handleError(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function validateInputs(url: string, options: CLIOptions): void {
  // Validate URL
  const urlResult = validateUrl(url);
  if (urlResult.err) {
    handleError(urlResult.val);
  }

  // Validate timeout
  const timeoutResult = validateTimeout(options.timeout);
  if (timeoutResult.err) {
    handleError(timeoutResult.val);
  }

  // Validate wait time if provided
  if (options.wait) {
    const waitResult = validateWait(options.wait);
    if (waitResult.err) {
      handleError(waitResult.val);
    }
  }

  // Validate format
  if (options.format && !["png", "jpeg"].includes(options.format)) {
    handleError(`Invalid format "${options.format}". Must be "png" or "jpeg".`);
  }

  // Validate quality
  const quality = Number.parseInt(options.quality);
  if (options.format === "jpeg" && (Number.isNaN(quality) || quality < 0 || quality > 100)) {
    handleError("JPEG quality must be between 0 and 100.");
  }
}

function buildScreenshotOptions(url: string, options: CLIOptions): ScreenshotOptions {
  const timeoutResult = validateTimeout(options.timeout);
  if (timeoutResult.err) {
    handleError(timeoutResult.val);
  }

  let waitValue: number | undefined;
  if (options.wait) {
    const waitResult = validateWait(options.wait);
    if (waitResult.err) {
      handleError(waitResult.val);
    }
    waitValue = waitResult.val;
  }

  const screenshotOptions: ScreenshotOptions = {
    url,
    output: options.output,
    timeout: timeoutResult.val,
    wait: waitValue,
    waitFor: options.waitFor,
    fullPage: options.fullPage,
    format: options.format as "png" | "jpeg",
    quality: Number.parseInt(options.quality),
    template: options.template,
  };

  // Parse viewport if provided
  if (options.viewport) {
    const viewportResult = parseViewport(options.viewport);
    if (viewportResult.err) {
      handleError(viewportResult.val);
    }
    screenshotOptions.viewport = viewportResult.val;
  }

  // Configure retry options if enabled
  if (options.retry) {
    screenshotOptions.retry = {
      enabled: true,
      maxAttempts: Number.parseInt(options.retryAttempts || "3"),
      delay: Number.parseInt(options.retryDelay || "1000"),
      backoff: (options.retryBackoff || "exponential") as "exponential" | "linear" | "fixed",
    };
  }

  return screenshotOptions;
}

async function handleScreenshot(url: string, options: CLIOptions): Promise<void> {
  try {
    validateInputs(url, options);
    const screenshotOptions = buildScreenshotOptions(url, options);
    const result = await screenshot(screenshotOptions);

    if (result.err) {
      handleError(result.val);
    }

    console.log(`Screenshot saved to: ${result.val}`);
    process.exit(0);
  } catch (error) {
    handleError(error instanceof Error ? error.message : String(error));
  }
}

program
  .version(version)
  .description(description)
  .argument("<url>", "URL to screenshot")
  .option("-o, --output <path>", "Output file path")
  .option("-t, --timeout <seconds>", "Page load timeout in seconds", "30")
  .option("-w, --wait <seconds>", "Additional wait after page load")
  .option("--wait-for <selector>", "Wait for specific CSS selector to appear")
  .option("--no-full-page", "Capture only viewport")
  .option("--format <format>", "Output format (png or jpeg)", "png")
  .option("--quality <number>", "JPEG quality (0-100)", "80")
  .option(
    "--template <template>",
    "Filename template with placeholders: {timestamp}, {date}, {time}, {domain}, {format}"
  )
  .option(
    "-v, --viewport <size>",
    "Viewport size (e.g., '1920x1080' or 'desktop', 'tablet', 'mobile')"
  )
  .option("--retry", "Enable retry on failure", false)
  .option("--retry-attempts <number>", "Max retry attempts (default: 3)", "3")
  .option("--retry-delay <ms>", "Initial retry delay in milliseconds (default: 1000)", "1000")
  .option(
    "--retry-backoff <strategy>",
    "Retry backoff strategy: exponential, linear, fixed (default: exponential)",
    "exponential"
  )
  .action(handleScreenshot);

program.parse();
