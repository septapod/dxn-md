import { describe, expect, it } from "vitest";
import { pickVariant, targetPath } from "../middleware.js";

describe("content negotiation (AE1 decision logic)", () => {
  it("prefers markdown when Accept asks for it", () => {
    expect(pickVariant("text/markdown")).toBe("markdown");
    expect(pickVariant("text/markdown, text/html;q=0.5")).toBe("markdown");
  });

  it("serves HTML to browsers", () => {
    expect(pickVariant("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe("html");
    expect(pickVariant(null)).toBe("html");
    expect(pickVariant("*/*")).toBe("html");
  });

  it("serves JSON when preferred", () => {
    expect(pickVariant("application/json")).toBe("json");
  });

  it("respects q-values when html outranks markdown", () => {
    expect(pickVariant("text/markdown;q=0.3, text/html;q=0.9")).toBe("html");
    expect(pickVariant("text/markdown;q=0")).toBe("html");
  });

  it("maps routes to variant paths", () => {
    expect(targetPath("/services", "markdown")).toBe("/services.md");
    expect(targetPath("/", "markdown")).toBe("/index.md");
    expect(targetPath("/newsletter/some-issue", "json")).toBe("/newsletter/some-issue.json");
    expect(targetPath("/services", "html")).toBeNull();
  });
});
