import type { Page } from "playwright";

export async function captureFullPageWithScroll(page: Page, path: string, format: "png" | "jpeg", quality?: number): Promise<void> {
  // First, trigger all lazy loaded content by scrolling
  let previousHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  let currentHeight = previousHeight;
  let attempts = 0;
  
  while (attempts < 10) {
    // Scroll to bottom  
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);
    
    currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    if (currentHeight === previousHeight) break;
    
    previousHeight = currentHeight;
    attempts++;
  }
  
  // Scroll back to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
  
  // Take the screenshot with Playwright's fullPage option
  // This should handle fixed headers correctly
  await page.screenshot({
    path,
    fullPage: true,
    type: format,
    ...(format === "jpeg" && { quality }),
    animations: "disabled", // Disable animations for consistent screenshots
  });
}