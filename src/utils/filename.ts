export function generateFilename(): string {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  return `screenshot-${timestamp}.png`;
}
