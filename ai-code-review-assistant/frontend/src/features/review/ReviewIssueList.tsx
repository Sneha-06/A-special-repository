import {
  Box, Chip, List, ListItemButton, ListItemText, Typography, useTheme,
} from "@mui/material";
import { ReviewSeverityChip } from "./ReviewSeverityChip";
import type { ReviewIssue } from "../../types/review";

interface ReviewIssueListProps {
  issues: ReviewIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: ReviewIssue) => void;
}

export function ReviewIssueList({ issues, selectedIssueId, onSelectIssue }: ReviewIssueListProps) {
  const theme = useTheme();

  if (issues.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No issues found. The code looks good for the selected review types.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Issues ({issues.length})</Typography>
      <List disablePadding>
        {issues.map((issue) => {
          const selected = issue.id === selectedIssueId;
          const bg = selected ? theme.palette.severity[issue.severity].light : undefined;

          return (
            <ListItemButton
              key={issue.id}
              selected={selected}
              onClick={() => onSelectIssue(issue)}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: 1,
                borderColor: selected ? theme.palette.severity[issue.severity].main : "divider",
                bgcolor: bg,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center", mb: 0.5 }}>
                    <ReviewSeverityChip severity={issue.severity} />
                    <Chip size="small" label={issue.category} variant="outlined" />
                    {issue.lineStart && (
                      <Chip size="small" label={`L${issue.lineStart}${issue.lineEnd && issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ""}`} />
                    )}
                  </Box>
                }
                secondary={
                  <Box component="span" sx={{ display: "block" }}>
                    <Typography component="span" variant="body2" fontWeight={600} color="text.primary" sx={{ display: "block" }}>
                      {issue.title}
                    </Typography>
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }} noWrap>
                      {issue.description}
                    </Typography>
                  </Box>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
