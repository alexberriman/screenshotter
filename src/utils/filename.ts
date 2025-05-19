export function generateFilename(options?: { format?: string }): string {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const format = options?.format || "png";
  return `screenshot-${timestamp}.${format}`;
}
