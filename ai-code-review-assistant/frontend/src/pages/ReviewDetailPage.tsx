import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { ReviewResultsPanel } from "../features/review/ReviewResultsPanel";
import { fetchReviewById } from "../services/reviewService";
import type { ReviewDetail, ReviewIssue } from "../types/review";

export function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchReviewById(id)
      .then((data) => {
        setReview(data);
        setSelectedIssueId(data.review.issues[0]?.id ?? null);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!review) return <Typography>Loading review…</Typography>;

  const title = review.fileName ?? "Code Review";

  return (
    <>
      <PageHeader
        title={title}
        subtitle={[
          review.repository?.fullName,
          review.language,
          new Date(review.createdAt).toLocaleString(),
        ].filter(Boolean).join(" · ")}
        action={
          <Button component={RouterLink} to="/history" variant="outlined">
            Back to History
          </Button>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Chip label={`Score ${review.overallScore}`} color="primary" />
        <Chip label={`${review.issueCount} issues`} variant="outlined" />
        {review.reviewTypes.map((type) => (
          <Chip key={type} label={type} size="small" variant="outlined" />
        ))}
      </Stack>

      <Card>
        <CardContent>
          <ReviewResultsPanel
            review={{
              summary: review.review.summary,
              overallScore: review.overallScore,
              issues: review.review.issues,
              strengths: review.strengths,
              recommendations: review.recommendations,
            }}
            selectedIssueId={selectedIssueId}
            onSelectIssue={(issue: ReviewIssue) => setSelectedIssueId(issue.id)}
            onApplyFix={() => {}}
          />
        </CardContent>
      </Card>
    </>
  );
}
