import { describe, it, expect } from "vitest";
import { formatTemplate, getTemplateValues } from "./template";

describe("formatTemplate", () => {
  it("replaces placeholders with values", () => {
    const template = "{greeting} {name}!";
    const values = { greeting: "Hello", name: "World" };

    const result = formatTemplate(template, values);

    expect(result).toBe("Hello World!");
  });

  it("leaves unmatched placeholders unchanged", () => {
    const template = "{greeting} {name} from {place}!";
    const values = { greeting: "Hello", name: "World" };

    const result = formatTemplate(template, values);

    expect(result).toBe("Hello World from {place}!");
  });

  it("handles empty values object", () => {
    const template = "{greeting} {name}!";
    const values = {};

    const result = formatTemplate(template, values);

    expect(result).toBe("{greeting} {name}!");
  });
});

describe("getTemplateValues", () => {
  it("returns all template values", () => {
    const url = "https://example.com/path";
    const format = "png";

    const values = getTemplateValues(url, format);

    expect(values).toHaveProperty("timestamp");
    expect(values).toHaveProperty("date");
    expect(values).toHaveProperty("time");
    expect(values).toHaveProperty("domain");
    expect(values).toHaveProperty("format");
    expect(values.domain).toBe("example_com");
    expect(values.format).toBe("png");
  });

  it("handles different URL formats", () => {
    const url = "https://sub.example.com:8080/path?query=1";
    const format = "jpeg";

    const values = getTemplateValues(url, format);

    expect(values.domain).toBe("sub_example_com");
    expect(values.format).toBe("jpeg");
  });

  it("generates valid timestamp format", () => {
    const url = "https://example.com";
    const format = "png";

    const values = getTemplateValues(url, format);

    expect(values.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
  });

  it("generates valid date format", () => {
    const url = "https://example.com";
    const format = "png";

    const values = getTemplateValues(url, format);

    expect(values.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("generates valid time format", () => {
    const url = "https://example.com";
    const format = "png";

    const values = getTemplateValues(url, format);

    expect(values.time).toMatch(/^\d{2}-\d{2}-\d{2}$/);
  });
});
