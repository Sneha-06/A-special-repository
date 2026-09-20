import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Card, CardContent,
  Chip, List, ListItem, ListItemText, Stack, Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { GitHubPullRequest, GitHubPullRequestFile, PrReviewResult } from "../../types/github";
import { ReviewSeverityChip } from "../review/ReviewSeverityChip";

interface PrReviewPanelProps {
  pullRequest: GitHubPullRequest;
  files: GitHubPullRequestFile[];
  review: PrReviewResult;
}

function FindingList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Accordion disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>{title} ({items.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List dense>
          {items.map((item) => (
            <ListItem key={item} sx={{ px: 0 }}>
              <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
            </ListItem>
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}

export function PrReviewPanel({ pullRequest, files, review }: PrReviewPanelProps) {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Review comments are proposed only — they are not posted to GitHub.
      </Alert>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{pullRequest.title}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
            <Chip size="small" label={`#${pullRequest.number}`} />
            <Chip size="small" label={`@${pullRequest.user.login}`} variant="outlined" />
            <Chip size="small" label={pullRequest.state} color={pullRequest.state === "open" ? "success" : "default"} />
          </Stack>
          <Typography variant="body2" color="text.secondary">{review.summary}</Typography>
        </CardContent>
      </Card>

      <Typography variant="subtitle2" gutterBottom>Changed files</Typography>
      <Stack spacing={1} sx={{ mb: 2 }}>
        {files.map((f) => (
          <Box key={f.filename} sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="body2" fontFamily="monospace">{f.filename}</Typography>
            <Typography variant="caption" color="text.secondary">
              {f.status} · +{f.additions} / -{f.deletions}
            </Typography>
          </Box>
        ))}
      </Stack>

      <FindingList title="Bugs" items={review.bugs} />
      <FindingList title="Security concerns" items={review.security} />
      <FindingList title="Performance concerns" items={review.performance} />
      <FindingList title="Maintainability issues" items={review.maintainability} />

      {review.recommendations.length > 0 && (
        <Card sx={{ mb: 2, mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Recommendations</Typography>
            <List dense>
              {review.recommendations.map((r) => (
                <ListItem key={r} sx={{ px: 0 }}><ListItemText primary={r} primaryTypographyProps={{ variant: "body2" }} /></ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {review.proposedComments.length > 0 && (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Proposed review comments ({review.proposedComments.length})
          </Typography>
          {review.proposedComments.map((comment, i) => (
            <Card key={i} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {comment.severity && <ReviewSeverityChip severity={comment.severity} />}
                  <Typography variant="caption" fontFamily="monospace">
                    {comment.file}{comment.line ? `:${comment.line}` : ""}
                  </Typography>
                </Stack>
                <Typography variant="body2">{comment.body}</Typography>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Box>
  );
}
