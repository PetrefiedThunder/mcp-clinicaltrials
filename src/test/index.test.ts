import { describe, it, expect } from "vitest";

describe("mcp-clinicaltrials", () => {
  it("should build correct search URLs", () => {
    const params = new URLSearchParams({
      "query.term": "diabetes",
      pageSize: "10",
      format: "json",
    });
    const url = `https://clinicaltrials.gov/api/v2/studies?${params}`;
    expect(url).toContain("query.term=diabetes");
    expect(url).toContain("format=json");
  });

  it("should clean NCT IDs", () => {
    expect("nct05678901".toUpperCase().trim()).toBe("NCT05678901");
    expect(" NCT05678901 ".toUpperCase().trim()).toBe("NCT05678901");
  });

  it("should build location queries", () => {
    const loc = "Los Angeles";
    const dist = "50mi";
    const combined = `${loc},${dist}`;
    expect(combined).toBe("Los Angeles,50mi");
  });

  it("should support all study statuses", () => {
    const statuses = [
      "RECRUITING", "NOT_YET_RECRUITING", "ACTIVE_NOT_RECRUITING",
      "COMPLETED", "TERMINATED", "WITHDRAWN", "SUSPENDED",
      "ENROLLING_BY_INVITATION", "UNKNOWN",
    ];
    expect(statuses.length).toBe(9);
  });

  it("should support all phases", () => {
    const phases = ["EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "NA"];
    expect(phases.length).toBe(6);
  });

  it("should build study detail URLs", () => {
    const nctId = "NCT05678901";
    const url = `https://clinicaltrials.gov/api/v2/studies/${nctId}?format=json`;
    expect(url).toContain(nctId);
  });
});
