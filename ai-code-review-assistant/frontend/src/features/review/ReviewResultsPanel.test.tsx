import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewResultsPanel } from "./ReviewResultsPanel";
import { renderWithTheme } from "../../test/renderWithTheme";
import type { CodeReviewResult } from "../../types/review";

const review: CodeReviewResult = {
  summary: "Overall solid implementation with one high-severity issue.",
  overallScore: 78,
  issues: [
    {
      id: "ISSUE-001",
      title: "Missing error handling",
      description: "Network failures are not handled.",
      severity: "high",
      category: "bug",
      lineStart: 12,
      lineEnd: 14,
      suggestion: "Add try/catch.",
      explanation: "Unhandled rejections crash the request.",
    },
  ],
  strengths: ["Clear naming"],
  recommendations: ["Add unit tests"],
};

describe("ReviewResultsPanel", () => {
  it("renders summary, score, and issues", () => {
    renderWithTheme(
      <ReviewResultsPanel
        review={review}
        selectedIssueId="ISSUE-001"
        onSelectIssue={vi.fn()}
        onApplyFix={vi.fn()}
      />,
    );

    expect(screen.getByText(/Overall solid implementation/i)).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
    expect(screen.getAllByText("Missing error handling").length).toBeGreaterThan(0);
    expect(screen.getByText("Clear naming")).toBeInTheDocument();
    expect(screen.getByText("Add unit tests")).toBeInTheDocument();
  });

  it("calls onSelectIssue when an issue is clicked", async () => {
    const onSelectIssue = vi.fn();
    renderWithTheme(
      <ReviewResultsPanel
        review={review}
        selectedIssueId={null}
        onSelectIssue={onSelectIssue}
        onApplyFix={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByText("Missing error handling"));
    expect(onSelectIssue).toHaveBeenCalledWith(review.issues[0]);
  });
});
