import { describe, expect, it } from "vitest";
import { countIssuesBySeverity } from "./review";
import type { ReviewIssue } from "./review";

const issues: ReviewIssue[] = [
  { id: "1", title: "A", description: "A", severity: "critical", category: "security", suggestion: "", explanation: "" },
  { id: "2", title: "B", description: "B", severity: "high", category: "bug", suggestion: "", explanation: "" },
  { id: "3", title: "C", description: "C", severity: "high", category: "bug", suggestion: "", explanation: "" },
];

describe("countIssuesBySeverity", () => {
  it("counts issues by severity", () => {
    expect(countIssuesBySeverity(issues)).toEqual({
      total: 3,
      critical: 1,
      high: 2,
      medium: 0,
      low: 0,
      info: 0,
    });
  });
});
