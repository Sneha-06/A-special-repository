import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { ReviewIssueList } from "./ReviewIssueList";
import { renderWithTheme } from "../../test/renderWithTheme";
import type { ReviewIssue } from "../../types/review";

const issues: ReviewIssue[] = [
  {
    id: "ISSUE-001",
    title: "Unused variable",
    description: "Variable x is never used.",
    severity: "low",
    category: "code-quality",
    lineStart: 4,
    suggestion: "Remove unused variable.",
    explanation: "Dead code increases noise.",
  },
];

describe("ReviewIssueList", () => {
  it("shows empty state when there are no issues", () => {
    renderWithTheme(
      <ReviewIssueList issues={[]} selectedIssueId={null} onSelectIssue={vi.fn()} />,
    );

    expect(screen.getByText(/No issues found/i)).toBeInTheDocument();
  });

  it("renders issue severity, category, and line number", () => {
    renderWithTheme(
      <ReviewIssueList issues={issues} selectedIssueId="ISSUE-001" onSelectIssue={vi.fn()} />,
    );

    expect(screen.getByText("Unused variable")).toBeInTheDocument();
    expect(screen.getByText("low")).toBeInTheDocument();
    expect(screen.getByText("code-quality")).toBeInTheDocument();
    expect(screen.getByText("L4")).toBeInTheDocument();
  });
});
