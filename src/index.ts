#!/usr/bin/env node

import { program } from "commander";
import { version, description } from "../package.json";
import { screenshot } from "./screenshot";
import type { ScreenshotOptions } from "./types/screenshot";

program
  .version(version)
  .description(description)
  .argument("<url>", "URL to screenshot")
  .option("-o, --output <path>", "Output file path")
  .option("-t, --timeout <seconds>", "Page load timeout in seconds", "30")
  .option("-w, --wait <seconds>", "Additional wait after page load")
  .option("--no-full-page", "Capture only viewport")
  .action(
    async (
      url: string,
      options: { output?: string; timeout: string; wait?: string; fullPage?: boolean }
    ) => {
      try {
        const screenshotOptions: ScreenshotOptions = {
          url,
          output: options.output,
          timeout: Number.parseInt(options.timeout) * 1000,
          wait: options.wait ? Number.parseInt(options.wait) * 1000 : undefined,
          fullPage: options.fullPage,
        };

        const result = await screenshot(screenshotOptions);

        if (result.err) {
          console.error(`Error: ${result.val}`);
          process.exit(1);
        }

        console.log(`Screenshot saved to: ${result.val}`);
        process.exit(0);
      } catch (error) {
        console.error(`Unexpected error: ${error}`);
        process.exit(1);
      }
    }
  );

program.parse();
