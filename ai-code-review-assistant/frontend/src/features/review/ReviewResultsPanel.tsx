import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { ReviewIssueDetail } from "./ReviewIssueDetail";
import { ReviewIssueList } from "./ReviewIssueList";
import { ReviewOverview } from "./ReviewOverview";
import { countIssuesBySeverity, type CodeReviewResult, type ReviewIssue } from "../../types/review";

interface ReviewResultsPanelProps {
  review: CodeReviewResult;
  selectedIssueId: string | null;
  onSelectIssue: (issue: ReviewIssue) => void;
  onApplyFix: (issue: ReviewIssue) => void;
}

export function ReviewResultsPanel({
  review, selectedIssueId, onSelectIssue, onApplyFix,
}: ReviewResultsPanelProps) {
  const counts = countIssuesBySeverity(review.issues);
  const selectedIssue = review.issues.find((i) => i.id === selectedIssueId) ?? null;

  return (
    <Box>
      <ReviewOverview review={review} counts={counts} />

      {review.strengths.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {review.strengths.map((s) => <Chip key={s} label={s} size="small" color="success" variant="outlined" />)}
            </Stack>
          </CardContent>
        </Card>
      )}

      {review.recommendations.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {review.recommendations.map((r) => (
                <Typography key={r} component="li" variant="body2" color="text.secondary">{r}</Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <ReviewIssueList
        issues={review.issues}
        selectedIssueId={selectedIssueId}
        onSelectIssue={onSelectIssue}
      />

      <Box sx={{ mt: 2 }}>
        <ReviewIssueDetail issue={selectedIssue} onApplyFix={onApplyFix} />
      </Box>
    </Box>
  );
}
