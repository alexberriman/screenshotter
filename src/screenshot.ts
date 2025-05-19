import { chromium, Browser, Page } from "playwright";
import tsResults from "ts-results";
const { Ok, Err } = tsResults;
import type { ScreenshotOptions } from "./types/screenshot";
import { generateFilename } from "./utils/filename";
import { formatTemplate, getTemplateValues } from "./utils/template";
import { retry, isRetryableError } from "./utils/retry";
import { DEFAULT_CONFIG } from "./config/defaults";
import { formatError } from "./utils/error-formatter";

async function setupPage(browser: Browser, options: ScreenshotOptions): Promise<Page> {
  const page = await browser.newPage();

  if (options.viewport) {
    await page.setViewportSize(options.viewport);
  }

  return page;
}

async function navigateToUrl(page: Page, options: ScreenshotOptions): Promise<void> {
  const timeout = options.timeout || DEFAULT_CONFIG.timeout;
  await page.goto(options.url, {
    timeout,
    waitUntil: "networkidle",
  });
}

async function applyWaitStrategies(page: Page, options: ScreenshotOptions): Promise<void> {
  const timeout = options.timeout || DEFAULT_CONFIG.timeout;

  if (options.waitFor) {
    await page.waitForSelector(options.waitFor, { timeout });
  }

  if (options.wait) {
    await page.waitForTimeout(options.wait);
  }
}

function generateOutputPath(options: ScreenshotOptions): string {
  if (options.output) {
    return options.output;
  }

  if (options.template) {
    const values = getTemplateValues(options.url, options.format || "png");
    return formatTemplate(options.template, values);
  }

  return generateFilename({ format: options.format });
}

async function captureScreenshot(
  page: Page,
  outputPath: string,
  options: ScreenshotOptions
): Promise<void> {
  await page.screenshot({
    path: outputPath,
    fullPage: options.fullPage !== false,
    type: options.format || "png",
    ...(options.format === "jpeg" && { quality: options.quality }),
  });
}

function handleError(error: unknown, options: ScreenshotOptions): never {
  const errorMessage = formatError(error, options);
  // Don't re-wrap if it's already a formatted error
  if (error instanceof Error && error.message.startsWith("Failed to take screenshot:")) {
    throw error;
  }
  throw new Error(errorMessage);
}

async function takeScreenshot(options: ScreenshotOptions): Promise<string> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch();
    page = await setupPage(browser, options);

    await navigateToUrl(page, options);
    await applyWaitStrategies(page, options);

    const outputPath = generateOutputPath(options);
    await captureScreenshot(page, outputPath, options);

    return outputPath;
  } catch (error) {
    handleError(error, options);
    throw error; // This line will never be reached because handleError always throws
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

export async function screenshot(
  options: ScreenshotOptions
): Promise<tsResults.Result<string, string>> {
  const retryConfig = options.retry || DEFAULT_CONFIG.retry;

  // If retry is disabled, just take the screenshot once
  if (!retryConfig.enabled) {
    try {
      const result = await takeScreenshot(options);
      return Ok(result);
    } catch (error) {
      return Err(formatError(error, options));
    }
  }

  // Use retry utility but only for retryable errors
  const result = await retry(() => takeScreenshot(options), {
    maxAttempts: retryConfig.maxAttempts,
    delay: retryConfig.delay,
    backoff: retryConfig.backoff,
    onAttempt: (attempt, error) => {
      // If it's not a retryable error, don't continue retrying
      if (!isRetryableError(error)) {
        throw error;
      }
      console.error(`Attempt ${attempt} failed with retryable error: ${error.message}`);
    },
  });

  if (result.err) {
    return Err(result.val);
  }

  return Ok(result.val);
}
