const {
  GATES,
  SECTIONS,
  TRANSPORT_OPTIONS,
  EMERGENCY_PROTOCOLS,
  TOURNAMENT_CONTEXT,
  getLiveCrowdDensity,
} = require("../lib/stadiumData");

describe("stadiumData", () => {
  test("every section references a real gate", () => {
    const gateIds = GATES.map((g) => g.id);
    SECTIONS.forEach((section) => {
      expect(gateIds).toContain(section.nearestGate);
    });
  });

  test("every transport option references a real gate", () => {
    const gateIds = GATES.map((g) => g.id);
    TRANSPORT_OPTIONS.forEach((t) => {
      expect(gateIds).toContain(t.nearestGate);
    });
  });

  test("getLiveCrowdDensity returns one entry per gate, within 0-100", () => {
    const crowd = getLiveCrowdDensity();
    expect(crowd).toHaveLength(GATES.length);
    crowd.forEach((c) => {
      expect(c.density).toBeGreaterThanOrEqual(0);
      expect(c.density).toBeLessThanOrEqual(100);
      expect(["normal", "busy", "critical"]).toContain(c.status);
    });
  });

  test("getLiveCrowdDensity is stable within the same minute (deterministic seed)", () => {
    const first = getLiveCrowdDensity();
    const second = getLiveCrowdDensity();
    expect(first).toEqual(second);
  });

  test("every emergency protocol has a label and at least one step", () => {
    Object.values(EMERGENCY_PROTOCOLS).forEach((protocol) => {
      expect(protocol.label).toEqual(expect.any(String));
      expect(protocol.steps.length).toBeGreaterThan(0);
    });
  });

  test("tournament context grounds the match/venue for tournament-operations queries", () => {
    expect(TOURNAMENT_CONTEXT.tournament).toBe("FIFA World Cup 2026");
    expect(TOURNAMENT_CONTEXT.venue).toEqual(expect.any(String));
    expect(TOURNAMENT_CONTEXT.hostCities.length).toBeGreaterThan(0);
    expect(TOURNAMENT_CONTEXT.volunteerShiftsOnDuty).toBeGreaterThan(0);
  });
});
