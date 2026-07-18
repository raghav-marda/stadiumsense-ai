const { buildSystemPrompt } = require("../lib/orchestrator");

describe("orchestrator.buildSystemPrompt", () => {
  const prompt = buildSystemPrompt("हिंदी (Hindi)");

  test("mentions all seven capability areas", () => {
    [
      "Navigation",
      "Crowd management",
      "Accessibility",
      "Transportation",
      "Multilingual",
      "Operational intelligence",
      "Real-time decision support",
    ].forEach((area) => {
      expect(prompt).toEqual(expect.stringContaining(area));
    });
  });

  test("injects the requested language", () => {
    expect(prompt).toEqual(expect.stringContaining("हिंदी (Hindi)"));
  });

  test("grounds the prompt in live gate data", () => {
    expect(prompt).toMatch(/Gate A/);
    expect(prompt).toMatch(/LIVE CROWD DENSITY/);
  });

  test("grounds the prompt in the tournament/match context and mentions volunteers", () => {
    expect(prompt).toEqual(expect.stringContaining("FIFA World Cup 2026"));
    expect(prompt).toMatch(/volunteer/i);
  });
});
