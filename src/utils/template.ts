export function formatTemplate(template: string, values: Record<string, string>): string {
  return template.replaceAll(/{(\w+)}/g, (match, key) => {
    return values[key] || match;
  });
}

export interface TemplateValues {
  timestamp: string;
  date: string;
  time: string;
  domain: string;
  format: string;
}

export function getTemplateValues(url: string, format: string): Record<string, string> {
  const now = new Date();
  const urlObj = new globalThis.URL(url);
  const domain = urlObj.hostname;

  return {
    timestamp: now.toISOString().replaceAll(/[:.]/g, "-"),
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().split(" ")[0].replaceAll(":", "-"),
    domain: domain.replaceAll(".", "_"),
    format,
  };
}
