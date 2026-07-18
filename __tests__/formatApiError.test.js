const { formatApiError } = require("../lib/formatApiError");

describe("lib/formatApiError", () => {
  test("appends the detail in parens when present", () => {
    const result = formatApiError({ error: "Could not load briefing.", detail: "GEMINI_API_KEY is missing" });
    expect(result).toBe("Could not load briefing. (GEMINI_API_KEY is missing)");
  });

  test("returns just the error when there's no detail", () => {
    const result = formatApiError({ error: "Could not load briefing." });
    expect(result).toBe("Could not load briefing.");
  });

  test("falls back to the provided default when error is missing", () => {
    const result = formatApiError({}, "Default message.");
    expect(result).toBe("Default message.");
  });

  test("falls back to the built-in default when no data and no fallback given", () => {
    const result = formatApiError(null);
    expect(result).toBe("Something went wrong. Please try again.");
  });
});
