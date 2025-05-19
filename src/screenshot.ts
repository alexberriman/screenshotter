import { chromium, Browser, Page } from "playwright";
import { Ok, Err, Result } from "ts-results";
import type { ScreenshotOptions } from "./types/screenshot";
import { generateFilename } from "./utils/filename";

export async function screenshot(options: ScreenshotOptions): Promise<Result<string, string>> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch();
    page = await browser.newPage();

    // Navigate to URL with timeout
    await page.goto(options.url, {
      timeout: options.timeout || 30_000,
      waitUntil: "networkidle",
    });

    // Additional wait if specified
    if (options.wait) {
      await page.waitForTimeout(options.wait);
    }

    // Generate output filename if not provided
    const outputPath = options.output || generateFilename();

    // Take screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: options.fullPage !== false, // Default to true
    });

    return Ok(outputPath);
  } catch (error) {
    return Err(
      `Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
