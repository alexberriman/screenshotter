import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  shims: true,
  target: "node18",
  splitting: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
  esbuildOptions(options) {
    // Ensure the output is executable
    options.platform = "node";
  },
});
