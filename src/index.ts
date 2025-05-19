import { program } from "commander";
import { version, description } from "../package.json";
import { screenshot } from "./screenshot";
import type { ScreenshotOptions } from "./types/screenshot";
import { parseViewport } from "./utils/viewport-parser";

program
  .version(version)
  .description(description)
  .argument("<url>", "URL to screenshot")
  .option("-o, --output <path>", "Output file path")
  .option("-t, --timeout <seconds>", "Page load timeout in seconds", "30")
  .option("-w, --wait <seconds>", "Additional wait after page load")
  .option("--wait-for <selector>", "Wait for specific CSS selector to appear")
  .option("--no-full-page", "Capture only viewport")
  .option(
    "-v, --viewport <size>",
    "Viewport size (e.g., '1920x1080' or 'desktop', 'tablet', 'mobile')"
  )
  .action(
    async (
      url: string,
      options: {
        output?: string;
        timeout: string;
        wait?: string;
        waitFor?: string;
        fullPage?: boolean;
        viewport?: string;
      }
    ) => {
      try {
        const screenshotOptions: ScreenshotOptions = {
          url,
          output: options.output,
          timeout: Number.parseInt(options.timeout) * 1000,
          wait: options.wait ? Number.parseInt(options.wait) * 1000 : undefined,
          waitFor: options.waitFor,
          fullPage: options.fullPage,
        };

        if (options.viewport) {
          const viewportResult = parseViewport(options.viewport);
          if (viewportResult.err) {
            console.error(`Error: ${viewportResult.val}`);
            process.exit(1);
          }
          screenshotOptions.viewport = viewportResult.val;
        }

        const result = await screenshot(screenshotOptions);

        if (result.err) {
          console.error(`Error: ${result.val}`);
          process.exit(1);
        }

        console.log(`Screenshot saved to: ${result.val}`);
        process.exit(0);
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    }
  );

program.parse();
