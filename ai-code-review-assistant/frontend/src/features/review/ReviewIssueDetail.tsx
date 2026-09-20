import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import { ReviewSeverityChip } from "./ReviewSeverityChip";
import type { ReviewIssue } from "../../types/review";

interface ReviewIssueDetailProps {
  issue: ReviewIssue | null;
  onApplyFix: (issue: ReviewIssue) => void;
}

export function ReviewIssueDetail({ issue, onApplyFix }: ReviewIssueDetailProps) {
  const theme = useTheme();

  if (!issue) {
    return (
      <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography variant="body2">Select an issue to view details</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: theme.palette.severity[issue.severity].main,
        bgcolor: theme.palette.severity[issue.severity].light,
      }}
    >
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
        <ReviewSeverityChip severity={issue.severity} />
        <Typography variant="caption" sx={{ alignSelf: "center" }}>{issue.id}</Typography>
      </Box>

      <Typography variant="h6" gutterBottom>{issue.title}</Typography>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Problem</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>{issue.description}</Typography>

      {issue.explanation && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Why it matters</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>{issue.explanation}</Typography>
        </>
      )}

      {issue.suggestion && (
        <>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Suggested fix</Typography>
          <Typography
            variant="body2"
            component="pre"
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {issue.suggestion}
          </Typography>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        startIcon={<AutoFixHighIcon />}
        onClick={() => onApplyFix(issue)}
        disabled={!issue.suggestion}
      >
        Apply Suggested Fix
      </Button>
    </Box>
  );
}
