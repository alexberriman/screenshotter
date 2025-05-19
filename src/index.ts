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
        format: string;
        quality: string;
        template?: string;
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
          format: options.format as "png" | "jpeg",
          quality: Number.parseInt(options.quality),
          template: options.template,
        };

        // Validate format
        if (options.format && !["png", "jpeg"].includes(options.format)) {
          console.error(`Error: Invalid format "${options.format}". Must be "png" or "jpeg".`);
          process.exit(1);
        }

        // Validate quality
        const quality = screenshotOptions.quality;
        if (
          options.format === "jpeg" &&
          quality !== undefined &&
          (Number.isNaN(quality) || quality < 0 || quality > 100)
        ) {
          console.error("Error: JPEG quality must be between 0 and 100.");
          process.exit(1);
        }

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
